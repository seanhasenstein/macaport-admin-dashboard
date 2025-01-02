import React from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

type Props = {
  children: JSX.Element;
  required: boolean;
};

export default function AuthorizedRoute(props: Props) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession({
    required: props.required,
    onUnauthenticated: () => {
      router.push('/login');
    },
  });

  if (props.required && (sessionStatus === 'loading' || !session)) {
    return <div className="sr-only">Verifying authentication</div>;
  }

  return props.children;
}
