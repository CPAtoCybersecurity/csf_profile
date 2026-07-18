import {
  DEFAULT_SCALE,
  SCALE_OPTIONS,
  QUARTER_FRACTIONS,
  CMMI_LEVELS,
  getScoringScale,
  wholeScoreOptions,
  scaleRatio,
  snapScore,
  composeScore,
  decomposeScore,
  scoreBand,
  formatScore
} from './scoringScale';

describe('scoringScale utilities', () => {
  describe('getScoringScale', () => {
    it('defaults to 10 for missing assessment', () => {
      expect(getScoringScale(null)).toBe(10);
      expect(getScoringScale(undefined)).toBe(10);
    });

    it('defaults to 10 for legacy assessments without the field', () => {
      expect(getScoringScale({ id: 'ASM-1', name: 'Legacy' })).toBe(10);
    });

    it('returns 5 only for an explicit 5', () => {
      expect(getScoringScale({ scoringScale: 5 })).toBe(5);
      expect(getScoringScale({ scoringScale: 10 })).toBe(10);
      expect(getScoringScale({ scoringScale: '5' })).toBe(10);
      expect(getScoringScale({ scoringScale: 7 })).toBe(10);
    });
  });

  describe('wholeScoreOptions', () => {
    it('generates 0..10 for the 10-point scale', () => {
      expect(wholeScoreOptions(10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('generates 0..5 for the 5-point scale', () => {
      expect(wholeScoreOptions(5)).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('treats invalid scales as 10', () => {
      expect(wholeScoreOptions(undefined)).toHaveLength(11);
      expect(wholeScoreOptions(7)).toHaveLength(11);
    });
  });

  describe('quarter fractions', () => {
    it('offers exactly .00 .25 .50 .75', () => {
      expect(QUARTER_FRACTIONS).toEqual([0, 0.25, 0.5, 0.75]);
    });
  });

  describe('composeScore', () => {
    it('combines whole and fraction', () => {
      expect(composeScore(7, 0.25, 10)).toBe(7.25);
      expect(composeScore(3, 0.75, 5)).toBe(3.75);
      expect(composeScore(0, 0, 10)).toBe(0);
    });

    it('clamps at the scale maximum', () => {
      expect(composeScore(10, 0.75, 10)).toBe(10);
      expect(composeScore(10, 0.25, 10)).toBe(10);
      expect(composeScore(5, 0.25, 5)).toBe(5);
      expect(composeScore(5, 0.75, 5)).toBe(5);
    });

    it('never returns negative', () => {
      expect(composeScore(-1, 0, 10)).toBe(0);
    });
  });

  describe('decomposeScore', () => {
    it('is exact for every quarter step 0..10', () => {
      for (let q = 0; q <= 40; q++) {
        const score = q / 4;
        const { whole, fraction } = decomposeScore(score);
        expect(whole + fraction).toBe(score);
        expect(QUARTER_FRACTIONS).toContain(fraction);
      }
    });

    it('handles legacy half points exactly', () => {
      expect(decomposeScore(7.5)).toEqual({ whole: 7, fraction: 0.5 });
    });

    it('snaps off-step legacy values to the nearest quarter for display', () => {
      expect(decomposeScore(7.3)).toEqual({ whole: 7, fraction: 0.25 });
      expect(decomposeScore(9.9)).toEqual({ whole: 10, fraction: 0 });
    });

    it('handles invalid input', () => {
      expect(decomposeScore(undefined)).toEqual({ whole: 0, fraction: 0 });
      expect(decomposeScore('abc')).toEqual({ whole: 0, fraction: 0 });
    });
  });

  describe('snapScore', () => {
    it('snaps to nearest quarter and clamps to scale', () => {
      expect(snapScore(7.3, 10)).toBe(7.25);
      expect(snapScore(7.9, 10)).toBe(8);
      expect(snapScore(12, 10)).toBe(10);
      expect(snapScore(6, 5)).toBe(5);
      expect(snapScore(-2, 10)).toBe(0);
      expect(snapScore('junk', 10)).toBe(0);
    });
  });

  describe('scoreBand', () => {
    it('keeps the existing 10-point thresholds (>=8 green, >=5 yellow)', () => {
      expect(scoreBand(8, 10)).toBe('green');
      expect(scoreBand(7.75, 10)).toBe('yellow');
      expect(scoreBand(5, 10)).toBe('yellow');
      expect(scoreBand(4.75, 10)).toBe('red');
      expect(scoreBand(0, 10)).toBe('red');
    });

    it('is proportional on the 5-point scale (>=4 green, >=2.5 yellow)', () => {
      expect(scoreBand(4, 5)).toBe('green');
      expect(scoreBand(3.75, 5)).toBe('yellow');
      expect(scoreBand(2.5, 5)).toBe('yellow');
      expect(scoreBand(2.25, 5)).toBe('red');
    });
  });

  describe('scaleRatio', () => {
    it('is 1 for 10-point and 0.5 for 5-point', () => {
      expect(scaleRatio(10)).toBe(1);
      expect(scaleRatio(5)).toBe(0.5);
      expect(scaleRatio(undefined)).toBe(1);
    });
  });

  describe('formatScore', () => {
    it('trims trailing zeros', () => {
      expect(formatScore(7)).toBe('7');
      expect(formatScore(7.5)).toBe('7.5');
      expect(formatScore(7.25)).toBe('7.25');
      expect(formatScore(0)).toBe('0');
      expect(formatScore('bad')).toBe('0');
    });
  });

  describe('reference data', () => {
    it('exposes both scales with 10 first (the default)', () => {
      expect(SCALE_OPTIONS).toEqual([10, 5]);
      expect(DEFAULT_SCALE).toBe(10);
    });

    it('defines all six CMMI-style levels 0..5', () => {
      expect(CMMI_LEVELS.map(l => l.level)).toEqual([0, 1, 2, 3, 4, 5]);
      expect(CMMI_LEVELS[0].name).toBe('Not Performed');
      expect(CMMI_LEVELS[5].name).toBe('Optimizing');
    });
  });
});
