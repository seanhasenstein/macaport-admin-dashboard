import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useNotification from '../hooks/useNotification';

type Props = {
  query: string;
  heading: string;
  callbackUrl: string;
  className?: string;
};

export default function Notification({
  query,
  heading,
  callbackUrl,
  className = '',
}: Props) {
  const router = useRouter();
  const [show, setShow] = useNotification(query);

  React.useEffect(() => {
    let timerRef: NodeJS.Timeout;
    if (show) {
      timerRef = setTimeout(() => {
        setShow(false);
        router.push(callbackUrl, undefined, { shallow: true });
      }, 10000);
    }
    return () => {
      clearTimeout(timerRef);
    };
  }, [callbackUrl, router, setShow, show]);

  return (
    <NotificationStyles className={`${className}${show ? ' show' : ''}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="check-icon"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="main">
        <h3 className="heading">{heading}</h3>
      </div>
      <button
        type="button"
        className="close-button"
        onClick={() => setShow(false)}
      >
        <span className="sr-only">Close Modal</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </NotificationStyles>
  );
}

const NotificationStyles = styled.div`
  padding: 1rem;
  display: flex;
  align-items: center;
  position: fixed;
  bottom: 2rem;
  right: -100%;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px,
    rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;

  &.show {
    animation-name: slidein;
    animation-duration: 10s;
    animation-timing-function: ease-in-out;
  }

  .check-icon {
    flex-shrink: 0;
    height: 1.5rem;
    width: 1.5rem;
    color: #10b981;
  }

  .main {
    margin: 0 0 0 0.75rem;
  }

  .heading {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #111827;
    line-height: 1.34;
  }

  .close-button {
    margin: 0 0 0 1rem;
    padding: 0;
    flex-shrink: 0;
    display: inline-flex;
    background-color: inherit;
    border: none;
    border-radius: 0.375rem;
    color: #9ca3af;
    cursor: pointer;

    svg {
      height: 1rem;
      width: 1rem;
    }

    &:hover {
      color: #6b7280;
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px,
        rgb(99, 102, 241) 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }

  @keyframes slidein {
    from {
      right: -100%;
    }

    5% {
      right: 2.25rem;
    }

    90% {
      right: 2.25rem;
    }

    to {
      right: -100%;
    }
  }
`;
