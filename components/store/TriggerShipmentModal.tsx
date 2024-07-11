import React from 'react';
import styled from 'styled-components';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/20/solid';

import Modal from '../Modal';

import { useStoreMutations } from '../../hooks/useStoreMutations';

import { Store, StoresTableStore } from '../../interfaces';

type Props = {
  closeModal: () => void;
  isOpen: boolean;
  store: Store | StoresTableStore;
};

export default function TriggerShipmentModal({
  closeModal,
  isOpen,
  store,
}: Props) {
  const { triggerStoreShipment } = useStoreMutations({
    store: store ?? undefined,
  });

  const {
    currentShippedOrders,
    fulfilledToShippedItems,
    newPartiallyShippedOrders,
    newShippedOrders,
    canceledOrders,
  } = store.orders.reduce(
    (acc, currOrder) => {
      const orderStatusIsNotPartiallyShippedOrShippedOrCanceled = ![
        'PartiallyShipped',
        'Shipped',
        'Canceled',
      ].includes(currOrder.orderStatus);
      const orderStatusIsFulfilledOrPartiallyShipped = [
        'Fulfilled',
        'PartiallyShipped',
      ].includes(currOrder.orderStatus);
      const allItemsAreFulfilledShippedOrCanceled = currOrder.items.every(
        item =>
          ['Fulfilled', 'Shipped', 'Canceled'].includes(item.status.current)
      );
      const orderHasAtLeastOneFulfilledItem = currOrder.items.some(
        item => item.status.current === 'Fulfilled'
      );
      const orderHasAtLeastOneNonFulfilledItem = currOrder.items.some(
        item => item.status.current !== 'Fulfilled'
      );

      let currentShippedOrders = 0;
      let fulfilledItems = 0;
      let partiallyShippedOrders = 0;
      let shippedOrders = 0;
      let canceledOrders = 0;

      currOrder.items.forEach(item => {
        if (item.status.current === 'Fulfilled') {
          fulfilledItems++;
        }
      });

      if (
        orderStatusIsFulfilledOrPartiallyShipped &&
        allItemsAreFulfilledShippedOrCanceled
      ) {
        shippedOrders++;
      }

      if (
        orderStatusIsNotPartiallyShippedOrShippedOrCanceled &&
        orderHasAtLeastOneFulfilledItem &&
        orderHasAtLeastOneNonFulfilledItem
      ) {
        partiallyShippedOrders++;
      }

      if (currOrder.orderStatus === 'Shipped') {
        currentShippedOrders++;
      }

      if (currOrder.orderStatus === 'Canceled') {
        canceledOrders++;
      }

      return {
        acc,
        currentShippedOrders: acc.currentShippedOrders + currentShippedOrders,
        fulfilledToShippedItems: acc.fulfilledToShippedItems + fulfilledItems,
        newPartiallyShippedOrders:
          acc.newPartiallyShippedOrders + partiallyShippedOrders,
        newShippedOrders: acc.newShippedOrders + shippedOrders,
        canceledOrders: acc.canceledOrders + canceledOrders,
      };
    },
    {
      currentShippedOrders: 0,
      fulfilledToShippedItems: 0,
      newPartiallyShippedOrders: 0,
      newShippedOrders: 0,
      canceledOrders: 0,
    }
  );

  const allOrdersAreCurrentlyShipped =
    !!store.orders.length && currentShippedOrders === store.orders.length;
  const allOrdersAreCurrentlyCanceled =
    !!store.orders.length && canceledOrders === store.orders.length;
  const allOrdersAreCurrentlyShippedOrCanceled =
    !!store.orders.length &&
    currentShippedOrders + canceledOrders === store.orders.length;
  const allOrdersAreCurrentlyShippeAndCanceled =
    !!store.orders.length &&
    currentShippedOrders + canceledOrders === store.orders.length &&
    currentShippedOrders > 0 &&
    canceledOrders > 0;

  const allOrdersWillBeShipped =
    currentShippedOrders + newShippedOrders === store.orders.length;
  const allOrdersWillBeShippedOrCanceled =
    currentShippedOrders + newShippedOrders + canceledOrders ===
      store.orders.length &&
    newShippedOrders > 0 &&
    canceledOrders > 0;

  const thereAreOrderItemsOrOrdersReadyToShip =
    fulfilledToShippedItems > 0 ||
    newPartiallyShippedOrders > 0 ||
    newShippedOrders > 0;

  const noOrderItemsOrOrdersReadyToShipAndNotAllOrdersAreShippedOrCanceled =
    fulfilledToShippedItems === 0 &&
    newPartiallyShippedOrders === 0 &&
    newShippedOrders === 0 &&
    !allOrdersAreCurrentlyShippedOrCanceled;

  return (
    <TriggerShipmentModalStyles>
      <Modal
        {...{
          closeModal,
          isOpen,
          customModalClass: 'custom-modal-class',
          customCloseClass: 'custom-close-button',
        }}
      >
        <h3>Trigger a shipment for {store.name}</h3>
        {allOrdersAreCurrentlyShipped && (
          <div className="all-orders-canceled-or-shipped">
            <p>
              <CheckCircleIcon className="check-circle-icon" />
              All orders are currently shipped.
            </p>
            <div className="close-modal-section">
              <button
                type="button"
                className="close-button"
                onClick={e => {
                  e.stopPropagation();
                  closeModal();
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {allOrdersAreCurrentlyCanceled && (
          <div className="all-orders-canceled-or-shipped">
            <p>
              <CheckCircleIcon className="check-circle-icon" />
              All orders are currently canceled.
            </p>
            <div className="close-modal-section">
              <button
                type="button"
                className="close-button"
                onClick={e => {
                  e.stopPropagation();
                  closeModal();
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {allOrdersAreCurrentlyShippeAndCanceled && (
          <div className="all-orders-canceled-or-shipped">
            <p>
              <CheckCircleIcon className="check-circle-icon" />
              All items are currently canceled or shipped
            </p>
            <div className="close-modal-section">
              <button
                type="button"
                className="close-button"
                onClick={e => {
                  e.stopPropagation();
                  closeModal();
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {thereAreOrderItemsOrOrdersReadyToShip && (
          <>
            <div className="main-content">
              <ul>
                {fulfilledToShippedItems > 0 && (
                  <li>
                    <ExclamationCircleIcon className="exclamation-circle-icon" />
                    <span>
                      {fulfilledToShippedItems} item
                      {fulfilledToShippedItems > 1 && 's'} will move from
                      fulfilled to shipped status.
                    </span>
                  </li>
                )}
                {newPartiallyShippedOrders > 0 && (
                  <li>
                    <ExclamationCircleIcon className="exclamation-circle-icon" />
                    <span>
                      {newPartiallyShippedOrders} order
                      {newPartiallyShippedOrders > 1 && 's'} will be set to
                      partially shipped.
                    </span>
                  </li>
                )}
                {newShippedOrders > 0 && (
                  <li>
                    <ExclamationCircleIcon className="exclamation-circle-icon" />
                    <span>
                      {newShippedOrders} order
                      {newShippedOrders > 1 && 's'} will be set to shipped.
                    </span>
                  </li>
                )}
              </ul>
              {allOrdersWillBeShipped && (
                <p className="all-orders-message">
                  <CheckCircleIcon className="check-circle-icon" />
                  All orders will now be shipped!
                </p>
              )}
              {allOrdersWillBeShippedOrCanceled && (
                <p className="all-orders-message">
                  <CheckCircleIcon className="check-circle-icon" />
                  All orders will now be shipped or canceled!
                </p>
              )}
            </div>
            <div className="actions">
              <button
                type="button"
                className="cancel-button"
                onClick={e => {
                  e.stopPropagation();
                  closeModal();
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="submit-button"
                onClick={e => {
                  e.stopPropagation();
                  triggerStoreShipment.mutate();
                  closeModal();
                }}
              >
                Trigger the shipment
              </button>
            </div>
          </>
        )}

        {noOrderItemsOrOrdersReadyToShipAndNotAllOrdersAreShippedOrCanceled && (
          <div className="empty-status">
            <p>
              <ExclamationCircleIcon className="exclamation-circle-icon" />
              No order items or orders are ready for a shipment.
            </p>
            <div className="close-modal-section">
              <button
                type="button"
                className="close-button"
                onClick={e => {
                  e.stopPropagation();
                  closeModal();
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </TriggerShipmentModalStyles>
  );
}

const TriggerShipmentModalStyles = styled.div`
  .custom-modal-class {
    padding: 1.375rem 2rem;
    max-width: 34rem;
    width: 100%;
    .custom-close-button {
      top: 1.375rem;
      right: 1.875rem;
    }
  }

  h3 {
    margin: 0;
    padding-right: 3rem;
    font-size: 1.0625rem;
    line-height: 140%;
  }

  .main-content {
    margin: 1.5rem 0;
    padding: 0;
    background-color: #fffbeb;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0.5rem;

    ul {
      margin: 0;
      padding: 0;
      li {
        padding: 1rem 1.25rem;
        display: flex;
        align-items: center;
        line-height: 100%;
        list-style-type: none;
        font-size: 0.875rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        &:last-of-type {
          border-bottom: none;
        }
        .exclamation-circle-icon {
          flex-shrink: 0;
          margin: 0.0625rem 0.5rem 0 0;
          height: 1rem;
          width: 1rem;
          color: #f59e0b;
        }
      }
    }
  }

  .all-orders-canceled-or-shipped {
    margin: 1.5rem 0 0.75rem;
    p {
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      line-height: 100%;
      list-style-type: none;
      font-size: 0.9375rem;
      font-weight: 500;
      color: #051610;
      background-color: #e5f9f2;
      border: 1px solid #bad6cc;
      border-radius: 0.375rem;
      .check-circle-icon {
        flex-shrink: 0;
        margin: 0.0625rem 0.4375rem 0 0;
        height: 1.25rem;
        width: 1.25rem;
        color: #107731;
      }
    }
  }

  .all-orders-message {
    margin: 0 0 -1px -1px;
    display: flex;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    line-height: 100%;
    list-style-type: none;
    font-size: 0.875rem;
    background-color: #e5f9f2;
    border-radius: 0 0 0.5rem 0.5rem;
    border: 1px solid #bad6cc;
    width: calc(100% + 2px);
    .check-circle-icon {
      flex-shrink: 0;
      margin: 0.0625rem 0.625rem 0 0;
      height: 1rem;
      width: 1rem;
      color: #107731;
    }
  }

  .empty-status {
    margin: 1rem 0 0;
    p {
      margin: 0;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      line-height: 100%;
      list-style-type: none;
      font-size: 0.9375rem;
      font-weight: 500;
      line-height: 120%;
      color: #0a0a0a;
      background-color: #e5e5e5;
      border: 1px solid #d4d4d4;
      border-radius: 0.375rem;
      .exclamation-circle-icon {
        flex-shrink: 0;
        margin: 0.0625rem 0.5rem 0 0;
        height: 1.25rem;
        width: 1.25rem;
        color: #f97316;
      }
    }
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0 1rem;
    .cancel-button,
    .submit-button {
      padding: 0 2.375rem;
      height: 2.375rem;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 130%;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
    }
    .cancel-button {
      background-color: transparent;
      border: 1px solid #d4d4d4;
      color: #171717;
      transition: all 0.075s linear;
      &:hover {
        border-color: #ccc;
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      }
    }
    .submit-button {
      background-color: #2c2c2c;
      color: #fff;
      transition: all 0.075s linear;
      &:hover {
        background-color: #232323;
      }
    }
  }

  .close-modal-section {
    margin: 1.25rem 0 0;
    display: flex;
    justify-content: center;
    display: none;
    .close-button {
      padding: 0 1.75rem;
      height: 2.375rem;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      font-size: 0.9375rem;
      font-weight: 500;
      line-height: 130%;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
      background-color: transparent;
      border: 1px solid #d4d4d4;
      color: #171717;
      transition: all 0.075s linear;
      &:hover {
        border-color: #ccc;
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      }
    }
  }
`;
