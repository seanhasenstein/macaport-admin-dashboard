import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { UseMutationResult } from 'react-query';
import { getQueryParameter } from '../../utils';
import useOutsideClick from '../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';
import { StoreProduct } from '../../interfaces';
import LoadingSpinner from '../LoadingSpinner';

type Props = {
  storeProduct: StoreProduct;
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  deleteProduct: UseMutationResult<any, unknown, string | undefined, unknown>;
};

export default function DeleteStoreProductModal(props: Props) {
  const router = useRouter();

  const modalRef = React.useRef<HTMLDivElement>(null);

  const closeModal = () => props.setShowModal(false);

  useOutsideClick(props.showModal, closeModal, modalRef);
  useEscapeKeydownClose(props.showModal, closeModal);

  const handleDeleteProductClick = () => {
    props.deleteProduct.mutate(getQueryParameter(router.query.pid));
  };

  return (
    <DeleteStoreProductModalStyles>
      <div ref={modalRef} className="modal">
        <div>
          <h3>Delete product</h3>
          <p>Are you sure you want to delete {props.storeProduct.name}?</p>
        </div>

        <div className="buttons">
          <button
            type="button"
            className="secondary-button"
            onClick={() => props.setShowModal(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={handleDeleteProductClick}
          >
            Delete the product
          </button>
        </div>

        <DeleteMutationSpinner isLoading={props.deleteProduct.isLoading} />
      </div>
    </DeleteStoreProductModalStyles>
  );
}

const DeleteStoreProductModalStyles = styled.div`
  padding: 10rem 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;

  .modal {
    position: relative;
    padding: 2.25rem 2.5rem 1.75rem;
    max-width: 26rem;
    width: 100%;
    text-align: left;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);

    h3 {
      margin: 0 0 0.75rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
    }

    p {
      margin: 0 0 1.5rem;
      font-size: 1rem;
      color: #4b5563;
      line-height: 1.5;
    }

    .buttons {
      margin: 1.25rem 0 0;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.625rem;
    }

    .primary-button,
    .secondary-button {
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }

    .primary-button {
      padding: 0.5rem 1.25rem;
      color: #b91c1c;
      background-color: #fee2e2;
      border: 1px solid #fdcfcf;
      box-shadow: inset 0 1px 1px #fff;
      border-radius: 0.25rem;

      &:hover {
        color: #a81919;
        border-color: #fcbcbc;
        box-shadow: inset 0 1px 1px #fff, rgba(0, 0, 0, 0) 0px 0px 0px 0px,
          rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible {
        text-decoration: underline;
      }
    }

    .secondary-button {
      color: #4b5563;
      background-color: transparent;
      border: none;

      &:hover {
        color: #1f2937;
        text-decoration: underline;
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible {
        text-decoration: underline;
      }
    }
  }
`;

const DeleteMutationSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
`;
