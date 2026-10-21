import React from 'react';
import {
  MemberBenefit,
  MemberBenefitMember,
} from '../../../core/memberBenefits/types';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import {
  amountErrorMessage,
  amountToInput,
  benefitUnitLabel,
  formatBenefitAmount,
  parseBenefitAmount,
} from '../../../utils/memberBenefit';
import { ModalStyles, ModalSpinner } from '../../modals/modalStyles';

type Props = {
  benefit: MemberBenefit;
  member: MemberBenefitMember;
  isLoading: boolean;
  errorMessage?: string;
  // null clears the override.
  onConfirm: (allowance: string | null) => void;
  onCancel: () => void;
};

export default function AllowanceModal(props: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { benefit, member } = props;
  const [input, setInput] = React.useState(
    member.allowance !== undefined
      ? amountToInput(benefit.type, member.allowance)
      : ''
  );
  useOutsideClick(true, props.onCancel, ref, props.isLoading);
  useEscapeKeydownClose(true, props.onCancel, props.isLoading);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const amount = parseBenefitAmount(benefit.type, input);
  const hasOverride = member.allowance !== undefined;

  return (
    <ModalStyles>
      <div ref={ref} className="modal narrow">
        <h3>Allowance for {member.email}</h3>
        <p>
          Overrides the benefit&apos;s{' '}
          {formatBenefitAmount(benefit.type, benefit.amount)} for this member
          only. What they have already used stays as it is.
        </p>
        <div className="field">
          <label htmlFor="allowance-amount">
            Allowance in {benefitUnitLabel(benefit.type)}
          </label>
          <input
            ref={inputRef}
            id="allowance-amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={props.isLoading}
          />
        </div>
        {input.trim() && amount === null && (
          <p className="hint error-hint">{amountErrorMessage(benefit.type)}</p>
        )}
        {amount !== null && (
          <div className="sentence">
            {member.email} gets {formatBenefitAmount(benefit.type, amount)}{' '}
            instead of {formatBenefitAmount(benefit.type, benefit.amount)}.
          </div>
        )}
        {props.errorMessage && (
          <div className="error-message">{props.errorMessage}</div>
        )}
        <div className="buttons">
          {hasOverride && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => props.onConfirm(null)}
              disabled={props.isLoading}
            >
              Clear override
            </button>
          )}
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
            onClick={() => amount !== null && props.onConfirm(input)}
            disabled={amount === null || props.isLoading}
          >
            {props.isLoading ? 'Saving...' : 'Save allowance'}
          </button>
        </div>
        <ModalSpinner isLoading={props.isLoading} />
      </div>
    </ModalStyles>
  );
}
