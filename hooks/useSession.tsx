import { useQuery } from 'react-query';
import { useRouter } from 'next/router';

export async function fetchSession() {
  const response = await fetch('/api/auth/session');
  const session = await response.json();
  if (Object.keys(session).length) {
    return session;
  }
  return null;
}

type Props = {
  required: boolean;
  redirectTo?: string;
};

export function useSession({ required, redirectTo = '/login' }: Props) {
  const router = useRouter();
  const query = useQuery(['session'], fetchSession, {
    onSettled(data) {
      if (data || !required) return;
      router.push(redirectTo);
    },
  });

  return [query.data, query.status === 'loading'];
}
