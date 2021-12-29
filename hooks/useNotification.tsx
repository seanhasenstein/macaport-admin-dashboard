import React from 'react';
import { useRouter } from 'next/router';

export default function useNotification(
  query: string
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const router = useRouter();
  const [showNotification, setShowNotification] = React.useState(false);

  React.useEffect(() => {
    if (router.query[query] === 'true') {
      setShowNotification(true);
    }
  }, [query, router.query]);

  return [showNotification, setShowNotification];
}
