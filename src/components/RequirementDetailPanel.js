import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, Link2, FileText, AlertTriangle, ClipboardCheck, Pencil, Trash2, User } from 'lucide-react';
import FrameworkBadge from './FrameworkBadge';
import CSFBadge, { SubcategoryBadge } from './CSFBadge';

/**
 * RequirementDetailPanel - Side panel for viewing requirement details
 * Mimics Confluence database entry panel styling
 * Uses Portal to escape overflow-hidden containers
 * Resizable panel without overlay (Confluence-style)
 * Supports dark mode and inline editing
 */
const RequirementDetailPanel = ({ requirement, onClose, onSave, onDelete, controls = [], artifacts = [], findings = [] }) => {
  const [panelWidth, setPanelWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRequirement, setEditedRequirement] = useState(null);
  const panelRef = useRef(null);

  // Initialize edited requirement when entering edit mode
  const handleStartEdit = useCallback(() => {
    setEditedRequirement({ ...requirement });
    setIsEditing(true);
  }, [requirement]);

  // Save changes
  const handleSave = useCallback(() => {
    if (onSave && editedRequirement) {
      onSave(editedRequirement);
    }
    setIsEditing(false);
    setEditedRequirement(null);
  }, [onSave, editedRequirement]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditedRequirement(null);
  }, []);

  // Update a field
  const handleFieldChange = useCallback((field, value) => {
    setEditedRequirement(prev => ({ ...prev, [field]: value }));
  }, []);

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

  // Get artifacts linked to those controls
  const linkedArtifacts = artifacts.filter(a =>
    linkedControls.some(c => (c.linkedArtifactIds || []).includes(a.id))
  );

  // Get findings linked to this requirement
  const linkedFindings = findings.filter(f =>
    f.requirementId === requirement.id ||
    linkedControls.some(c => c.id === f.controlId)
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
          {isEditing ? 'Edit entry' : 'Database entry'}
        </h2>
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded transition-colors"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEdit();
                }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Edit"
              >
                <Pencil size={16} className="text-gray-500 dark:text-gray-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDelete) onDelete(requirement);
                }}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                title="Delete"
              >
                <Trash2 size={16} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Close panel"
          >
            <X size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
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

          {/* Category Name - Editable */}
          <FieldRow icon={null} label="Category Name">
            {isEditing ? (
              <input
                type="text"
                value={editedRequirement?.category || ''}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className="w-full text-sm px-2 py-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <span className="text-sm text-gray-700 dark:text-gray-100">{requirement.category}</span>
            )}
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

          {/* Subcategory Description - Editable */}
          <FieldRow icon={null} label="Subcategory Description">
            {isEditing ? (
              <textarea
                value={editedRequirement?.subcategoryDescription || ''}
                onChange={(e) => handleFieldChange('subcategoryDescription', e.target.value)}
                rows={2}
                className="w-full text-sm px-2 py-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 resize-none"
              />
            ) : (
              <span className="text-sm text-gray-700 dark:text-gray-100">{requirement.subcategoryDescription || '-'}</span>
            )}
          </FieldRow>

          {/* Implementation Example - Editable */}
          <FieldRow icon={null} label="Implementation Example">
            {isEditing ? (
              <textarea
                value={editedRequirement?.implementationExample || ''}
                onChange={(e) => handleFieldChange('implementationExample', e.target.value)}
                rows={3}
                className="w-full text-sm px-2 py-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 resize-none"
              />
            ) : (
              <span className="text-sm text-gray-700 dark:text-gray-100 whitespace-pre-wrap">
                {requirement.implementationExample || '-'}
              </span>
            )}
          </FieldRow>

          {/* Implementation Details (if exists) */}
          {(requirement.implementationDetails || isEditing) && (
            <FieldRow icon={null} label="Implementation Details">
              {isEditing ? (
                <textarea
                  value={editedRequirement?.implementationDetails || ''}
                  onChange={(e) => handleFieldChange('implementationDetails', e.target.value)}
                  rows={2}
                  className="w-full text-sm px-2 py-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 resize-none"
                />
              ) : (
                <span className="text-sm text-gray-700 dark:text-gray-100 whitespace-pre-wrap">
                  {requirement.implementationDetails}
                </span>
              )}
            </FieldRow>
          )}

          {/* Control Owner - Editable */}
          <FieldRow icon={<User size={14} />} label="Control Owner">
            {isEditing ? (
              <input
                type="text"
                value={editedRequirement?.controlOwner || ''}
                onChange={(e) => handleFieldChange('controlOwner', e.target.value)}
                className="w-full text-sm px-2 py-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                placeholder="Enter user names (comma separated)"
              />
            ) : requirement.controlOwner ? (
              <div className="flex flex-wrap gap-2">
                {requirement.controlOwner.split(',').map((name, idx) => (
                  <UserBadge key={idx} name={name.trim()} />
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500">None</span>
            )}
          </FieldRow>

          {/* Stakeholders - Editable */}
          <FieldRow icon={<User size={14} />} label="Stakeholders">
            {isEditing ? (
              <input
                type="text"
                value={editedRequirement?.stakeholders || ''}
                onChange={(e) => handleFieldChange('stakeholders', e.target.value)}
                className="w-full text-sm px-2 py-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                placeholder="Enter user names (comma separated)"
              />
            ) : requirement.stakeholders ? (
              <div className="flex flex-wrap gap-2">
                {requirement.stakeholders.split(',').map((name, idx) => (
                  <UserBadge key={idx} name={name.trim()} />
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500">None</span>
            )}
          </FieldRow>

          {/* Artifacts */}
          <FieldRow icon={<FileText size={14} />} label="Artifacts">
            {linkedArtifacts.length > 0 ? (
              <div className="space-y-1">
                {linkedArtifacts.map((artifact) => (
                  <div
                    key={`artifact-${artifact.id}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {artifact.name || artifact.title}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500">Empty</span>
            )}
          </FieldRow>

          {/* Findings */}
          <FieldRow icon={<AlertTriangle size={14} />} label="Findings">
            {linkedFindings.length > 0 ? (
              <div className="space-y-1">
                {linkedFindings.map((finding) => (
                  <div
                    key={`finding-${finding.id}`}
                    className="text-sm text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    {finding.title || finding.summary}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500">Empty</span>
            )}
          </FieldRow>

          {/* Control Evaluations */}
          <FieldRow icon={<ClipboardCheck size={14} />} label="Linked Controls">
            {linkedControls.length > 0 ? (
              <div className="space-y-1">
                {linkedControls.map((control) => (
                  <div
                    key={`control-${control.id}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {control.controlId}: {control.title || control.name}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500">Empty</span>
            )}
          </FieldRow>

          {/* In Scope - Editable */}
          <FieldRow icon={null} label="In Scope">
            {isEditing ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editedRequirement?.inScope || false}
                  onChange={(e) => handleFieldChange('inScope', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {editedRequirement?.inScope ? 'Yes' : 'No'}
                </span>
              </label>
            ) : (
              <span className={`text-sm ${requirement.inScope ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {requirement.inScope ? 'Yes' : 'No'}
              </span>
            )}
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

/**
 * User Badge Component - Jira-style avatar with initials
 */
const UserBadge = ({ name }) => {
  // Get initials from name (first letter of first and last name)
  const getInitials = (fullName) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  // Generate consistent color based on name
  const getColor = (str) => {
    const colors = [
      { bg: 'bg-blue-500', text: 'text-white' },
      { bg: 'bg-green-500', text: 'text-white' },
      { bg: 'bg-purple-500', text: 'text-white' },
      { bg: 'bg-orange-500', text: 'text-white' },
      { bg: 'bg-pink-500', text: 'text-white' },
      { bg: 'bg-teal-500', text: 'text-white' },
      { bg: 'bg-indigo-500', text: 'text-white' },
      { bg: 'bg-red-500', text: 'text-white' },
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const color = getColor(name);

  return (
    <div className="inline-flex items-center gap-2 group" title={name}>
      <div className={`w-7 h-7 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-xs font-medium flex-shrink-0`}>
        {initials}
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-200">{name}</span>
    </div>
  );
};

export default RequirementDetailPanel;
