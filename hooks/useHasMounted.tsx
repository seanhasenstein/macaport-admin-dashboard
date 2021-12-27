import React from 'react';

export default function useHasMounted() {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useLayoutEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
