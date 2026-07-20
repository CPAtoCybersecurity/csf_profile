/**
 * OLIR / CPRT workbook reader — converts the NIST CPRT "CSF 2.0 Reference
 * Tool" bulk-download workbook (XLSX) into the committed crosswalk artifact
 * under vendor/olir/ (plan §7 R-2; PR-4).
 *
 * Runs at VENDOR time only (scripts/vendor-olir.mjs): CI never parses XLSX —
 * it consumes the committed converted JSON, integrity-pinned by
 * vendor/olir/MANIFEST.json (scripts/verify-olir-integrity.mjs).
 *
 * Faithful-extraction contract: reference strings are preserved RAW as the
 * workbook states them (e.g. "AC-07", "SI-02(07)" — zero-padded). All
 * normalization and grain interpretation is JOIN logic
 * (src/utils/subcategoryMapping.mjs, versioned by GENERATOR_VERSION), so a
 * join-rule fix never requires re-vendoring. The one structural split made
 * here: bare FAMILY codes ("PT", "CP", "IR") are not control references and
 * are recorded separately in familyOnlyRefs — never silently dropped.
 *
 * The workbook is generated per request by the CPRT service (Apache POI,
 * creation timestamp = fetch time), so the raw bytes are NOT stable across
 * downloads. The committed copy is the pin; conversion from that committed
 * copy is deterministic and re-runnable via vendor-olir.mjs --reconvert.
 *
 * No dependencies: a minimal ZIP reader (stored + deflate entries) plus
 * targeted SpreadsheetML parsing. Anything outside the measured shape —
 * unknown compression method, unknown cell type, missing sheet, changed
 * header row — is a loud error, never a silent skip: a silently dropped
 * reference would surface as a missing mapping with no signal.
 */

import zlib from 'node:zlib';

export const CONVERTER_VERSION = 1;

/** Sheet + header shape the converter requires (Gate-E: error on drift). */
export const DATA_SHEET_NAME = 'CSF 2.0';
export const EXPECTED_HEADER = [
  'Function',
  'Category',
  'Subcategory',
  'Implementation Examples',
  'Informative References'
];

const EOCD_SIG = 0x06054b50;
const CENTRAL_SIG = 0x02014b50;
const LOCAL_SIG = 0x04034b50;

/** Read a ZIP archive into a Map of entry name -> Buffer. */
export const readZipEntries = (buffer) => {
  // End-of-central-directory record: scan back from EOF (max comment 64 KiB).
  let eocd = -1;
  const scanFloor = Math.max(0, buffer.length - 65557);
  for (let i = buffer.length - 22; i >= scanFloor; i--) {
    if (buffer.readUInt32LE(i) === EOCD_SIG) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) throw new Error('olirWorkbook: not a ZIP archive (no end-of-central-directory)');

  const entryCount = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  const entries = new Map();

  for (let n = 0; n < entryCount; n++) {
    if (buffer.readUInt32LE(offset) !== CENTRAL_SIG) {
      throw new Error(`olirWorkbook: bad central-directory signature at ${offset}`);
    }
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLen = buffer.readUInt16LE(offset + 28);
    const extraLen = buffer.readUInt16LE(offset + 30);
    const commentLen = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLen);

    if (buffer.readUInt32LE(localOffset) !== LOCAL_SIG) {
      throw new Error(`olirWorkbook: bad local-header signature for ${name}`);
    }
    const localNameLen = buffer.readUInt16LE(localOffset + 26);
    const localExtraLen = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLen + localExtraLen;
    const raw = buffer.subarray(dataStart, dataStart + compressedSize);

    if (method === 0) {
      entries.set(name, Buffer.from(raw));
    } else if (method === 8) {
      entries.set(name, zlib.inflateRawSync(raw));
    } else {
      throw new Error(`olirWorkbook: unsupported compression method ${method} for ${name}`);
    }
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
};

const decodeXml = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&');

/**
 * Shared strings: each <si> is either a plain <t> or a sequence of rich-text
 * <r> runs each holding a <t>. Runs are joined in order; phonetic <rPh>
 * blocks (never text content) are stripped first.
 */
