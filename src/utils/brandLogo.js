/**
 * Custom brand logo — file intake, validation, and downscaling.
 *
 * The app ships the Simply Cyber shield as its default mark. An org can
 * replace it with their own logo; the uploaded image is stored as a data URL
 * in localStorage (there is no server — see PRIVATE_DATA.md) and rendered
 * into the sidebar brand.
 *
 * Two invariants govern everything here:
 *
 *  1. VALIDATION IS POSITIVE-MATCH. `isSafeLogoDataUrl` allow-lists four
 *     raster MIME types with base64 payloads. Everything else — `javascript:`,
 *     `data:text/html`, remote `https:` URLs, and notably `image/svg+xml` —
 *     is refused. SVG is excluded on purpose: it is a document format that
 *     can carry script and external references, and nothing about a company
 *     logo needs it. The guard runs at upload, at render, and at restore,
 *     because a data URL can enter through a backup file that never passed
 *     the upload form.
 *
 *  2. SIZE IS BOUNDED BEFORE PERSIST. localStorage is a single shared budget
 *     for every assessment, control, finding, and artifact in the app. An
 *     unbounded logo would evict real work. Images are downscaled to
 *     LOGO_MAX_EDGE_PX on their long edge and the persisted string is capped
 *     at LOGO_MAX_PERSISTED_CHARS.
 */

// Raster only. See the SVG note above.
export const LOGO_ACCEPTED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

// The `accept` attribute for the file input. Derived from the same list the
// guard uses so the picker and the validator cannot drift apart.
export const LOGO_ACCEPT_ATTR = LOGO_ACCEPTED_MIME.join(',');

// Cap on the source file the user hands us, before any downscaling.
export const LOGO_MAX_SOURCE_BYTES = 2 * 1024 * 1024; // 2 MB

// The brand mark renders at 44px inside a 56px disc. 256px is a generous
// retina headroom and keeps a downscaled PNG in the tens of KB.
export const LOGO_MAX_EDGE_PX = 256;

// Hard ceiling on the persisted data-URL string (~192 KB of characters).
// A 256px PNG lands far below this; the cap is the backstop for the
// canvas-unavailable path and for values arriving from a backup file.
export const LOGO_MAX_PERSISTED_CHARS = 192 * 1024;

const SAFE_LOGO_DATA_URL = /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/;

/**
 * Positive-match guard for a stored logo value. Anything not matching the
 * allow-listed raster data-URL shape is refused.
 */
export const isSafeLogoDataUrl = (value) =>
  typeof value === 'string' && value.length > 0 && SAFE_LOGO_DATA_URL.test(value);

/**
 * Validate the file the user picked. Returns { ok } or { ok: false, error }
 * with a message naming the actual limit — a refusal the user cannot act on
 * is the same as a silent failure.
 */
export const validateLogoFile = (file) => {
  if (!file) return { ok: false, error: 'No file selected.' };
  if (!LOGO_ACCEPTED_MIME.includes(file.type)) {
    return {
      ok: false,
      error: `Unsupported image type${file.type ? ` (${file.type})` : ''}. Use PNG, JPEG, WebP, or GIF.`
    };
  }
  if (file.size > LOGO_MAX_SOURCE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return { ok: false, error: `That image is ${mb} MB. The limit is 2 MB — try a smaller export of your logo.` };
  }
  return { ok: true };
};

/** Read a File into a data URL. Rejects if the browser cannot read it. */
export const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });

/**
 * Encodings tried in order, each checked against the persist cap. PNG first
 * because logos are usually flat colour and it is lossless; JPEG after,
 * because a photographic or gradient-heavy mark can exceed the cap as a
 * lossless 256px PNG — and re-encoding a JPEG/WebP source to PNG can inflate
 * it by an order of magnitude, which works against the storage budget this
 * whole module exists to protect. The last rung halves the edge so a refusal
 * is genuinely the last resort rather than the second thing we try.
 */
const ENCODINGS = [
  { edge: LOGO_MAX_EDGE_PX, type: 'image/png' },
  { edge: LOGO_MAX_EDGE_PX, type: 'image/jpeg', quality: 0.85 },
  { edge: Math.round(LOGO_MAX_EDGE_PX / 2), type: 'image/jpeg', quality: 0.8 }
];

export const RASTERIZE_OK = 'ok';
export const RASTERIZE_UNDECODABLE = 'undecodable';
export const RASTERIZE_NO_CANVAS = 'no-canvas';
export const RASTERIZE_TOO_LARGE = 'too-large';

