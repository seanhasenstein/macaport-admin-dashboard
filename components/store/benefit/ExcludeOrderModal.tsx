import React from 'react';
import { Order } from '../../../interfaces';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import { formatToMoney } from '../../../utils';
import { orderNetBenefitAmount } from '../../../utils/memberBenefit';
import { ModalStyles, ModalSpinner } from '../../modals/modalStyles';

type Props = {
  order: Order;
  isLoading: boolean;
  errorMessage?: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

// Keeps an order off every invoice, with a reason that shows next to it.
// Reversible from the same list.
export default function ExcludeOrderModal(props: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [reason, setReason] = React.useState('');
  useOutsideClick(true, props.onCancel, ref, props.isLoading);
  useEscapeKeydownClose(true, props.onCancel, props.isLoading);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <ModalStyles>
      <div ref={ref} className="modal narrow">
        <h3>Exclude order #{props.order.orderId} from invoicing</h3>
        <p>
          The client will not be billed the{' '}
          <strong>
            {formatToMoney(orderNetBenefitAmount(props.order), true)}
          </strong>{' '}
          this order used. The member keeps what they used. You can include it
          again later.
        </p>
        <fieldset className="form-fields" disabled={props.isLoading}>
          <div className="field">
            <label htmlFor="exclude-reason">Why</label>
            <input
              ref={inputRef}
              id="exclude-reason"
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              maxLength={300}
              placeholder="Goodwill replacement, disputed with client..."
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
            onClick={() => props.onConfirm(reason.trim())}
            disabled={!reason.trim() || props.isLoading}
          >
            {props.isLoading ? 'Saving...' : 'Exclude'}
          </button>
        </div>
        <ModalSpinner isLoading={props.isLoading} />
      </div>
    </ModalStyles>
  );
}
