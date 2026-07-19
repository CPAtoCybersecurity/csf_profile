/**
 * Shape guard for the generated community test-procedure bank.
 * Drift against ASSESSMENT_CATALOG is caught by CI running
 * `node scripts/generate-procedure-bank.mjs --check`; this suite guards the
 * contract the app relies on (keys, required fields, nothing lossy/empty).
 */
import bank from './communityProcedures.json';

const SUBCATEGORY_ID = /^[A-Z]{2}\.[A-Z]{2,3}-\d{2}$/;

describe('communityProcedures.json (generated bank)', () => {
  const ids = Object.keys(bank.procedures);

  test('carries a content-hash bankVersion and an accurate count', () => {
    expect(bank.bankVersion).toMatch(/^[0-9a-f]{16}$/);
    expect(bank.procedureCount).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(106);
  });

  test('every key is a CSF subcategory ID', () => {
    const bad = ids.filter((id) => !SUBCATEGORY_ID.test(id));
    expect(bad).toEqual([]);
  });

  test('every entry preserves full markdown with title and source path', () => {
    for (const id of ids) {
      const p = bank.procedures[id];
      expect(p.title).toBeTruthy();
      expect(p.sourcePath).toMatch(
        new RegExp(`^ASSESSMENT_CATALOG/3_Test_Procedures/${id.slice(0, 2)}/${id}\\.md$`)
      );
      // Full-content guarantee: substantially longer than the old
      // headings-only flatten, and still carrying its section structure.
      expect(p.markdown.length).toBeGreaterThan(200);
      expect(p.markdown).toContain('#');
    }
  });

  test('all six CSF functions are represented', () => {
    const fns = new Set(ids.map((id) => id.slice(0, 2)));
    expect([...fns].sort()).toEqual(['DE', 'GV', 'ID', 'PR', 'RC', 'RS']);
  });

  test('no entry carries a Related section (issue #294)', () => {
    // Catalog files end with "## Related" / "## Related Artifacts" sections of
    // relative links that only resolve on GitHub — dead links in the app. The
    // generator strips the section; anything after it (e.g. "## Notes") stays.
    const offenders = ids.filter((id) => /^## Related\b/m.test(bank.procedures[id].markdown));
    expect(offenders).toEqual([]);
  });

  test('no entry carries relative markdown links — dead inside the app (issue #294)', () => {
    // Remaining relative links (e.g. ../../0_Methodology/...) are rewritten
    // to absolute GitHub blob URLs at generation so they keep working when
    // rendered in the app.
    const offenders = ids.filter((id) => /\]\(\.\.?\//.test(bank.procedures[id].markdown));
    expect(offenders).toEqual([]);
  });

  test('no entry carries tag-like tokens the app sanitizer would DELETE on attach', () => {
    // The DOMPurify-based input sanitizer deletes letter-initial <...> tokens
    // outright (e.g. "<name@example.com>", "<br>"). The generator normalizes
    // them away so attaching community text is lossless. Numeric comparisons
    // like "<4min" are only entity-encoded (render-safe) and are fine.
    const offenders = ids.filter((id) => /<[a-zA-Z/][^>]*>/.test(bank.procedures[id].markdown));
    expect(offenders).toEqual([]);
  });
});