export const parseSharedStrings = (xml) => {
  const strings = [];
  for (const si of xml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    const body = si[1].replace(/<rPh[\s\S]*?<\/rPh>/g, '');
    const runs = [...body.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => decodeXml(m[1]));
    strings.push(runs.join(''));
  }
  return strings;
};

/**
 * Worksheet rows -> [{ r, cells: { A: string, ... } }]. Cell attributes are
 * parsed individually (never positionally: real CPRT cells interleave the
 * style attribute s= before t=, which defeats order-dependent matching).
 * Cell types: t="s" (shared string), and untyped or t="n" (raw
 * numeric/value) are the measured corpus; any OTHER declared type
 * (inlineStr, str, b, e) is a loud error BEFORE the empty-value check —
 * those types carry their text outside <v>, so skipping them on
 * value-absence would be exactly the silent reference drop the converter
 * contract forbids. (Residual: an untyped formula cell with no <v> still
 * reads as empty; the header-shape assertion and the pinned
 * subcategory/reference counts are the guard for that never-observed shape.)
 */
export const parseSheetRows = (xml, strings) => {
  const rows = [];
  for (const row of xml.matchAll(/<row [^>]*?r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = {};
    for (const c of row[2].matchAll(/<c\s([^>]*?)\/?>(?:<v>([\s\S]*?)<\/v>)?/g)) {
      const attrs = c[1];
      const ref = (attrs.match(/(?:^|\s)r="([A-Z]+)\d+"/) || [])[1];
      const type = (attrs.match(/(?:^|\s)t="(\w+)"/) || [])[1];
      const value = c[2];
      if (!ref) continue;
      if (type !== undefined && type !== 's' && type !== 'n') {
        throw new Error(`olirWorkbook: unsupported cell type t="${type}" in row ${row[1]}`);
      }
      if (value === undefined) continue;
      if (type === 's') {
        const idx = Number(value);
        if (!Number.isInteger(idx) || idx < 0 || idx >= strings.length) {
          throw new Error(`olirWorkbook: shared-string index ${value} out of range in row ${row[1]}`);
        }
        cells[ref] = strings[idx];
      } else {
        cells[ref] = decodeXml(value);
      }
    }
    rows.push({ r: Number(row[1]), cells });
  }
  return rows;
};

/** Resolve a sheet name to its worksheet XML path via workbook.xml + rels. */
const sheetPathByName = (entries, sheetName) => {
  const workbook = entries.get('xl/workbook.xml')?.toString('utf8');
  if (!workbook) throw new Error('olirWorkbook: xl/workbook.xml missing');
  const sheet = [...workbook.matchAll(/<sheet [^>]*>/g)]
    .map((m) => m[0])
    .find((tag) => (tag.match(/name="([^"]*)"/) || [])[1] === sheetName);
  if (!sheet) throw new Error(`olirWorkbook: no sheet named "${sheetName}" in workbook`);
  const rId = (sheet.match(/r:id="([^"]*)"/) || [])[1];
  const rels = entries.get('xl/_rels/workbook.xml.rels')?.toString('utf8');
  if (!rels) throw new Error('olirWorkbook: xl/_rels/workbook.xml.rels missing');
  const rel = [...rels.matchAll(/<Relationship [^>]*>/g)]
    .map((m) => m[0])
    .find((tag) => (tag.match(/Id="([^"]*)"/) || [])[1] === rId);
  if (!rel) throw new Error(`olirWorkbook: no relationship for sheet "${sheetName}" (${rId})`);
  const target = (rel.match(/Target="([^"]*)"/) || [])[1];
  return `xl/${target.replace(/^\//, '').replace(/^xl\//, '')}`;
};

const SUBCATEGORY_ID = /^([A-Z]{2}\.[A-Z]{2}-\d{2}):/;
const SP80053_LINE = /^SP 800-53 Rev (\d+\.\d+\.\d+):\s*(.+)$/;
const FAMILY_ONLY = /^[A-Z]{2,3}$/;

const sortedObject = (obj) =>
  Object.fromEntries(Object.keys(obj).sort().map((k) => [k, obj[k]]));

/**
 * Convert the workbook buffer into the vendored crosswalk artifact object.
 * Deterministic for a fixed input: sorted keys throughout, no clock reads.
 */
export const convertWorkbook = (buffer) => {
  const entries = readZipEntries(buffer);
  const strings = parseSharedStrings(entries.get('xl/sharedStrings.xml')?.toString('utf8') || '');

  // Release identity from the Introduction sheet (title / change log /
  // generated-date serial) — the workbook's own statement of what it is.
  const introRows = parseSheetRows(
    entries.get(sheetPathByName(entries, 'Introduction')).toString('utf8'),
    strings
  );
  const introField = (label) =>
    introRows.find((r) => r.cells.A === label)?.cells.B || '';
  const generatedSerial = Number(introField('Generated Date')) || null;
  // Excel serial (1900 date system, epoch 1899-12-30) -> UTC date string.
  const generatedDate = generatedSerial
    ? new Date(Date.UTC(1899, 11, 30) + Math.round(generatedSerial * 86400000)).toISOString().slice(0, 10)
    : null;

  const rows = parseSheetRows(
    entries.get(sheetPathByName(entries, DATA_SHEET_NAME)).toString('utf8'),
    strings
  );

  const header = rows.find((r) => r.cells.A === EXPECTED_HEADER[0]);
  const headerCells = header ? ['A', 'B', 'C', 'D', 'E'].map((col) => header.cells[col]) : [];
  if (headerCells.join('|') !== EXPECTED_HEADER.join('|')) {
    throw new Error(
      `olirWorkbook: data-sheet header changed upstream — got [${headerCells.join(', ')}]. ` +
      'The CPRT export shape drifted; re-derive the converter before re-vendoring.'
    );
  }

  const subcategories = {};
  const familyOnlyRefs = {};
  const withdrawn = [];
  const laneSet = new Set();

  for (const row of rows) {
    const c = row.cells.C || '';
    const idMatch = c.match(SUBCATEGORY_ID) || c.match(/^([A-Z]{2}\.[A-Z]{2}-\d{2})/);
    if (!idMatch) continue;
    const id = idMatch[1];
    if (c.includes('[Withdrawn:')) {
      withdrawn.push(id);
      continue;
    }
    const lanes = {};
    for (const line of (row.cells.E || '').split('\n')) {
      const m = line.trim().match(SP80053_LINE);
      if (!m) continue;
      const lane = `SP 800-53 Rev ${m[1]}`;
      const ref = m[2].trim();
      laneSet.add(lane);
      if (FAMILY_ONLY.test(ref)) {
        if (!familyOnlyRefs[id]) familyOnlyRefs[id] = {};
        if (!familyOnlyRefs[id][lane]) familyOnlyRefs[id][lane] = [];
        familyOnlyRefs[id][lane].push(ref);
      } else {
        if (!lanes[lane]) lanes[lane] = [];
        lanes[lane].push(ref);
      }
    }
    if (subcategories[id]) throw new Error(`olirWorkbook: duplicate subcategory row for ${id}`);
    subcategories[id] = sortedObject(
      Object.fromEntries(Object.entries(lanes).map(([k, v]) => [k, [...new Set(v)].sort()]))
    );
  }

  return {
    convertedFormat: 'olir-csf2-sp80053-refs-v1',
    converterVersion: CONVERTER_VERSION,
    title: introField('Title'),
    changeLog: introField('Change Log'),
    generatedDateSerial: generatedSerial,
    generatedDate,
    lanes: [...laneSet].sort(),
    subcategoryCount: Object.keys(subcategories).length,
    withdrawnCount: withdrawn.length,
    withdrawn: withdrawn.sort(),
    familyOnlyRefs: sortedObject(
      Object.fromEntries(
        Object.entries(familyOnlyRefs).map(([id, lanes]) => [
          id,
          sortedObject(Object.fromEntries(Object.entries(lanes).map(([k, v]) => [k, [...new Set(v)].sort()])))
        ])
      )
    ),
    subcategories: sortedObject(subcategories)
  };
};
