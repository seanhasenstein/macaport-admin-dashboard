import React from 'react';

export default function useThrottle(value: string, delay: number) {
  const [throttledValue, setThrottledValue] = React.useState(value);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setThrottledValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return throttledValue;
}
