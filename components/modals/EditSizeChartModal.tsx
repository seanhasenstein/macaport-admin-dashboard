import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import Modal from '../Modal';
import SizeChartForm from '../inventoryProduct/SizeChartForm';

import { InventoryProduct } from '../../interfaces';

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  inventoryProduct: InventoryProduct | undefined;
};

export default function EditSizeChartModal({
  isOpen,
  closeModal,
  inventoryProduct,
}: Props) {
  const router = useRouter();

  const onSuccess = () => {
    closeModal();
    router.push('/inventory-products?page=1&sizeChart=true', undefined, {
      shallow: true,
    });
  };

  if (!isOpen || !inventoryProduct) return null;

  return (
    <EditSizeChartModalStyles>
      <Modal
        {...{ isOpen, closeModal }}
        customOverlayClass="custom-modal-overlay"
        customModalClass="custom-modal-container"
      >
        <p className="product-name">
          Size chart for {inventoryProduct.name} (
          {inventoryProduct.merchandiseCode})
        </p>
        <SizeChartForm {...{ inventoryProduct }} onSuccess={onSuccess} />
      </Modal>
    </EditSizeChartModalStyles>
  );
}

const EditSizeChartModalStyles = styled.div`
  .custom-modal-container {
    max-width: 30rem;
    width: 100%;
    max-height: 95%;
    overflow-y: auto;
    .product-name {
      margin: 0.3125rem 0 1.25rem;
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
    }
  }
`;
