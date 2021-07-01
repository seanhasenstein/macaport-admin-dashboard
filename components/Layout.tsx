import Link from 'next/link';
import Image from 'next/image';
import styled, { createGlobalStyle } from 'styled-components';
import Logo from '../public/images/logo.png';

const GlobalStyles = createGlobalStyle`
  @font-face {
  font-family: 'Inter';
  font-style:  normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/Inter-Regular.woff2?v=3.18") format("woff2"),
       url("/fonts/Inter-Regular.woff?v=3.18") format("woff");
}

@font-face {
  font-family: 'Inter';
  font-style:  normal;
  font-weight: 500;
  font-display: swap;
  src: url("/fonts/Inter-Medium.woff2?v=3.18") format("woff2"),
       url("/fonts/Inter-Medium.woff?v=3.18") format("woff");
}

@font-face {
  font-family: 'Inter';
  font-style:  normal;
  font-weight: 600;
  font-display: swap;
  src: url("/fonts/Inter-SemiBold.woff2?v=3.18") format("woff2"),
       url("/fonts/Inter-SemiBold.woff?v=3.18") format("woff");
}

@font-face {
  font-family: 'Inter';
  font-style:  normal;
  font-weight: 700;
  font-display: swap;
  src: url("/fonts/Inter-Bold.woff2?v=3.18") format("woff2"),
       url("/fonts/Inter-Bold.woff?v=3.18") format("woff");
}

  html,
  body {
  padding: 0;
  margin: 0;
  position: relative;
  font-size: 16px;
  letter-spacing: -0.011em;
  background-color: #fff;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "cv02","cv03","cv04","cv09", "cv11";
}

html, body, button, input, select, textarea {
  font-family: 'Inter',-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
  outline-color: #4F46E5;
}

.sr-only {
  position: absolute;
  clip: rect(1px, 1px, 1px, 1px);
  padding: 0;
  border: 0;
  height: 1px;
  width: 1px;
  overflow: hidden;
}

label {
  margin: 0 0 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6e788c;
}

input, select, textarea {
  appearance: none;
  background-color: #fff;
  border: 1px solid #dddde2;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
}

input:not([type="checkbox"], [type="radio"]), textarea {
  padding: 0.6875rem 0.75rem;

  &:focus {
    outline-color: #4F46E5;
  }
}

input[type="checkbox"]:checked, input[type='radio']:checked {
  border-color: transparent;
  background-color: currentColor;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

input[type='checkbox']:focus, input[type='radio']:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, rgb(99, 102, 241) 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
}

input[type='checkbox'] {
  padding: 0;
  width: 1rem;
  height: 1rem;
  display: inline-block;
  vertical-align: middle;
  user-select: none;
  flex-shrink: 0;
  border-radius: 0.25rem;
  color: rgb(79, 70, 229);
}

input[type="checkbox"]:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
}

input[type="radio"] {
  margin: 0%;
  height: 1rem;
  width: 1rem;
  border-radius: 100%;
  flex-shrink: 0;
  color: rgb(79,70,229);
}

input[type="radio"]:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
}

select {
  padding: 0.6875rem 2.5rem 0.75rem 0.75rem;
  background-color: #fff;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%239fa6b2' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-size: 1.375em 1.375em;
  background-repeat: no-repeat;
  color-adjust: exact;
  border: 1px solid #dddde2;
  border-radius: 0.375rem;
  font-weight: 500;
  color: #36383e;
  cursor: pointer;
}

select:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(65, 141, 203, 0.2);
  border-color: #8faef4;
}

textarea {
  resize: vertical;
  min-height: 6rem;
}

@media (max-width: 500px) {
  input, select, textarea {
    font-size: 1rem;
  }
}

@media print {
  body {
    background-color: #fff;
  }

  header, footer {
    display: none;
  }
}
`;

const LayoutStyles = styled.div`
  padding: 0 0 0 20rem;
  position: relative;

  header {
    padding: 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    width: 20rem;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    background-color: #f3f4f6;
    border-right: 1px solid #e5e7eb;
  }

  nav {
    margin: 1.125rem 0;
    padding: 0.5rem 0;
    display: flex;
    flex-direction: column;

    a {
      padding: 0.75rem 0;
      display: flex;
      align-items: center;
      font-size: 1rem;
      font-weight: 500;
      color: #4b5563;

      &:hover {
        color: #111827;
      }

      svg {
        margin: 0 0.5rem 0 0;
        height: 1.375rem;
        width: 1.375rem;
        color: #9ca3af;
      }
    }
  }
`;

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <LayoutStyles>
      <GlobalStyles />
      <header>
        <div className="logo">
          <Link href="/dashboard">
            <a>
              <Image
                src={Logo}
                alt="Macaport logo with mountains"
                width="200px"
                height="54px"
              />
            </a>
          </Link>
        </div>
        <nav>
          <Link href="/">
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home
            </a>
          </Link>
          <Link href="/stores">
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Stores
            </a>
          </Link>
          <Link href="/orders">
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Orders
            </a>
          </Link>
        </nav>
      </header>
      <main>{children}</main>
    </LayoutStyles>
  );
}
