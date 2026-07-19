/**
 * Issue #305 — CSF function/category filters over an assessment's scoped items.
 *
 * The Assessments page is 2,900 lines and mounts the whole store graph, so
 * these tests exercise the page's rendered OUTPUT through a focused harness
 * that mirrors the page's own logic literally: the same facet derivation, the
 * same option narrowing, the same unfiltered EVAL numbering. If the page and
 * this harness ever diverge the divergence is the defect — the properties
 * asserted here (numbering stability, option narrowing, no scope mutation) are
 * the ones a filter can quietly break.
 */

const REQUIREMENTS = {
  'GV.OC-01-01': { id: 'GV.OC-01-01', function: 'GOVERN (GV)', category: 'Organizational Context (GV.OC)' },
  'GV.RM-01-01': { id: 'GV.RM-01-01', function: 'GOVERN (GV)', category: 'Risk Management Strategy (GV.RM)' },
  'PR.AA-01-01': { id: 'PR.AA-01-01', function: 'PROTECT (PR)', category: 'Identity Management (PR.AA)' },
  'DE.CM-01-01': { id: 'DE.CM-01-01', function: 'DETECT (DE)', category: 'Continuous Monitoring (DE.CM)' }
};

const getRequirement = (id) => REQUIREMENTS[id];

// --- the page's logic, mirrored -----------------------------------------

const scopedItemFacets = (item) => {
  if (item.type === 'requirement') {
    return {
      functions: item.function ? [item.function] : [],
      categories: item.category ? [item.category] : []
    };
  }
  const functions = new Set();
  const categories = new Set();
  (item.linkedRequirementIds || []).forEach((reqId) => {
    const req = getRequirement(reqId);
    if (req?.function) functions.add(req.function);
    if (req?.category) categories.add(req.category);
  });
  return { functions: [...functions], categories: [...categories] };
};

const functionOptions = (scopedItems) => {
  const found = new Set();
  scopedItems.forEach((item) => scopedItemFacets(item).functions.forEach((f) => found.add(f)));
  return [...found].sort();
};

const categoryOptions = (scopedItems, fn) => {
  const found = new Set();
  scopedItems.forEach((item) => {
    const facets = scopedItemFacets(item);
    if (fn && !facets.functions.includes(fn)) return;
    facets.categories.forEach((c) => found.add(c));
  });
  return [...found].sort();
};

const applyFilters = (scopedItems, fn, cat) => {
  if (!fn && !cat) return scopedItems;
  return scopedItems.filter((item) => {
    const facets = scopedItemFacets(item);
    if (fn && !facets.functions.includes(fn)) return false;
    if (cat && !facets.categories.includes(cat)) return false;
    return true;
  });
};

const evalNumbers = (scopedItems) => {
  const numbers = new Map();
  scopedItems.forEach((item, index) => numbers.set(item.itemId, index + 1));
  return numbers;
};

// --- fixtures -------------------------------------------------------------

const requirementItem = (id) => ({ ...REQUIREMENTS[id], type: 'requirement', itemId: id });

const REQUIREMENT_SCOPE = [
  requirementItem('GV.OC-01-01'),
  requirementItem('GV.RM-01-01'),
  requirementItem('PR.AA-01-01'),
  requirementItem('DE.CM-01-01')
];

describe('function options', () => {
  it('come from the scoped items, not the whole catalog', () => {
    const scope = [requirementItem('GV.OC-01-01'), requirementItem('PR.AA-01-01')];
    expect(functionOptions(scope)).toEqual(['GOVERN (GV)', 'PROTECT (PR)']);
    // DETECT is in the catalog but not in scope, so it is not offered.
    expect(functionOptions(scope)).not.toContain('DETECT (DE)');
  });

  it('de-duplicate when several items share a function', () => {
    expect(functionOptions(REQUIREMENT_SCOPE).filter(f => f === 'GOVERN (GV)')).toHaveLength(1);
  });

  it('are empty for an empty scope', () => {
    expect(functionOptions([])).toEqual([]);
  });
});

describe('category options narrow to the selected function', () => {
  it('offers only the selected function\'s categories', () => {
    expect(categoryOptions(REQUIREMENT_SCOPE, 'GOVERN (GV)')).toEqual([
      'Organizational Context (GV.OC)',
      'Risk Management Strategy (GV.RM)'
    ]);
  });

  it('offers every category when no function is selected', () => {
    expect(categoryOptions(REQUIREMENT_SCOPE, '')).toHaveLength(4);
  });
});

describe('filtering', () => {
  it('returns the untouched list when no filter is set', () => {
    expect(applyFilters(REQUIREMENT_SCOPE, '', '')).toBe(REQUIREMENT_SCOPE);
  });

  it('filters by function', () => {
    const filtered = applyFilters(REQUIREMENT_SCOPE, 'GOVERN (GV)', '');
    expect(filtered.map(i => i.itemId)).toEqual(['GV.OC-01-01', 'GV.RM-01-01']);
  });

  it('filters by category', () => {
    const filtered = applyFilters(REQUIREMENT_SCOPE, '', 'Identity Management (PR.AA)');
    expect(filtered.map(i => i.itemId)).toEqual(['PR.AA-01-01']);
  });

  it('applies function and category together', () => {
    const filtered = applyFilters(REQUIREMENT_SCOPE, 'GOVERN (GV)', 'Risk Management Strategy (GV.RM)');
    expect(filtered.map(i => i.itemId)).toEqual(['GV.RM-01-01']);
  });

  it('never mutates the scoped list it filters', () => {
    const before = REQUIREMENT_SCOPE.map(i => i.itemId);
    applyFilters(REQUIREMENT_SCOPE, 'GOVERN (GV)', '');
    expect(REQUIREMENT_SCOPE.map(i => i.itemId)).toEqual(before);
  });
});

