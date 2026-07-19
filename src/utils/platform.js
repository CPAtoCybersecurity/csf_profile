/**
 * Platform detection for keyboard-shortcut display.
 *
 * This is DISPLAY ONLY. The navigation hook accepts ctrlKey || metaKey on every
 * chorded action, so both renderings describe keys that genuinely work. The
 * toggle exists so the overlay shows the modifier a reader expects to press,
 * not to rebind anything.
 *
 * Detection biases toward Windows: telling a Windows user to press ⌘ names a
 * key their keyboard does not have, while telling a Mac user to press Ctrl is
 * merely the less idiomatic of two working options.
 */

export const PLATFORM_STORAGE_KEY = 'csf-shortcut-platform';

export const PLATFORM_WINDOWS = 'windows';
export const PLATFORM_MAC = 'mac';

const isValid = (value) => value === PLATFORM_WINDOWS || value === PLATFORM_MAC;

/** Read the user's explicit choice, or null when they have not made one. */
export const readStoredPlatform = () => {
  try {
    const stored = window.localStorage.getItem(PLATFORM_STORAGE_KEY);
    return isValid(stored) ? stored : null;
  } catch (err) {
    // Private-mode / disabled storage: fall through to detection.
    return null;
  }
};

export const storePlatform = (platform) => {
  if (!isValid(platform)) return;
  try {
    window.localStorage.setItem(PLATFORM_STORAGE_KEY, platform);
  } catch (err) {
    // Persistence is a convenience; the session still works without it.
  }
};

/** Best-effort platform sniff. Unknown or unavailable → Windows. */
export const detectPlatform = () => {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  if (!nav) return PLATFORM_WINDOWS;

  // userAgentData.platform is the non-deprecated source where it exists.
  const hinted = nav.userAgentData && nav.userAgentData.platform;
  if (typeof hinted === 'string' && hinted) {
    return /mac/i.test(hinted) ? PLATFORM_MAC : PLATFORM_WINDOWS;
  }

  const ua = typeof nav.userAgent === 'string' ? nav.userAgent : '';
  // iPadOS reports as Macintosh; both want ⌘, so no special case is needed.
  return /Mac|iPhone|iPad|iPod/i.test(ua) ? PLATFORM_MAC : PLATFORM_WINDOWS;
};

/** Stored choice wins over detection. */
export const resolvePlatform = () => readStoredPlatform() || detectPlatform();
