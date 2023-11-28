import React from 'react';

export default function useOutsideClick(
  isOpen: boolean,
  close: () => void,
  ref: React.RefObject<HTMLElement>,
  disable = false
) {
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        close();
      }
    };

    if (isOpen && !disable) {
      document.addEventListener('click', handleClick);
    }

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [open, ref, close]);
}
