import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { format, parseISO } from 'date-fns';
import { MemberBenefit } from '../../../core/memberBenefits/types';
import { ClientInvoice, Order, Store } from '../../../interfaces';
import { useQuery } from 'react-query';
import { useInvoicesQuery } from '../../../hooks/useInvoicesQuery';
import { fetchShippingData } from '../../../queries/fetchShippingData';
import {
  CreateInvoiceValues,
  useInvoiceMutations,
} from '../../../hooks/useInvoiceMutations';
import { formatToMoney } from '../../../utils';
import {
  DEFAULT_INVOICE_GRACE_DAYS,
  downloadCsv,
  invoiceDrift,
  invoiceTotals,
  invoiceUnsettledDrift,
  isOverdue,
  orderInvoiceableAt,
  orderMonth,
  orderNetBenefitAmount,
  splitOrdersForInvoicing,
} from '../../../utils/memberBenefit';
import ExcludeOrderModal from './ExcludeOrderModal';
import CreateInvoiceModal from './CreateInvoiceModal';
import MarkPaidModal from './MarkPaidModal';
import VoidInvoiceModal from './VoidInvoiceModal';

type Props = {
  benefit: MemberBenefit;
  store: Store;
};

function shortDate(iso: string) {
  return format(parseISO(iso), 'MMM d, yyyy');
}

function monthLabel(yyyymm: string) {
  return format(parseISO(`${yyyymm}-01`), 'MMM yyyy');
}

export function exportInvoiceCsv(invoice: ClientInvoice) {
  const money = (cents: number) => (cents / 100).toFixed(2);
  const rows = [
    ['invoice', 'order', 'date', 'customer', 'amount'],
    ...invoice.lines.map(l => [
      invoice.number,
      l.kind === 'adjustment'
        ? `${l.orderId} (adjusts invoice ${l.adjustsInvoiceNumber ?? ''})`
        : l.orderId,
      shortDate(l.orderDate),
      l.customer,
      money(l.amount),
    ]),
    [],
    ['', '', '', 'Total', money(invoice.total)],
  ];
  downloadCsv(`invoice-${invoice.number}-${invoice.storeName}.csv`, rows);
}

