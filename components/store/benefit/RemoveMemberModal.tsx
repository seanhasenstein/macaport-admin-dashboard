import React from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import { ModalStyles, ModalSpinner } from '../../modals/modalStyles';

type Props = {
  email: string;
  usedLabel: string | null;
  isLoading: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function RemoveMemberModal(props: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  useOutsideClick(true, props.onCancel, ref, props.isLoading);
  useEscapeKeydownClose(true, props.onCancel, props.isLoading);

  return (
    <ModalStyles>
      <div ref={ref} className="modal narrow">
        <h3>Remove member</h3>
        <p>
          <strong>{props.email}</strong> will no longer get this benefit.
          {props.usedLabel ? (
            <>
              {' '}
              They have used {props.usedLabel}; that record and the links to
              their orders go with them.
            </>
          ) : null}
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
            {props.isLoading ? 'Removing...' : 'Remove member'}
          </button>
        </div>
        <ModalSpinner isLoading={props.isLoading} />
      </div>
    </ModalStyles>
  );
}
