import React from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { Order } from '../../../interfaces';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import { CreateInvoiceValues } from '../../../hooks/useInvoiceMutations';
import { formatToMoney } from '../../../utils';
import {
  orderNetBenefitAmount,
  todayInputDate,
} from '../../../utils/memberBenefit';
import { ModalStyles, ModalSpinner } from '../../modals/modalStyles';

type Adjustment = {
  orderId: string;
  customer: string;
  amount: number;
  invoiceNumber: string;
};

type Props = {
  orders: Order[];
  adjustments: Adjustment[];
  totals: { subtotal: number; total: number };
  isLoading: boolean;
  errorMessage?: string;
  onSubmit: (values: Omit<CreateInvoiceValues, 'orderIds'>) => void;
  onCancel: () => void;
};

// Records the invoice that was, or is about to be, sent from QuickBooks.
// The amounts are frozen here; the number is theirs.
export default function CreateInvoiceModal(props: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const numberRef = React.useRef<HTMLInputElement>(null);
  const [number, setNumber] = React.useState('');
  const [issuedAt, setIssuedAt] = React.useState(todayInputDate());
  const [dueAt, setDueAt] = React.useState('');
  const [note, setNote] = React.useState('');
  const [alreadyPaid, setAlreadyPaid] = React.useState(false);
  const [paidAt, setPaidAt] = React.useState(todayInputDate());
  const [reference, setReference] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  useOutsideClick(true, props.onCancel, ref, true);
  useEscapeKeydownClose(true, props.onCancel, props.isLoading);

  React.useEffect(() => {
    numberRef.current?.focus();
  }, []);

  const numberError = !number.trim()
    ? 'The QuickBooks invoice number is required.'
    : null;
  const issuedError = !issuedAt ? 'An issue date is required.' : null;
  const dueError =
    dueAt && dueAt < issuedAt ? 'Due date is before the issue date.' : null;
  const paidError =
    alreadyPaid && !paidAt ? 'A payment date is required.' : null;
  const valid = !numberError && !issuedError && !dueError && !paidError;

  const handleSubmit = () => {
    setSubmitted(true);
    if (!valid) return;
    props.onSubmit({
      number: number.trim(),
      issuedAt,
      dueAt,
      note: note.trim(),
      paid: alreadyPaid ? { paidAt, reference: reference.trim() } : null,
    });
  };

  return (
    <ModalStyles>
      <div ref={ref} className="modal">
        <button
          type="button"
          className="close-button"
          onClick={props.onCancel}
          disabled={props.isLoading}
          aria-label="Close"
        >
          <XMarkIcon aria-hidden="true" />
        </button>
        <h3>Create invoice</h3>
        <fieldset className="form-fields" disabled={props.isLoading}>
          <section className="form-section">
            <div className="section-head">
              <h4>Invoice</h4>
              <p>The number QuickBooks gave it, and when it went out.</p>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="invoice-number">
                  QuickBooks invoice number
                </label>
                <input
                  ref={numberRef}
                  id="invoice-number"
                  type="text"
                  value={number}
                  onChange={e => setNumber(e.target.value)}
                  maxLength={40}
                  autoComplete="off"
                />
                {submitted && numberError && (
                  <p className="hint error-hint">{numberError}</p>
                )}
              </div>
              <div className="field">
                <label htmlFor="invoice-issued">Issue date</label>
                <input
                  id="invoice-issued"
                  type="date"
                  value={issuedAt}
                  onChange={e => setIssuedAt(e.target.value)}
                />
                {submitted && issuedError && (
                  <p className="hint error-hint">{issuedError}</p>
                )}
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="invoice-due">Due date, optional</label>
                <input
                  id="invoice-due"
                  type="date"
                  value={dueAt}
                  min={issuedAt}
                  onChange={e => setDueAt(e.target.value)}
                />
                {dueError && <p className="hint error-hint">{dueError}</p>}
              </div>
              <div className="field">
                <label htmlFor="invoice-note">Note, optional</label>
                <input
                  id="invoice-note"
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  maxLength={500}
                  placeholder="Sent to Jane in accounting"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="section-head">
              <h4>Payment</h4>
              <p>Leave this alone unless the client has already paid.</p>
            </div>
            <div className="field">
              <div className="checkbox-row">
                <label htmlFor="invoice-paid">
                  <input
                    id="invoice-paid"
                    type="checkbox"
                    checked={alreadyPaid}
                    onChange={e => setAlreadyPaid(e.target.checked)}
                  />
                  Already paid
                </label>
              </div>
            </div>
            {alreadyPaid && (
              <div className="field-row follow-up">
                <div className="field">
                  <label htmlFor="invoice-paid-at">Payment date</label>
                  <input
                    id="invoice-paid-at"
                    type="date"
                    value={paidAt}
                    onChange={e => setPaidAt(e.target.value)}
                  />
                  {submitted && paidError && (
                    <p className="hint error-hint">{paidError}</p>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="invoice-reference">
                    Payment reference, optional
                  </label>
                  <input
                    id="invoice-reference"
                    type="text"
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                    maxLength={120}
                    placeholder="Check 1042, ACH, card"
                  />
                </div>
              </div>
            )}
          </section>

          <section className="form-section">
            <div className="section-head">
              <h4>Orders on this invoice</h4>
              <p>
                {props.orders.length} order
                {props.orders.length === 1 ? '' : 's'}
                {props.adjustments.length > 0
                  ? ` and ${props.adjustments.length} credit${
                      props.adjustments.length === 1 ? '' : 's'
                    } from earlier invoices`
                  : ''}{' '}
                for <strong>{formatToMoney(props.totals.total, true)}</strong>.
                No tax is added: the client pays exactly what the credit paid.
                The amounts are frozen as they stand now.
              </p>
            </div>
            <table className="item-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th className="num">Credit used</th>
                </tr>
              </thead>
              <tbody>
                {props.orders.map(order => (
                  <tr key={order.orderId}>
                    <td>#{order.orderId}</td>
                    <td>
                      {order.customer.firstName} {order.customer.lastName}
                    </td>
                    <td className="num">
                      {formatToMoney(orderNetBenefitAmount(order), true)}
                    </td>
                  </tr>
                ))}
                {props.adjustments.map(a => (
                  <tr key={`adj-${a.invoiceNumber}-${a.orderId}`}>
                    <td>
                      #{a.orderId}
                      <span className="sub">
                        Credit back from invoice #{a.invoiceNumber}
                      </span>
                    </td>
                    <td>{a.customer}</td>
                    <td className="num">-{formatToMoney(-a.amount, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </fieldset>

        {props.errorMessage && (
          <div className="error-message">{props.errorMessage}</div>
        )}

        <div className="form-footer">
          <p className="footer-note">
            Orders on an invoice stay off the next one. Void it to release them.
          </p>
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
              onClick={handleSubmit}
              disabled={props.isLoading}
            >
              {props.isLoading
                ? 'Saving...'
                : alreadyPaid
                ? 'Create as paid'
                : 'Create invoice'}
            </button>
          </div>
        </div>
        <ModalSpinner isLoading={props.isLoading} />
      </div>
    </ModalStyles>
  );
}
