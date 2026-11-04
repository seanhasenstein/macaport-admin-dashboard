import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid';

import { formatToMoney } from '../../utils';
import { stripeRefundDue } from '../../utils/memberBenefit';
import { restoredPhrase } from '../../utils/refund';
import { useMarkStripeRefunded } from '../../hooks/useRefundMutation';

import { Order, Store } from '../../interfaces';

type Props = {
  order: Order;
  store: Store;
};

// What has been refunded on the order, and whether the card part has been
// done in Stripe yet. The dashboard never calls Stripe, so a card refund
// stays "due" until someone does it there and marks it here.
export default function OrderRefundPanel({ order, store }: Props) {
  const markStripeRefunded = useMarkStripeRefunded({ order, store });
  const resetMarkStripe = markStripeRefunded.reset;
  React.useEffect(() => {
    resetMarkStripe();
  }, [order.orderId, resetMarkStripe]);

  const refund = order.refund;
  const card = refund?.card ?? 0;
  const restored = refund?.creditRestored ?? 0;
  if (!refund || (card === 0 && restored === 0)) return null;

  const due = stripeRefundDue(order);
  const itemsReturned = (refund.returnedItems ?? []).reduce(
    (sum, r) => sum + r.quantity,
    0
  );
  const status: 'due' | 'done' | 'none' =
    card === 0 ? 'none' : due > 0 ? 'due' : 'done';

  return (
    <OrderRefundPanelStyles className={status}>
      <div className="panel-head">
        <p className="panel-title">
          {refund.status === 'Full' ? 'Full refund' : 'Partial refund'}
        </p>
        {status === 'due' && (
          <span className="pill due">Stripe refund due</span>
        )}
        {status === 'done' && (
          <span className="pill done">Refunded in Stripe</span>
        )}
      </div>

      <dl className="rows">
        {card > 0 && (
          <div className="row">
            <dt>To card</dt>
            <dd>{formatToMoney(card, true)}</dd>
          </div>
        )}
        {restored > 0 && order.benefit && (
          <div className="row">
            <dt>Credit restored</dt>
            <dd>{restoredPhrase(order.benefit.type, restored)}</dd>
          </div>
        )}
        {itemsReturned > 0 && (
          <div className="row">
            <dt>Items returned</dt>
            <dd>{itemsReturned}</dd>
          </div>
        )}
      </dl>

      {status === 'due' && (
        <div className="panel-foot">
          <p className="foot-text">
            <ExclamationTriangleIcon className="foot-icon" aria-hidden />
            <span>
              Refund {formatToMoney(due, true)} to the card in Stripe, then mark
              it done here.
            </span>
          </p>
          <div className="foot-actions">
            <a
              href={`https://dashboard.stripe.com/payments/${order.stripeId}`}
              target="_blank"
              rel="noreferrer"
              className="button secondary"
            >
              Open in Stripe
              <ArrowTopRightOnSquareIcon className="button-icon" aria-hidden />
            </a>
            <button
              type="button"
              className="button primary"
              onClick={() => markStripeRefunded.mutate()}
              disabled={markStripeRefunded.isLoading}
            >
              {markStripeRefunded.isLoading
                ? 'Saving...'
                : 'Mark refunded in Stripe'}
            </button>
          </div>
          {markStripeRefunded.isError && (
            <p className="foot-error" role="alert">
              {(markStripeRefunded.error as Error)?.message}
            </p>
          )}
        </div>
      )}

      {status === 'done' && (
        <div className="panel-foot">
          <p className="foot-text">
            <CheckCircleIcon className="foot-icon" aria-hidden />
            <span>
              Marked refunded in Stripe
              {refund.stripeRefundedAt
                ? ` on ${format(
                    new Date(refund.stripeRefundedAt),
                    'MMM d, yyyy'
                  )}`
                : ''}
              {refund.stripeRefundedBy ? ` by ${refund.stripeRefundedBy}` : ''}.
            </span>
          </p>
        </div>
      )}
    </OrderRefundPanelStyles>
  );
}

const OrderRefundPanelStyles = styled.section`
  margin: 1.75rem 2.5rem 0;
  background-color: #fff;
  border: 1px solid #d4d4d8;
  border-radius: 0.5rem;
  overflow: hidden;

  &.due {
    border-color: #f5c98b;
  }

  .panel-head {
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid #e4e4e7;
  }

  .panel-title {
    color: #09090b;
    font-size: 0.6875rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.1rem;
    text-transform: uppercase;
  }

  .pill {
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.2;
    border-radius: 9999px;
    border: 1px solid transparent;
    white-space: nowrap;
  }

  .pill.due {
    color: #92400e;
    background-color: #fffbeb;
    border-color: #f5c98b;
  }

  .pill.done {
    color: #065f46;
    background-color: #ecfdf5;
    border-color: #a7f3d0;
  }

  .rows {
    margin: 0;
    padding: 0.25rem 1rem;
  }

  .row {
    padding: 0.5rem 0;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 1.2;
  }

  .row + .row {
    border-top: 1px solid #f4f4f5;
  }

  dt {
    color: #09090b;
  }

  dd {
    margin: 0;
    color: #52525b;
    text-align: right;
  }

  .panel-foot {
    padding: 0.75rem 1rem;
    background-color: #fafafa;
    border-top: 1px solid #e4e4e7;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem 1rem;
  }

  &.due .panel-foot {
    background-color: #fffbeb;
    border-top-color: #f5c98b;
  }

  .foot-text {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    color: #52525b;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  &.due .foot-text {
    color: #78350f;
  }

  .foot-icon {
    flex-shrink: 0;
    margin-top: 0.0625rem;
    width: 1rem;
    height: 1rem;
    color: #10b981;
  }

  &.due .foot-icon {
    color: #d97706;
  }

  .foot-actions {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
  }

  .button {
    padding: 0.4375rem 0.75rem;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1.2;
    border-radius: 0.375rem;
    border: 1px solid transparent;
    cursor: pointer;
    white-space: nowrap;
    text-decoration: none;
  }

  .button:focus-visible {
    outline: 2px solid #1c44b9;
    outline-offset: 2px;
  }

  .button.secondary {
    color: #1f2937;
    background-color: #fff;
    border-color: #d1d5db;
  }

  .button.secondary:hover {
    background-color: #f3f4f6;
  }

  .button.primary {
    color: #fff;
    background-color: #1f2937;
  }

  .button.primary:hover:not(:disabled) {
    background-color: #111827;
  }

  .button:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .button-icon {
    width: 0.875rem;
    height: 0.875rem;
  }

  .foot-error {
    flex-basis: 100%;
    color: #b91c1c;
    font-size: 0.8125rem;
  }
`;
