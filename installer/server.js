// CSF Profile Installer Server
// Binds ONLY to 127.0.0.1 — credentials never leave localhost.
// Uses only Node built-in modules: http, fs, path, child_process, net, url

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const net = require('net');

const PORT = 31338;
const HOST = '127.0.0.1';
const REPO_DIR = process.argv[2] || path.resolve(__dirname, '..');
const WIZARD_HTML = path.join(__dirname, 'wizard.html');
const ENV_LOCAL = path.join(REPO_DIR, '.env.local');

// ── Helpers ───────────────────────────────────────────────────────────────────

function jsonResponse(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': `http://localhost:${PORT}`,
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch { reject(new Error('Invalid JSON')); }
    });
  });
}

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise(resolve => {
    const sock = new net.Socket();
    sock.setTimeout(500);
    sock.connect(port, host, () => { sock.destroy(); resolve(true); });
    sock.on('error', () => { sock.destroy(); resolve(false); });
    sock.on('timeout', () => { sock.destroy(); resolve(false); });
  });
}

function backupEnvLocal() {
  if (!fs.existsSync(ENV_LOCAL)) return null;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${ENV_LOCAL}.backup-${stamp}`;
  fs.copyFileSync(ENV_LOCAL, backupPath);
  return backupPath;
}

// ── API Handlers ──────────────────────────────────────────────────────────────

async function handleSystem(req, res) {
  let nodeVersion = process.version;
  let gitPresent = false;
  try { execSync('git --version', { stdio: 'pipe' }); gitPresent = true; } catch {}
  const envExists = fs.existsSync(ENV_LOCAL);
  jsonResponse(res, 200, { nodeVersion, gitPresent, envExists, envPath: envExists ? ENV_LOCAL : null });
}

async function handleCredentials(req, res) {
  try {
    const body = await parseBody(req);
    const { jiraUrl, jiraToken, confluenceUrl, confluenceToken } = body;

    // Validate: if any credential field is provided, paired field must also be present
    if ((jiraUrl && !jiraToken) || (!jiraUrl && jiraToken)) {
      return jsonResponse(res, 400, { error: 'Jira URL and token must both be provided, or both left empty.' });
    }
    if ((confluenceUrl && !confluenceToken) || (!confluenceUrl && confluenceToken)) {
      return jsonResponse(res, 400, { error: 'Confluence URL and token must both be provided, or both left empty.' });
    }

    const backupPath = backupEnvLocal();
    const lines = [
      `REACT_APP_JIRA_INSTANCE_URL=${jiraUrl || ''}`,
      `REACT_APP_JIRA_API_TOKEN=${jiraToken || ''}`,
      `REACT_APP_CONFLUENCE_INSTANCE_URL=${confluenceUrl || ''}`,
      `REACT_APP_CONFLUENCE_API_TOKEN=${confluenceToken || ''}`,
      `REACT_APP_API_URL=http://localhost:4000`,
    ];
    fs.writeFileSync(ENV_LOCAL, lines.join('\n') + '\n', 'utf8');
    jsonResponse(res, 200, { written: ENV_LOCAL, backup: backupPath });
  } catch (err) {
    jsonResponse(res, 500, { error: err.message });
  }
}

async function handleTestConnection(req, res) {
  try {
    const body = await parseBody(req);
    const { type, url, token } = body;
    if (!url || !token) return jsonResponse(res, 400, { error: 'url and token required' });

    // Proxy the test to Atlassian — we use Node's https module to avoid CORS
    const https = require('https');
    const testUrl = type === 'jira'
      ? `${url.replace(/\/$/, '')}/rest/api/3/myself`
      : `${url.replace(/\/$/, '')}/rest/api/content?limit=1`;

    const parsed = new URL(testUrl);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`user:${token}`).toString('base64')}`,
        'Accept': 'application/json',
      },
    };

    const testReq = https.request(options, testRes => {
      jsonResponse(res, 200, { status: testRes.statusCode, ok: testRes.statusCode < 300 });
    });
    testReq.on('error', err => jsonResponse(res, 200, { ok: false, error: err.message }));
    testReq.end();
  } catch (err) {
    jsonResponse(res, 500, { error: err.message });
  }
}

async function handleSeed(req, res) {
  try {
    const body = await parseBody(req);
    const { choice } = body; // 'alma' | 'blank' | 'skip'
    // For 'alma': the demo CSVs are already in public/ — the app loads them automatically.
    // We write a seed preference to .env.local so the app can pick it up on first run.
    const envContent = fs.existsSync(ENV_LOCAL) ? fs.readFileSync(ENV_LOCAL, 'utf8') : '';
    const filtered = envContent.split('\n').filter(l => !l.startsWith('REACT_APP_SEED_MODE=')).join('\n');
    fs.writeFileSync(ENV_LOCAL, filtered.trimEnd() + `\nREACT_APP_SEED_MODE=${choice}\n`, 'utf8');
    jsonResponse(res, 200, { choice });
  } catch (err) {
    jsonResponse(res, 500, { error: err.message });
  }
}

let appProcess = null;

async function handleLaunch(req, res) {
  try {
    if (appProcess) {
      return jsonResponse(res, 200, { url: 'http://localhost:3000', already: true });
    }
    appProcess = spawn('npm', ['start'], {
      cwd: REPO_DIR,
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, BROWSER: 'none' }, // prevent CRA from auto-opening browser
    });
    appProcess.unref();
    jsonResponse(res, 200, { url: 'http://localhost:3000', pid: appProcess.pid });
    // Shut down installer server after a delay so wizard can poll /api/status
    setTimeout(() => { server.close(); process.exit(0); }, 30000);
  } catch (err) {
    jsonResponse(res, 500, { error: err.message });
  }
}

async function handleStatus(req, res) {
  const open = await isPortOpen(3000);
  jsonResponse(res, 200, { ready: open, url: 'http://localhost:3000' });
}

// ── Router ────────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${HOST}:${PORT}`);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }

  // Serve wizard HTML
  if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    const html = fs.readFileSync(WIZARD_HTML, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(html);
  }

  // API routes
  if (pathname === '/api/system'     && req.method === 'GET')  return handleSystem(req, res);
  if (pathname === '/api/credentials' && req.method === 'POST') return handleCredentials(req, res);
  if (pathname === '/api/test-connection' && req.method === 'POST') return handleTestConnection(req, res);
  if (pathname === '/api/seed'        && req.method === 'POST') return handleSeed(req, res);
  if (pathname === '/api/launch'      && req.method === 'POST') return handleLaunch(req, res);
  if (pathname === '/api/status'      && req.method === 'GET')  return handleStatus(req, res);

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, HOST, () => {
  console.log(`CSF Installer server running at http://${HOST}:${PORT}`);
});
