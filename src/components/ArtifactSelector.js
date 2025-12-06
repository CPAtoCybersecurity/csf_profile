import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import useArtifactStore from '../stores/artifactStore';

const ArtifactSelector = ({
  label,
  selectedArtifacts,
  onChange,
  multiple = true,
  disabled = false
}) => {
  const artifacts = useArtifactStore((state) => state.artifacts);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  return (
    <div>
      <span className="text-sm font-medium text-gray-500">{label}:</span>

      {disabled ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {multiple ? (
            selectedArtifacts && selectedArtifacts.length > 0 ? (
              selectedArtifacts.map(name => (
                <span key={name} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {name}
                </span>
              ))
            ) : (
              <span className="text-gray-400">No artifacts linked</span>
            )
          ) : (
            <span className="">{selectedArtifacts || "None"}</span>
          )}
        </div>
      ) : (
        <div className="relative mt-1" ref={dropdownRef}>
          <div
            className="w-full p-2 border rounded-lg flex items-center flex-wrap gap-1 min-h-[42px] cursor-pointer"
            onClick={() => setDropdownOpen(prevState => !prevState)}
          >
            {multiple ? (
              selectedArtifacts && selectedArtifacts.length > 0 ? (
                selectedArtifacts.map(name => (
                  <span key={name} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                    {name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(selectedArtifacts.filter(n => n !== name));
                      }}
                      className="text-blue-600 hover:text-blue-800:text-blue-100"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-400">Select artifacts</span>
              )
            ) : (
              <span className="">{selectedArtifacts || <span className="text-gray-400">Select an artifact</span>}</span>
            )}
          </div>

          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {artifacts.length > 0 ? (
                <>
                  {multiple && (
                    <div
                      className="p-2 hover:bg-gray-100:bg-gray-600 cursor-pointer border-b"
                      onClick={() => onChange([])}
                    >
                      Clear selection
                    </div>
                  )}

                  {artifacts.map(artifact => (
                    <div
                      key={artifact.id}
                      className={`p-2 hover:bg-gray-100:bg-gray-600 cursor-pointer ${
                        multiple
                          ? selectedArtifacts && selectedArtifacts.includes(artifact.name) ? 'bg-blue-50' : ''
                          : selectedArtifacts === artifact.name ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleSelectArtifact(artifact)}
                    >
                      <div className="font-medium">{artifact.name}</div>
                      <div className="text-xs text-gray-500 truncate">{artifact.description}</div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="p-2 text-gray-500 text-sm">No artifacts available</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtifactSelector;
