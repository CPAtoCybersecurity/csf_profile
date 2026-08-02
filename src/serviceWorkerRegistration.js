/*
 * Registers the offline service worker in production builds only.
 *
 * Dev servers (`npm start`) skip registration so hot reload never fights a
 * cache, and environments without service worker support (older browsers,
 * the Tauri desktop webview) are feature-checked and fail silently — the
 * app runs exactly as before, just without offline install support.
 */

export function register() {
  if (process.env.NODE_ENV !== 'production') return;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
  // A CDN-hosted PUBLIC_URL would be cross-origin and cannot control this
  // page; skip registration rather than register a dead worker.
  if (publicUrl.origin !== window.location.origin) return;

  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    navigator.serviceWorker.register(swUrl).catch(() => {
      // Registration is a progressive enhancement; never surface a failure.
    });
  });
}

export function unregister() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then((registration) => registration.unregister())
    .catch(() => {});
}
