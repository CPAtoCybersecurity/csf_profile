import { resolveSourceLink } from './AlmaCaseStudyLibrary';

jest.mock('./Markdown', () => () => null);

test('links between bundled case study documents stay in the app', () => {
  expect(resolveSourceLink(
    'ASSESSMENT_CATALOG/1_Case_Study/README.md',
    '../0_Methodology/Alma-Fact-Sheet.md'
  ).document.id).toBe('fact-sheet');

  expect(resolveSourceLink(
    'ASSESSMENT_CATALOG/1_Case_Study/README.md',
    '../0_Methodology/'
  ).document.id).toBe('methodology-index');
});
