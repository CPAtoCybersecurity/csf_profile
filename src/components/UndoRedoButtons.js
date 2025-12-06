import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import useCSFStore from '../stores/csfStore';

export function UndoRedoButtons() {
  const { undo, redo, canUndo, canRedo } = useCSFStore((state) => ({
    undo: state.undo,
    redo: state.redo,
    canUndo: state.canUndo(),
    canRedo: state.canRedo(),
  }));

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
