import React from 'react';
import { useSession } from '../hooks/useSession';

type Props = {
  children: JSX.Element;
  required: boolean;
};

export default function AuthorizedRoute(props: Props) {
  const [session, sessionLoading] = useSession({ required: props.required });

  if (props.required && (sessionLoading || !session)) {
    return <div className="sr-only">Verifying authentication</div>;
  }

  return props.children;
}
