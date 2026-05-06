import React from 'react';
import styled from 'styled-components';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import LoadingSpinner from '../../LoadingSpinner';

type Props = {
  nextActive: boolean;
  isLoading: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ProgramActiveModal(props: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [show, setShow] = React.useState(true);

  useOutsideClick(
    show,
    () => {
      setShow(false);
      props.onCancel();
    },
    ref,
    props.isLoading
  );
  useEscapeKeydownClose(
    show,
    () => {
      setShow(false);
      props.onCancel();
    },
    props.isLoading
  );

  const isPausing = !props.nextActive;

  return (
    <Styles>
      <div ref={ref} className="modal">
        <h3>{isPausing ? 'Pause discount' : 'Resume discount'}</h3>
        <p>
          {isPausing ? (
            <>
              Pausing will immediately stop accepting Teacher Appreciation
              discounts at checkout. Eligible customers will see an{' '}
              <strong>ineligible</strong> rejection until the discount is
              resumed.
            </>
          ) : (
            <>
              Resuming will allow eligible customers to redeem their Teacher
              Appreciation discount at checkout again.
            </>
          )}
        </p>
        {props.errorMessage && (
          <div className="error-message">{props.errorMessage}</div>
        )}
        <div className="buttons">
          <button
            type="button"
            className="secondary-button"
            onClick={props.onCancel}
            disabled={props.isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={props.onConfirm}
            disabled={props.isLoading}
          >
            {props.isLoading
              ? isPausing
                ? 'Pausing...'
                : 'Resuming...'
              : isPausing
              ? 'Pause discount'
              : 'Resume discount'}
          </button>
        </div>
        <ModalSpinner isLoading={props.isLoading} />
      </div>
    </Styles>
  );
}

const Styles = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;

  .modal {
    position: relative;
    margin: -6rem 0 0;
    padding: 2rem 2.25rem 1.5rem;
    max-width: 28rem;
    width: 100%;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  }

  h3 {
    margin: 0 0 0.625rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  p {
    margin: 0 0 1.25rem;
    font-size: 0.9375rem;
    color: #4b5563;
    line-height: 1.5;
  }

  strong {
    font-weight: 600;
    color: #111827;
  }

  .error-message {
    margin: 1rem 0 0;
    padding: 0.625rem 0.875rem;
    font-size: 0.8125rem;
    color: #b91c1c;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.375rem;
  }

  .buttons {
    margin: 1.5rem 0 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
  }

  .primary-button,
  .secondary-button {
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
  }

  .primary-button {
    padding: 0.625rem 1.25rem;
    min-width: 10rem;
    color: #fff;
    background-color: #111827;
    border: none;
    border-radius: 0.25rem;
    transition: background-color 150ms linear;
  }

  .primary-button:hover:not(:disabled) {
    background-color: #000;
  }

  .secondary-button {
    color: #4b5563;
    background-color: transparent;
    border: none;
  }

  .secondary-button:hover:not(:disabled) {
    color: #1f2937;
    text-decoration: underline;
  }

  .primary-button:disabled,
  .secondary-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .primary-button:focus,
  .secondary-button:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }

  .primary-button:focus-visible,
  .secondary-button:focus-visible {
    text-decoration: underline;
  }
`;

const ModalSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
`;
