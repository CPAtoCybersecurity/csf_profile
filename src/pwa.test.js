import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { register, unregister } from './serviceWorkerRegistration';

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

const readPublic = (name) => fs.readFileSync(path.join(PUBLIC_DIR, name), 'utf8');

/** Width/height straight from the PNG IHDR chunk — no image library needed. */
function pngDimensions(name) {
  const buf = fs.readFileSync(path.join(PUBLIC_DIR, name));
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe('web app manifest', () => {
  const manifest = JSON.parse(readPublic('manifest.json'));

  test('declares the installability fields Chrome requires', () => {
    expect(manifest.name).toBe('CSF Profile Assessment');
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#000000');
    // The app shell is black; a white launch background would flash.
    expect(manifest.background_color).toBe('#000000');
  });

  test('id preserves the pre-manifest identity so existing installs update in place', () => {
    // An origin-relative id equal to start_url matches the implicit identity
    // the app had before an id was declared; anything else orphans installs.
    expect(manifest.id).toBe('./');
  });

  test('declares 192px and 512px icons plus a maskable variant', () => {
    const bySize = Object.fromEntries(manifest.icons.map((i) => [i.sizes, i]));
    expect(bySize['192x192']).toBeDefined();
    expect(bySize['512x512']).toBeDefined();
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
  });

  test('every declared icon exists and its pixel size matches its declaration', () => {
    for (const icon of manifest.icons) {
      const [w, h] = icon.sizes.split('x').map(Number);
      const actual = pngDimensions(icon.src);
      expect({ src: icon.src, ...actual }).toEqual({ src: icon.src, width: w, height: h });
    }
  });
});

describe('index.html install surface', () => {
  const html = readPublic('index.html');

  test('links the manifest and theme color', () => {
    expect(html).toContain('rel="manifest"');
    expect(html).toContain('name="theme-color"');
  });

  test('apple-touch-icon points at a real file', () => {
    const match = html.match(/rel="apple-touch-icon" href="%PUBLIC_URL%\/([^"]+)"/);
    expect(match).not.toBeNull();
    expect(fs.existsSync(path.join(PUBLIC_DIR, match[1]))).toBe(true);
  });
});

/*
 * Evaluates public/service-worker.js in a sandbox and drives its real
 * install/activate/fetch handlers with synthetic events, so the tests pin
 * behavior — request classes, cache strategy, write gating — not source text.
 */
const ORIGIN = 'https://csf.example';

class FakeResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status ?? 200;
    this.statusText = init.statusText ?? '';
    this.headers = init.headers || { get: () => null };
    this.ok = this.status >= 200 && this.status < 300;
    this.redirected = false;
    this.type = 'basic';
  }
}

function makeResponse({ status = 200, contentType = 'text/plain', redirected = false, type = 'basic' } = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    redirected,
    type,
    headers: { get: (name) => (name.toLowerCase() === 'content-type' ? contentType : null) },
    clone() {
      return this;
    },
    blob: async () => 'body-bytes',
    json: async () => ({}),
  };
}

function loadServiceWorker() {
  const listeners = {};
  const store = new Map();
  const keyOf = (req) => (typeof req === 'string' ? req : req.url);
  const cache = {
    put: jest.fn(async (req, res) => {
      store.set(keyOf(req), res);
    }),
    addAll: jest.fn(async (urls) => {
      urls.forEach((u) => store.set(u, makeResponse()));
    }),
  };
  const caches = {
    open: jest.fn(async () => cache),
    match: jest.fn(async (req) => store.get(keyOf(req))),
    keys: jest.fn(async () => []),
    delete: jest.fn(async () => true),
  };
  const fetchMock = jest.fn(async () => makeResponse());
  const self = {
    location: new URL(`${ORIGIN}/`),
    addEventListener: (type, fn) => {
      listeners[type] = fn;
    },
    skipWaiting: jest.fn(async () => {}),
    clients: { claim: jest.fn(async () => {}) },
  };
  vm.runInNewContext(readPublic('service-worker.js'), {
    self,
    caches,
    fetch: fetchMock,
    URL,
    Response: FakeResponse,
  });
  return { listeners, cache, caches, store, fetch: fetchMock, self };
}

