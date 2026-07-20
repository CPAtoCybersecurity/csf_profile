/**
 * bankSourceUrl upstream capability (PR-1, plan §7 R-10): the helper must be
 * able to express a source URL that is NOT a blob in this repo — the shape a
 * platform bank's generator will emit (e.g. a CISA ScubaGoggles baseline
 * file). Proven against a mocked bank so no real entry needs the field yet.
 * (jest.mock hoists above the import, so import-order rules are satisfied
 * with the import first.)
 */
import { bankSourceUrl } from './procedureBank';

jest.mock('../data/communityProcedures.json', () => ({
  bankVersion: 'mock-version',
  procedures: {
    'GV.OC-01': {
      title: 'Repo-sourced entry',
      markdown: 'M',
      sourcePath: 'ASSESSMENT_CATALOG/3_Test_Procedures/GV/GV.OC-01.md'
    },
    'GV.OC-02': {
      title: 'Upstream-sourced entry',
      markdown: 'M2',
      sourcePath: 'ASSESSMENT_CATALOG/3_Test_Procedures/GV/GV.OC-02.md',
      upstreamUrl: 'https://github.com/cisagov/ScubaGoggles/blob/abc123/baselines/commoncontrols.md'
    }
  }
}));

test('an entry with upstreamUrl links to its non-repo upstream', () => {
  expect(bankSourceUrl('GV.OC-02')).toBe(
    'https://github.com/cisagov/ScubaGoggles/blob/abc123/baselines/commoncontrols.md'
  );
});

test('entries without upstreamUrl keep the repo blob URL', () => {
  expect(bankSourceUrl('GV.OC-01')).toBe(
    'https://github.com/CPAtoCybersecurity/csf_profile/blob/main/ASSESSMENT_CATALOG/3_Test_Procedures/GV/GV.OC-01.md'
  );
});
