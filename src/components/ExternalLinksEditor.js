import React, { useState } from 'react';
import { ExternalLink, Plus, X } from 'lucide-react';
import {
  EXTERNAL_LINK_TYPES,
  EXTERNAL_URL_MAX_LENGTH,
  MAX_EXTERNAL_LINKS,
  normalizeExternalLinks,
  normalizeExternalTracking,
  sanitizeExternalUrl
} from '../utils/externalLinks';

/**
 * Typed external-link editor for an evaluation observation (issue #288).
 *
 * "Add (not select)": the user pastes links to findings, artifacts, and
 * controls that live in EXTERNAL systems (a Jira ticket, a SharePoint
 * document, a Hyperproof control) — no in-app record is created or picked.
 * Group labels use the assessment's per-type system names when configured;
 * the editor itself is always available, with or without the External
 * Tracking option (#286-ratified doctrine: no config-gated visibility).
 *
 * Adds are validated with sanitizeExternalUrl (only full http/https URLs
 * enter state from here); rendering is sanitize-gated regardless, so
 * imported junk degrades to plain text, never an anchor.
 */

const TYPE_META = {
  findings: { label: 'Finding' },
  artifacts: { label: 'Artifact' },
  controls: { label: 'Control' }
};

const EMPTY_DRAFTS = { findings: '', artifacts: '', controls: '' };

const ExternalLinksEditor = ({ links, onChange, externalTracking, disabled }) => {
  const [drafts, setDrafts] = useState(EMPTY_DRAFTS);
  const [invalidType, setInvalidType] = useState(null);

  const safeLinks = Array.isArray(links) ? links : [];
  const tracking = normalizeExternalTracking(externalTracking);
  const atCap = safeLinks.length >= MAX_EXTERNAL_LINKS;

  const groupTitle = (type) => {
    const systemName = tracking.systems[type];
    return systemName
      ? `${TYPE_META[type].label} links · ${systemName}`
      : `${TYPE_META[type].label} links`;
  };

  const handleAdd = (type) => {
    // The Add button is disabled at the cap, but the Enter-key path lands
    // here too — bail with the draft intact so a typed URL is never
    // silently discarded (the cap notice is already visible).
    if (atCap) return;
    const draft = drafts[type];
    if (!sanitizeExternalUrl(draft)) {
      setInvalidType(type);
      return;
    }
    onChange(normalizeExternalLinks([...safeLinks, { type, url: draft }]));
    setDrafts((prev) => ({ ...prev, [type]: '' }));
    setInvalidType(null);
  };

  const handleRemove = (id) => {
    onChange(safeLinks.filter((link) => link.id !== id));
  };

  const renderLink = (link) => {
    const safeHref = sanitizeExternalUrl(link.url);
    return (
      <li key={link.id} className="flex items-start gap-2">
        {safeHref ? (
          <a
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 break-all"
          >
            <ExternalLink size={14} className="mt-0.5 shrink-0" />
            {link.url}
          </a>
        ) : (
          <span className="text-sm text-gray-700 dark:text-gray-300 break-all">
            {link.url}
            <span className="text-xs text-gray-400 ml-1">(only http/https URLs render as links)</span>
          </span>
        )}
        {!disabled && (
          <button
            type="button"
            aria-label={`Remove ${TYPE_META[link.type].label.toLowerCase()} link`}
            onClick={() => handleRemove(link.id)}
            className="text-gray-400 hover:text-red-500 shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </li>
    );
  };

  return (
    <div>
      <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1">External links</label>
      {disabled && safeLinks.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500">No external links.</p>
      )}
      {EXTERNAL_LINK_TYPES.map((type) => {
        const typeLinks = safeLinks.filter((link) => link.type === type);
        if (disabled && typeLinks.length === 0) return null;
        return (
          <div key={type} className="mb-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{groupTitle(type)}</p>
            {typeLinks.length > 0 && (
              <ul className="space-y-1 mb-1">{typeLinks.map(renderLink)}</ul>
            )}
            {!disabled && (
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={drafts[type]}
                  maxLength={EXTERNAL_URL_MAX_LENGTH}
                  onChange={(e) => {
                    const { value } = e.target;
                    setDrafts((prev) => ({ ...prev, [type]: value }));
                    if (invalidType === type) setInvalidType(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAdd(type);
                    }
                  }}
                  placeholder={`https://... (${tracking.systems[type] || 'link to a ' + TYPE_META[type].label.toLowerCase()})`}
                  className="flex-1 p-2 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleAdd(type)}
                  disabled={atCap}
                  className="px-2 py-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-40 inline-flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            )}
            {!disabled && invalidType === type && (
              <p className="text-xs text-red-500 mt-1">Enter a full http:// or https:// URL.</p>
            )}
          </div>
        );
      })}
      {!disabled && atCap && (
        <p className="text-xs text-gray-400 mt-1">Link limit reached ({MAX_EXTERNAL_LINKS} per item).</p>
      )}
    </div>
  );
};

export default ExternalLinksEditor;
