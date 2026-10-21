import React from 'react';
import { ClientInvoice } from '../../../interfaces';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import { formatToMoney } from '../../../utils';
import { ModalStyles, ModalSpinner } from '../../modals/modalStyles';

type Props = {
  invoice: ClientInvoice;
  isLoading: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function VoidInvoiceModal(props: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  useOutsideClick(true, props.onCancel, ref, props.isLoading);
  useEscapeKeydownClose(true, props.onCancel, props.isLoading);

  return (
    <ModalStyles>
      <div ref={ref} className="modal narrow">
        <h3>Void invoice #{props.invoice.number}</h3>
        <p>
          The {props.invoice.lines.length} order
          {props.invoice.lines.length === 1 ? '' : 's'} on it, worth{' '}
          <strong>{formatToMoney(props.invoice.total, true)}</strong>, go back
          to uninvoiced so they can be billed again. The record is kept and
          marked void.
          {props.invoice.status === 'paid'
            ? ' This invoice is marked paid; void it only if that was a mistake.'
            : ''}
        </p>
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
            className="danger-button"
            onClick={props.onConfirm}
            disabled={props.isLoading}
          >
            {props.isLoading ? 'Voiding...' : 'Void invoice'}
          </button>
        </div>
        <ModalSpinner isLoading={props.isLoading} />
      </div>
    </ModalStyles>
  );
}
