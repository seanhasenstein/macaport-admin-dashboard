import { GetServerSideProps } from 'next';
import styled from 'styled-components';
import { signIn, getSession } from 'next-auth/client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import BasicLayout from '../components/BasicLayout';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('A valid email is required')
    .required('Email is required to login'),
});

export default function Login() {
  return (
    <BasicLayout>
      <LoginStyles>
        <div className="container">
          <img
            src="/images/logo-round.png"
            alt="Macaport logo with mountains"
            className="logo"
          />

          <h2>Sign in to your account</h2>
          <Formik
            initialValues={{ email: '' }}
            validationSchema={loginSchema}
            onSubmit={values => {
              signIn('email', { email: values.email, callbackUrl: '/' });
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="item">
                  <label htmlFor="email">Email address</label>
                  <Field
                    name="email"
                    id="email"
                    placeholder="example@email.com"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="validation-error"
                  />
                </div>
                <button type="submit">
                  {isSubmitting ? (
                    <span className="spinner" />
                  ) : (
                    'Email a Login Link'
                  )}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </LoginStyles>
    </BasicLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  try {
    const session = await getSession(context);
    if (session) {
      return {
        props: {},
        redirect: {
          permanent: false,
          destination: '/',
        },
      };
    }

    return {
      props: {},
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        error: error.message,
      },
    };
  }
};

const LoginStyles = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f3f4f6;
  display: flex;
  justify-content: center;
  align-items: center;

  .logo {
    width: 6.5rem;
  }

  h2 {
    margin: 1.75rem 0 2.75rem;
    font-size: 1.5rem;
    color: #374151;
  }

  .container {
    padding: 0 0 8rem;
    max-width: 22rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  form {
    width: 100%;
  }

  .item {
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  label {
    margin: 0 0 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6e788c;
  }

  input {
    width: 100%;
  }

  input,
  select,
  textarea {
    appearance: none;
    background-color: #fff;
    border: 1px solid #dddde2;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
  }

  input:not([type='checkbox'], [type='radio']),
  textarea {
    padding: 0.6875rem 0.75rem;

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }
  }

  button {
    margin: 1.125rem 0 0;
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

  @keyframes spinner {
    to {
      transform: rotate(360deg);
    }
  }

  .spinner:before {
    content: '';
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin-top: -10px;
    margin-left: -10px;
    border-radius: 50%;
    border-top: 2px solid #fff;
    border-right: 2px solid transparent;
    animation: spinner 0.6s linear infinite;
  }

  .validation-error {
    margin: 0.5rem 0 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: #b91c1c;
  }
`;
