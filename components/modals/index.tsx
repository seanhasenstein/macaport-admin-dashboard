import React from 'react';
import styled from 'styled-components';
import { XMarkIcon } from '@heroicons/react/20/solid';

import useOutsideClick from '../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';

type Props = {
  children: React.ReactNode;
  isOpen: boolean;
  closeModal: () => void;
  closeOnOutsideClick?: boolean;
};

export default function Modal({
  children,
  isOpen,
  closeModal,
  closeOnOutsideClick = true,
}: Props) {
  const modalRef = React.useRef(null);

  useOutsideClick(isOpen, closeModal, modalRef, closeOnOutsideClick);
  useEscapeKeydownClose(isOpen, closeModal);

  if (!isOpen) return null;

  return (
    <ModalComponent>
      <div className="modal-overlay">
        <div ref={modalRef} className="modal-container">
          <button type="button" className="close-button" onClick={closeModal}>
            <XMarkIcon className="icon" />
            <span className="sr-only">Close modal</span>
          </button>
          {children}
        </div>
      </div>
    </ModalComponent>
  );
}

const ModalComponent = styled.div`
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.75);
  }

  .modal-container {
    position: relative;
    padding: 1.875rem 2.25rem;
    max-width: 32rem;
    width: 100%;
    min-height: 3rem;
    background-color: #fff;
    border-radius: 0.375rem;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: #6b7280;

    .icon {
      height: 1.75rem;
      width: 1.75rem;
    }
  }
`;
