import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid';

import { formatToMoney } from '../../utils';
import {
  formatBenefitAmount,
  stripeRefundDue,
} from '../../utils/memberBenefit';
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
            <dd>{formatBenefitAmount(order.benefit.type, restored)}</dd>
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

// Coloured by status: amber while the card refund is still owed in Stripe,
// green once it has been marked done, and a quiet grey when nothing went
// to the card. Each status sets the same few variables.
const OrderRefundPanelStyles = styled.section`
  --panel-bg: #fafafa;
  --panel-border: #e4e4e7;
  --panel-rule: #ececef;
  --panel-title: #3f3f46;
  --foot-bg: #f4f4f5;
  --foot-text: #3f3f46;
  --accent: #52525b;

  &.due {
    --panel-bg: #fffbeb;
    --panel-border: #f3c77f;
    --panel-rule: #fbe3b4;
    --panel-title: #92400e;
    --foot-bg: #fef0c7;
    --foot-text: #78350f;
    --accent: #b45309;
  }

  &.done {
    --panel-bg: #f0fdf4;
    --panel-border: #a7e3bd;
    --panel-rule: #cdeedb;
    --panel-title: #065f46;
    --foot-bg: #dcfce7;
    --foot-text: #065f46;
    --accent: #059669;
  }

  margin: 1rem 2.5rem 0;
  background-color: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 0.5rem;
  overflow: hidden;

  .panel-head {
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid var(--panel-rule);
  }

  .panel-title {
    color: var(--panel-title);
    font-size: 0.6875rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.1rem;
    text-transform: uppercase;
  }

  .pill {
    padding: 0.25rem 0.625rem;
    color: var(--panel-title);
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.2;
    background-color: #fff;
    border: 1px solid var(--panel-border);
    border-radius: 9999px;
    white-space: nowrap;
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
    border-top: 1px solid var(--panel-rule);
  }

  dt {
    color: #09090b;
  }

  dd {
    margin: 0;
    color: #3f3f46;
    text-align: right;
  }

  .panel-foot {
    padding: 0.75rem 1rem;
    background-color: var(--foot-bg);
    border-top: 1px solid var(--panel-border);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem 1rem;
  }

  .foot-text {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    color: var(--foot-text);
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.4;
  }

  .foot-icon {
    flex-shrink: 0;
    margin-top: 0.0625rem;
    width: 1rem;
    height: 1rem;
    color: var(--accent);
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
    font-weight: 600;
    line-height: 1.2;
    border-radius: 0.375rem;
    border: 1px solid transparent;
    cursor: pointer;
    white-space: nowrap;
    text-decoration: none;
  }

  .button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .button.secondary {
    color: var(--foot-text);
    background-color: #fff;
    border-color: var(--panel-border);
  }

  .button.secondary:hover {
    background-color: var(--panel-bg);
  }

  .button.primary {
    color: #fff;
    background-color: var(--accent);
  }

  .button.primary:hover:not(:disabled) {
    background-color: var(--panel-title);
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
