import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useArtifactStore from '../stores/artifactStore';
import { sanitizeExternalUrl } from '../utils/externalLinks';

const ArtifactSelector = ({
  label,
  selectedArtifacts,
  onChange,
  multiple = true,
  disabled = false
}) => {
  const artifacts = useArtifactStore((state) => state.artifacts);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Read-mode chip: link out to the artifact URL, or open its detail in the Artifacts tab
  const renderLinkedChip = (name) => {
    const artifact = artifacts.find(a => a.name === name);
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
              selectedArtifacts.map(name => renderLinkedChip(name))
            ) : (
              <span className="text-gray-400 dark:text-gray-500">No artifacts linked</span>
            )
          ) : (
            selectedArtifacts ? renderLinkedChip(selectedArtifacts) : <span className="dark:text-gray-200">None</span>
          )}
        </div>
      ) : (
        <div className="relative mt-1" ref={dropdownRef}>
          <div
            className="w-full p-2 border dark:border-gray-600 rounded-lg flex items-center flex-wrap gap-1 min-h-[42px] cursor-pointer bg-white dark:bg-gray-700"
            onClick={() => setDropdownOpen(prevState => !prevState)}
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

          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
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
          )}
        </div>
      )}
    </div>
  );
};

export default ArtifactSelector;