function dispatchFetch(listeners, request) {
  let responded = null;
  const waits = [];
  listeners.fetch({
    request,
    respondWith: (p) => {
      responded = p;
    },
    waitUntil: (p) => {
      waits.push(p);
    },
  });
  return { responded, settle: () => Promise.allSettled(waits) };
}

const req = (url, extra = {}) => ({ method: 'GET', mode: 'no-cors', url: `${ORIGIN}${url}`, ...extra });

describe('service worker behavior', () => {
  test('install precaches the app shell including the CSV datasets, plus hashed assets', async () => {
    const sw = loadServiceWorker();
    sw.fetch.mockImplementation(async (target) => {
      if (target === 'asset-manifest.json') {
        return { ...makeResponse(), json: async () => ({ files: { 'main.js': '/static/js/main.abc.js', 'index.html': '/index.html' } }) };
      }
      return makeResponse();
    });
    let installed;
    sw.listeners.install({ waitUntil: (p) => (installed = p) });
    await installed;
    const putKeys = sw.cache.put.mock.calls.map(([k]) => k);
    for (const entry of ['index.html', 'manifest.json', 'tblProfile_Demo.csv', 'Confluence-Requirements.csv', 'scoring_legend.csv']) {
      expect(putKeys).toContain(entry);
    }
    expect(sw.cache.addAll).toHaveBeenCalledWith(['/static/js/main.abc.js']);
    expect(sw.self.skipWaiting).toHaveBeenCalled();
  });

  test('a redirected shell response is re-wrapped before caching so offline navigations can serve it', async () => {
    const sw = loadServiceWorker();
    sw.fetch.mockImplementation(async (target) =>
      target === 'index.html' ? makeResponse({ redirected: true, contentType: 'text/html' }) : makeResponse()
    );
    let installed;
    sw.listeners.install({ waitUntil: (p) => (installed = p) });
    await installed;
    const stored = sw.store.get('index.html');
    expect(stored).toBeInstanceOf(FakeResponse);
    expect(stored.redirected).toBe(false);
  });

  test('activate deletes caches from other versions only', async () => {
    const sw = loadServiceWorker();
    sw.caches.keys.mockResolvedValue(['csf-profile-v0', 'csf-profile-v1']);
    let activated;
    sw.listeners.activate({ waitUntil: (p) => (activated = p) });
    await activated;
    expect(sw.caches.delete).toHaveBeenCalledWith('csf-profile-v0');
    expect(sw.caches.delete).not.toHaveBeenCalledWith('csf-profile-v1');
  });

  test('never intercepts POSTs, cross-origin requests, or /api/', () => {
    const sw = loadServiceWorker();
    expect(dispatchFetch(sw.listeners, req('/save', { method: 'POST' })).responded).toBeNull();
    expect(dispatchFetch(sw.listeners, { method: 'GET', mode: 'cors', url: 'https://other.example/x' }).responded).toBeNull();
    expect(dispatchFetch(sw.listeners, req('/api/ai/status')).responded).toBeNull();
    expect(sw.fetch).not.toHaveBeenCalled();
  });

  test('navigations go network-first and only ok responses become the cached shell', async () => {
    const sw = loadServiceWorker();
    const fresh = makeResponse({ contentType: 'text/html' });
    sw.fetch.mockResolvedValue(fresh);
    const { responded, settle } = dispatchFetch(sw.listeners, req('/', { mode: 'navigate' }));
    expect(await responded).toBe(fresh);
    await settle();
    expect(sw.store.get('index.html')).toBe(fresh);

    // A 500 during a deploy blip must never poison the offline shell.
    sw.cache.put.mockClear();
    sw.fetch.mockResolvedValue(makeResponse({ status: 500, contentType: 'text/html' }));
    const second = dispatchFetch(sw.listeners, req('/', { mode: 'navigate' }));
    expect((await second.responded).status).toBe(500);
    await second.settle();
    expect(sw.cache.put).not.toHaveBeenCalled();
  });

  test('offline navigation falls back to the cached shell', async () => {
    const sw = loadServiceWorker();
    const shell = makeResponse({ contentType: 'text/html' });
    sw.store.set('index.html', shell);
    sw.fetch.mockRejectedValue(new TypeError('offline'));
    const { responded } = dispatchFetch(sw.listeners, req('/', { mode: 'navigate' }));
    expect(await responded).toBe(shell);
  });

  test('hashed /static/ assets are cache-first: a cached copy never triggers a fetch', async () => {
    const sw = loadServiceWorker();
    const cachedJs = makeResponse({ contentType: 'application/javascript' });
    sw.store.set(`${ORIGIN}/static/js/main.abc.js`, cachedJs);
    const { responded } = dispatchFetch(sw.listeners, req('/static/js/main.abc.js'));
    expect(await responded).toBe(cachedJs);
    expect(sw.fetch).not.toHaveBeenCalled();
  });

  test('datasets are stale-while-revalidate: cached copy served, fresh copy fetched and stored', async () => {
    const sw = loadServiceWorker();
    const stale = makeResponse({ contentType: 'text/csv' });
    const fresh = makeResponse({ contentType: 'text/csv' });
    sw.store.set(`${ORIGIN}/tblProfile_Demo.csv`, stale);
    sw.fetch.mockResolvedValue(fresh);
    const { responded, settle } = dispatchFetch(sw.listeners, req('/tblProfile_Demo.csv'));
    expect(await responded).toBe(stale);
    await settle();
    expect(sw.fetch).toHaveBeenCalledTimes(1);
    expect(sw.store.get(`${ORIGIN}/tblProfile_Demo.csv`)).toBe(fresh);
  });

  test('SPA-fallback HTML for a non-navigation URL is never cached', async () => {
    const sw = loadServiceWorker();
    sw.fetch.mockResolvedValue(makeResponse({ contentType: 'text/html; charset=utf-8' }));
    const { responded, settle } = dispatchFetch(sw.listeners, req('/no-such-file.csv'));
    await responded;
    await settle();
    expect(sw.cache.put).not.toHaveBeenCalled();
  });
});