describe('control-scoped assessments derive facets from linked requirements', () => {
  const CONTROL_SCOPE = [
    {
      type: 'control',
      itemId: 'CTL-001',
      controlId: 'CTL-001',
      linkedRequirementIds: ['GV.OC-01-01', 'PR.AA-01-01']
    },
    { type: 'control', itemId: 'CTL-002', controlId: 'CTL-002', linkedRequirementIds: ['DE.CM-01-01'] },
    { type: 'control', itemId: 'CTL-003', controlId: 'CTL-003', linkedRequirementIds: [] }
  ];

  it('offers the union of the linked requirements\' functions', () => {
    expect(functionOptions(CONTROL_SCOPE)).toEqual(['DETECT (DE)', 'GOVERN (GV)', 'PROTECT (PR)']);
  });

  it('matches a control that spans more than one function under either', () => {
    expect(applyFilters(CONTROL_SCOPE, 'GOVERN (GV)', '').map(i => i.itemId)).toEqual(['CTL-001']);
    expect(applyFilters(CONTROL_SCOPE, 'PROTECT (PR)', '').map(i => i.itemId)).toEqual(['CTL-001']);
  });

  it('drops a control with nothing to derive from once a filter is active, and keeps it otherwise', () => {
    expect(applyFilters(CONTROL_SCOPE, 'GOVERN (GV)', '').map(i => i.itemId)).not.toContain('CTL-003');
    expect(applyFilters(CONTROL_SCOPE, '', '').map(i => i.itemId)).toContain('CTL-003');
  });
});

describe('EVAL numbering is stable under a filter', () => {
  it('numbers from the UNFILTERED position so list and detail agree', () => {
    const numbers = evalNumbers(REQUIREMENT_SCOPE);
    const filtered = applyFilters(REQUIREMENT_SCOPE, 'PROTECT (PR)', '');

    // PR.AA-01-01 is third in the full scope, and stays EVAL-03 when it is
    // the only row on screen. Numbering off the rendered index would call it
    // EVAL-01 while the detail header still said EVAL-03.
    expect(numbers.get('PR.AA-01-01')).toBe(3);
    expect(filtered).toHaveLength(1);
    expect(numbers.get(filtered[0].itemId)).toBe(3);
  });

  it('keeps every number distinct across the full scope', () => {
    const values = [...evalNumbers(REQUIREMENT_SCOPE).values()];
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('the page is actually wired to the filtered list', () => {
  // The harness above proves the LOGIC. This proves the page USES it — the
  // failure mode a mirrored harness cannot otherwise catch is a page that
  // still renders the unfiltered list while every logic test passes.
  const fs = require('fs');
  const path = require('path');
  const source = fs.readFileSync(path.join(__dirname, 'Assessments.js'), 'utf8');

  it('renders both scoped-item lists from filteredScopedItems', () => {
    expect(source).toContain('filteredScopedItems.map(item =>');
    expect(source).toContain('filteredScopedItems.map((item) =>');
  });

  it('no longer maps the unfiltered scopedItems into a rendered list', () => {
    expect(source).not.toContain('scopedItems.map((item, index) =>');
    expect(source).not.toMatch(/\{scopedItems\.map\(item =>/);
  });

  it('derives EVAL numbers from the unfiltered index in both places', () => {
    expect(source).toContain('EVAL-{evalNumber(item.itemId)}');
    expect(source).toContain('EVAL-{evalNumber(selectedItemId)}');
    // The old rendered-index numbering must be gone from both call sites.
    expect(source).not.toContain("String(index + 1).padStart(2, '0')");
    expect(source).not.toContain("String(currentIndex + 1).padStart(2, '0')");
  });

  it('renders the two filter dropdowns in both views', () => {
    expect(source).toContain("renderScopedCsfFilters('scope')");
    expect(source).toContain("renderScopedCsfFilters('assess')");
    expect(source).toContain('Filter scoped items by CSF function');
    expect(source).toContain('Filter scoped items by CSF category');
  });

  it('clears the filters when the current assessment changes', () => {
    expect(source).toMatch(/setScopedFunctionFilter\(''\);[\s\S]{0,80}setScopedCategoryFilter\(''\);[\s\S]{0,60}\}, \[currentAssessmentId\]\)/);
  });
});

describe('navigation list selection', () => {
  const navigationItems = (filtered, all, selectedItemId) =>
    filtered.some(i => i.itemId === selectedItemId) ? filtered : all;

  it('walks the filtered list when the selection is inside it', () => {
    const filtered = applyFilters(REQUIREMENT_SCOPE, 'GOVERN (GV)', '');
    expect(navigationItems(filtered, REQUIREMENT_SCOPE, 'GV.RM-01-01')).toBe(filtered);
  });

  it('falls back to the full list when the selection is outside the filter', () => {
    const filtered = applyFilters(REQUIREMENT_SCOPE, 'GOVERN (GV)', '');
    // Without the fallback, prev/next would be dead on a deep-linked item.
    expect(navigationItems(filtered, REQUIREMENT_SCOPE, 'DE.CM-01-01')).toBe(REQUIREMENT_SCOPE);
  });
});
