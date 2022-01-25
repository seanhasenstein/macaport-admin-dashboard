import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { InventoryProduct, InventorySku } from '../interfaces';
import useOutsideClick from '../hooks/useOutsideClick';
import useEscapeKeydownClose from '../hooks/useEscapeKeydownClose';
import LoadingSpinner from './LoadingSpinner';

type Props = {
  product: InventoryProduct;
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function InventoryModal({
  product,
  showModal,
  setShowModal,
}: Props) {
  const queryClient = useQueryClient();
  const modalRef = React.useRef<HTMLDivElement>(null);
  useOutsideClick(showModal, setShowModal, modalRef);
  useEscapeKeydownClose(showModal, setShowModal);
  const [updatedProduct, setUpdatedProduct] = React.useState(product);
  const [selectAll, setSelectAll] = React.useState(() =>
    product.skus.every(s => s.active)
  );

  React.useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'inherit';
    };
  }, [showModal]);

  React.useEffect(() => {
    if (!selectAll && updatedProduct.skus.every(s => s.active)) {
      setSelectAll(true);
    }
    if (selectAll && updatedProduct.skus.some(s => !s.active)) {
      setSelectAll(false);
    }
  }, [selectAll, updatedProduct.skus]);

  const updateInventoryProduct = useMutation(
    async (updatedProduct: InventoryProduct) => {
      const { _id, ...update } = updatedProduct;
      const response = await fetch(`/api/inventory-products/update`, {
        method: 'post',
        body: JSON.stringify({
          id: product._id,
          update,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update the inventory product.');
      }

      const data: { inventoryProduct: InventoryProduct } =
        await response.json();
      return data.inventoryProduct;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory-products']);
        setShowModal(false);
      },
    }
  );

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    const updatedSkus = updatedProduct.skus.map(s => ({
      ...s,
      active: !selectAll,
    }));
    setUpdatedProduct({ ...updatedProduct, skus: updatedSkus });
  };

  return (
    <InventoryModalStyles>
      <div ref={modalRef} className="modal">
        <div className="heading">
          <div>
            <h3>{product.name}</h3>
            <p>{product.inventoryProductId}</p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="close-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        <div className="body">
          <h4>Update Sku's Inventory</h4>
          <div className="skus">
            <div className="row header">
              <div className="active">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
              </div>
              <div className="size">Size</div>
              <div className="color">Color</div>
              <div className="inventory">Inventory</div>
            </div>
            {updatedProduct.skus.map(s => (
              <InventoryItem
                product={updatedProduct}
                setProduct={setUpdatedProduct}
                key={s.id}
                sku={s}
              />
            ))}
          </div>
        </div>
        <div className="actions">
          {updateInventoryProduct.isLoading ? (
            <LoadingSpinner isLoading={updateInventoryProduct.isLoading} />
          ) : (
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="cancel-button"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={() => updateInventoryProduct.mutate(updatedProduct)}
            disabled={updateInventoryProduct.isLoading}
            className="update-button"
          >
            Update Inventory Product
          </button>
        </div>
      </div>
    </InventoryModalStyles>
  );
}

const InventoryModalStyles = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
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
    margin: 4rem 0 0;
    padding: 2rem 2.5rem 1.5rem;
    max-width: 40rem;
    width: 100%;
    text-align: left;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  }

  .heading {
    display: flex;
    justify-content: space-between;

    h3 {
      margin: 0 0 0.1875rem;
    }

    p {
      margin: 0;
      color: #6b7280;
      font-family: 'Dank Mono', 'Menlo', monospace;
    }
  }

  .close-button {
    height: 1.75rem;
    width: 1.75rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;
    border-radius: 0.3125rem;
    border: none;
    color: #9ca3af;
    cursor: pointer;

    svg {
      flex-shrink: 0;
      height: 1.125rem;
      width: 1.125rem;
    }

    &:hover {
      color: #1f2937;
    }
  }

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .body {
    margin: 2.5rem 0 0;
  }

  h4 {
    margin: 0;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #111827;
  }

  .skus {
    margin: 1rem 0 0;
    max-height: 400px;
    overflow-y: scroll;
    border: 1px solid #e5e7eb;
    border-radius: 0.125rem;
  }

  .header {
    &.row {
      padding: 0.5rem 1rem;
      font-family: 'Menlo', monospace;
      font-size: 0.8125rem;
      font-weight: 600;

      &:nth-of-type(odd) {
        background-color: #f3f4f6;
      }
    }
  }

  .row {
    padding: 0.3125rem 1rem;
    display: grid;
    grid-template-columns: 1rem 9rem 1fr 4.25rem;
    align-items: center;
    width: 100%;
    font-family: 'Dank Mono', 'Menlo', monospace;
    font-size: 0.875rem;
    border-bottom: 1px solid #e5e7eb;

    &:nth-of-type(odd) {
      background-color: #f9fafb;
    }
  }

  .active {
    input {
      margin: 0;
    }
  }

  .size {
    text-align: center;
  }

  .actions {
    position: relative;
    margin: 2rem 0 0;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .cancel-button,
  .update-button {
    padding: 0.4375rem 1rem;
    display: flex;
    align-items: center;
    font-weight: 500;
    border-radius: 0.25rem;
    cursor: pointer;

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c5eb9 0px 0px 0px 4px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }

  .cancel-button {
    background-color: #fff;
    border: 1px solid #b2b7c1;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);

    &:hover {
      border-color: #9199a6;
    }
  }

  .update-button {
    background-color: #059669;
    border: 1px solid #065f46;
    color: #fff;
    box-shadow: inset 0 1px 1px #10b981;

    &:hover {
      background-color: #0b9067;
    }
  }

  .success {
    position: absolute;
    bottom: 0.375rem;
    left: 0;
    display: flex;
    align-items: center;
    gap: 0.375rem;

    svg {
      height: 1.125rem;
      width: 1.125rem;
      color: #059669;
    }

    span {
      font-size: 0.9375rem;
      font-weight: 500;
      color: #374151;
      line-height: 1.35;
    }
  }
`;

type InventoryItemProps = {
  sku: InventorySku;
  product: InventoryProduct;
  setProduct: React.Dispatch<React.SetStateAction<InventoryProduct>>;
};

function InventoryItem({ sku, product, setProduct }: InventoryItemProps) {
  const handleActiveClick = () => {
    const updatedSkus = product.skus.map(s => {
      if (s.id === sku.id) {
        return { ...s, active: !sku.active };
      }
      return s;
    });
    setProduct({ ...product, skus: updatedSkus });
  };

  const handleInventoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numberCoercion = Number(e.target.value);
    if (isNaN(numberCoercion) === true) {
      return;
    }

    const updatedSkus = product.skus.map(s => {
      if (s.id === sku.id) {
        return { ...s, inventory: numberCoercion };
      }
      return s;
    });

    setProduct({ ...product, skus: updatedSkus });
  };

  return (
    <InventoryItemStyles className="row">
      <div className="active">
        <input
          type="checkbox"
          checked={sku.active}
          onChange={handleActiveClick}
        />
      </div>
      <div className="size">{sku.size.label}</div>
      <div className="color">{sku.color.label}</div>
      <div className="inventory">
        <input
          type="text"
          value={sku.inventory}
          onChange={e => handleInventoryChange(e)}
        />
      </div>
    </InventoryItemStyles>
  );
}

const InventoryItemStyles = styled.div`
  display: flex;

  .inventory input {
    margin: 0;
    padding: 0.3125rem 0.5rem;
    width: 100%;
    font-family: 'Dank Mono', 'Menlo', monospace;
    text-align: center;
    border-radius: 0.25rem;
  }
`;