describe('service worker registration', () => {
  const setEnv = (key, value) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  };
  let savedNodeEnv;
  let savedPublicUrl;

  beforeEach(() => {
    savedNodeEnv = process.env.NODE_ENV;
    savedPublicUrl = process.env.PUBLIC_URL;
  });

  afterEach(() => {
    setEnv('NODE_ENV', savedNodeEnv);
    setEnv('PUBLIC_URL', savedPublicUrl);
    delete window.navigator.serviceWorker;
  });

  test('is a no-op outside production builds', () => {
    const addEventListener = jest.spyOn(window, 'addEventListener');
    register(); // NODE_ENV is 'test' here
    expect(addEventListener).not.toHaveBeenCalledWith('load', expect.any(Function));
    addEventListener.mockRestore();
  });

  test('in production, skips environments without service worker support instead of throwing', () => {
    setEnv('NODE_ENV', 'production');
    setEnv('PUBLIC_URL', '');
    const addEventListener = jest.spyOn(window, 'addEventListener');
    expect(() => register()).not.toThrow(); // jsdom has no navigator.serviceWorker
    expect(addEventListener).not.toHaveBeenCalledWith('load', expect.any(Function));
    addEventListener.mockRestore();
  });

  test('in production, skips a cross-origin PUBLIC_URL that could not control this page', () => {
    setEnv('NODE_ENV', 'production');
    setEnv('PUBLIC_URL', 'https://cdn.example.com/app');
    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: { register: jest.fn() },
      configurable: true,
    });
    const addEventListener = jest.spyOn(window, 'addEventListener');
    register();
    expect(addEventListener).not.toHaveBeenCalledWith('load', expect.any(Function));
    expect(window.navigator.serviceWorker.register).not.toHaveBeenCalled();
    addEventListener.mockRestore();
  });

  test('unregister survives environments without service worker support', () => {
    expect(() => unregister()).not.toThrow();
  });

  test('in production with support, registers the worker on window load', () => {
    setEnv('NODE_ENV', 'production');
    setEnv('PUBLIC_URL', '');
    const registerMock = jest.fn(() => Promise.resolve());
    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: { register: registerMock },
      configurable: true,
    });
    register();
    window.dispatchEvent(new Event('load'));
    expect(registerMock).toHaveBeenCalledWith('/service-worker.js');
  });
});
