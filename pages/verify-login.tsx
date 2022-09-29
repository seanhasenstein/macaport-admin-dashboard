import styled from 'styled-components';
import BasicLayout from '../components/BasicLayout';

export default function VerifyLogin() {
  return (
    <BasicLayout title="Verify Login | Macaport Dashboard" requiresAuth={false}>
      <VerifyLoginStyles>
        <div className="container">
          <img
            className="logo"
            src="/images/logo-round.png"
            alt="Macaport logo with mountains"
          />
          <h2>Please check your email...</h2>
          <p>A sign in link has been sent to your email address.</p>
        </div>
      </VerifyLoginStyles>
    </BasicLayout>
  );
}

const VerifyLoginStyles = styled.div`
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
`;
