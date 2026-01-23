import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Edit2 } from 'lucide-react';
import useUIStore from '../stores/uiStore';
import useCSFStore from '../stores/csfStore';
import toast from 'react-hot-toast';

export function BulkEditToolbar() {
  const { selectedItemIds, clearSelection } = useUIStore();
  const { bulkUpdateItems, bulkSetInScope } = useCSFStore();
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const selectedCount = selectedItemIds.length;

  if (selectedCount === 0) return null;

  const handleSetAllInScope = () => {
    bulkSetInScope(selectedItemIds, 'Yes');
    toast.success(`Set ${selectedCount} items to In Scope`);
    clearSelection();
  };

  const handleSetAllOutOfScope = () => {
    bulkSetInScope(selectedItemIds, 'No');
    toast.success(`Set ${selectedCount} items to Out of Scope`);
    clearSelection();
  };

  const handleSetStatus = (status) => {
    bulkUpdateItems(selectedItemIds, { 'Testing Status': status });
    toast.success(`Updated ${selectedCount} items to "${status}"`);
    setShowStatusMenu(false);
    clearSelection();
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-4 z-50">
      <div className="flex items-center gap-2">
        <span className="font-medium">{selectedCount} items selected</span>
        <button
          onClick={clearSelection}
          className="p-1 hover:bg-blue-500 rounded"
          title="Clear selection"
        >
          <X size={16} />
        </button>
      </div>

      <div className="h-6 w-px bg-blue-400" />

      <div className="flex items-center gap-2">
        <button
          onClick={handleSetAllInScope}
          className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-sm"
          title="Set all selected to In Scope"
        >
          <CheckCircle size={14} />
          In Scope
        </button>

        <button
          onClick={handleSetAllOutOfScope}
          className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
          title="Set all selected to Out of Scope"
        >
          <XCircle size={14} />
          Out of Scope
        </button>

        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded text-sm"
            title="Set testing status"
          >
            <Edit2 size={14} />
            Set Status
          </button>

          {showStatusMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg py-1 min-w-40">
              {['Not Started', 'In Progress', 'Submitted', 'Complete'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleSetStatus(status)}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100:bg-gray-700 text-sm"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BulkEditToolbar;
