import React from 'react';
import { ClientInvoice } from '../../../interfaces';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import { formatToMoney } from '../../../utils';
import { todayInputDate } from '../../../utils/memberBenefit';
import { ModalStyles, ModalSpinner } from '../../modals/modalStyles';

type Props = {
  invoice: ClientInvoice;
  isLoading: boolean;
  errorMessage?: string;
  onConfirm: (values: { paidAt: string; reference: string }) => void;
  onCancel: () => void;
};

export default function MarkPaidModal(props: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const refInput = React.useRef<HTMLInputElement>(null);
  const [paidAt, setPaidAt] = React.useState(todayInputDate());
  const [reference, setReference] = React.useState('');
  useOutsideClick(true, props.onCancel, ref, props.isLoading);
  useEscapeKeydownClose(true, props.onCancel, props.isLoading);

  React.useEffect(() => {
    refInput.current?.focus();
  }, []);

  return (
    <ModalStyles>
      <div ref={ref} className="modal narrow">
        <h3>Mark invoice #{props.invoice.number} paid</h3>
        <p>
          <strong>{formatToMoney(props.invoice.total, true)}</strong> from{' '}
          {props.invoice.storeName}.
        </p>
        <fieldset className="form-fields" disabled={props.isLoading}>
          <div className="field">
            <label htmlFor="paid-at">Payment date</label>
            <input
              id="paid-at"
              type="date"
              value={paidAt}
              onChange={e => setPaidAt(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="paid-reference">Payment reference, optional</label>
            <input
              ref={refInput}
              id="paid-reference"
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              maxLength={120}
              placeholder="Check 1042, ACH, card"
            />
          </div>
        </fieldset>
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
            onClick={() =>
              props.onConfirm({ paidAt, reference: reference.trim() })
            }
            disabled={!paidAt || props.isLoading}
          >
            {props.isLoading ? 'Saving...' : 'Mark paid'}
          </button>
        </div>
        <ModalSpinner isLoading={props.isLoading} />
      </div>
    </ModalStyles>
  );
}
