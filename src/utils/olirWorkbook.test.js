/**
 * Unit suite for the OLIR/CPRT workbook converter (PR-4). Two layers:
 *
 *  1. Synthetic-workbook fixtures exercising the exact failure modes the
 *     real corpus surfaced during derivation: a style attribute BEFORE the
 *     cell type (order-dependent parsing resolved shared-string indexes as
 *     literals), rich-text <r> runs (naive <t> extraction leaked raw XML),
 *     plus the loud-error contract (unknown compression, unknown cell type,
 *     missing sheet, drifted header).
 *
 *  2. The COMMITTED vendored workbook: converting it must reproduce the
 *     committed converted artifact byte-for-byte (rebuild-compare — the
 *     jest analog of vendor-olir.mjs --reconvert determinism).
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import {
  CONVERTER_VERSION,
  readZipEntries,
  parseSharedStrings,
  parseSheetRows,
  convertWorkbook
} from './olirWorkbook.mjs';

const OLIR_DIR = path.resolve(__dirname, '..', '..', 'vendor', 'olir');

/** Minimal ZIP writer (stored or deflate) for fixtures. */
const buildZip = (files, { method = 0 } = {}) => {
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const nameBuf = Buffer.from(name, 'utf8');
    const raw = Buffer.from(content, 'utf8');
    const data = method === 8 ? zlib.deflateRawSync(raw) : raw;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(method, 10);
    entry.writeUInt32LE(data.length, 20);
    entry.writeUInt32LE(raw.length, 24);
    entry.writeUInt16LE(nameBuf.length, 28);
    entry.writeUInt32LE(offset, 42);
    central.push(Buffer.concat([entry, nameBuf]));
    chunks.push(local, nameBuf, data);
    offset += local.length + nameBuf.length + data.length;
  }
  const cd = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(central.length, 8);
  eocd.writeUInt16LE(central.length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, cd, eocd]);
};

const sst = (items) =>
  `<?xml version="1.0"?><sst>${items.join('')}</sst>`;

describe('readZipEntries', () => {
  test('reads stored entries', () => {
    const zip = buildZip({ 'a.txt': 'hello', 'b/c.txt': 'world' });
    const entries = readZipEntries(zip);
    expect(entries.get('a.txt').toString()).toBe('hello');
    expect(entries.get('b/c.txt').toString()).toBe('world');
  });

  test('reads deflate entries', () => {
    const zip = buildZip({ 'a.txt': 'deflated content' }, { method: 8 });
    expect(readZipEntries(zip).get('a.txt').toString()).toBe('deflated content');
  });

  test('throws on an unsupported compression method', () => {
    const zip = buildZip({ 'a.txt': 'x' });
    // Patch the method field (central dir entry, offset +10) to 99.
    const cdOffset = zip.readUInt32LE(zip.length - 22 + 16);
    zip.writeUInt16LE(99, cdOffset + 10);
    expect(() => readZipEntries(zip)).toThrow(/unsupported compression method 99/);
  });

  test('throws on a non-ZIP buffer', () => {
    expect(() => readZipEntries(Buffer.from('not a zip archive at all......'))).toThrow(
      /end-of-central-directory/
    );
  });
});

describe('parseSharedStrings', () => {
  test('joins rich-text runs in order (the raw-XML-leak failure mode)', () => {
    const xml = sst([
      '<si><t>plain</t></si>',
      '<si><r><rPr><b/></rPr><t>Ex1: </t></r><r><t xml:space="preserve">rich run</t></r></si>'
    ]);
    expect(parseSharedStrings(xml)).toEqual(['plain', 'Ex1: rich run']);
  });

  test('strips phonetic rPh blocks and decodes entities', () => {
    const xml = sst(['<si><t>a &amp; b &lt;c&gt;</t><rPh sb="0" eb="1"><t>ignored</t></rPh></si>']);
    expect(parseSharedStrings(xml)).toEqual(['a & b <c>']);
  });
});

