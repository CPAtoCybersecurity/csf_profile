import React, { useEffect, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import Markdown from './Markdown';
import documents from '../data/almaCaseStudyDocuments.json';

const SOURCE_BASE = 'https://github.com/CPAtoCybersecurity/csf_profile/blob/main/';
const GROUPS = ['Start here', 'Company and decision', 'Data and workpapers', 'Methodology'];

export const resolveSourceLink = (sourcePath, href) => {
  if (!href || /^(https?:|mailto:)/i.test(href)) return { href };
  const [relativePath, fragment] = href.split('#');
  if (!relativePath) return { document: documents.find((item) => item.sourcePath === sourcePath), href: `${SOURCE_BASE}${sourcePath}${fragment ? `#${fragment}` : ''}` };
  const parts = sourcePath.split('/').slice(0, -1);
  for (const segment of relativePath.split('/')) {
    if (segment === '..') parts.pop();
    else if (segment && segment !== '.') parts.push(segment);
  }
  const path = parts.join('/');
  const targetPath = relativePath.endsWith('/') ? `${path}/README.md` : path;
  return {
    document: documents.find((item) => item.sourcePath === targetPath),
    href: `${SOURCE_BASE.replace('/blob/', relativePath.endsWith('/') ? '/tree/' : '/blob/')}${path}${fragment ? `#${fragment}` : ''}`
  };
};

const letter = (index) => {
  let number = index + 1;
  let label = '';
  while (number > 0) {
    number -= 1;
    label = String.fromCharCode(65 + (number % 26)) + label;
    number = Math.floor(number / 26);
  }
  return label;
};

const Workbook = ({ document }) => (
  <div>
    {document.sheets.map((sheet) => (
      <div key={sheet.name} className="assessment-brief__data-section">
        <h3>{sheet.name}</h3>
        <div className="assessment-brief__table-wrap" tabIndex="0" aria-label={`${sheet.name} spreadsheet, scroll to see all columns`}>
          <table>
            <caption>{document.title}: {sheet.name}</caption>
            <thead><tr><th scope="col">Row</th>{sheet.rows[0].map((_, index) => <th scope="col" key={index}>{letter(index)}</th>)}</tr></thead>
            <tbody>
              {sheet.rows.map((row, index) => (
                <tr key={index}>
                  <th scope="row">{index + 1}</th>
                  {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </div>
);

const CsvRecords = ({ document }) => {
  const [recordIndex, setRecordIndex] = useState(0);
  const [headers, ...records] = document.rows;
  useEffect(() => setRecordIndex(0), [document.id]);
  const record = records[recordIndex] || [];

  return (
    <div className="assessment-brief__records">
      <label htmlFor="alma-record-select">Record ({records.length} total)</label>
      <select id="alma-record-select" value={recordIndex} onChange={(event) => setRecordIndex(Number(event.target.value))}>
        {records.map((row, index) => <option value={index} key={index}>{row[0] || `Record ${index + 1}`}</option>)}
      </select>
      <dl>
        {headers.map((header, index) => (
          <div key={index}>
            <dt>{header}</dt>
            <dd>{record[index] || '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

const AlmaCaseStudyLibrary = () => {
  const [selectedId, setSelectedId] = useState('case-study-index');
  const [query, setQuery] = useState('');
  const selected = documents.find((document) => document.id === selectedId) || documents[0];
  const filtered = documents.filter((document) =>
    `${document.title} ${document.group}`.toLowerCase().includes(query.toLowerCase().trim())
  );

  return (
    <section className="assessment-brief__library" aria-labelledby="alma-library-title">
      <div className="assessment-brief__library-heading">
        <h2 id="alma-library-title">Complete Alma case study library</h2>
        <p>Read the original catalog material here. Markdown and spreadsheets are shown directly; the Word files duplicate the backgrounder and business case.</p>
      </div>
      <div className="assessment-brief__library-layout">
        <nav className="assessment-brief__library-nav" aria-label="Alma case study documents">
          <label htmlFor="alma-document-search"><Search size={16} aria-hidden="true" /> Find a document</label>
          <input id="alma-document-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles" />
          {GROUPS.map((group) => {
            const groupDocuments = filtered.filter((document) => document.group === group);
            return groupDocuments.length ? (
              <div key={group}>
                <h3>{group}</h3>
                {groupDocuments.map((document) => (
                  <button
                    key={document.id}
                    type="button"
                    className={document.id === selectedId ? 'is-active' : ''}
                    aria-current={document.id === selectedId ? 'page' : undefined}
                    onClick={() => setSelectedId(document.id)}
                  >
                    {document.title}
                  </button>
                ))}
              </div>
            ) : null;
          })}
          {filtered.length === 0 && <p>No matching documents.</p>}
        </nav>
        <article className="assessment-brief__document" aria-labelledby="alma-document-title">
          <div className="assessment-brief__document-header">
            <div>
              <span>{selected.group} · {selected.format.toUpperCase()}</span>
              <h2 id="alma-document-title">{selected.title}</h2>
            </div>
            <a href={`${SOURCE_BASE}${selected.sourcePath}`} target="_blank" rel="noopener noreferrer">
              Original file <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
          {selected.format === 'md' && (
            <div className="prose assessment-brief__prose">
              <Markdown
                components={{
                  a: ({ href, children }) => {
                    const link = resolveSourceLink(selected.sourcePath, href);
                    return link.document ? (
                      <button type="button" className="assessment-brief__text-link" onClick={() => setSelectedId(link.document.id)}>{children}</button>
                    ) : <a href={link.href} target="_blank" rel="noopener noreferrer">{children}</a>;
                  }
                }}
              >
                {selected.content}
              </Markdown>
            </div>
          )}
          {selected.format === 'csv' && <CsvRecords document={selected} />}
          {selected.format === 'xlsx' && <Workbook document={selected} />}
        </article>
      </div>
    </section>
  );
};

export default AlmaCaseStudyLibrary;
