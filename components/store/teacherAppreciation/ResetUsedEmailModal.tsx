import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import styled from 'styled-components';
import { Order } from '../../../interfaces';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import { formatToMoney } from '../../../utils';
import LoadingSpinner from '../../LoadingSpinner';

type Props = {
  email: string;
  linkedOrders: Order[];
  storeId: string;
  isLoading: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ResetUsedEmailModal(props: Props) {
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

  return (
    <ResetUsedEmailModalStyles>
      <div ref={ref} className="modal">
        <div>
          <h3>Reset email</h3>
          <p>
            This will move <strong>{props.email}</strong> from used back to
            eligible. The customer will be able to redeem the discount again.
          </p>

          <div className="order-context">
            <div className="label">
              {props.linkedOrders.length > 1
                ? `Linked orders (${props.linkedOrders.length})`
                : 'Linked order'}
            </div>
            {props.linkedOrders.length === 0 ? (
              <div className="empty">
                No linked order found in this store. Reset is still allowed.
              </div>
            ) : (
              <div className="order-list">
                {props.linkedOrders.map((order, i) => (
                  <div key={order.orderId} className="order-card">
                    {props.linkedOrders.length > 1 && i === 0 && (
                      <div className="order-card-label">Most recent</div>
                    )}
                    <div className="row">
                      <span className="muted">Order ID</span>
                      <Link
                        href={`/stores/${props.storeId}?orderId=${order.orderId}`}
                      >
                        <a className="link">{order.orderId}</a>
                      </Link>
                    </div>
                    <div className="row">
                      <span className="muted">Customer</span>
                      <span>
                        {order.customer.firstName} {order.customer.lastName}
                      </span>
                    </div>
                    <div className="row">
                      <span className="muted">Date</span>
                      <span>
                        {format(
                          new Date(order.createdAt),
                          "MMM. d, yyyy 'at' h:mmaa"
                        )}
                      </span>
                    </div>
                    <div className="row">
                      <span className="muted">Total</span>
                      <span>{formatToMoney(order.summary.total, true)}</span>
                    </div>
                    <div className="row">
                      <span className="muted">Status</span>
                      <span>{order.orderStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
            {props.isLoading ? 'Resetting...' : 'Reset email'}
          </button>
        </div>
        <ModalSpinner isLoading={props.isLoading} />
      </div>
    </ResetUsedEmailModalStyles>
  );
}

const ResetUsedEmailModalStyles = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;

  .modal {
    position: relative;
    margin: -4rem 0 0;
    padding: 2rem 2.25rem 1.5rem;
    max-width: 30rem;
    width: 100%;
    text-align: left;
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

  .order-context {
    margin: 0 0 0.5rem;
  }

  .order-context .label {
    margin: 0 0 0.5rem;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
  }

  .order-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 22rem;
    overflow-y: auto;
  }

  .order-card {
    padding: 0.875rem 1rem;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
  }

  .order-card-label {
    margin: 0 0 0.5rem;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
  }

  .row {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
    font-size: 0.8125rem;
    color: #111827;
  }

  .muted {
    color: #6b7280;
  }

  .link {
    color: #1c44b9;
    font-weight: 500;
  }

  .link:hover {
    text-decoration: underline;
  }

  .empty {
    padding: 0.875rem 1rem;
    background-color: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    color: #92400e;
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