describe('parseSheetRows', () => {
  const strings = ['alpha', 'beta'];

  test('resolves shared strings when the style attribute precedes t= (attr-order fixture)', () => {
    // The real CPRT sheet writes <c r="C5" s="16" t="s"> — a positional
    // matcher reads the index as a literal "0"/"1" instead of the string.
    const xml = '<worksheet><sheetData>' +
      '<row r="1"><c r="A1" s="16" t="s"><v>0</v></c><c t="s" r="B1"><v>1</v></c></row>' +
      '</sheetData></worksheet>';
    expect(parseSheetRows(xml, strings)).toEqual([{ r: 1, cells: { A: 'alpha', B: 'beta' } }]);
  });

  test('keeps untyped numeric cells raw', () => {
    const xml = '<worksheet><sheetData><row r="2"><c r="B2"><v>46223.5</v></c></row></sheetData></worksheet>';
    expect(parseSheetRows(xml, [])).toEqual([{ r: 2, cells: { B: '46223.5' } }]);
  });

  test('throws on an unknown cell type', () => {
    const xml = '<worksheet><sheetData><row r="3"><c r="A3" t="inlineStr"><v>x</v></c></row></sheetData></worksheet>';
    expect(() => parseSheetRows(xml, [])).toThrow(/unsupported cell type t="inlineStr"/);
  });

  test('throws on an inline-string cell even when it carries no <v> (text lives in <is>, skipping would drop it)', () => {
    const xml = '<worksheet><sheetData><row r="3"><c r="A3" t="inlineStr"><is><t>ref text</t></is></c></row></sheetData></worksheet>';
    expect(() => parseSheetRows(xml, [])).toThrow(/unsupported cell type t="inlineStr"/);
  });

  test('throws on a shared-string index out of range', () => {
    const xml = '<worksheet><sheetData><row r="4"><c r="A4" t="s"><v>7</v></c></row></sheetData></worksheet>';
    expect(() => parseSheetRows(xml, strings)).toThrow(/out of range/);
  });
});

describe('convertWorkbook (synthetic workbook)', () => {
  const workbookFiles = ({ header = 'Informative References', subcatRow } = {}) => ({
    'xl/workbook.xml':
      '<workbook><sheets>' +
      '<sheet name="Introduction" r:id="rId1" sheetId="1"/>' +
      '<sheet name="CSF 2.0" r:id="rId2" sheetId="2"/>' +
      '</sheets></workbook>',
    'xl/_rels/workbook.xml.rels':
      '<Relationships>' +
      '<Relationship Id="rId1" Target="worksheets/sheet1.xml"/>' +
      '<Relationship Id="rId2" Target="worksheets/sheet2.xml"/>' +
      '</Relationships>',
    'xl/sharedStrings.xml': sst([
      '<si><t>Title</t></si>',
      '<si><t>Fixture CSF</t></si>',
      '<si><t>Change Log</t></si>',
      '<si><t>Final</t></si>',
      '<si><t>Generated Date</t></si>',
      '<si><t>Function</t></si>',
      '<si><t>Category</t></si>',
      '<si><t>Subcategory</t></si>',
      '<si><t>Implementation Examples</t></si>',
      `<si><t>${header}</t></si>`,
      `<si><t>${subcatRow || 'GV.PO-01: Policy is established'}</t></si>`,
      '<si><t>SP 800-53 Rev 5.2.0: AC-01\nSP 800-53 Rev 5.2.0: PT\nCRI Profile v2.0: GV</t></si>',
      '<si><t>PR.AC-01: [Withdrawn: Incorporated into PR.AA-01]</t></si>'
    ]),
    'xl/worksheets/sheet1.xml':
      '<worksheet><sheetData>' +
      '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row>' +
      '<row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2" t="s"><v>3</v></c></row>' +
      '<row r="3"><c r="A3" t="s"><v>4</v></c><c r="B3"><v>46223.673259606481</v></c></row>' +
      '</sheetData></worksheet>',
    'xl/worksheets/sheet2.xml':
      '<worksheet><sheetData>' +
      '<row r="2"><c r="A2" t="s"><v>5</v></c><c r="B2" t="s"><v>6</v></c><c r="C2" t="s"><v>7</v></c>' +
      '<c r="D2" t="s"><v>8</v></c><c r="E2" t="s"><v>9</v></c></row>' +
      '<row r="3"><c r="C3" s="5" t="s"><v>10</v></c><c r="E3" t="s"><v>11</v></c></row>' +
      '<row r="4"><c r="C4" t="s"><v>12</v></c></row>' +
      '</sheetData></worksheet>'
  });

  test('extracts subcategories, splits family-only refs, excludes withdrawn rows', () => {
    const converted = convertWorkbook(buildZip(workbookFiles()));
    expect(converted.converterVersion).toBe(CONVERTER_VERSION);
    expect(converted.title).toBe('Fixture CSF');
    expect(converted.changeLog).toBe('Final');
    expect(converted.generatedDate).toBe('2026-07-20');
    expect(converted.lanes).toEqual(['SP 800-53 Rev 5.2.0']);
    expect(converted.subcategories).toEqual({ 'GV.PO-01': { 'SP 800-53 Rev 5.2.0': ['AC-01'] } });
    expect(converted.familyOnlyRefs).toEqual({ 'GV.PO-01': { 'SP 800-53 Rev 5.2.0': ['PT'] } });
    expect(converted.withdrawn).toEqual(['PR.AC-01']);
    expect(converted.withdrawnCount).toBe(1);
  });

  test('throws when the data sheet is missing', () => {
    const files = workbookFiles();
    files['xl/workbook.xml'] = files['xl/workbook.xml'].replace('CSF 2.0', 'CSF 3.0');
    expect(() => convertWorkbook(buildZip(files))).toThrow(/no sheet named "CSF 2.0"/);
  });

  test('throws when the header row drifted upstream (Gate-E shape assertion)', () => {
    expect(() => convertWorkbook(buildZip(workbookFiles({ header: 'References' })))).toThrow(
      /header changed upstream/
    );
  });

  test('throws on a duplicate subcategory row', () => {
    const files = workbookFiles();
    files['xl/worksheets/sheet2.xml'] = files['xl/worksheets/sheet2.xml'].replace(
      '</sheetData>',
      '<row r="5"><c r="C5" t="s"><v>10</v></c><c r="E5" t="s"><v>11</v></c></row></sheetData>'
    );
    expect(() => convertWorkbook(buildZip(files))).toThrow(/duplicate subcategory row for GV.PO-01/);
  });
});

