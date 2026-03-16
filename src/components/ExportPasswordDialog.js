import React from 'react';
import { createPortal } from 'react-dom';
import { Eye, EyeOff, Lock, X } from 'lucide-react';

/**
 * ExportPasswordDialog
 *
 * Collects an optional password for export encryption.
 * - If the password is empty, the export should proceed unencrypted.
 * - If the password is set, the caller should encrypt before downloading.
 */
const ExportPasswordDialog = ({
  isOpen,
  title = 'Export',
  description,
  onCancel,
  onConfirm
}) => {
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    setPassword('');
    setShowPassword(false);
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm?.(password);
  };

  const isEncrypted = password.trim().length > 0;

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex items-start gap-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Lock className="text-blue-600 dark:text-blue-300" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            {description ? (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {description}
              </p>
            ) : null}
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-3 space-y-2">
            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded p-2">
              Leave the password blank to export normally. Set a password to create a
              password-protected <span className="font-medium">.enc.csv</span> file.
            </div>

            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
              Password (optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to encrypt"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {isEncrypted ? (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Note: The password cannot be recovered. Keep it somewhere safe.
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 p-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {isEncrypted ? 'Export Encrypted' : 'Export'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ExportPasswordDialog;