// Billing the client for a client-funded benefit: pick the shipped orders
// that are not yet on an invoice, freeze them onto one with the QuickBooks
// number, then mark it paid when the money arrives.
export default function InvoicingSection({ benefit, store }: Props) {
  const orders = store.orders ?? [];
  const invoicesQuery = useInvoicesQuery(store._id);
  const mutations = useInvoiceMutations({ storeId: store._id });

  const [month, setMonth] = React.useState('all');
  // Everything visible is selected unless the admin unticked it. Keeping
  // the exceptions rather than the selection means a new month or a fresh
  // order list starts fully selected without any effect ordering.
  const [deselected, setDeselected] = React.useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = React.useState(false);
  const [paying, setPaying] = React.useState<ClientInvoice | null>(null);
  const [voiding, setVoiding] = React.useState<ClientInvoice | null>(null);
  const [excluding, setExcluding] = React.useState<Order | null>(null);

  const settingsQuery = useQuery(['shipping'], fetchShippingData, {
    staleTime: 1000 * 60 * 10,
  });
  const graceDays =
    settingsQuery.data?.invoiceGraceDays ?? DEFAULT_INVOICE_GRACE_DAYS;

  const split = React.useMemo(
    () => splitOrdersForInvoicing(benefit, orders, graceDays),
    [benefit, orders, graceDays]
  );

  // Credits owed back from earlier invoices; they ride on the next one.
  const adjustments = React.useMemo(
    () =>
      (invoicesQuery.data ?? [])
        .filter(i => i.status !== 'void')
        .flatMap(inv =>
          invoiceUnsettledDrift(inv, orders)
            .filter(d => d.amount < 0)
            .map(d => ({ ...d, invoice: inv }))
        ),
    [invoicesQuery.data, orders]
  );
  const adjustmentTotal = adjustments.reduce((sum, a) => sum + a.amount, 0);

  const months = React.useMemo(
    () =>
      Array.from(new Set(split.eligible.map(orderMonth)))
        .sort()
        .reverse(),
    [split.eligible]
  );

  const visible = React.useMemo(
    () =>
      month === 'all'
        ? split.eligible
        : split.eligible.filter(o => orderMonth(o) === month),
    [split.eligible, month]
  );

  React.useEffect(() => {
    setDeselected(new Set());
  }, [month]);

  const chosen = visible.filter(o => !deselected.has(o.orderId));
  const totals = invoiceTotals([
    ...chosen.map(orderNetBenefitAmount),
    ...adjustments.map(a => a.amount),
  ]);

  const toggle = (orderId: string) => {
    setDeselected(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };
  const selectAll = (on: boolean) => {
    setDeselected(on ? new Set() : new Set(visible.map(o => o.orderId)));
  };

  const handleCreate = (values: Omit<CreateInvoiceValues, 'orderIds'>) => {
    mutations.createInvoice.mutate(
      { ...values, orderIds: chosen.map(o => o.orderId) },
      {
        onSuccess: () => {
          setShowCreate(false);
          setDeselected(new Set());
        },
      }
    );
  };

  const invoices = (invoicesQuery.data ?? []).filter(i => i.status !== 'void');
  const voided = (invoicesQuery.data ?? []).filter(i => i.status === 'void');

  return (
    <Styles>
      <div className="block">
        <div className="block-header">
          <h5>Uninvoiced orders</h5>
          <div className="block-tools">
            {months.length > 1 && (
              <select value={month} onChange={e => setMonth(e.target.value)}>
                <option value="all">All months</option>
                {months.map(m => (
                  <option key={m} value={m}>
                    {monthLabel(m)}
                  </option>
                ))}
              </select>
            )}
            {visible.length > 0 && (
              <>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => selectAll(true)}
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => selectAll(false)}
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="empty">
            {split.eligible.length === 0
              ? split.grace.length > 0
                ? 'Nothing invoiceable yet; shipped orders wait out the return window below.'
                : 'Nothing to invoice yet. Orders appear here once they are shipped and the return window has passed.'
              : 'No shipped orders in that month.'}
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="check" />
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th className="num">Credit used</th>
                <th className="actions" />
              </tr>
            </thead>
            <tbody>
              {visible.map(order => (
                <tr
                  key={order.orderId}
                  className={deselected.has(order.orderId) ? '' : 'selected'}
                >
                  <td className="check">
                    <input
                      type="checkbox"
                      checked={!deselected.has(order.orderId)}
                      onChange={() => toggle(order.orderId)}
                      aria-label={`Include order ${order.orderId}`}
                    />
                  </td>
                  <td>
                    <Link
                      href={`/stores/${store._id}?orderId=${order.orderId}`}
                    >
                      <a className="link">#{order.orderId}</a>
                    </Link>
                  </td>
                  <td>{shortDate(order.createdAt)}</td>
                  <td>
                    {order.customer.firstName} {order.customer.lastName}
                  </td>
                  <td className="num">
                    {formatToMoney(orderNetBenefitAmount(order), true)}
                  </td>
                  <td className="actions">
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => {
                        mutations.setExclusion.reset();
                        setExcluding(order);
                      }}
                    >
                      Exclude
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {split.grace.length > 0 && (
          <div className="sublist">
            <p className="awaiting">
              {split.grace.length} shipped order
              {split.grace.length === 1 ? '' : 's'} still inside the {graceDays}
              -day return window:
            </p>
            <ul className="plain-list">
              {split.grace.map(order => {
                const at = orderInvoiceableAt(order, graceDays);
                return (
                  <li key={order.orderId}>
                    <Link
                      href={`/stores/${store._id}?orderId=${order.orderId}`}
                    >
                      <a className="link">#{order.orderId}</a>
                    </Link>{' '}
                    {order.customer.firstName} {order.customer.lastName} ·{' '}
                    {formatToMoney(orderNetBenefitAmount(order), true)} ·
                    invoiceable {at ? shortDate(at.toISOString()) : 'soon'}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {split.excluded.length > 0 && (
          <div className="sublist">
            <p className="awaiting">
              {split.excluded.length} order
              {split.excluded.length === 1 ? '' : 's'} excluded from invoicing:
            </p>
            <ul className="plain-list">
              {split.excluded.map(order => (
                <li key={order.orderId}>
                  <Link href={`/stores/${store._id}?orderId=${order.orderId}`}>
                    <a className="link">#{order.orderId}</a>
                  </Link>{' '}
                  {order.customer.firstName} {order.customer.lastName} ·{' '}
                  {formatToMoney(orderNetBenefitAmount(order), true)} ·{' '}
                  <em>{order.clientInvoiceExcluded?.reason}</em>{' '}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() =>
                      mutations.setExclusion.mutate({
                        orderId: order.orderId,
                        exclude: false,
                      })
                    }
                  >
                    Include again
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {adjustments.length > 0 && (
          <div className="sublist">
            <p className="awaiting">
              Credits owed back from earlier invoices, added to the next invoice
              automatically:
            </p>
            <ul className="plain-list">
              {adjustments.map(a => (
                <li key={`${a.invoice._id}-${a.orderId}`}>
                  #{a.orderId} {a.customer} on invoice #{a.invoice.number} ·{' '}
                  <strong>-{formatToMoney(-a.amount, true)}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        {split.awaiting.length > 0 && (
          <p className="awaiting">
            {split.awaiting.length} more order
            {split.awaiting.length === 1 ? '' : 's'} used this benefit but{' '}
            {split.awaiting.length === 1 ? 'has' : 'have'} not shipped yet. They
            become invoiceable once shipped.
          </p>
        )}

        {(visible.length > 0 || adjustments.length > 0) && (
          <div className="totals-row">
            <div className="totals">
              <span>
                {chosen.length} of {visible.length} selected
              </span>
              {adjustmentTotal !== 0 && (
                <span>Credits -{formatToMoney(-adjustmentTotal, true)}</span>
              )}
              <strong>Total {formatToMoney(totals.total, true)}</strong>
            </div>
            <button
              type="button"
              className="primary"
              disabled={chosen.length === 0 || totals.total < 0}
              onClick={() => {
                mutations.createInvoice.reset();
                setShowCreate(true);
              }}
            >
              Create invoice
              {chosen.length > 0 ? ` for ${chosen.length}` : ''}
            </button>
          </div>
        )}
      </div>

      <div className="block">
        <div className="block-header">
          <h5>Invoices</h5>
        </div>
        {invoicesQuery.isLoading && <p className="empty">Loading...</p>}
        {invoicesQuery.isError && (
          <p className="empty">Could not load invoices.</p>
        )}
        {invoicesQuery.data && invoices.length === 0 && (
          <p className="empty">No invoices yet.</p>
        )}
        {invoices.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Issued</th>
                <th>Due</th>
                <th className="num">Orders</th>
                <th className="num">Total</th>
                <th>Status</th>
                <th className="actions" />
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => {
                const drift = invoiceDrift(invoice, orders);
                const overdue = isOverdue(invoice);
                return (
                  <tr key={invoice._id}>
                    <td>
                      <strong>#{invoice.number}</strong>
                      {invoice.note && (
                        <span className="sub" title={invoice.note}>
                          {invoice.note}
                        </span>
                      )}
                    </td>
                    <td>{shortDate(invoice.issuedAt)}</td>
                    <td>{invoice.dueAt ? shortDate(invoice.dueAt) : '—'}</td>
                    <td className="num">{invoice.lines.length}</td>
                    <td className="num">
                      {formatToMoney(invoice.total, true)}
                      {drift !== 0 && (
                        <span
                          className="sub warn"
                          title="An order on this invoice changed after it was issued, usually a refund."
                        >
                          changed since issued: {drift > 0 ? '+' : '-'}
                          {formatToMoney(Math.abs(drift), true)}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`status ${
                          invoice.status === 'paid'
                            ? 'paid'
                            : overdue
                            ? 'overdue'
                            : 'open'
                        }`}
                      >
                        {invoice.status === 'paid'
                          ? 'Paid'
                          : overdue
                          ? 'Overdue'
                          : 'Open'}
                      </span>
                      {invoice.status === 'paid' && invoice.paidAt && (
                        <span className="sub">
                          {shortDate(invoice.paidAt)}
                          {invoice.paymentReference
                            ? ` · ${invoice.paymentReference}`
                            : ''}
                        </span>
                      )}
                    </td>
                    <td className="actions">
                      {invoice.status === 'open' && (
                        <button
                          type="button"
                          className="row-button"
                          onClick={() => {
                            mutations.markPaid.reset();
                            setPaying(invoice);
                          }}
                        >
                          Mark paid
                        </button>
                      )}
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => exportInvoiceCsv(invoice)}
                      >
                        CSV
                      </button>
                      <button
                        type="button"
                        className="link-button danger"
                        onClick={() => {
                          mutations.voidInvoice.reset();
                          setVoiding(invoice);
                        }}
                      >
                        Void
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {voided.length > 0 && (
          <p className="awaiting">
            {voided.length} voided invoice{voided.length === 1 ? '' : 's'}:{' '}
            {voided.map(v => `#${v.number}`).join(', ')}
          </p>
        )}
      </div>

      {showCreate && (
        <CreateInvoiceModal
          orders={chosen}
          adjustments={adjustments.map(a => ({
            orderId: a.orderId,
            customer: a.customer,
            amount: a.amount,
            invoiceNumber: a.invoice.number,
          }))}
          totals={totals}
          isLoading={mutations.createInvoice.isLoading}
          errorMessage={
            mutations.createInvoice.isError
              ? (mutations.createInvoice.error as Error)?.message
              : undefined
          }
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {excluding && (
        <ExcludeOrderModal
          order={excluding}
          isLoading={mutations.setExclusion.isLoading}
          errorMessage={
            mutations.setExclusion.isError
              ? (mutations.setExclusion.error as Error)?.message
              : undefined
          }
          onConfirm={reason =>
            mutations.setExclusion.mutate(
              { orderId: excluding.orderId, exclude: true, reason },
              { onSuccess: () => setExcluding(null) }
            )
          }
          onCancel={() => setExcluding(null)}
        />
      )}

      {paying && (
        <MarkPaidModal
          invoice={paying}
          isLoading={mutations.markPaid.isLoading}
          errorMessage={
            mutations.markPaid.isError
              ? (mutations.markPaid.error as Error)?.message
              : undefined
          }
          onConfirm={values =>
            mutations.markPaid.mutate(
              { invoiceId: paying._id, ...values },
              { onSuccess: () => setPaying(null) }
            )
          }
          onCancel={() => setPaying(null)}
        />
      )}

      {voiding && (
        <VoidInvoiceModal
          invoice={voiding}
          isLoading={mutations.voidInvoice.isLoading}
          errorMessage={
            mutations.voidInvoice.isError
              ? (mutations.voidInvoice.error as Error)?.message
              : undefined
          }
          onConfirm={() =>
            mutations.voidInvoice.mutate(voiding._id, {
              onSuccess: () => setVoiding(null),
            })
          }
          onCancel={() => setVoiding(null)}
        />
      )}
    </Styles>
  );
}

export type { Order };

const Styles = styled.div`
  .block {
    margin: 0 0 1rem;
    padding: 0.875rem 1rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
  }

  .block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin: 0 0 0.625rem;
  }

  .block-header h5 {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
  }

  .block-tools {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .block-tools select {
    padding: 0.3125rem 0.5rem;
    font-size: 0.8125rem;
    color: #111827;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    font-family: inherit;
  }

  /* Tables are segmented stacks too: rows share borders, the header
     carries the top corners, the last row the bottom ones, and a selected
     row's border is drawn in blue on both edges. */
  .table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.8125rem;
  }

  .table th {
    padding: 0.4375rem 0.5rem;
    text-align: left;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    background-color: #f9fafb;
    border-top: 1px solid #d1d5db;
    border-bottom: 1px solid #d1d5db;
  }

  .table th:first-child {
    border-left: 1px solid #d1d5db;
    border-top-left-radius: 0.375rem;
  }

  .table th:last-child {
    border-right: 1px solid #d1d5db;
    border-top-right-radius: 0.375rem;
  }

  .table td {
    padding: 0.5rem;
    color: #111827;
    background-color: #fff;
    border-bottom: 1px solid #d1d5db;
    vertical-align: top;
    transition: background-color 120ms linear, border-color 120ms linear;
  }

  .table td:first-child {
    border-left: 1px solid #d1d5db;
  }

  .table td:last-child {
    border-right: 1px solid #d1d5db;
  }

  .table tbody tr:last-child td:first-child {
    border-bottom-left-radius: 0.375rem;
  }

  .table tbody tr:last-child td:last-child {
    border-bottom-right-radius: 0.375rem;
  }

  .table tbody tr:hover td {
    background-color: #f9fafb;
  }

  .table tr.selected td {
    background-color: #eef2ff;
    border-color: #1c44b9;
  }

  /* The line above a selected row belongs to the row before it, or to the
     header, so those turn blue too. */
  .table tr:has(+ tr.selected) td {
    border-bottom-color: #1c44b9;
  }

  .table thead:has(+ tbody > tr.selected:first-child) th {
    border-bottom-color: #1c44b9;
  }

  .table tr.selected:hover td {
    background-color: #e0e7ff;
  }

  .table .check input[type='checkbox'] {
    margin: 0;
    accent-color: #1c44b9;
  }

  .table .check {
    width: 2rem;
  }

  .table .num {
    text-align: right;
    white-space: nowrap;
  }

  .table .actions {
    text-align: right;
    white-space: nowrap;
  }

  .table .actions > * + * {
    margin-left: 0.75rem;
  }

  .sub {
    display: block;
    font-size: 0.6875rem;
    color: #6b7280;
    max-width: 16rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sub.warn {
    color: #92400e;
  }

  .link {
    color: #1c44b9;
    font-weight: 500;
  }

  .link:hover {
    text-decoration: underline;
  }

  .status {
    display: inline-block;
    padding: 0.1875rem 0.5rem;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.075em;
    border-radius: 0.25rem;
    border: 1px solid transparent;
  }

  .status.open {
    color: #1e40af;
    background-color: #dbeafe;
    border-color: #bfdbfe;
  }

  .status.overdue {
    color: #991b1b;
    background-color: #fee2e2;
    border-color: #fecaca;
  }

  .status.paid {
    color: #065f46;
    background-color: #d1fae5;
    border-color: #a7f3d0;
  }

  .sublist {
    margin: 0.75rem 0 0;
  }

  .plain-list {
    margin: 0.25rem 0 0;
    padding: 0 0 0 1rem;
    font-size: 0.8125rem;
    color: #374151;
    line-height: 1.6;
  }

  .plain-list em {
    color: #6b7280;
  }

  .empty,
  .awaiting {
    margin: 0.5rem 0 0;
    font-size: 0.8125rem;
    color: #6b7280;
  }

  .totals-row {
    margin: 0.875rem 0 0;
    padding: 0.75rem 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .totals {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1.25rem;
    font-size: 0.8125rem;
    color: #4b5563;
  }

  .totals strong {
    color: #111827;
  }

  .primary {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #fff;
    background-color: #111827;
    border: 1px solid #111827;
    border-radius: 0.25rem;
    cursor: pointer;
    white-space: nowrap;
  }

  .primary:hover:not(:disabled) {
    background-color: #000;
  }

  .primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .row-button {
    padding: 0.3125rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #4b5563;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .row-button:hover {
    color: #111827;
    background-color: #e5e7eb;
    border-color: #9ca3af;
  }

  .link-button {
    padding: 0;
    font-size: 0.75rem;
    font-weight: 500;
    color: #4b5563;
    background-color: transparent;
    border: none;
    cursor: pointer;
  }

  .link-button:hover {
    color: #111827;
    text-decoration: underline;
  }

  .link-button.danger:hover {
    color: #991b1b;
  }

  @media (max-width: 800px) {
    .stats {
      grid-template-columns: 1fr 1fr;
    }
  }
`;
