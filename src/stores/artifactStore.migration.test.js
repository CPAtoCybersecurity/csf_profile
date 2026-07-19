import { repairRelocatedLinks } from './artifactStore';
import { RELOCATED_ARTIFACT_LINKS } from './defaultArtifactsData';

const [DEAD_LINK, LIVE_LINK] = Object.entries(RELOCATED_ARTIFACT_LINKS)[0];

describe('repairRelocatedLinks (artifacts store migration v7, issue #287)', () => {
  test('rewrites a seeded link that the ASSESSMENT_CATALOG restructure broke', () => {
    const before = { artifacts: [{ artifactId: 'AR-1', link: DEAD_LINK }] };
    expect(repairRelocatedLinks(before).artifacts[0].link).toBe(LIVE_LINK);
  });

  test('covers every entry in the relocation map', () => {
    const artifacts = Object.keys(RELOCATED_ARTIFACT_LINKS).map((link, i) => ({
      artifactId: `AR-${i}`,
      link
    }));
    const repaired = repairRelocatedLinks({ artifacts }).artifacts;
    expect(repaired.map(a => a.link)).toEqual(Object.values(RELOCATED_ARTIFACT_LINKS));
  });

  test('leaves a link the user entered themselves alone', () => {
    const mine = 'https://intranet.example.com/evidence/phishing-q1.xlsx';
    const before = { artifacts: [{ artifactId: 'AR-99', link: mine }] };
    expect(repairRelocatedLinks(before).artifacts[0].link).toBe(mine);
  });

  test('preserves every other field on a rewritten artifact', () => {
    const artifact = {
      artifactId: 'AR-1',
      name: 'Phishing Campaign Results',
      link: DEAD_LINK,
      controlId: 'PR.AT-01 Ex2',
      status: 'ACTIVE'
    };
    expect(repairRelocatedLinks({ artifacts: [artifact] }).artifacts[0]).toEqual({
      ...artifact,
      link: LIVE_LINK
    });
  });

  test('preserves sibling keys on the persisted state', () => {
    const before = { artifacts: [{ artifactId: 'AR-1', link: DEAD_LINK }], somethingElse: 42 };
    expect(repairRelocatedLinks(before).somethingElse).toBe(42);
  });

  test('is idempotent — a second pass changes nothing', () => {
    const once = repairRelocatedLinks({ artifacts: [{ artifactId: 'AR-1', link: DEAD_LINK }] });
    expect(repairRelocatedLinks(once)).toBe(once);
  });

  test('returns the state untouched when there is nothing to repair', () => {
    const state = { artifacts: [{ artifactId: 'AR-1', link: LIVE_LINK }] };
    expect(repairRelocatedLinks(state)).toBe(state);
  });

  test.each([
    ['undefined state', undefined],
    ['null state', null],
    ['missing artifacts key', {}],
    ['artifacts not an array', { artifacts: 'corrupt' }]
  ])('survives %s without throwing', (_label, state) => {
    expect(() => repairRelocatedLinks(state)).not.toThrow();
  });

  test('tolerates artifacts with no link field', () => {
    const before = { artifacts: [{ artifactId: 'AR-6' }, null] };
    expect(() => repairRelocatedLinks(before)).not.toThrow();
  });

  test('every relocation target is a link this repo actually ships', () => {
    for (const target of Object.values(RELOCATED_ARTIFACT_LINKS)) {
      expect(target).toContain('/ASSESSMENT_CATALOG/');
      expect(target).not.toContain('/Sample_Artifacts/');
    }
  });
});
