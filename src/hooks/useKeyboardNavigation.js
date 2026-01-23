import { useEffect, useCallback } from 'react';
import useUIStore from '../stores/uiStore';
import useCSFStore from '../stores/csfStore';
import { useFilters } from './useFilters';

export function useKeyboardNavigation() {
  const {
    currentItemId,
    setCurrentItemId,
    editMode,
    setEditMode,
    selectedItemIds,
    toggleItemSelection,
    clearSelection,
  } = useUIStore();

  const { undo, redo, canUndo, canRedo } = useCSFStore();
  const { filteredData, getNextItem, getPrevItem, goToNextPage, goToPrevPage } = useFilters();

  // Get current item
  const currentItem = filteredData.find(item => item.ID === currentItemId);

  // Navigate to next item
  const navigateToNext = useCallback(() => {
    if (!currentItemId) {
      // If no item selected, select the first one
      if (filteredData.length > 0) {
        setCurrentItemId(filteredData[0].ID);
      }
      return;
    }

    const nextItem = getNextItem(currentItemId);
    if (nextItem) {
      setCurrentItemId(nextItem.ID);
    }
  }, [currentItemId, filteredData, getNextItem, setCurrentItemId]);

  // Navigate to previous item
  const navigateToPrev = useCallback(() => {
    if (!currentItemId) {
      // If no item selected, select the last one
      if (filteredData.length > 0) {
        setCurrentItemId(filteredData[filteredData.length - 1].ID);
      }
      return;
    }

    const prevItem = getPrevItem(currentItemId);
    if (prevItem) {
      setCurrentItemId(prevItem.ID);
    }
  }, [currentItemId, filteredData, getPrevItem, setCurrentItemId]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event) => {
    // Don't handle if we're in edit mode or typing in an input
    const activeElement = document.activeElement;
    const isInputActive = activeElement?.tagName === 'INPUT' ||
      activeElement?.tagName === 'TEXTAREA' ||
      activeElement?.tagName === 'SELECT' ||
      activeElement?.isContentEditable;

    if (editMode && isInputActive) {
      return;
    }

    // Undo: Ctrl/Cmd + Z
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      if (canUndo()) {
        undo();
      }
      return;
    }

    // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
    if ((event.ctrlKey || event.metaKey) && (
      (event.key === 'z' && event.shiftKey) ||
      event.key === 'y'
    )) {
      event.preventDefault();
      if (canRedo()) {
        redo();
      }
      return;
    }

    // Navigation keys (when not in input)
    if (!isInputActive) {
      switch (event.key) {
        case 'ArrowDown':
        case 'j': // Vim-style navigation
          event.preventDefault();
          if (event.shiftKey && currentItemId) {
            // Shift+Down: extend selection
            toggleItemSelection(currentItemId);
          }
          navigateToNext();
          break;

        case 'ArrowUp':
        case 'k': // Vim-style navigation
          event.preventDefault();
          if (event.shiftKey && currentItemId) {
            // Shift+Up: extend selection
            toggleItemSelection(currentItemId);
          }
          navigateToPrev();
          break;

        case 'ArrowRight':
        case 'l': // Vim-style navigation
          event.preventDefault();
          goToNextPage();
          break;

        case 'ArrowLeft':
        case 'h': // Vim-style navigation
          event.preventDefault();
          goToPrevPage();
          break;

        case 'Enter':
          event.preventDefault();
          if (currentItemId && !editMode) {
            setEditMode(true);
          }
          break;

        case 'Escape':
          event.preventDefault();
          if (editMode) {
            setEditMode(false);
          } else if (selectedItemIds.length > 0) {
            clearSelection();
          } else if (currentItemId) {
            setCurrentItemId(null);
          }
          break;

        case ' ': // Space to toggle selection
          event.preventDefault();
          if (currentItemId) {
            toggleItemSelection(currentItemId);
          }
          break;

        case 'a': // Ctrl/Cmd + A to select all
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const allIds = filteredData.map(item => item.ID);
            useUIStore.getState().selectAllItems(allIds);
          }
          break;

<<<<<<< HEAD
=======
        case 'n': // 'n' to create new item
          event.preventDefault();
          // Dispatch custom event for pages to handle new item creation
          window.dispatchEvent(new CustomEvent('keyboard-new-item'));
          break;

        case '/': // '/' to focus search
          event.preventDefault();
          // Find and focus the search input
          const searchInput = document.querySelector('input[placeholder*="Search"]') ||
                            document.querySelector('input[type="search"]');
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
          break;

        case '?': // '?' to show keyboard shortcuts help
          if (event.shiftKey) {
            event.preventDefault();
            window.dispatchEvent(new CustomEvent('keyboard-show-help'));
          }
          break;

>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
        default:
          break;
      }
    }
  }, [
    editMode,
    currentItemId,
    selectedItemIds,
    filteredData,
    canUndo,
    canRedo,
    undo,
    redo,
    navigateToNext,
    navigateToPrev,
    goToNextPage,
    goToPrevPage,
    setEditMode,
    toggleItemSelection,
    clearSelection,
    setCurrentItemId,
  ]);

  // Add/remove keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    currentItem,
    navigateToNext,
    navigateToPrev,
  };
}

export default useKeyboardNavigation;
