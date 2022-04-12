import React from 'react';

export default function usePreventBodyScroll(preventScroll: boolean) {
  React.useEffect(() => {
    if (preventScroll) {
      document.body.style.overflowY = 'hidden';
    }

    return () => {
      document.body.style.overflowY = 'inherit';
    };
  }, [preventScroll]);
}
