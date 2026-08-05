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
 * Downscale a data URL so its long edge is at most maxEdge, preserving aspect
 * ratio, and re-encode as PNG. Resolves to the ORIGINAL data URL when the
 * environment has no usable canvas or the image will not decode — the caller
 * still applies the persist cap, so the size invariant holds either way.
 */
export const downscaleDataUrl = (dataUrl, maxEdge = LOGO_MAX_EDGE_PX) =>
  new Promise((resolve) => {
    if (typeof document === 'undefined' || typeof Image === 'undefined') {
      resolve(dataUrl);
      return;
    }
    let canvas;
    try {
      canvas = document.createElement('canvas');
    } catch {
      resolve(dataUrl);
      return;
    }
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx || typeof canvas.toDataURL !== 'function') {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        const { width, height } = img;
        if (!width || !height) {
          resolve(dataUrl);
          return;
        }
        const scale = Math.min(1, maxEdge / Math.max(width, height));
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const out = canvas.toDataURL('image/png');
        resolve(isSafeLogoDataUrl(out) ? out : dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
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

  if (!isSafeLogoDataUrl(raw)) {
    return { ok: false, error: 'That file did not decode as a supported image.' };
  }

  const scaled = await downscaleDataUrl(raw);
  const dataUrl = isSafeLogoDataUrl(scaled) ? scaled : raw;

  if (dataUrl.length > LOGO_MAX_PERSISTED_CHARS) {
    // Only reachable when downscaling could not run (no canvas) and the
    // source was large. Refuse rather than blow the shared storage budget.
    return {
      ok: false,
      error: 'That image is too large to store once encoded. Try a logo around 256×256 pixels.'
    };
  }

  return { ok: true, dataUrl, fileName: file.name || '' };
};
