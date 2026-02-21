import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: (e?: KeyboardEvent) => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'd',
      ctrlKey: true,
      action: () => router.push('/dashboard'),
      description: 'Go to Dashboard',
    },
    {
      key: 'n',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        // Context-aware new record
        const path = window.location.pathname;
        if (path.includes('/customers')) router.push('/finance/customers/new');
        else if (path.includes('/invoices')) router.push('/finance/invoices/new');
        else if (path.includes('/vendors')) router.push('/finance/vendors/new');
        // Add more context-aware paths as needed
      },
      description: 'Create new record (context-aware)',
    },
    {
      key: 's',
      ctrlKey: true,
      action: (e?: KeyboardEvent) => {
        e?.preventDefault();
        // Trigger save action if a form is present
        const saveButton = document.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (saveButton) {
          saveButton.click();
        }
      },
      description: 'Save current form',
    },
    {
      key: 'Escape',
      action: () => {
        // Close any open dialogs or modals
        const closeButtons = document.querySelectorAll<HTMLButtonElement>('[aria-label="Close"]');
        if (closeButtons.length > 0) {
          closeButtons[closeButtons.length - 1].click();
        }
      },
      description: 'Close dialog/modal',
    },
    {
      key: '/',
      ctrlKey: true,
      action: () => {
        // Show shortcuts help
        showShortcutsHelp();
      },
      description: 'Show keyboard shortcuts',
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Ctrl+S to save forms even in inputs
        if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          const saveButton = document.querySelector<HTMLButtonElement>('button[type="submit"]');
          if (saveButton) {
            saveButton.click();
          }
        }
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatches = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;
        const altMatches = shortcut.altKey ? e.altKey : !e.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          e.preventDefault();
          shortcut.action(e);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return { shortcuts };
}

function showShortcutsHelp() {
  // Create a simple modal showing keyboard shortcuts
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
      <h2 class="text-xl font-bold mb-4">Keyboard Shortcuts</h2>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Open Command Palette</span>
          <kbd class="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+K</kbd>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Go to Dashboard</span>
          <kbd class="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+D</kbd>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Create New Record</span>
          <kbd class="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+N</kbd>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Save Form</span>
          <kbd class="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+S</kbd>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Close Dialog</span>
          <kbd class="px-2 py-1 bg-gray-100 rounded text-xs">ESC</kbd>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Show This Help</span>
          <kbd class="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+/</kbd>
        </div>
      </div>
      <button class="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
        Close
      </button>
    </div>
  `;

  const closeModal = () => {
    modal.remove();
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal || (e.target as HTMLElement).tagName === 'BUTTON') {
      closeModal();
    }
  });

  document.body.appendChild(modal);
}