/**
 * Decode a data URL, downscale it so its long edge is at most `edge`, and
 * re-encode it small enough to persist.
 *
 * The three outcomes are kept DISTINCT on purpose. Collapsing "the browser
 * has no canvas" into "these bytes are not an image" is what lets an
 * undecodable file — a truncated PNG, or an SVG renamed to .png so `file.type`
 * lies — be accepted as a success: Settings would say "In use: logo.png" while
 * the sidebar quietly fell back to the shield.
 *
 * Resolves { status, dataUrl? }:
 *  - ok           re-encoded and under the persist cap
 *  - undecodable  the bytes are not an image the browser can render
 *  - too-large    decoded fine, still over the cap at the smallest rung
 *  - no-canvas    no usable canvas here (jsdom, exotic environments); the
 *                 caller falls back to the original bytes under the cap
 */
export const rasterizeDataUrl = (dataUrl, encodings = ENCODINGS) =>
  new Promise((resolve) => {
    if (typeof document === 'undefined' || typeof Image === 'undefined') {
      resolve({ status: RASTERIZE_NO_CANVAS });
      return;
    }
    let canvas;
    try {
      canvas = document.createElement('canvas');
    } catch {
      resolve({ status: RASTERIZE_NO_CANVAS });
      return;
    }
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx || typeof canvas.toDataURL !== 'function') {
      resolve({ status: RASTERIZE_NO_CANVAS });
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        const { width, height } = img;
        if (!width || !height) {
          resolve({ status: RASTERIZE_UNDECODABLE });
          return;
        }
        let best = null;
        for (const { edge, type, quality } of encodings) {
          const scale = Math.min(1, edge / Math.max(width, height));
          canvas.width = Math.max(1, Math.round(width * scale));
          canvas.height = Math.max(1, Math.round(height * scale));
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const out = canvas.toDataURL(type, quality);
          // Re-check the OUTPUT, not just the input MIME: what gets persisted
          // is always canvas-produced, never the user's original bytes.
          if (!isSafeLogoDataUrl(out)) continue;
          if (out.length <= LOGO_MAX_PERSISTED_CHARS) {
            resolve({ status: RASTERIZE_OK, dataUrl: out });
            return;
          }
          best = out;
        }
        resolve(best ? { status: RASTERIZE_TOO_LARGE } : { status: RASTERIZE_NO_CANVAS });
      } catch {
        resolve({ status: RASTERIZE_NO_CANVAS });
      }
    };
    // Reached only once a canvas exists, so this means exactly one thing: the
    // bytes did not decode.
    img.onerror = () => resolve({ status: RASTERIZE_UNDECODABLE });
    img.src = dataUrl;
  });

/**
 * Full intake: validate → read → downscale → re-check.
 * Resolves to { ok: true, dataUrl, fileName } or { ok: false, error }.
 * Never throws for user-input reasons; the caller renders `error` verbatim.
 */
export const prepareLogoFromFile = async (file) => {
  const validation = validateLogoFile(file);
  if (!validation.ok) return validation;

  let raw;
  try {
    raw = await readFileAsDataUrl(file);
  } catch (error) {
    return { ok: false, error: error.message || 'Could not read that file.' };
  }

  // The data URL is built from file.type, which validateLogoFile already
  // allow-listed, so this only catches a FileReader that produced something
  // other than a data URL. Real decodability is settled by rasterizeDataUrl.
  if (!isSafeLogoDataUrl(raw)) {
    return { ok: false, error: 'That file could not be read as an image.' };
  }

  const raster = await rasterizeDataUrl(raw);

  if (raster.status === RASTERIZE_OK) {
    return { ok: true, dataUrl: raster.dataUrl, fileName: file.name || '' };
  }

  if (raster.status === RASTERIZE_UNDECODABLE) {
    // A truncated file, or one whose extension lies about its contents (the
    // MIME comes from the extension, so a .svg renamed .png arrives here
    // claiming to be a PNG). Refusing keeps Settings and the sidebar telling
    // the user the same story.
    return { ok: false, error: 'That file is not a readable image — it may be damaged, or not the format its name claims.' };
  }

  if (raster.status === RASTERIZE_TOO_LARGE) {
    return {
      ok: false,
      error: 'That logo is still too large to store after resizing. Try a simpler, flatter version of the mark.'
    };
  }

  // No usable canvas: fall back to the original bytes, still capped.
  if (raw.length > LOGO_MAX_PERSISTED_CHARS) {
    return {
      ok: false,
      error: 'That image is too large to store once encoded. Try a logo around 256×256 pixels.'
    };
  }

  return { ok: true, dataUrl: raw, fileName: file.name || '' };
};
