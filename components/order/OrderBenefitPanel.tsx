import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { format } from 'date-fns';

import { useBenefitQuery } from '../../hooks/useBenefitQuery';
import { useInvoicesQuery } from '../../hooks/useInvoicesQuery';
import { fetchShippingData } from '../../queries/fetchShippingData';
import {
  benefitTypeLabel,
  DEFAULT_INVOICE_GRACE_DAYS,
  formatBenefitAmount,
  memberDisplayName,
  memberUsage,
  orderAdjustments,
  orderInvoiceableAt,
  orderInvoiceState,
} from '../../utils/memberBenefit';

import { Order, Store } from '../../interfaces';

type Props = {
  order: Order;
  store: Store;
};

const shortDate = (iso: string | Date) => format(new Date(iso), 'MMM d, yyyy');

// Which member benefit the order used, how much of it, what the member has
// left, and where the order stands with the client's invoicing.
export default function OrderBenefitPanel({ order, store }: Props) {
  const use = order.benefit;
  const legacyEmail =
    order.sheboyganLutheranStaffDiscount?.email ??
    order.switchFitnessDiscount?.email ??
    order.teacherAppreciation?.email;
  const benefitAdjustments = orderAdjustments(order).filter(
    a => a.kind !== 'waived'
  );
  const hasBenefit = Boolean(use) || benefitAdjustments.length > 0;

  const benefitQuery = useBenefitQuery(store._id, hasBenefit);
  // Only the benefit this order actually drew on, never a newer one the
  // store has since been given.
  const benefit =
    use && benefitQuery.data && benefitQuery.data._id === use.benefitId
      ? benefitQuery.data
      : null;
  const invoicesQuery = useInvoicesQuery(
    store._id,
    Boolean(order.clientInvoiceId)
  );
  const settingsQuery = useQuery(['shipping'], fetchShippingData, {
    staleTime: 1000 * 60 * 10,
    enabled: Boolean(benefit && benefit.funding === 'client'),
  });

  if (!hasBenefit) return null;

  const email = use?.email ?? legacyEmail;
  const member =
    benefit && email ? benefit.members.find(m => m.email === email) : undefined;
  const listedName =
    member && memberDisplayName(member) !== member.email
      ? memberDisplayName(member)
      : null;
  // The checkout name stands in when the client's list had none, but only
  // when the order was placed with the member's own email.
  const memberName =
    listedName ??
    (email && email === order.customer.email.trim().toLowerCase()
      ? `${order.customer.firstName} ${order.customer.lastName}`.trim() || null
      : null);
  const ended = Boolean((member as { endedAt?: string } | undefined)?.endedAt);

  const type = use?.type ?? benefit?.type;
  const name =
    benefit?.copy.benefitName ?? benefitAdjustments[0]?.label ?? 'Benefit';

  const restored =
    use && use.type !== 'discount' ? order.refund?.creditRestored ?? 0 : 0;
  const used = use?.used ?? 0;
  const usage = benefit && member ? memberUsage(benefit, member) : null;

  const clientInvoice = order.clientInvoiceId
    ? invoicesQuery.data?.find(i => i._id === order.clientInvoiceId)
    : undefined;
  const invoiceLine = (() => {
    if (order.clientInvoiceId) {
      if (!clientInvoice) return 'Invoiced';
      if (clientInvoice.status !== 'paid') {
        return `Invoice #${clientInvoice.number}, open`;
      }
      return `Invoice #${clientInvoice.number}, paid${
        clientInvoice.paidAt ? ` ${shortDate(clientInvoice.paidAt)}` : ''
      }${
        clientInvoice.paymentReference
          ? ` (${clientInvoice.paymentReference})`
          : ''
      }`;
    }
    if (!benefit) return null;
    if (benefit.funding !== 'client') return 'Macaport-funded, not invoiced';
    const graceDays =
      settingsQuery.data?.invoiceGraceDays ?? DEFAULT_INVOICE_GRACE_DAYS;
    switch (orderInvoiceState(order, graceDays)) {
      case 'excluded':
        return `Excluded${
          order.clientInvoiceExcluded?.reason
            ? `: ${order.clientInvoiceExcluded.reason}`
            : ''
        }`;
      case 'awaiting':
        return 'Not yet, waits until the order ships';
      case 'grace': {
        const at = orderInvoiceableAt(order, graceDays);
        return at
          ? `In the return window until ${shortDate(at)}`
          : 'In the return window';
      }
      case 'eligible':
        return 'Ready to invoice';
      default:
        return 'Nothing to invoice';
    }
  })();

  return (
    <OrderBenefitPanelStyles>
      <div className="panel-head">
        <p className="panel-title">Member benefit</p>
        {type && <span className="pill">{benefitTypeLabel(type)}</span>}
      </div>

      <dl className="rows">
        <div className="row">
          <dt>Benefit</dt>
          <dd>{name}</dd>
        </div>
        {email && (
          <div className="row">
            <dt>Member</dt>
            <dd>
              {memberName && <span className="strong">{memberName}</span>}
              <span className="email">{email}</span>
              {ended && <span className="note">Benefit ended</span>}
            </dd>
          </div>
        )}
        {use && type && (
          <div className="row">
            <dt>Used on this order</dt>
            <dd>
              <span className="strong">{formatBenefitAmount(type, used)}</span>
              {restored > 0 && (
                <span className="note">
                  {formatBenefitAmount(type, Math.max(0, used - restored))}{' '}
                  after refunds
                </span>
              )}
            </dd>
          </div>
        )}
        {usage && type && (
          <div className="row">
            <dt>Member&apos;s balance</dt>
            <dd>
              <span className="strong">
                {formatBenefitAmount(type, usage.remaining)} left
              </span>
              <span className="note">
                of {formatBenefitAmount(type, usage.allowance)}
              </span>
            </dd>
          </div>
        )}
        {invoiceLine && (
          <div className="row">
            <dt>Client invoice</dt>
            <dd>{invoiceLine}</dd>
          </div>
        )}
      </dl>
    </OrderBenefitPanelStyles>
  );
}

const OrderBenefitPanelStyles = styled.section`
  margin: 1.75rem 2.5rem 0;
  background-color: #f5f8ff;
  border: 1px solid #c7d4f5;
  border-radius: 0.5rem;
  overflow: hidden;

  .panel-head {
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid #dbe4fa;
  }

  .panel-title {
    color: #1c3a8f;
    font-size: 0.6875rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.1rem;
    text-transform: uppercase;
  }

  .pill {
    padding: 0.25rem 0.625rem;
    color: #1c44b9;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.2;
    background-color: #fff;
    border: 1px solid #8fa6e6;
    border-radius: 9999px;
    white-space: nowrap;
  }

  .rows {
    margin: 0;
    padding: 0.25rem 1rem;
  }

  .row {
    padding: 0.5625rem 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1.5rem;
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 1.3;
  }

  .row + .row {
    border-top: 1px solid #e3eafb;
  }

  dt {
    flex-shrink: 0;
    color: #09090b;
  }

  dd {
    margin: 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.125rem;
    color: #3f3f46;
    text-align: right;
  }

  .strong {
    color: #09090b;
  }

  .email,
  .note {
    color: #52525b;
    font-size: 0.8125rem;
  }

  .email {
    max-width: 100%;
    overflow-wrap: anywhere;
  }
`;
