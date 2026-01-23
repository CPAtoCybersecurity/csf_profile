import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * A dropdown component that renders its content in a portal to avoid z-index issues
 */
const DropdownPortal = ({
  isOpen,
  onClose,
  triggerRef,
  children,
  className = '',
}) => {
  const [position, setPosition] = useState({ top: 100, left: 100, width: 200 });
  const dropdownRef = useRef(null);

  // Calculate position when opened
  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
<<<<<<< HEAD
      console.log('DropdownPortal: trigger rect', rect);
=======
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen, triggerRef]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(e.target);
      const isOutsideTrigger = triggerRef?.current && !triggerRef.current.contains(e.target);

      if (isOutsideDropdown && isOutsideTrigger) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

<<<<<<< HEAD
  console.log('DropdownPortal render: isOpen=', isOpen, 'position=', position);

=======
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
  if (!isOpen) {
    return null;
  }

<<<<<<< HEAD
=======
  // Check if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');

>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        minWidth: position.width,
        zIndex: 99999,
<<<<<<< HEAD
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
=======
        backgroundColor: isDarkMode ? '#1f2937' : 'white',
        border: isDarkMode ? '1px solid #374151' : '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.3)',
        color: isDarkMode ? '#f9fafb' : 'inherit',
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
      }}
      className={className}
    >
      {children}
    </div>,
    document.body
  );
};

export default DropdownPortal;
