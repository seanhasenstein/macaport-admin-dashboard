import React from 'react';

export default function useEscapeKeydownClose(
  isOpen: boolean,
  close: () => void
) {
  React.useEffect(() => {
    const handleEscapeKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKeydown);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKeydown);
    };
  }, [open, close]);
}
