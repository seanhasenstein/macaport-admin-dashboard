import React from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import { ModalStyles, ModalSpinner } from '../../modals/modalStyles';

type Props = {
  email: string;
  usedLabel: string;
  remainingLabel: string;
  benefitName: string;
  isLoading: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// For a member who has used their benefit: removing them would lose that
// history and let them start again if re-added, so their allowance is set
// to what they have used instead.
export default function EndBenefitModal(props: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  useOutsideClick(true, props.onCancel, ref, props.isLoading);
  useEscapeKeydownClose(true, props.onCancel, props.isLoading);

  return (
    <ModalStyles>
      <div ref={ref} className="modal narrow">
        <h3>End {props.email}&apos;s benefit</h3>
        <p>
          They have used <strong>{props.usedLabel}</strong> and have{' '}
          <strong>{props.remainingLabel}</strong> left. Ending it takes away
          what is left. Their orders and what they used stay on record, and the
          store will tell them their {props.benefitName} is used up.
        </p>
        <p>
          A member who has used their benefit is not removed, so adding the same
          email back later cannot give them a fresh allowance. Use Set allowance
          to give them more again.
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
            {props.isLoading ? 'Ending...' : 'End benefit'}
          </button>
        </div>
        <ModalSpinner isLoading={props.isLoading} />
      </div>
    </ModalStyles>
  );
}
