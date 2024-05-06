import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import { XMarkIcon } from '@heroicons/react/20/solid';

import useOutsideClick from '../hooks/useOutsideClick';
import useEscapeKeydownClose from '../hooks/useEscapeKeydownClose';

type Props = {
  children: React.ReactNode;
  closeModal: () => void;
  isOpen: boolean;
  customClass?: string;
  customCloseClass?: string;
};

export default function Modal({
  children,
  closeModal,
  isOpen,
  customClass,
  customCloseClass,
}: Props) {
  const modalRef = React.useRef<HTMLDivElement>(null);

  useOutsideClick(isOpen, closeModal, modalRef);
  useEscapeKeydownClose(isOpen, closeModal);

  return (
    <ModalContainer>
      <div className="overlay">
        <div
          ref={modalRef}
          className={classNames('modal-container', customClass)}
        >
          <button
            onClick={e => {
              e.stopPropagation();
              closeModal();
            }}
            className={classNames('close-modal-button', customCloseClass)}
          >
            <XMarkIcon className="icon" />
            <span className="sr-only">Close modal</span>
          </button>
          {children}
        </div>
      </div>
    </ModalContainer>
  );
}

const ModalContainer = styled.div`
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.65);
    z-index: 9999;
  }

  .modal-container {
    position: relative;
    padding: 1.5rem 2rem;
    background-color: #fff;
    border-radius: 0.5rem;
  }
  .close-modal-button {
    position: absolute;
    padding: 0;
    top: 1.3125rem;
    right: 1.25rem;
    color: #52525b;
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: color 100ms linear;
    &:hover {
      color: #09090b;
    }
    .icon {
      height: 1.75rem;
      width: 1.75rem;
    }
  }
`;
