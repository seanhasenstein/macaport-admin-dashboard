import React from 'react';
import {
  MemberBenefit,
  MemberBenefitMember,
} from '../../../core/memberBenefits/types';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import {
  amountErrorMessage,
  benefitUnitLabel,
  formatBenefitAmount,
  memberUsage,
  parseBenefitAmount,
} from '../../../utils/memberBenefit';
import { ModalStyles, ModalSpinner } from '../../modals/modalStyles';

type Props = {
  benefit: MemberBenefit;
  member: MemberBenefitMember;
  isLoading: boolean;
  errorMessage?: string;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
};

// Lowers `used` by hand, for anything the refund calculator cannot express.
export default function RestoreUsedModal(props: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [input, setInput] = React.useState('');
  useOutsideClick(true, props.onCancel, ref, props.isLoading);
  useEscapeKeydownClose(true, props.onCancel, props.isLoading);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { benefit, member } = props;
  const usage = memberUsage(benefit, member);
  const amount = parseBenefitAmount(benefit.type, input);
  const tooMuch = amount !== null && amount > usage.used;
  const valid = amount !== null && !tooMuch;

  return (
    <ModalStyles>
      <div ref={ref} className="modal narrow">
        <h3>Restore to {member.email}</h3>
        <p>
          Lowers what this member has used. Use the refund calculator on the
          order for a return; this is for anything it cannot express.
        </p>
        <div className="summary-box">
          <div className="row">
            <span className="muted">Used</span>
            <span>{formatBenefitAmount(benefit.type, usage.used)}</span>
          </div>
          <div className="row">
            <span className="muted">Remaining</span>
            <span>{formatBenefitAmount(benefit.type, usage.remaining)}</span>
          </div>
        </div>
        <div className="field" style={{ marginTop: '1rem' }}>
          <label htmlFor="restore-amount">
            Amount to restore, in whole {benefitUnitLabel(benefit.type)}
          </label>
          <input
            ref={inputRef}
            id="restore-amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={props.isLoading || usage.used === 0}
          />
          {usage.used === 0 && (
            <p className="hint">This member has nothing used to restore.</p>
          )}
          {input.trim() && amount === null && (
            <p className="hint error-hint">
              {amountErrorMessage(benefit.type)}
            </p>
          )}
          {tooMuch && (
            <p className="hint error-hint">
              That is more than the member has used.
            </p>
          )}
        </div>
        {valid && amount !== null && (
          <div className="sentence">
            Restore {formatBenefitAmount(benefit.type, amount)} to{' '}
            {member.email}. Used becomes{' '}
            {formatBenefitAmount(benefit.type, usage.used - amount)}.
          </div>
        )}
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
            onClick={() => amount !== null && props.onConfirm(amount)}
            disabled={!valid || props.isLoading}
          >
            {props.isLoading ? 'Restoring...' : 'Restore'}
          </button>
        </div>
        <ModalSpinner isLoading={props.isLoading} />
      </div>
    </ModalStyles>
  );
}
