import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { format, parseISO } from 'date-fns';
import Layout from '../../components/Layout';
import TopPageNav from '../../components/TopPageNav';
import TableLoadingSpinner from '../../components/TableLoadingSpinner';
import { useAllInvoicesQuery } from '../../hooks/useInvoicesQuery';
import { formatToMoney } from '../../utils';
import { isOverdue } from '../../utils/memberBenefit';
import { ClientInvoiceStatus } from '../../interfaces';

function shortDate(iso: string) {
  return format(parseISO(iso), 'MMM d, yyyy');
}

// Every client invoice across every store: what is owed to Macaport right
// now, oldest first, and what has been paid.
export default function Receivables() {
  const [status, setStatus] = React.useState<ClientInvoiceStatus>('open');
  const query = useAllInvoicesQuery(status);
  const invoices = query.data ?? [];
  const total = invoices.reduce((sum, i) => sum + i.total, 0);

  return (
    <Layout title="Receivables | Macaport Dashboard" requiresAuth={true}>
      <Styles>
        <div className="container">
          <TopPageNav />
          <div className="card">
            <div className="header">
              <div>
                <h2>Client invoices</h2>
                <p className="subtitle">
                  What clients owe Macaport for member benefits. Invoices are
                  created from each store&apos;s member benefit panel.
                </p>
              </div>
              <div className="tabs">
                <button
                  type="button"
                  className={status === 'open' ? 'active' : ''}
                  onClick={() => setStatus('open')}
                >
                  Open
                </button>
                <button
                  type="button"
                  className={status === 'paid' ? 'active' : ''}
                  onClick={() => setStatus('paid')}
                >
                  Paid
                </button>
              </div>
            </div>

            {query.isLoading && <TableLoadingSpinner />}
            {query.isError && (
              <p className="empty">Could not load the invoices.</p>
            )}
            {query.data && invoices.length === 0 && (
              <p className="empty">
                {status === 'open'
                  ? 'Nothing outstanding.'
                  : 'No paid invoices yet.'}
              </p>
            )}

            {invoices.length > 0 && (
              <>
                <div className="summary">
                  {invoices.length} invoice{invoices.length === 1 ? '' : 's'} ·{' '}
                  {formatToMoney(total, true)}
                  {status === 'open' &&
                    invoices.some(i => isOverdue(i)) &&
                    ` · ${invoices.filter(i => isOverdue(i)).length} overdue`}
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Store</th>
                      <th>Benefit</th>
                      <th>Invoice</th>
                      <th>Issued</th>
                      <th>{status === 'open' ? 'Due' : 'Paid'}</th>
                      <th className="num">Orders</th>
                      <th className="num">Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(invoice => {
                      const overdue = isOverdue(invoice);
                      return (
                        <tr key={invoice._id}>
                          <td>
                            <Link href={`/stores/${invoice.storeId}`}>
                              <a className="link">{invoice.storeName}</a>
                            </Link>
                          </td>
                          <td>{invoice.benefitName}</td>
                          <td>
                            <strong>#{invoice.number}</strong>
                            {invoice.note && (
                              <span className="sub" title={invoice.note}>
                                {invoice.note}
                              </span>
                            )}
                          </td>
                          <td>{shortDate(invoice.issuedAt)}</td>
                          <td>
                            {status === 'open'
                              ? invoice.dueAt
                                ? shortDate(invoice.dueAt)
                                : '—'
                              : invoice.paidAt
                              ? shortDate(invoice.paidAt)
                              : '—'}
                            {status === 'paid' && invoice.paymentReference && (
                              <span className="sub">
                                {invoice.paymentReference}
                              </span>
                            )}
                          </td>
                          <td className="num">{invoice.lines.length}</td>
                          <td className="num">
                            {formatToMoney(invoice.total, true)}
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
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </Styles>
    </Layout>
  );
}

const Styles = styled.div`
  position: relative;

  .container {
    position: relative;
    margin: 0 auto;
    padding: 3rem 1.5rem 0;
    max-width: 74rem;
    width: 100%;
  }

  .card {
    position: relative;
    margin: 1.875rem 0 0;
    padding: 1.625rem 1.75rem 1.5rem;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.4375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .header {
    margin: 0 0 1rem;
    padding: 0 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .subtitle {
    margin: 0.375rem 0 0;
    font-size: 0.875rem;
    color: #6b7280;
    max-width: 40rem;
  }

  .tabs {
    display: inline-flex;
    padding: 0.1875rem;
    background-color: #f3f4f6;
    border-radius: 0.375rem;
    flex-shrink: 0;
  }

  .tabs button {
    padding: 0.375rem 0.875rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #4b5563;
    background-color: transparent;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .tabs button.active {
    color: #111827;
    background-color: #fff;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.08);
  }

  .summary {
    margin: 0 0 0.75rem;
    font-size: 0.8125rem;
    color: #4b5563;
  }

  .empty {
    margin: 1rem 0 0;
    font-size: 0.875rem;
    color: #6b7280;
  }

  /* One segmented stack: the header carries the top corners, rows share
     borders, the last row carries the bottom corners. */
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.8125rem;
  }

  th {
    padding: 0.5rem;
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

  th:first-child {
    border-left: 1px solid #d1d5db;
    border-top-left-radius: 0.375rem;
  }

  th:last-child {
    border-right: 1px solid #d1d5db;
    border-top-right-radius: 0.375rem;
  }

  td {
    padding: 0.625rem 0.5rem;
    color: #111827;
    background-color: #fff;
    border-bottom: 1px solid #d1d5db;
    vertical-align: top;
    transition: background-color 120ms linear;
  }

  td:first-child {
    border-left: 1px solid #d1d5db;
  }

  td:last-child {
    border-right: 1px solid #d1d5db;
  }

  tbody tr:last-child td:first-child {
    border-bottom-left-radius: 0.375rem;
  }

  tbody tr:last-child td:last-child {
    border-bottom-right-radius: 0.375rem;
  }

  tbody tr:hover td {
    background-color: #f9fafb;
  }

  .num {
    text-align: right;
    white-space: nowrap;
  }

  .sub {
    display: block;
    font-size: 0.6875rem;
    color: #6b7280;
    max-width: 14rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
`;
