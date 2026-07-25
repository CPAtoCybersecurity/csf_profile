/**
 * Palette guard — the utility layer.
 *
 * contrast.test.js grades the token block (:root / .dark custom properties).
 * It cannot see the OTHER color system in this stylesheet: a ~150-rule
 * `.dark .utility` override layer that the JSX reaches through Tailwind-style
 * class names (`bg-gray-800`, `text-blue-700`, ...). During the slate
 * retheming that layer was left on the old phosphor-green palette, and the
 * full suite passed over a dark mode whose assessment header rendered at
 * 1.21:1 — invisible. Nothing here was failing, because nothing was looking.
 *
 * So this file grades the utility layer on the two properties that failed:
 *
 *   A. Every `text-<hue>-<step>` utility is readable on the dark page —
 *      whether it has a `.dark` override or falls through to its light value.
 *      This is the one that caught the invisible text.
 *
 *   B. The retired terminal palette does not reappear. PRs 3-6 rewrite the
 *      `.terminal-*` rules where these hexes lived; a literal that slips back
 *      in is invisible to A whenever it lands on a non-text property
 *      (scrollbar thumbs, dot glows, select arrows — all real cases).
 *
 * Like contrast.test.js, the colors under test are read from the stylesheet
 * rather than retyped here, so this cannot drift green.
 */

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const CSS_PATH = path.join(__dirname, '..', 'index.css');
const source = fs.readFileSync(CSS_PATH, 'utf8');
const root = postcss.parse(source);

const AA = 4.5;

// --- WCAG (same arithmetic as contrast.test.js) -------------------------------

const channel = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

const luminance = (hex) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// --- read the two palettes out of the stylesheet ------------------------------

const customProps = (selector) => {
  const out = {};
  root.walkRules(selector, (rule) => {
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) out[decl.prop] = decl.value.trim();
    });
  });
  return out;
};

const DARK_VARS = customProps('.dark');
const DARK_PAGE = DARK_VARS['--bg-primary'];

/** Resolve a declared color to a hex, following one level of var(). */
const toHex = (value) => {
  const v = value.trim();
  const m = /^var\((--[a-z0-9-]+)\)$/i.exec(v);
  const raw = m ? DARK_VARS[m[1]] : v;
  return /^#[0-9a-f]{6}$/i.test(raw || '') ? raw.toLowerCase() : null;
};

/**
 * Collect `.text-<hue>-<step>` utilities and their dark-mode counterparts.
 * A utility with no `.dark` rule keeps its light value in dark mode — that is
 * exactly how `.text-blue-700` (#11245a) ended up invisible, so the fallback
 * is deliberate rather than a skip.
 */
const TEXT_UTILITY = /^\.(text-[a-z]+-\d+)$/;

const lightText = {};
const darkText = {};

root.walkRules((rule) => {
  rule.selectors.forEach((sel) => {
    const s = sel.trim();
    const lightMatch = TEXT_UTILITY.exec(s);
    const darkMatch = /^\.dark \.(text-[a-z]+-\d+)$/.exec(s);
    if (!lightMatch && !darkMatch) return;
    rule.walkDecls('color', (decl) => {
      const name = (lightMatch || darkMatch)[1];
      (darkMatch ? darkText : lightText)[name] = decl.value.trim();
    });
  });
});

const effectiveInDark = (name) => darkText[name] ?? lightText[name];

// --- A. readability of the utility layer in dark mode -------------------------

describe('text utilities are readable on the dark page', () => {
  it('finds both the utility layer and the dark page color', () => {
    expect(DARK_PAGE).toMatch(/^#[0-9a-f]{6}$/i);
    // If this drops to a handful, the selectors above stopped matching and
    // every assertion below is vacuously passing.
    expect(Object.keys(lightText).length).toBeGreaterThan(20);
  });

  const cases = Object.keys(lightText)
    .sort()
    .map((name) => [name, effectiveInDark(name)]);

  it.each(cases)('.%s', (name, declared) => {
    const hex = toHex(declared);
    // A utility resolving to something other than a flat hex (currentColor,
    // a gradient) is out of scope rather than a silent pass.
    if (hex === null) return;
    const ratio = contrast(hex, DARK_PAGE);
    // Report the resolved color and ratio on failure — the class name alone
    // does not say whether it fell through from light mode or resolved badly.
    expect({ [`${name} (${hex} on ${DARK_PAGE})`]: ratio >= AA }).toEqual({
      [`${name} (${hex} on ${DARK_PAGE})`]: true,
    });
  });
});

// --- B. the retired terminal palette stays retired ----------------------------

/**
 * The phosphor-green CRT palette and its warm-cream light counterpart. These
 * were the app's identity before the slate retheming; every one of them was
 * found still live somewhere in this file after the token block had already
 * been converted.
 */
const RETIRED = [
  '#33ff66', '#22cc55', '#1fb551', '#12a04a', '#0e6633', // phosphor text ramp
  '#66ff99', '#189944', '#1f5533', '#2a8044', '#001100', // phosphor accents/borders
  '#0a0a0a', '#111111', '#1a1a1a', '#000000', //             CRT surfaces
  '#ff4444', '#ff6666', '#ff8888', '#33ffff', '#ffb000', //  CRT status colors
  '#ebe6d8', '#f5f1e8', //                                   warm cream chrome
];

describe('the retired terminal palette does not reappear', () => {
  it.each(RETIRED)('%s is absent from index.css', (hex) => {
    const found = [];
    root.walkDecls((decl) => {
      if (new RegExp(`${hex}\\b`, 'i').test(decl.value)) {
        found.push(`${decl.parent.selector} { ${decl.prop}: ${decl.value} }`);
      }
    });
    expect(found).toEqual([]);
  });
});
