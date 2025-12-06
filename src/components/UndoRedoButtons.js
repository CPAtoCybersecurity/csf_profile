import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import useCSFStore from '../stores/csfStore';

export function UndoRedoButtons() {
  // Select values individually to avoid creating new object references
  const undo = useCSFStore((state) => state.undo);
  const redo = useCSFStore((state) => state.redo);
  const historyIndex = useCSFStore((state) => state.historyIndex);
  const historyLength = useCSFStore((state) => state.history.length);

  // Compute can undo/redo from primitive values
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLength - 1;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={undo}
        disabled={!canUndo}
        className={`p-2 rounded transition-colors ${
          canUndo
            ? 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
        }`}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={18} />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className={`p-2 rounded transition-colors ${
          canRedo
            ? 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
        }`}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 size={18} />
      </button>
    </div>
  );
}

export default UndoRedoButtons;
