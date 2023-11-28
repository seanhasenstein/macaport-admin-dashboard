import React from 'react';
import styled from 'styled-components';

type Theme = 'light' | 'dark';

type Props = {
  isLoading: boolean;
  className?: string;
  theme?: Theme;
};

export default function LoadingSpinner({
  isLoading,
  className = '',
  theme = 'light',
}: Props) {
  if (!isLoading) return null;
  return (
    <LoadingSpinnerStyles
      className={`${className && `${className} `}${isLoading ? 'show' : ''}`}
      theme={theme}
      aria-hidden="true"
    >
      <span className="spinner" />
    </LoadingSpinnerStyles>
  );
}

const LoadingSpinnerStyles = styled.div<{ theme: Theme }>`
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
    border-width: 2px;
    border-style: solid;
    border-color: ${props => (props.theme === 'light' ? '#eaeaee' : '#535f6e')};
    border-radius: 9999px;
    border-top-color: ${props =>
      props.theme === 'light' ? '#bbc1ca' : '#1f2937'};
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
