import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import BasicLayout from '../components/BasicLayout';

type AuthErrorLayoutProps = {
  children: React.ReactNode;
};

function AuthErrorLayout({ children }: AuthErrorLayoutProps) {
  return (
    <BasicLayout title="Error | Macaport Dashboard" requiresAuth={false}>
      <AuthenticationErrorStyles>
        <div className="container">
          <img
            className="logo"
            src="/images/logo-round.png"
            alt="Macaport logo with mountains"
          />
          {children}
        </div>
      </AuthenticationErrorStyles>
    </BasicLayout>
  );
}

export default function AuthenticationError() {
  const router = useRouter();
  const error =
    typeof router.query.error === 'string' &&
    router.query?.error?.toLowerCase();

  if (error === 'configuration') {
    return (
      <AuthErrorLayout>
        <h2>Server Error</h2>
        <p>
          There was a problem with the server configuration. Check the server
          logs for more information.
        </p>
        <Link href="/login">
          <a className="login-link">Go to login</a>
        </Link>
      </AuthErrorLayout>
    );
  }

  if (error === 'accessdenied') {
    return (
      <AuthErrorLayout>
        <h2>Access Denied</h2>
        <p>You do not have permission to sign in.</p>
        <Link href="/login">
          <a className="login-link">Try logging in again</a>
        </Link>
      </AuthErrorLayout>
    );
  }

  if (error == 'verification') {
    return (
      <AuthErrorLayout>
        <h2>Unable to sign in</h2>
        <p>
          The sign in link is no longer valid. It may have been used already or
          it may have expired.
        </p>
        <Link href="/login">
          <a className="login-link">Go to login</a>
        </Link>
      </AuthErrorLayout>
    );
  } else {
    return (
      <AuthErrorLayout>
        <h2>Authentication Error</h2>
        <p>An error occurred while trying to authenticate.</p>
        <Link href="/login">
          <a className="login-link">Go to login</a>
        </Link>
      </AuthErrorLayout>
    );
  }
}

const AuthenticationErrorStyles = styled.div`
  padding: 0 1.5rem;
  width: 100%;
  min-height: 100vh;
  background-color: #f3f4f6;
  display: flex;
  justify-content: center;
  align-items: center;

  .logo {
    width: 8rem;
  }

  h2 {
    margin: 1.75rem 0;
    font-size: 1.625rem;
    color: #1f2937;
  }

  p {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 500;
    color: #6b7280;
    text-align: center;
    line-height: 1.5;
  }

  .container {
    padding: 0 0 8rem;
    max-width: 22rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .login-link {
    margin: 1.5rem 0 0;
    padding: 0.75rem 1.25rem;
    width: 100%;
    height: 2.625rem;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #31363f;
    color: #f3f4f5;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.011em;
    border: 1px solid #181a1e;
    border-radius: 0.375rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
    cursor: pointer;

    &:hover {
      background-color: #282d34;
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #0369a1 0px 0px 0px 4px,
        rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
    }
  }
`;
