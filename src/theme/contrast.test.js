/**
 * Theme contrast guard.
 *
 * CSS-only defects are invisible to the rest of the suite: nothing here renders
 * a stylesheet, and jsdom does not resolve custom properties. So this test
 * parses src/index.css with postcss and reads the actual declared values — the
 * colors under test come from the stylesheet, not from constants typed here.
 * Editing a hex in index.css changes this test's input; it cannot drift green.
 *
 * The hand-maintained part is which foreground pairs with which background.
 * The coverage assertion at the bottom is what keeps that honest: every
 * --text-* / --on-* token must appear in at least one pair, so adding a token
 * fails the suite until someone classifies it.
 */

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const CSS_PATH = path.join(__dirname, '..', 'index.css');
const root = postcss.parse(fs.readFileSync(CSS_PATH, 'utf8'));

// --- palette extraction ------------------------------------------------------

const collectCustomProps = (selector) => {
  const out = {};
  root.walkRules(selector, (rule) => {
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) out[decl.prop] = decl.value.trim();
    });
  });
  return out;
};

const LIGHT_VARS = collectCustomProps(':root');
const DARK_VARS = collectCustomProps('.dark');

/** Resolve a token (or literal hex) to a hex, following one level of var(). */
const resolve = (value, vars) => {
  const varMatch = /^var\((--[a-z0-9-]+)\)$/i.exec(value.trim());
  const raw = varMatch ? vars[varMatch[1]] : value.trim();
  if (!raw) throw new Error(`unresolved color: ${value}`);
  const inner = /^var\((--[a-z0-9-]+)\)$/i.exec(raw);
  const hex = inner ? vars[inner[1]] : raw;
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`not a 6-digit hex: ${value} -> ${hex}`);
  return hex.toLowerCase();
};

/** Read one declared value straight out of the stylesheet, e.g. the literals. */
const declValue = (selector, prop) => {
  let found = null;
  root.walkRules((rule) => {
    if (rule.selector.split(',').map((s) => s.trim()).includes(selector)) {
      rule.walkDecls(prop, (decl) => {
        found = decl.value.trim();
      });
    }
  });
  if (found === null) throw new Error(`no "${prop}" declared on ${selector}`);
  return found;
};

// --- WCAG relative luminance / contrast --------------------------------------

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

const parseHex = (h) => [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16));

/** Composite a translucent overlay onto an opaque background. */
const over = ([r, g, b], bg, alpha) => {
  const base = parseHex(bg);
  return `#${[r, g, b]
    .map((v, i) => Math.round(v * alpha + base[i] * (1 - alpha)).toString(16).padStart(2, '0'))
    .join('')}`;
};

/**
 * Read an `rgba(r, g, b, a)` declaration out of the stylesheet. Taking the
 * channels as well as the alpha matters: an earlier version asserted only that
 * the alpha was still 0.06 and composited a hardcoded accent, so restyling the
 * hover tint to a different color left the test grading the old surface.
 */
const rgbaDecl = (selector, prop) => {
  const raw = declValue(selector, prop);
  const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/.exec(raw);
  if (!m) throw new Error(`not an rgb(a) value on ${selector}: ${raw}`);
  return {
    rgb: [Number(m[1]), Number(m[2]), Number(m[3])],
    alpha: m[4] === undefined ? 1 : Number(m[4]),
  };
};

// --- the pair matrix ---------------------------------------------------------

const AA = 4.5;

/**
 * Surfaces text actually lands on. --bg-header is the chrome that stays dark in
 * BOTH themes, which is the trap the on-header tokens exist to avoid.
 */
const surfaces = (vars) => ({
  base: resolve('var(--bg-primary)', vars),
  secondary: resolve('var(--bg-secondary)', vars),
  header: resolve('var(--bg-header)', vars),
});

const lightSurfaces = surfaces(LIGHT_VARS);
const darkSurfaces = surfaces(DARK_VARS);

// Row hover tints: both the color and the alpha come from the stylesheet, so
// restyling `tr:hover td` re-grades every hovered-row pair automatically.
const lightHoverTint = rgbaDecl('tr:hover td', 'background-color');
const darkHoverTint = rgbaDecl('.dark tr:hover td', 'background-color');
const LIGHT_HOVER = over(lightHoverTint.rgb, lightSurfaces.base, lightHoverTint.alpha);
const DARK_HOVER = over(darkHoverTint.rgb, darkSurfaces.base, darkHoverTint.alpha);

