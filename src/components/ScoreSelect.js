import React from 'react';
import {
  QUARTER_FRACTIONS,
  wholeScoreOptions,
  composeScore,
  decomposeScore,
  snapScore
} from '../utils/scoringScale';

/**
 * ScoreSelect — two-dropdown score entry with quarter-point precision
 * (issue #277).
 *
 * The first dropdown selects the whole number (0..maxScore), the second
 * selects the quarter fraction (.00 / .25 / .50 / .75). At the scale
 * maximum the fraction locks to .00 so values above the maximum are
 * impossible to enter.
 *
 * Props:
 * - value:    current score (number; off-step legacy values display at
 *             the nearest quarter and are only changed if the user edits)
 * - onChange: called with the composed numeric score
 * - maxScore: 10 (default) or 5, from the assessment's scoringScale
 * - label:    accessible label prefix, e.g. "Actual Score"
 * - className: optional class for each <select>
 */
const ScoreSelect = ({ value, onChange, maxScore = 10, label = 'Score', className = '' }) => {
  // Clamp against the scale so an out-of-range import (e.g. an 8 in a
  // 5-point assessment) displays at the scale max instead of rendering a
  // blank controlled select. Storage is only changed if the user edits.
  const { whole, fraction } = decomposeScore(snapScore(value, maxScore));
  const atMax = whole >= maxScore;

  const handleWholeChange = (e) => {
    const nextWhole = Number(e.target.value);
    // Fraction is forced to .00 when the whole hits the maximum.
    const nextFraction = nextWhole >= maxScore ? 0 : fraction;
    onChange(composeScore(nextWhole, nextFraction, maxScore));
  };

  const handleFractionChange = (e) => {
    onChange(composeScore(whole, Number(e.target.value), maxScore));
  };

  const selectClass = className || 'p-1 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white';

  return (
    <span className="inline-flex items-center gap-1">
      <select
        value={whole}
        onChange={handleWholeChange}
        className={selectClass}
        aria-label={`${label} whole number`}
      >
        {wholeScoreOptions(maxScore).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        value={atMax ? 0 : fraction}
        onChange={handleFractionChange}
        disabled={atMax}
        className={`${selectClass} ${atMax ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={`${label} quarter fraction`}
        title={atMax ? `Fractions are not available at the maximum score of ${maxScore}` : 'Quarter-point fraction'}
      >
        {QUARTER_FRACTIONS.map((f) => (
          <option key={f} value={f}>{f.toFixed(2).slice(1)}</option>
        ))}
      </select>
    </span>
  );
};

export default ScoreSelect;
