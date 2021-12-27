import React from 'react';

export default function useEscapeKeydownClose(
  open: boolean,
  setOpen: (value: React.SetStateAction<boolean>) => void
) {
  React.useEffect(() => {
    const handleEscapeKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscapeKeydown);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKeydown);
    };
  }, [open, setOpen]);
}
