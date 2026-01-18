import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, Link2, FileText, AlertTriangle, ClipboardCheck, User } from 'lucide-react';
import FrameworkBadge from './FrameworkBadge';
import CSFBadge, { SubcategoryBadge } from './CSFBadge';
import { UserAvatar } from './UserAvatar';
import { ArtifactBadge, FindingBadge, ControlBadge } from './BadgeSystem';

/**
 * RequirementDetailPanel - Side panel for viewing requirement details
 * Mimics Confluence database entry panel styling
 * Uses Portal to escape overflow-hidden containers
 * Resizable panel without overlay (Confluence-style)
 *
 * NOTE: Requirements are READ-ONLY framework data.
 * Only the 'inScope' field can be toggled.
 * Control-related data (owner, stakeholders, implementation description)
 * should be managed through the Controls page and controlsStore.
 */
const RequirementDetailPanel = ({ requirement, onClose, onSave, controls = [], artifacts = [], findings = [] }) => {
  const [panelWidth, setPanelWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef(null);

  // Handle inScope toggle - the only editable field
  const handleScopeToggle = useCallback((inScope) => {
    if (onSave) {
      onSave({ ...requirement, inScope });
    }
  }, [onSave, requirement]);

  // Handle resize
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    const newWidth = window.innerWidth - e.clientX;
    // Constrain width between 320 and 1200 (allows wider expansion like Confluence)
    setPanelWidth(Math.max(320, Math.min(1200, newWidth)));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add/remove event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (!requirement) return null;

  // Get linked controls for this requirement
  const linkedControls = controls.filter(c =>
    (c.linkedRequirementIds || []).includes(requirement.id)
  );

  // Get artifacts linked to those controls (artifacts have controlId pointing to control)
  const linkedArtifacts = artifacts.filter(a =>
    a.controlId && linkedControls.some(c => c.controlId === a.controlId)
  );

  // Get findings linked to those controls (findings have controlId pointing to control)
  const linkedFindings = findings.filter(f =>
    f.controlId && linkedControls.some(c => c.controlId === f.controlId)
  );

  const panelContent = (
    <div
      ref={panelRef}
      style={{
        width: `${panelWidth}px`,
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        boxShadow: '-4px 0 20px rgba(0,0,0,0.15)'
      }}
      className="flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
    >
      {/* Resize Handle - positioned at left edge, extends slightly outside for easier grabbing */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          left: '-4px',
          top: 0,
          bottom: 0,
          width: '8px',
          cursor: 'col-resize',
          zIndex: 10
        }}
        className={`transition-colors ${
          isResizing ? 'bg-blue-500' : 'bg-gray-300 hover:bg-blue-400 dark:bg-gray-500 dark:hover:bg-blue-500'
        }`}
        title="Drag to resize"
      />

      {/* Header - Confluence style */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="text-sm font-medium text-gray-700 dark:text-white">
          Requirement (Read-Only)
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Close panel"
          >
            <X size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content - Scrollable (min-h-0 required for flex child scrolling) */}
      <div className="flex-1 min-h-0 overflow-y-auto panel-scrollbar">
        <div className="py-1">
          {/* Requirement ID - Title field (read-only) */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span className="font-medium">Requirement ID</span>
            </div>
            <input
              type="text"
              value={requirement.id}
              readOnly
              className="w-full text-base font-medium text-gray-900 dark:text-gray-100 bg-transparent border-none p-0 focus:outline-none"
            />
          </div>

          {/* Framework */}
          <FieldRow icon={<Link2 size={14} />} label="Framework">
            <FrameworkBadge frameworkId={requirement.frameworkId} size="sm" />
          </FieldRow>

          {/* CSF Function */}
          <FieldRow icon={<Link2 size={14} />} label="CSF Function">
            <CSFBadge functionName={requirement.function} size="sm" />
          </FieldRow>

          {/* CSF Function Description */}
          {requirement.functionDescription && (
            <FieldRow icon={null} label="Function Description">
              <span className="text-sm text-gray-700 dark:text-gray-100">{requirement.functionDescription}</span>
            </FieldRow>
          )}

          {/* Category Name */}
          <FieldRow icon={null} label="Category Name">
            <span className="text-sm text-gray-700 dark:text-gray-100">{requirement.category}</span>
          </FieldRow>

          {/* Category Description */}
          {requirement.categoryDescription && (
            <FieldRow icon={null} label="Category Description">
              <span className="text-sm text-gray-700 dark:text-gray-100">{requirement.categoryDescription}</span>
            </FieldRow>
          )}

          {/* Subcategory ID */}
          <FieldRow icon={<Link2 size={14} />} label="Subcategory ID">
            <SubcategoryBadge subcategoryId={requirement.subcategoryId} size="sm" />
          </FieldRow>

          {/* Subcategory Description */}
          <FieldRow icon={null} label="Subcategory Description">
            {requirement.subcategoryDescription ? (
              <span className="text-sm text-gray-700 dark:text-gray-100">{requirement.subcategoryDescription}</span>
            ) : (
              <span className="text-sm empty-value">Empty</span>
            )}
          </FieldRow>

          {/* Implementation Example */}
          <FieldRow icon={null} label="Implementation Example">
            {requirement.implementationExample ? (
              <span className="text-sm text-gray-700 dark:text-gray-100 whitespace-pre-wrap">
                {requirement.implementationExample}
              </span>
            ) : (
              <span className="text-sm empty-value">Empty</span>
            )}
          </FieldRow>

          {/* Implementation Description (from linked Controls - DEPRECATED on Requirements) */}
          {requirement.implementationDescription && (
            <FieldRow icon={null} label="Implementation Description">
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-100 whitespace-pre-wrap">
                  {requirement.implementationDescription}
                </span>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Note: Edit via Controls page
                </p>
              </div>
            </FieldRow>
          )}

          {/* Control Owner (from linked Controls - DEPRECATED on Requirements) */}
          <FieldRow icon={<User size={14} />} label="Control Owner">
            {requirement.controlOwner ? (
              <div>
                <div className="flex flex-wrap gap-2">
                  {requirement.controlOwner.split(',').map((name, idx) => (
                    <UserAvatar key={idx} name={name.trim()} size="sm" showName={true} />
                  ))}
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Note: Edit via Controls page
                </p>
              </div>
            ) : (
              <span className="text-sm empty-value">Unassigned</span>
            )}
          </FieldRow>

          {/* Stakeholders (from linked Controls - DEPRECATED on Requirements) */}
          <FieldRow icon={<User size={14} />} label="Stakeholders">
            {requirement.stakeholders ? (
              <div>
                <div className="flex flex-wrap gap-2">
                  {requirement.stakeholders.split(',').map((name, idx) => (
                    <UserAvatar key={idx} name={name.trim()} size="sm" showName={true} />
                  ))}
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Note: Edit via Controls page
                </p>
              </div>
            ) : (
              <span className="text-sm empty-value">None</span>
            )}
          </FieldRow>

          {/* Artifacts */}
          <FieldRow icon={<FileText size={14} />} label="Artifacts">
            {linkedArtifacts.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {linkedArtifacts.map((artifact) => (
                  <ArtifactBadge
                    key={`artifact-${artifact.id}`}
                    name={artifact.name || artifact.title}
                    artifactId={artifact.artifactId}
                    size="sm"
                  />
                ))}
              </div>
            ) : (
              <span className="text-sm empty-value">No artifacts linked</span>
            )}
          </FieldRow>

          {/* Findings */}
          <FieldRow icon={<AlertTriangle size={14} />} label="Findings">
            {linkedFindings.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {linkedFindings.map((finding) => (
                  <FindingBadge
                    key={`finding-${finding.id}`}
                    id={finding.id}
                    summary={finding.title || finding.summary}
                    size="sm"
                  />
                ))}
              </div>
            ) : (
              <span className="text-sm empty-value">No findings</span>
            )}
          </FieldRow>

          {/* Control Evaluations */}
          <FieldRow icon={<ClipboardCheck size={14} />} label="Linked Controls">
            {linkedControls.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {linkedControls.map((control) => (
                  <ControlBadge
                    key={`control-${control.id}`}
                    controlId={control.controlId}
                    title={control.title || control.name}
                    size="sm"
                  />
                ))}
              </div>
            ) : (
              <span className="text-sm empty-value">No controls linked</span>
            )}
          </FieldRow>

          {/* In Scope - ONLY EDITABLE FIELD */}
          <FieldRow icon={null} label="In Scope">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={requirement.inScope || false}
                onChange={(e) => handleScopeToggle(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${requirement.inScope ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {requirement.inScope ? 'Yes' : 'No'}
              </span>
            </label>
          </FieldRow>
        </div>
      </div>
    </div>
  );

  // Return the panel content directly (no portal needed since fixed positioning works)
  return panelContent;
};

/**
 * Field Row Component - Jira-style field display
 */
const FieldRow = ({ icon, label, children }) => (
  <div className="flex items-start border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
    <div className="w-44 flex-shrink-0 flex items-start gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      {icon && <span className="text-gray-400 dark:text-gray-500 mt-0.5">{icon}</span>}
      <span className="leading-tight">{label}</span>
    </div>
    <div className="flex-1 min-w-0 px-4 py-3 bg-white dark:bg-gray-900">
      {children}
    </div>
  </div>
);

export default RequirementDetailPanel;
