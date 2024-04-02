import React from 'react';

export default function useOutsideClick(
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  ref: React.RefObject<HTMLElement>,
  disabled = false
) {
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        e.stopPropagation();
        setOpen(false);
      }
    };

    if (open && !disabled) {
      document.addEventListener('click', handleClick);
    }

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [disabled, open, ref, setOpen]);
}
