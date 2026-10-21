import React from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import { ModalStyles, ModalSpinner } from '../../modals/modalStyles';

type Props = {
  benefitName: string;
  memberCount: number;
  linkedOrderCount: number;
  isLoading: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteBenefitModal(props: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  useOutsideClick(true, props.onCancel, ref, props.isLoading);
  useEscapeKeydownClose(true, props.onCancel, props.isLoading);

  const blocked = props.linkedOrderCount > 0;

  return (
    <ModalStyles>
      <div ref={ref} className="modal narrow">
        <h3>Delete benefit</h3>
        {blocked ? (
          <p>
            <strong>{props.benefitName}</strong> was used on{' '}
            {props.linkedOrderCount} order
            {props.linkedOrderCount === 1 ? '' : 's'}, so it cannot be deleted.
            Pause it instead to stop it being applied.
          </p>
        ) : (
          <p>
            This removes <strong>{props.benefitName}</strong> and its{' '}
            {props.memberCount} member{props.memberCount === 1 ? '' : 's'} from
            this store. It cannot be undone.
          </p>
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
            {blocked ? 'Close' : 'Cancel'}
          </button>
          {!blocked && (
            <button
              type="button"
              className="danger-button"
              onClick={props.onConfirm}
              disabled={props.isLoading}
            >
              {props.isLoading ? 'Deleting...' : 'Delete benefit'}
            </button>
          )}
        </div>
        <ModalSpinner isLoading={props.isLoading} />
      </div>
    </ModalStyles>
  );
}
