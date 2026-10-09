import documents from './almaCaseStudyDocuments.json';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const catalogRoot = join(__dirname, '../../ASSESSMENT_CATALOG');

test('bundles every unique case study source for reading in the app', () => {
  const paths = documents.map((document) => document.sourcePath);

  expect(paths).toEqual(expect.arrayContaining([
    'ASSESSMENT_CATALOG/0_Methodology/Alma-Fact-Sheet.md',
    'ASSESSMENT_CATALOG/0_Methodology/Scoring-Rubric-and-Methodology.md',
    'ASSESSMENT_CATALOG/1_Case_Study/README.md',
    'ASSESSMENT_CATALOG/1_Case_Study/alma-backgrounder.md',
    'ASSESSMENT_CATALOG/1_Case_Study/alma-business-case.md',
    'ASSESSMENT_CATALOG/1_Case_Study/alma-controls.csv',
    'ASSESSMENT_CATALOG/1_Case_Study/alma-assessments.csv',
    'ASSESSMENT_CATALOG/1_Case_Study/alma-financials-q1-2026.xlsx',
    'ASSESSMENT_CATALOG/1_Case_Study/alma-kpi-trends.xlsx'
  ]));
  expect(documents).toHaveLength(13);
  expect(documents.find((document) => document.id === 'backgrounder').content)
    .toContain('The 2024 Incidents and the Rebuild');
  expect(documents.find((document) => document.id === 'kpi-trends').sheets[0].rows.length)
    .toBeGreaterThan(20);
});

test('includes every unique file in the case study and methodology folders', () => {
  for (const folder of ['0_Methodology', '1_Case_Study']) {
    const sourceFiles = readdirSync(join(catalogRoot, folder))
      .filter((name) => /\.(md|csv|xlsx)$/.test(name))
      .map((name) => `ASSESSMENT_CATALOG/${folder}/${name}`);
    expect(documents.map((document) => document.sourcePath)).toEqual(expect.arrayContaining(sourceFiles));
  }
});

test('bundled markdown matches the catalog source exactly', () => {
  for (const document of documents.filter((item) => item.format === 'md')) {
    const source = readFileSync(join(__dirname, '../..', document.sourcePath), 'utf8');
    expect(document.content.replace(/\r\n/g, '\n')).toBe(source.replace(/\r\n/g, '\n'));
  }
});
