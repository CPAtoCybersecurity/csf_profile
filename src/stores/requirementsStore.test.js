/**
 * Tests for framework id normalization in the requirements store.
 * CSV files carry display names ("NIST CSF 2.0") while filters compare
 * framework ids ("nist-csf-2.0") — see issue #269 (empty scope list).
 */
import useRequirementsStore, { CSF_FRAMEWORK_ID, normalizeFrameworkId, isCsfRequirement } from './requirementsStore';

describe('normalizeFrameworkId', () => {
  test('maps the CSF display name to the canonical id', () => {
    expect(normalizeFrameworkId('NIST CSF 2.0')).toBe(CSF_FRAMEWORK_ID);
  });

  test('is case-insensitive and trims whitespace', () => {
    expect(normalizeFrameworkId(' nist csf 2.0 ')).toBe(CSF_FRAMEWORK_ID);
  });

  test('passes through the canonical id unchanged', () => {
    expect(normalizeFrameworkId('nist-csf-2.0')).toBe(CSF_FRAMEWORK_ID);
  });

  test('passes through unknown frameworks unchanged', () => {
    expect(normalizeFrameworkId('iso27001-2022')).toBe('iso27001-2022');
  });

  test('passes through empty values unchanged', () => {
    expect(normalizeFrameworkId('')).toBe('');
    expect(normalizeFrameworkId(null)).toBeNull();
    expect(normalizeFrameworkId(undefined)).toBeUndefined();
  });
});

describe('isCsfRequirement', () => {
  test('matches the canonical id', () => {
    expect(isCsfRequirement({ frameworkId: 'nist-csf-2.0' })).toBe(true);
  });

  test('matches legacy persisted display-name values', () => {
    expect(isCsfRequirement({ frameworkId: 'NIST CSF 2.0' })).toBe(true);
  });

  test('rejects other frameworks', () => {
    expect(isCsfRequirement({ frameworkId: 'iso27001-2022' })).toBe(false);
  });

  test('rejects requirements without a frameworkId', () => {
    expect(isCsfRequirement({})).toBe(false);
    expect(isCsfRequirement(null)).toBe(false);
  });
});

describe('importRequirementsCSV framework normalization', () => {
  beforeEach(() => {
    useRequirementsStore.setState({ requirements: [] });
  });

  test('rows carrying the legacy display name persist with the canonical id', async () => {
    const csv = [
      'Requirement ID,Framework,CSF Function,Category Name,Subcategory ID,Implementation Example',
      'GV.SC-04 Ex1,NIST CSF 2.0,GOVERN (GV),Supply Chain (GV.SC),GV.SC-04,Ex1: Develop criteria'
    ].join('\n');

    await useRequirementsStore.getState().importRequirementsCSV(csv, CSF_FRAMEWORK_ID);

    const { requirements } = useRequirementsStore.getState();
    expect(requirements).toHaveLength(1);
    expect(requirements[0].frameworkId).toBe(CSF_FRAMEWORK_ID);
    // The view path for legacy assessments (frameworkFilter: 'nist-csf-2.0',
    // e.g. from dataMigration) filters by strict id equality — must match.
    expect(requirements.filter(r => r.frameworkId === 'nist-csf-2.0')).toHaveLength(1);
  });
});