const pairs = [
  // Informational text tiers on the page surface.
  ['light', '--text-primary on page', 'var(--text-primary)', lightSurfaces.base],
  ['light', '--text-secondary on page', 'var(--text-secondary)', lightSurfaces.base],
  ['light', '--text-muted on page', 'var(--text-muted)', lightSurfaces.base],
  ['light', '--text-faint on page', 'var(--text-faint)', lightSurfaces.base],
  ['light', '--text-faint on panel', 'var(--text-faint)', lightSurfaces.secondary],
  ['light', '--text-faint on hovered row', 'var(--text-faint)', LIGHT_HOVER],
  ['dark', '--text-primary on page', 'var(--text-primary)', darkSurfaces.base],
  ['dark', '--text-secondary on page', 'var(--text-secondary)', darkSurfaces.base],
  ['dark', '--text-muted on page', 'var(--text-muted)', darkSurfaces.base],
  ['dark', '--text-faint on page', 'var(--text-faint)', darkSurfaces.base],
  ['dark', '--text-faint on panel', 'var(--text-faint)', darkSurfaces.secondary],
  ['dark', '--text-faint on hovered row', 'var(--text-faint)', DARK_HOVER],

  // The always-dark chrome: status bar + shortcuts-overlay header.
  ['light', '--on-header-accent on chrome', 'var(--on-header-accent)', lightSurfaces.header],
  ['light', '--on-header-muted on chrome', 'var(--on-header-muted)', lightSurfaces.header],
  ['dark', '--on-header-accent on chrome', 'var(--on-header-accent)', darkSurfaces.header],
  ['dark', '--on-header-muted on chrome', 'var(--on-header-muted)', darkSurfaces.header],

  // Shortcut chips render --accent on the overlay body, which is the page surface.
  ['light', 'kbd chip in overlay body', 'var(--accent)', lightSurfaces.base],
  ['dark', 'kbd chip in overlay body', 'var(--accent)', darkSurfaces.base],

  // Active/hover inversions: dark chrome color becomes the text on an accent fill.
  ['light', 'active chip label on accent fill', 'var(--bg-header)', resolve('var(--on-header-accent)', LIGHT_VARS)],
  ['dark', 'active chip label on accent fill', 'var(--bg-header)', resolve('var(--on-header-accent)', DARK_VARS)],

  // Status-bar literals (read from the stylesheet, not retyped).
  ['light', 'status-bar value literal', declValue('.terminal-statusbar-value', 'color'), lightSurfaces.header],
  ['light', 'status-bar bar text', declValue('.terminal-statusbar', 'color'), lightSurfaces.header],

  // Warning badge on the page surface.
  ['light', 'badge-warning', declValue('.badge-warning', 'color'), lightSurfaces.base],
  ['dark', 'badge-warning', declValue('.dark .badge-warning', 'color'), darkSurfaces.base],
];

describe('luminance arithmetic', () => {
  it('matches known WCAG reference ratios', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
    expect(contrast('#123456', '#123456')).toBeCloseTo(1, 5);
  });
});

describe('palette parsing', () => {
  it('reads both theme blocks out of index.css', () => {
    expect(Object.keys(LIGHT_VARS).length).toBeGreaterThan(20);
    expect(Object.keys(DARK_VARS).length).toBeGreaterThan(10);
    // Sanity: the two themes really do define different accents.
    expect(resolve('var(--accent)', LIGHT_VARS)).not.toEqual(resolve('var(--accent)', DARK_VARS));
  });

  it('composites the row-hover tints from their declared color and alpha', () => {
    expect(lightHoverTint.alpha).toBeLessThan(1);
    expect(darkHoverTint.alpha).toBeLessThan(1);
    // The composited surfaces must actually differ from the untinted base,
    // otherwise the hovered-row pairs are silently duplicating the base pairs.
    expect(LIGHT_HOVER).not.toEqual(lightSurfaces.base);
    expect(DARK_HOVER).not.toEqual(darkSurfaces.base);
  });
});

describe('WCAG AA contrast (4.5:1) in both themes', () => {
  it.each(pairs)('%s — %s', (mode, _label, fg, bg) => {
    const vars = mode === 'dark' ? DARK_VARS : LIGHT_VARS;
    const ratio = contrast(resolve(fg, vars), bg);
    expect(ratio).toBeGreaterThanOrEqual(AA);
  });
});

describe('token coverage', () => {
  it('every informational text token is exercised by at least one pair', () => {
    const covered = new Set(pairs.map(([, , fg]) => fg));
    const merged = { ...LIGHT_VARS, ...DARK_VARS };
    // Exclude by what a value IS, not by what it looks like: --text-xs..3xl are
    // font sizes sharing the prefix. Anything that is not a length is treated
    // as a color and must be classified, so a token declared as rgb()/hsl()/
    // an 8-digit hex cannot slip past this the way a hex-only filter allowed.
    const isLength = (value) => /^[\d.]+(rem|em|px|%)$/.test(value.trim());
    const tokens = Object.keys(merged).filter(
      (name) =>
        /^--(text|on)-/.test(name) &&
        !isLength(merged[name]) &&
        name !== '--text-decorative',
    );
    const missing = tokens.filter((name) => !covered.has(`var(${name})`));
    expect(missing).toEqual([]);
  });

  it('--text-decorative is exempt and used only for ornamental glyphs', () => {
    // Exempt by WCAG 1.4.3 (decorative), so it is deliberately excluded above.
    // Guard the exemption: it may only appear on ::before/::after content rules.
    const offenders = [];
    root.walkRules((rule) => {
      rule.walkDecls((decl) => {
        if (!decl.value.includes('--text-decorative')) return;
        if (decl.prop.startsWith('--')) return;
        const isPseudoElement = /::(before|after)/.test(rule.selector);
        if (!isPseudoElement) offenders.push(rule.selector);
      });
    });
    expect(offenders).toEqual([]);
  });
});
