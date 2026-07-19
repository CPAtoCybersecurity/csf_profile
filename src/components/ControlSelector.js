import React, { useState, useEffect, useRef } from 'react';
import { X, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useControlsStore from '../stores/controlsStore';

/**
 * In-app control linker for the evaluation panel (issue #294) — the Controls
 * counterpart to ArtifactSelector/FindingSelector. Chips navigate to the
 * Controls tab (/controls?selected=<controlId>, already honored by
 * UserControls); the dropdown selects from the controls register. Stores
 * plain controlId strings on the observation (linkedControls).
 */
const ControlSelector = ({
  label,
  selectedControls,
  onChange,
  disabled = false
}) => {
  const navigate = useNavigate();
  const controls = useControlsStore((state) => state.controls);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tolerate missing/tampered persisted values — always work on an array.
  const selected = Array.isArray(selectedControls) ? selectedControls : [];

  const getControlById = (controlId) => controls.find(c => c.controlId === controlId);

  const handleSelectControl = (control) => {
    if (selected.includes(control.controlId)) {
      onChange(selected.filter(id => id !== control.controlId));
    } else {
      onChange([...selected, control.controlId]);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Implemented':
        return 'bg-green-600 text-white';
      case 'Partially Implemented':
        return 'bg-blue-600 text-white';
      case 'Not Implemented':
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleNavigateToControl = (e, controlId) => {
    e.stopPropagation();
    navigate(`/controls?selected=${encodeURIComponent(controlId)}`);
  };

  return (
    <div>
      {label && <span className="text-sm font-medium text-gray-500">{label}:</span>}

      {disabled ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {selected.length > 0 ? (
            selected.map(controlId => {
              const control = getControlById(controlId);
              return (
                <button
                  key={controlId}
                  onClick={(e) => handleNavigateToControl(e, controlId)}
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full text-xs flex items-center gap-1 transition-colors"
                  title={control?.implementationDescription || 'View control'}
                >
                  <Shield size={10} />
                  {controlId}
                </button>
              );
            })
          ) : (
            <span className="text-gray-400 dark:text-gray-500">No controls linked</span>
          )}
        </div>
      ) : (
        <div className="relative mt-1" ref={dropdownRef}>
          <div
            className="w-full p-2 border dark:border-gray-600 rounded-lg flex items-center flex-wrap gap-1 min-h-[42px] cursor-pointer bg-white dark:bg-gray-700"
            onClick={() => setDropdownOpen(prevState => !prevState)}
          >
            {selected.length > 0 ? (
              selected.map(controlId => (
                <span key={controlId} className="px-2 py-1 bg-indigo-600 text-white font-medium rounded-full text-xs flex items-center gap-1">
                  <Shield size={10} />
                  {controlId}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(selected.filter(id => id !== controlId));
                    }}
                    className="text-indigo-100 hover:text-white"
                    aria-label={`Remove ${controlId}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-400 dark:text-gray-500">Select controls</span>
            )}
          </div>

          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {controls.length > 0 ? (
                <>
                  {selected.length > 0 && (
                    <div
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      onClick={() => onChange([])}
                    >
                      Clear selection
                    </div>
                  )}

                  {controls.map(control => (
                    <div
                      key={control.controlId}
                      className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                        selected.includes(control.controlId) ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                      }`}
                      onClick={() => handleSelectControl(control)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-indigo-500" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {control.controlId}
                          </span>
                        </div>
                        {control.status && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(control.status)}`}>
                            {control.status}
                          </span>
                        )}
                      </div>
                      {control.implementationDescription && (
                        <div className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-1">
                          {control.implementationDescription}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  <Shield size={24} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p>No controls available</p>
                  <p className="text-xs mt-1">Create controls in the Controls tab first</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ControlSelector;
