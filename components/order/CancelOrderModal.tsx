import React from 'react';
import { UseMutationResult } from 'react-query';
import styled from 'styled-components';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';
import useOutsideClick from '../../hooks/useOutsideClick';
import { Order, Store } from '../../interfaces';
import LoadingSpinner from '../LoadingSpinner';

type Props = {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  cancelOrder: UseMutationResult<
    Store | undefined,
    unknown,
    void,
    Order | undefined
  >;
};

export default function CancelOrderModal(props: Props) {
  const modalRef = React.useRef<HTMLDivElement>(null);

  const closeModal = () => props.setShowModal(false);

  useOutsideClick(props.showModal, closeModal, modalRef);
  useEscapeKeydownClose(props.showModal, closeModal);

  const handleCancelOrderClick = () => {
    props.cancelOrder.mutate();
    props.setShowModal(false);
  };

  if (props.showModal) {
    return (
      <CancelOrderModalStyles>
        <div ref={modalRef} className="modal">
          <div>
            <h3>Cancel order</h3>
            <p>
              Are you sure you want to cancel this order? This will cause the
              following changes:
            </p>
            <ul>
              <li>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Order status set to 'canceled'.
              </li>
              <li>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Order totals to $0.00.
              </li>
              <li>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                All order items quantity to 0 and item total to $0.00.
              </li>
              <li>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                All order items quantity will be added back to inventory
                products inventory.
              </li>
            </ul>
          </div>
          <div className="buttons">
            <button
              type="button"
              className="secondary-button"
              onClick={() => props.setShowModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleCancelOrderClick}
            >
              Cancel the order
            </button>
          </div>
          <CancelOrderMutationSpinner isLoading={props.cancelOrder.isLoading} />
        </div>
      </CancelOrderModalStyles>
    );
  } else {
    return null;
  }
}

const CancelOrderModalStyles = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;

  .modal {
    position: relative;
    margin: -8rem 0 0;
    padding: 2.25rem 2.5rem 1.75rem;
    max-width: 26rem;
    width: 100%;
    text-align: left;
    background-color: #fff;
    border-radius: 0.375rem;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);

    h3 {
      margin: 0 0 0.75rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
    }

    p {
      margin: 0 0 1rem;
      font-size: 1rem;
      color: #1f2937;
      line-height: 1.5;
    }

    ul {
      margin: 1rem 0;
      padding: 0;
    }

    li {
      margin: 0 0 0.75rem;
      display: flex;
      gap: 0.5rem;
      font-size: 0.875rem;
      list-style: none;
      line-height: 1.5;

      svg {
        margin: 4px 0 0;
        flex-shrink: 0;
        height: 0.875rem;
        width: 0.875rem;
        color: #059669;
      }
    }

    .buttons {
      margin: 2rem 0 0;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.75rem;
    }

    .primary-button,
    .secondary-button {
      padding: 0.5rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 0.25rem;
      cursor: pointer;

      &:hover {
        color: #000;
        border-color: #c6cbd2;
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.1);
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible {
        box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c44b9 0px 0px 0px 4px,
          rgba(0, 0, 0, 0) 0px 0px 0px 0px;
      }
    }

    .primary-button {
      color: #b91c1c;
      background-color: #fee2e2;
      border: 1px solid #fdcfcf;
      box-shadow: inset 0 1px 1px #fff;

      &:hover {
        color: #a81919;
        border-color: #fcbcbc;
        box-shadow: inset 0 1px 1px #fff, rgba(0, 0, 0, 0) 0px 0px 0px 0px,
          rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
      }
    }

    .secondary-button {
      color: #1f2937;
      background-color: transparent;
      border: 1px solid #d1d5db;
      border-radius: 0.3125rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      cursor: pointer;
    }
  }
`;

const CancelOrderMutationSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
`;
