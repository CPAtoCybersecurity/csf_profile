/**
 * Scoring scale utilities (issue #277).
 *
 * An assessment carries a `scoringScale` of 10 (default — the classic
 * 10-point scale) or 5 (CMMI-style maturity scale, as in the NIST CSF
 * Maturity Toolkit). Scores are stored RAW on the assessment's own scale
 * and are never rescaled; every scale-dependent threshold in the app is
 * expressed as a fraction of the scale via `scaleRatio` so 10-point
 * behavior is unchanged and 5-point behavior is proportional.
 *
 * Both scales support quarter-point precision (0.25 steps). Quarter
 * fractions (.0, .25, .5, .75) are exactly representable in binary
 * floating point, so compose/decompose round-trips are lossless.
 *
 * Assessments never mix scales in aggregate views today (dashboards,
 * reports and exports are single-assessment scoped). If a cross-assessment
 * comparison surface is ever added, normalize at that boundary — not in
 * storage.
 */

export const DEFAULT_SCALE = 10;

/** Valid scale values, in display order (10 first — it is the default). */
export const SCALE_OPTIONS = [10, 5];

/** The quarter-point fraction choices offered by the second dropdown. */
export const QUARTER_FRACTIONS = [0, 0.25, 0.5, 0.75];

/**
 * CMMI-style maturity level reference for the 5-point scale
 * (classic CMM level names; 0 = not performed at all).
 */
export const CMMI_LEVELS = [
  { level: 0, name: 'Not Performed', description: 'The activity is not performed at all.' },
  { level: 1, name: 'Initial', description: 'Ad hoc and reactive; success depends on individual effort.' },
  { level: 2, name: 'Repeatable', description: 'Basic processes established; discipline exists to repeat earlier successes.' },
  { level: 3, name: 'Defined', description: 'Processes documented, standardized, and integrated across the organization.' },
  { level: 4, name: 'Managed', description: 'Processes quantitatively measured and controlled.' },
  { level: 5, name: 'Optimizing', description: 'Continuous process improvement from quantitative feedback and piloting.' }
];

/**
 * Per-level policy/process maturity expectations for the 5-point CMMI-style
 * scale, from the Cyber Resilience courses in Simply Cyber Academy. Levels
 * 1-5 only by design — level 0 (Not Performed) means the activity does not
 * occur at all, so there is no policy/process expectation to state. Rendered
 * on the Reference page; CMMI_LEVELS above stays the short-label source for
 * dropdowns, the wizard, and report legends.
 */
export const CMMI_EXPECTATIONS = [
  {
    level: 1,
    name: 'Initial',
    policy: 'Policy or standard does not exist or is not formally approved by management.',
    process: 'Standard process does not exist.'
  },
  {
    level: 2,
    name: 'Repeatable',
    policy: 'Policy or standard exists, but has not been reviewed in more than 2 years.',
    process: 'Ad-hoc process exists and is done informally.'
  },
  {
    level: 3,
    name: 'Defined',
    policy: 'Policy and standard exists with formal management approval. Policy exceptions are documented, approved and occur less than 5% of the time.',
    process: 'Formal process exists and is documented. Evidence can be provided for most activities. Less than 10% exceptions.'
  },
  {
    level: 4,
    name: 'Managed',
    policy: 'Policy and standard exists with formal management approval. Policy exceptions are documented, approved and occur less than 3% of the time.',
    process: 'Formal process exists and is documented. Evidence can be provided for all activities and detailed metrics of the process are captured and reported. Minimal target for metrics has been established. Less than 5% of process exceptions occur with minimal reoccurring exceptions.'
  },
  {
    level: 5,
    name: 'Optimizing',
    policy: 'Policy and standard exists with formal management approval. Policy exceptions are documented, approved and occur less than 0.5% of the time.',
    process: 'Formal process exists and is documented. Evidence can be provided for all activities and detailed metrics of the process are captured and reported. Minimal target for metrics has been established and continually improving. Less than 1% of process exceptions occur.'
  }
];

/**
 * Resolve an assessment's scoring scale. Anything other than an explicit
 * 5 resolves to the default 10 — including legacy assessments created
 * before the field existed.
 */
export function getScoringScale(assessment) {
  return assessment && assessment.scoringScale === 5 ? 5 : DEFAULT_SCALE;
}

/** Whole-number options for the first dropdown: 0..scale inclusive. */
export function wholeScoreOptions(scale) {
  const max = scale === 5 ? 5 : DEFAULT_SCALE;
  return Array.from({ length: max + 1 }, (_, i) => i);
}

/**
 * Ratio for converting a threshold defined on the 10-point scale to the
 * assessment's scale. Multiplying every absolute threshold by this keeps
 * 10-point behavior identical and makes 5-point proportional.
 */
export function scaleRatio(scale) {
  return (scale === 5 ? 5 : DEFAULT_SCALE) / DEFAULT_SCALE;
}

/** Snap a value to the nearest quarter point, clamped to [0, scale]. */
export function snapScore(value, scale) {
  const max = scale === 5 ? 5 : DEFAULT_SCALE;
  const num = Number(value);
  if (isNaN(num)) return 0;
  const snapped = Math.round(num * 4) / 4;
  return Math.min(Math.max(snapped, 0), max);
}

/**
 * Combine the two dropdown values into one score, clamped to the scale
 * maximum (so whole=10 + fraction=.75 yields 10, never 10.75).
 */
export function composeScore(whole, fraction, scale) {
  return snapScore(Number(whole) + Number(fraction), scale);
}

/**
 * Split a stored score into { whole, fraction } for the two dropdowns.
 * Off-step legacy values (e.g. 7.3 from an old CSV import) are shown at
 * the nearest quarter; storage is only changed if the user edits.
 */
export function decomposeScore(score) {
  const num = Number(score);
  const snapped = isNaN(num) ? 0 : Math.max(Math.round(num * 4) / 4, 0);
  const whole = Math.floor(snapped);
  return { whole, fraction: snapped - whole };
}

/**
 * Traffic-light band for a score on its scale. Thresholds are the
 * existing >=8 green / >=5 yellow on the 10-point scale, expressed
 * proportionally (80% / 50% of the scale max).
 */
export function scoreBand(score, scale) {
  const max = scale === 5 ? 5 : DEFAULT_SCALE;
  const num = Number(score) || 0;
  if (num >= 0.8 * max) return 'green';
  if (num >= 0.5 * max) return 'yellow';
  return 'red';
}

/** Format a score without trailing zeros: 7 -> "7", 7.5 -> "7.5", 7.25 -> "7.25". */
export function formatScore(score) {
  const num = Number(score);
  if (isNaN(num)) return '0';
  return String(parseFloat(num.toFixed(2)));
}
