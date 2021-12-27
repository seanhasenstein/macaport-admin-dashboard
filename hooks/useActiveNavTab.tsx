import React from 'react';
import { useRouter } from 'next/router';
import useHasMounted from './useHasMounted';
import { getQueryParameter } from '../utils';

export default function useActiveNavTab(inputArray: string[], url: string) {
  type T = typeof inputArray[number];
  const hasMounted = useHasMounted();
  const router = useRouter();
  const activeParam = getQueryParameter(router.query.active);
  const [activeNav, setActiveNav] = React.useState<T>(() => {
    if (hasMounted) {
      const result = getActiveNav(activeParam);
      router.push(`${url}active=${result}`, undefined, {
        shallow: true,
      });
      return result;
    }
    return inputArray[0];
  });

  const getActiveNav = React.useCallback(
    (input: string | undefined) => {
      const includesValue = inputArray.some(v => v === input);

      if (includesValue) {
        return input as T;
      }
      return inputArray[0];
    },
    [inputArray]
  );

  React.useEffect(() => {
    setActiveNav(getActiveNav(activeParam));
  }, [activeParam, getActiveNav]);

  return { activeNav, setActiveNav };
}
