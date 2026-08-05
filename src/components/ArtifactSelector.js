import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useArtifactStore from '../stores/artifactStore';
import { sanitizeExternalUrl } from '../utils/externalLinks';
import { belongsToAssessment, isUnassigned } from '../utils/assessmentScope';

// Panel geometry. The panel is portalled out of the scrolling pane, so these
// are viewport-space numbers rather than anything the pane can constrain.
const VIEWPORT_MARGIN = 8;
const PANEL_MAX_HEIGHT = 320;

export const ARTIFACT_TYPES = ['Document', 'Screenshot', 'Log', 'Policy', 'Report', 'Configuration', 'Other'];

const ArtifactSelector = ({
  label,
  selectedArtifacts,
  onChange,
  multiple = true,
  disabled = false,
  // Assessment scope (issue #297): when set, the pick list shows only this
  // assessment's artifacts plus unassigned (legacy) ones — demo artifacts,
  // being stamped to the demo assessment, drop out everywhere else. Already-
  // linked chips always resolve against the full store.
  assessmentId
}) => {
  const allArtifacts = useArtifactStore((state) => state.artifacts);
  const addArtifact = useArtifactStore((state) => state.addArtifact);
  const artifacts = assessmentId
    ? allArtifacts.filter(a => belongsToAssessment(a, assessmentId) || isUnassigned(a))
    : allArtifacts;
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: '', type: 'Document', link: '' });
  const [createError, setCreateError] = useState('');
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Read-mode chip: link out to the artifact URL, or open its detail in the Artifacts tab
  const renderLinkedChip = (name) => {
    const artifact = allArtifacts.find(a => a.name === name);
    const chipClass = 'px-2 py-1 bg-blue-600 text-white rounded-full text-xs inline-flex items-center gap-1 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer';

    if (sanitizeExternalUrl(artifact?.link)) {
      return (
        <a
          key={name}
          href={sanitizeExternalUrl(artifact.link)}
          target="_blank"
          rel="noopener noreferrer"
          className={chipClass}
          title={`Open ${name} in a new tab`}
        >
          {name}
          <ExternalLink size={12} />
        </a>
      );
    }

    return (
      <button
        key={name}
        type="button"
        onClick={() => artifact && navigate('/artifacts', { state: { artifactId: artifact.id } })}
        className={`${chipClass} ${!artifact ? 'opacity-70 cursor-default' : ''}`}
        title={artifact ? `View ${name} in Artifacts` : name}
      >
        {name}
        {artifact && <ChevronRight size={12} />}
      </button>
    );
  };

  // Handle selecting an artifact
  const handleSelectArtifact = (artifact) => {
    if (multiple) {
      // For multiple selection
      if (selectedArtifacts && selectedArtifacts.includes(artifact.name)) {
        // Remove artifact if already selected
        onChange(selectedArtifacts.filter(name => name !== artifact.name));
      } else {
        // Add artifact to selection
        onChange([...(selectedArtifacts || []), artifact.name]);
      }
    } else {
      // For single selection
      onChange(artifact.name === selectedArtifacts ? null : artifact.name);
    }
  };

  // Reset the create form whenever the panel closes, so a cancelled or
  // abandoned draft never reappears the next time the picker is opened.
  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
    setCreating(false);
    setDraft({ name: '', type: 'Document', link: '' });
    setCreateError('');
  }, []);

  // Create the artifact and link it to this evaluation in one step — the point
  // of creating from here is not having to go to the Artifacts tab, find the
  // thing you just made, and come back to select it.
  const handleCreateArtifact = () => {
    const name = draft.name.trim();
    if (!name) {
      setCreateError('Name is required');
      return;
    }
    // linkedArtifacts stores NAMES, not ids, so two artifacts sharing a name
    // would make an existing link ambiguous. Block rather than silently alias.
    if (allArtifacts.some(a => (a.name || '').trim().toLowerCase() === name.toLowerCase())) {
      setCreateError('An artifact with that name already exists');
      return;
    }

    addArtifact({
      name,
      type: draft.type,
      link: draft.link.trim(),
      description: '',
      // Stamp into the scope that created it (issue #297). Without this the
      // new artifact reads as unassigned and shows up in every assessment.
      assessmentId: assessmentId || null
    });

    if (multiple) {
      onChange([...(selectedArtifacts || []), name]);
    } else {
      onChange(name);
    }

    setCreating(false);
    setDraft({ name: '', type: 'Document', link: '' });
    setCreateError('');
  };

  // Anchor the panel to the trigger in viewport coordinates.
  //
  // The panel is portalled to <body> and positioned `fixed` rather than
  // absolutely inside the trigger: the evaluation pane is an `overflow-auto`
  // column nested in an `overflow-hidden` grid, so an absolutely-positioned
  // panel is clipped by that pane instead of drawing over it. Same fix, and
  // same reason, as the auditor dropdown in UserSelector.
  const updateDropdownPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const t = trigger.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const panelH = dropdownRef.current?.offsetHeight || 0;

    // Match the trigger's width — this picker has always been full-width
    // against its field, so measure rather than hardcode.
    const width = Math.min(t.width, vw - VIEWPORT_MARGIN * 2);
    const left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(t.left, vw - width - VIEWPORT_MARGIN)
    );

    // Below the trigger, flipping above when there isn't room underneath.
    let top = t.bottom + 4;
    if (panelH && top + panelH > vh - VIEWPORT_MARGIN) {
      const above = t.top - panelH - 4;
      top = above >= VIEWPORT_MARGIN
        ? above
        : Math.max(VIEWPORT_MARGIN, vh - panelH - VIEWPORT_MARGIN);
    }

    setDropdownPos((prev) =>
      prev && prev.top === top && prev.left === left && prev.width === width
        ? prev
        : { top, left, width }
    );
  }, []);

  // Measure before paint so the panel never flashes at the wrong spot. Track
  // scroll in the capture phase — the element that scrolls is an ancestor div,
  // not window, so a bubbling listener would never fire.
  useLayoutEffect(() => {
    if (!dropdownOpen) {
      setDropdownPos(null);
      return undefined;
    }
    updateDropdownPosition();

    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);

    // The trigger's width can settle after the first measurement — the pane's
    // scrollbar appearing or disappearing resizes it by ~17px. Observe it so
    // the panel re-syncs instead of keeping a stale width.
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateDropdownPosition)
      : null;
    if (observer && triggerRef.current) observer.observe(triggerRef.current);

    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
      observer?.disconnect();
    };
    // Opening the create form changes the panel height, which changes the flip.
  }, [dropdownOpen, creating, updateDropdownPosition]);

  // Close dropdown when clicking outside. The panel lives in a portal, so it is
  // NOT inside the trigger's subtree — both refs have to be consulted or every
  // click on a row would read as "outside" and close the panel.
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inPanel = dropdownRef.current?.contains(event.target);
      const inTrigger = triggerRef.current?.contains(event.target);
      if (!inPanel && !inTrigger) {
        closeDropdown();
      }
    };

    // Escape closes the panel. Portalling moves it to the end of the document,
    // so without this a keyboard user has no way back out of it.
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      // The create form handles its own Escape (form first, then panel).
      if (creating) return;
      closeDropdown();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeDropdown, creating]);

  return (
    <div>
      {/* Only render the label when one is supplied. The Assessments pane
          passes none (it renders its own <label>Artifacts</label>), which used
          to leave a bare ":" floating above the chips. */}
      {label && <span className="text-sm font-medium text-gray-500">{label}:</span>}

      {disabled ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {multiple ? (
            selectedArtifacts && selectedArtifacts.length > 0 ? (
              selectedArtifacts.map(name => renderLinkedChip(name))
            ) : (
              <span className="text-gray-400 dark:text-gray-500">No artifacts linked</span>
            )
          ) : (
            selectedArtifacts ? renderLinkedChip(selectedArtifacts) : <span className="dark:text-gray-200">None</span>
          )}
        </div>
      ) : (
        <div className="relative mt-1">
          {/* The ref goes on the bordered box, not the wrapper: `w-full` under
              this stylesheet's content-box sizing renders ~17px wider than its
              parent, so measuring the wrapper would size the panel to something
              narrower than the field the user sees. */}
          <div
            ref={triggerRef}
            data-testid="artifact-trigger"
            className="w-full p-2 border dark:border-gray-600 rounded-lg flex items-center flex-wrap gap-1 min-h-[42px] cursor-pointer bg-white dark:bg-gray-700"
            onClick={() => (dropdownOpen ? closeDropdown() : setDropdownOpen(true))}
          >
            {multiple ? (
              selectedArtifacts && selectedArtifacts.length > 0 ? (
                selectedArtifacts.map(name => (
                  <span key={name} className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs flex items-center gap-1">
                    {name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(selectedArtifacts.filter(n => n !== name));
                      }}
                      className="text-blue-100 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-400 dark:text-gray-500">Select artifacts</span>
              )
            ) : (
              <span className="dark:text-gray-200">{selectedArtifacts || <span className="text-gray-400 dark:text-gray-500">Select an artifact</span>}</span>
            )}
          </div>

          {/* Panel — portalled to <body> so the evaluation pane's
              `overflow-auto` can't clip it; see updateDropdownPosition. The
              z-index is set inline rather than via a utility class: a missing
              `.z-10` rule is precisely what let the Findings field paint over
              this list. */}
          {dropdownOpen && createPortal(
            <div
              ref={dropdownRef}
              data-testid="artifact-dropdown"
              className="bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-xl flex flex-col"
              style={{
                position: 'fixed',
                top: dropdownPos ? dropdownPos.top : 0,
                left: dropdownPos ? dropdownPos.left : 0,
                width: dropdownPos ? dropdownPos.width : undefined,
                maxHeight: PANEL_MAX_HEIGHT,
                // This stylesheet's reset leaves boxSizing at content-box, so
                // without this the border would be added to the width above and
                // the viewport clamp would be off by exactly the border width.
                boxSizing: 'border-box',
                zIndex: 9999,
                visibility: dropdownPos ? 'visible' : 'hidden'
              }}
            >
              <div className="overflow-y-auto">
                {artifacts.length > 0 ? (
                  <>
                    {multiple && (
                      <div
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-600 text-gray-700 dark:text-gray-300"
                        onClick={() => onChange([])}
                      >
                        Clear selection
                      </div>
                    )}

                    {artifacts.map(artifact => (
                      <div
                        key={artifact.id}
                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                          multiple
                            ? selectedArtifacts && selectedArtifacts.includes(artifact.name) ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                            : selectedArtifacts === artifact.name ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                        }`}
                        onClick={() => handleSelectArtifact(artifact)}
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">{artifact.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{artifact.description}</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="p-2 text-gray-500 dark:text-gray-400 text-sm">No artifacts available</p>
                )}
              </div>

              {/* Create an artifact without leaving the evaluation. Pinned
                  below the scrolling list so it stays reachable however long
                  the list gets. */}
              <div className="border-t dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 rounded-b-lg">
                {creating ? (
                  <div className="p-2 space-y-2">
                    <input
                      type="text"
                      autoFocus
                      value={draft.name}
                      onChange={(e) => { setDraft(d => ({ ...d, name: e.target.value })); setCreateError(''); }}
                      onKeyDown={(e) => {
                        // Enter submits. Without this the keypress bubbles to
                        // the surrounding evaluation form and the panel closes
                        // before the artifact is ever saved.
                        if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); handleCreateArtifact(); }
                        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setCreating(false); setCreateError(''); }
                      }}
                      placeholder="Artifact name"
                      aria-label="New artifact name"
                      className="w-full p-2 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <select
                        value={draft.type}
                        onChange={(e) => setDraft(d => ({ ...d, type: e.target.value }))}
                        aria-label="New artifact type"
                        className="p-2 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                      >
                        {ARTIFACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input
                        type="text"
                        value={draft.link}
                        onChange={(e) => setDraft(d => ({ ...d, link: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); handleCreateArtifact(); }
                        }}
                        placeholder="https://… (optional)"
                        aria-label="New artifact link"
                        className="flex-1 min-w-0 p-2 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    {createError && (
                      <p role="alert" className="text-xs text-red-600 dark:text-red-400">{createError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCreateArtifact}
                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        Create &amp; link
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCreating(false); setCreateError(''); }}
                        className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setCreating(true); setCreateError(''); }}
                    className="w-full p-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-b-lg flex items-center justify-center gap-1"
                  >
                    <Plus size={14} /> New artifact
                  </button>
                )}
              </div>
            </div>,
            document.body
          )}
        </div>
      )}
    </div>
  );
};

export default ArtifactSelector;
