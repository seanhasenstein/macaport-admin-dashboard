import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { format } from 'date-fns';
import {
  MemberBenefit,
  MemberBenefitMember,
} from '../../../core/memberBenefits/types';
import { Order } from '../../../interfaces';
import { formatToMoney } from '../../../utils';
import { formatBenefitAmount, memberUsage } from '../../../utils/memberBenefit';

type Props = {
  benefit: MemberBenefit;
  member: MemberBenefitMember;
  orders: Order[];
  storeId: string;
  onRestore: () => void;
  onAllowance: () => void;
  onRemove: () => void;
  onEnd: () => void;
};

export default function MemberRow({
  benefit,
  member,
  orders,
  storeId,
  onRestore,
  onAllowance,
  onRemove,
  onEnd,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const usage = memberUsage(benefit, member);
  // Set by End benefit; a dashboard-only field on the member.
  const ended = Boolean((member as { endedAt?: string }).endedAt);
  const name = [member.firstName, member.lastName].filter(Boolean).join(' ');

  const linked = (member.orderIds ?? []).map(orderId => ({
    orderId,
    order: orders.find(o => o.orderId === orderId),
  }));

  return (
    <MemberRowStyles className={open ? 'open' : ''}>
      <button
        type="button"
        className="row"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="who">
          <span className="email">{member.email}</span>
          {name && <span className="name">{name}</span>}
        </span>
        <span className="usage">
          {formatBenefitAmount(benefit.type, usage.used)} of{' '}
          {formatBenefitAmount(benefit.type, usage.allowance)}
          {ended ? (
            <span className="override ended" title="Benefit ended">
              ended
            </span>
          ) : member.allowance !== undefined ? (
            <span className="override" title="Allowance override">
              override
            </span>
          ) : null}
        </span>
        <span className="orders-count">
          {linked.length} order{linked.length === 1 ? '' : 's'}
        </span>
      </button>

      {open && (
        <div className="details">
          <div className="stats">
            <div>
              <span className="label">Allowance</span>
              <span>{formatBenefitAmount(benefit.type, usage.allowance)}</span>
            </div>
            <div>
              <span className="label">Used</span>
              <span>{formatBenefitAmount(benefit.type, usage.used)}</span>
            </div>
            <div>
              <span className="label">Remaining</span>
              <span>{formatBenefitAmount(benefit.type, usage.remaining)}</span>
            </div>
          </div>

          <div className="linked">
            <span className="label">Linked orders</span>
            {linked.length === 0 ? (
              <span className="empty">None yet.</span>
            ) : (
              <ul>
                {linked.map(({ orderId, order }) => (
                  <li key={orderId}>
                    <Link href={`/stores/${storeId}?orderId=${orderId}`}>
                      <a className="link">#{orderId}</a>
                    </Link>
                    {order ? (
                      <span className="order-meta">
                        {format(new Date(order.createdAt), 'MMM d, yyyy')} ·{' '}
                        {formatToMoney(order.summary.total, true)} ·{' '}
                        {order.orderStatus}
                        {order.benefit
                          ? ` · ${formatBenefitAmount(
                              order.benefit.type,
                              order.benefit.used
                            )} used`
                          : ''}
                      </span>
                    ) : (
                      <span className="order-meta">not in this store</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="actions">
            <button type="button" className="row-button" onClick={onRestore}>
              Restore used
            </button>
            <button type="button" className="row-button" onClick={onAllowance}>
              Set allowance
            </button>
            {usage.used === 0 ? (
              <button
                type="button"
                className="row-button danger"
                onClick={onRemove}
              >
                Remove
              </button>
            ) : !ended ? (
              <button
                type="button"
                className="row-button danger"
                onClick={onEnd}
              >
                End benefit
              </button>
            ) : null}
          </div>
        </div>
      )}
    </MemberRowStyles>
  );
}

const MemberRowStyles = styled.li`
  position: relative;
  background-color: #fff;
  border: 1px solid #d1d5db;
  transition: border-color 120ms linear, background-color 120ms linear;

  &:hover {
    border-color: #9ca3af;
    z-index: 1;
  }

  /* The ring is drawn on a layer above the row's contents, so the
     expanded panel's backgrounds cannot cover it, and the row clips its
     contents to its own rounded corners at the bottom of the list. */
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 0 solid #1c44b9;
    pointer-events: none;
  }

  &.open {
    border-color: #1c44b9;
    z-index: 2;
  }

  &.open::after {
    border-width: 1px;
  }

  /* Two open rows in a row share one edge, so the lower one drops its
     inner top line and the shared edge stays two pixels. */
  &.open + &.open::after {
    border-top-width: 0;
  }

  &:has(.row:focus-visible) {
    z-index: 3;
  }

  &:has(.row:focus-visible)::after {
    border-width: 2px;
  }

  &:last-child {
    border-radius: 0 0 0.375rem 0.375rem;
  }

  /* The ring sits inside the 1px border, so its curve is 1px tighter. */
  &:last-child::after {
    border-radius: 0 0 calc(0.375rem - 1px) calc(0.375rem - 1px);
  }

  .row {
    width: 100%;
    padding: 0.5625rem 0.75rem;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 13rem 5rem;
    gap: 1rem;
    align-items: center;
    text-align: left;
    font-size: 0.8125rem;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-family: inherit;
  }

  .row:focus {
    outline: none;
  }

  .row:hover {
    background-color: #f9fafb;
  }

  &.open .row {
    background-color: #eef2ff;
  }

  .who {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .email {
    color: #111827;
    word-break: break-all;
  }

  .name {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .usage {
    color: #374151;
    white-space: nowrap;
  }

  .override.ended {
    color: #4b5563;
    background-color: #f3f4f6;
  }

  .override {
    margin-left: 0.5rem;
    padding: 0.0625rem 0.375rem;
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #92400e;
    background-color: #fffbeb;
    border-radius: 9999px;
  }

  .orders-count {
    text-align: right;
    color: #6b7280;
    white-space: nowrap;
  }

  .details {
    padding: 0.75rem 0.75rem 0.875rem;
    background-color: #f9fafb;
    border-top: 1px solid #c7d2fe;
    font-size: 0.8125rem;
    color: #111827;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .stats > div {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
  }

  .linked {
    margin: 0.875rem 0 0;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .linked ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .linked li {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: baseline;
  }

  .link {
    color: #1c44b9;
    font-weight: 500;
  }

  .link:hover {
    text-decoration: underline;
  }

  .order-meta,
  .empty {
    color: #6b7280;
    font-size: 0.75rem;
  }

  .actions {
    margin: 0.875rem 0 0;
    display: flex;
    gap: 0.5rem;
  }

  @media (max-width: 800px) {
    .row {
      grid-template-columns: minmax(0, 1fr) 9rem 4rem;
    }
  }

  .row-button {
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #4b5563;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: color 150ms linear, background-color 150ms linear,
      border-color 150ms linear;
  }

  .row-button:hover {
    color: #111827;
    background-color: #e5e7eb;
    border-color: #9ca3af;
  }

  .row-button.danger:hover {
    color: #991b1b;
    background-color: #fef2f2;
    border-color: #fca5a5;
  }
`;
