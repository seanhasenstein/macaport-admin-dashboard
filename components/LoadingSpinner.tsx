import React from 'react';
import styled from 'styled-components';

type Props = {
  isLoading: boolean;
  className?: string;
};

export default function LoadingSpinner({ isLoading, className = '' }: Props) {
  return (
    <LoadingSpinnerStyles
      className={`${className && `${className} `}${isLoading ? 'show' : ''}`}
      aria-hidden="true"
    >
      <span className="spinner" />
    </LoadingSpinnerStyles>
  );
}

const LoadingSpinnerStyles = styled.div`
  margin: 1px 0 0;
  display: inline-flex;
  align-items: center;
  opacity: 0;
  pointer-events: none;

  &.show {
    opacity: 1;
  }

  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid #eaeaee;
    border-radius: 9999px;
    border-top-color: #bbc1ca;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
