import React from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import { ModalStyles, ModalSpinner } from '../../modals/modalStyles';

type Props = {
  benefitName: string;
  nextActive: boolean;
  isLoading: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function BenefitActiveModal(props: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  useOutsideClick(true, props.onCancel, ref, props.isLoading);
  useEscapeKeydownClose(true, props.onCancel, props.isLoading);

  const isPausing = !props.nextActive;

  return (
    <ModalStyles>
      <div ref={ref} className="modal narrow">
        <h3>{isPausing ? 'Pause benefit' : 'Resume benefit'}</h3>
        <p>
          {isPausing ? (
            <>
              Pausing stops <strong>{props.benefitName}</strong> being applied
              at checkout right away. The store stays open; the card on the
              storefront says the benefit is paused until it is resumed.
            </>
          ) : (
            <>
              Resuming lets members use <strong>{props.benefitName}</strong> at
              checkout again.
            </>
          )}
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
            className="primary-button"
            onClick={props.onConfirm}
            disabled={props.isLoading}
          >
            {props.isLoading
              ? isPausing
                ? 'Pausing...'
                : 'Resuming...'
              : isPausing
              ? 'Pause benefit'
              : 'Resume benefit'}
          </button>
        </div>
        <ModalSpinner isLoading={props.isLoading} />
      </div>
    </ModalStyles>
  );
}