describe('committed vendored workbook (vendor/olir/)', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(OLIR_DIR, 'MANIFEST.json'), 'utf8'));
  const workbookRel = Object.keys(manifest.files).find((f) => f.endsWith('.xlsx'));
  const convertedRel = Object.keys(manifest.files).find((f) => f.endsWith('csf2-sp80053-refs.json'));

  test('conversion of the committed workbook reproduces the committed artifact byte-for-byte', () => {
    const converted = convertWorkbook(fs.readFileSync(path.join(OLIR_DIR, workbookRel)));
    const committed = fs.readFileSync(path.join(OLIR_DIR, convertedRel), 'utf8');
    expect(JSON.stringify(converted, null, 2) + '\n').toBe(committed);
  });

  test('release pins: 106 modern subcategories, 79 withdrawn v1.1 rows, both 800-53 lanes', () => {
    const converted = JSON.parse(fs.readFileSync(path.join(OLIR_DIR, convertedRel), 'utf8'));
    expect(converted.subcategoryCount).toBe(106);
    expect(converted.withdrawnCount).toBe(79);
    expect(converted.lanes).toEqual(['SP 800-53 Rev 5.1.1', 'SP 800-53 Rev 5.2.0']);
    expect(converted.converterVersion).toBe(manifest.converterVersion);
  });

  test('family-only refs pinned exactly: PT on GV.OC-03; CP and IR on PR.IR-03', () => {
    const converted = JSON.parse(fs.readFileSync(path.join(OLIR_DIR, convertedRel), 'utf8'));
    expect(converted.familyOnlyRefs).toEqual({
      'GV.OC-03': { 'SP 800-53 Rev 5.1.1': ['PT'], 'SP 800-53 Rev 5.2.0': ['PT'] },
      'PR.IR-03': { 'SP 800-53 Rev 5.1.1': ['CP', 'IR'], 'SP 800-53 Rev 5.2.0': ['CP', 'IR'] }
    });
  });
});
