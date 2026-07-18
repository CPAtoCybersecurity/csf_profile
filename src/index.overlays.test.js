/**
 * Regression guard for issue #279.
 *
 * The app has no Tailwind build — src/index.css is a hand-written utility
 * subset. Modal/overlay components use `className="fixed inset-0 ... z-50"`,
 * but `.fixed` and `.inset-0` were never defined, so every overlay rendered
 * `position: static` (in document flow) and the "Set up org profile" wizard
 * opened off-screen. These assertions fail if the position/overlay utilities
 * the modals depend on are removed or altered.
 *
 * jsdom does not apply CSS, so this guards the stylesheet source directly.
 */
import fs from 'fs';
import path from 'path';

const css = fs.readFileSync(path.join(__dirname, 'index.css'), 'utf8');

// collapse whitespace so `.x {\n position: fixed;\n}` matches a simple regex
const flat = css.replace(/\s+/g, ' ');

const hasRule = (selector, ...decls) => {
  // selector may contain an escaped slash (e.g. .bg-black\/50)
  const sel = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = flat.match(new RegExp(sel + '\\s*\\{([^}]*)\\}'));
  if (!m) return false;
  return decls.every((d) => m[1].includes(d));
};

describe('index.css overlay/position utilities (issue #279)', () => {
  test('.fixed sets position: fixed', () => {
    expect(hasRule('.fixed', 'position: fixed')).toBe(true);
  });

  test('.inset-0 pins all four edges to 0', () => {
    expect(hasRule('.inset-0', 'top: 0', 'right: 0', 'bottom: 0', 'left: 0')).toBe(true);
  });

  test('.bottom-0 sets bottom: 0', () => {
    expect(hasRule('.bottom-0', 'bottom: 0')).toBe(true);
  });

  test('.max-w-lg constrains the dialog card width', () => {
    expect(hasRule('.max-w-lg', 'max-width: 32rem')).toBe(true);
  });

  test('modal backdrops dim: bg-black/50 is semi-transparent black', () => {
    expect(hasRule('.bg-black\\/50', 'rgba(0, 0, 0, 0.5)')).toBe(true);
  });

  test('bg-opacity-50 is a color-agnostic alpha modifier, not hardcoded black', () => {
    // it must dim bg-black (which reads the var) without forcing black on other colors
    expect(hasRule('.bg-opacity-50', '--tw-bg-opacity: 0.5')).toBe(true);
    expect(hasRule('.bg-black', 'var(--tw-bg-opacity)')).toBe(true);
    // regression: it must NOT hardcode a black background-color
    const flatOpacity = flat.match(/\.bg-opacity-50\s*\{([^}]*)\}/);
    expect(flatOpacity && /background-color/.test(flatOpacity[1])).toBeFalsy();
  });

  test('every "fixed inset-0" overlay class the components use is now defined', () => {
    // if a component asks for these classes, index.css must define them
    for (const sel of ['.fixed', '.inset-0']) {
      expect(flat).toMatch(new RegExp(sel.replace('.', '\\.') + '\\s*\\{'));
    }
  });
});

/**
 * Regression guard for the New Assessment modal scroll bug.
 *
 * The modal card is `max-h-[90vh] flex flex-col` with a fixed header, a
 * `flex-1 overflow-auto` body, and a fixed footer. `.max-h-[90vh]` was never
 * defined in the hand-written CSS, so the card's max-height computed to `none`,
 * it grew to full content height, the overlay's `items-center` centered it, and
 * the header + footer scrolled off-screen with no way to reach them. These
 * assertions fail if the height-cap utilities the modals/panels depend on are
 * removed. Values follow the Tailwind spacing scale (N x 0.25rem).
 */
describe('index.css max-height utilities (Assessments modal scroll)', () => {
  test('.max-h-[90vh] caps the modal dialog card at 90% of the viewport', () => {
    expect(hasRule('.max-h-\\[90vh\\]', 'max-height: 90vh')).toBe(true);
  });

  const scale = {
    '.max-h-40': '10rem',
    '.max-h-48': '12rem',
    '.max-h-56': '14rem',
    '.max-h-60': '15rem',
    '.max-h-64': '16rem',
    '.max-h-72': '18rem',
    '.max-h-80': '20rem',
  };

  test.each(Object.entries(scale))('%s is defined as %s', (sel, value) => {
    expect(hasRule(sel, `max-height: ${value}`)).toBe(true);
  });

  test('no max-h-* class used in JSX is left undefined in index.css', () => {
    const srcDir = __dirname;
    const files = [];
    const walk = (dir) => {
      for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name);
        const stat = fs.statSync(p);
        if (stat.isDirectory()) walk(p);
        else if (/\.(js|jsx)$/.test(name) && !/\.test\.js$/.test(name)) {
          files.push(fs.readFileSync(p, 'utf8'));
        }
      }
    };
    walk(srcDir);
    const used = new Set();
    for (const content of files) {
      for (const m of content.matchAll(/\bmax-h-(?:\[[^\]]+\]|[a-z0-9]+)/g)) {
        used.add(m[0]);
      }
    }
    // CSS escapes brackets in selectors (`.max-h-\[90vh\]`); the JSX class is
    // raw (`max-h-[90vh]`). Strip the CSS escaping so a raw-class regex matches.
    const flatNoEsc = flat.replace(/\\/g, '');
    const missing = [...used].filter((cls) => {
      const sel = '.' + cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return !new RegExp(sel + '\\s*\\{').test(flatNoEsc);
    });
    expect(missing).toEqual([]);
  });
});
