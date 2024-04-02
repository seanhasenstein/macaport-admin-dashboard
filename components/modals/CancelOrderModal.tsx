import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import classNames from 'classnames';
import {
  PlusCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid';

import Modal from '../Modal';
import OrderStatus from '../order/OrderStatus';

import { useOrderMutation } from '../../hooks/useOrderMutations';

import { formatPhoneNumber, formatToMoney } from '../../utils';

import { Order, Store } from '../../interfaces';

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  store: Store;
  order: Order;
};

export default function CancelOrderModal({
  isOpen,
  closeModal,
  order,
  store,
}: Props) {
  const [itemsWithShouldReturn, setItemsWithShouldReturn] = React.useState(
    () => {
      return order.items.map(item => {
        if (
          item.status.current !== 'Canceled' &&
          item.status.current !== 'Shipped'
        ) {
          return {
            ...item,
            shouldReturnToInventory: true,
          };
        } else {
          return {
            ...item,
            shouldReturnToInventory: false,
          };
        }
      });
    }
  );

  const { cancelOrder } = useOrderMutation({
    order: { ...order, items: itemsWithShouldReturn },
    store,
  });

  const {
    createdAt,
    customer,
    items,
    orderId,
    summary,
    stripeId,
    store: orderStore,
    orderStatus,
  } = order;
  const { firstName, lastName, email, phone } = customer;
  const { name: storeName } = orderStore;
  const { subtotal, total, salesTax } = summary;

  const allItemsAlreadyCanceled = items.every(
    item => item.status.current === 'Canceled'
  );
  const allItemsAlreadyShipped = items.every(
    item => item.status.current === 'Shipped'
  );
  const allItemsAlreadyShippedOrCanceled = items.every(
    item =>
      item.status.current === 'Shipped' || item.status.current === 'Canceled'
  );

  const handleTriggerItem = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    itemId: string
  ) => {
    e.stopPropagation();
    setItemsWithShouldReturn(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            shouldReturnToInventory: !item.shouldReturnToInventory,
          };
        }
        return item;
      });
    });
  };

  return (
    <CancelOrderModalStyles>
      <Modal
        {...{
          closeModal,
          isOpen,
          customClass: 'custom-cancel-item-modal-class',
          customCloseClass: 'custom-close-button',
        }}
      >
        <div className="cancel-modal-heading">
          <h3>Cancel this order</h3>
        </div>
        <div className="modal-main-content">
          <div className="modal-body">
            <div className="customer-details-row">
              <div>
                <p className="customer-name">
                  {firstName} {lastName}
                </p>
                <p>
                  <a href={`mailto:${email}`} target="_blank" rel="noreferrer">
                    {email}
                  </a>
                </p>
                <p>{formatPhoneNumber(phone)}</p>
              </div>
              <div>
                <OrderStatus
                  {...{
                    order,
                    copy: `Order ${
                      orderStatus === 'PartiallyShipped'
                        ? 'Partially Shipped'
                        : orderStatus
                    }`,
                    customClass: 'order-status',
                  }}
                />
              </div>
            </div>
            <div className="order-details-row">
              <div>
                <p>
                  <span className="label">Store:</span>
                  {storeName}
                </p>
                <p>
                  <span className="label">Order date:</span>
                  {format(new Date(createdAt), 'P h:mmaaa')}
                </p>
                <p>
                  <span className="label">Order ID:</span>#{orderId}
                </p>
                <p>
                  <span className="label">Stripe ID:</span>
                  <a
                    href={`https://dashboard.stripe.com/payments/${stripeId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {stripeId}
                  </a>
                </p>
              </div>
              <div>
                <p className="summary-item">
                  <span className="label">Subtotal:</span>
                  {formatToMoney(subtotal, true)}
                </p>
                <p className="summary-item">
                  <span className="label">Sales tax:</span>
                  {formatToMoney(salesTax, true)}
                </p>
                <p className="summary-item">
                  <span className="label">Total:</span>
                  {formatToMoney(total, true)}
                </p>
              </div>
            </div>
            <div className="instructions">
              <h3>Select the items to return to inventory</h3>
              <p>
                All of the order items are selected to return to inventory by
                default (except for items that are already shipped or canceled).
              </p>
            </div>
            <h4>Order items:</h4>
            <div className="order-items">
              {itemsWithShouldReturn.map(item => {
                const {
                  image,
                  name: itemName,
                  itemTotal,
                  quantity,
                  sku,
                  status,
                  shouldReturnToInventory,
                  id,
                  artworkId,
                  personalizationAddons,
                  merchandiseCode,
                } = item;
                const { size } = sku;
                const { label } = size;
                const { current: itemStatus } = status;

                const isCanceled = itemStatus === 'Canceled';
                const isShipped = itemStatus === 'Shipped';
                const isShippedOrCanceled = isCanceled || isShipped;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={classNames(
                      'order-item-button',
                      itemStatus.toLowerCase(),
                      {
                        ['should-return-to-inventory']: shouldReturnToInventory,
                      }
                    )}
                    onClick={e => handleTriggerItem(e, id)}
                  >
                    <div className="main-item-details">
                      {isShippedOrCanceled ? (
                        <XCircleIcon className="no-symbol-icon" />
                      ) : (
                        <>
                          {shouldReturnToInventory ? (
                            <PlusCircleIcon className="check-circle-icon" />
                          ) : (
                            <XCircleIcon className="minus-circle-icon" />
                          )}
                        </>
                      )}
                      <div className="item-img-container">
                        <img src={image} alt={itemName} className="item-img" />
                      </div>
                      <div className="item-details">
                        <div className="row">
                          <div className="item-name-status-row">
                            <p className="item-name">{itemName}</p>
                            <span
                              className={classNames(
                                'item-status',
                                itemStatus.toLowerCase()
                              )}
                            >
                              {itemStatus}
                            </span>
                          </div>
                          <p className="merch-code">{merchandiseCode}</p>
                        </div>
                        <div className="row">
                          <p className="item-color">
                            <span className="label">Color:</span>
                            {sku.color.label}
                          </p>
                          <p className="item-qty">
                            <span className="label">Qty:</span>
                            {quantity}
                          </p>
                        </div>
                        <div className="row">
                          <p className="item-size">
                            <span className="label">Size:</span>
                            {label}
                          </p>
                        </div>
                        <div className="row">
                          <p className="art-id">
                            <span className="label">Artwork Id:</span>
                            {artworkId ? artworkId : 'None'}
                          </p>
                          <p className="item-total">
                            <span className="label">Total:</span>
                            {formatToMoney(itemTotal, true)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {personalizationAddons.length > 0 && (
                      <div
                        className={classNames(
                          'personalization-details',
                          itemStatus.toLowerCase()
                        )}
                      >
                        <p className="title">
                          <span
                            className={classNames({
                              ['return-to-inventory']: shouldReturnToInventory,
                              ['do-not-return-to-inventory']:
                                !shouldReturnToInventory &&
                                !isShippedOrCanceled,
                              ['is-shipped-or-canceled']: isShippedOrCanceled,
                            })}
                          >
                            Item personalization
                          </span>
                        </p>
                        <div className="items">
                          {personalizationAddons.map((item, index) => {
                            const { addon, location, subItems, value } = item;
                            return (
                              <div key={`${item.id}-${index}`}>
                                <div className="personalization-item">
                                  <div className="flex align-center">
                                    <p className="label">{addon}:</p>
                                    <p className="value">{value}</p>
                                  </div>
                                  <span className="location">{location}</span>
                                </div>
                                {subItems.length > 0 ? (
                                  <>
                                    {subItems.map((subItem, index) => (
                                      <div
                                        key={`${subItem.id}-${index}`}
                                        className="personalization-item"
                                      >
                                        <div className="flex align-center">
                                          <p className="label">
                                            {subItem.addon}:
                                          </p>
                                          <p className="value">
                                            {subItem.value}
                                          </p>
                                        </div>
                                        <span className="location">
                                          {subItem.location}
                                        </span>
                                      </div>
                                    ))}
                                  </>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div
            className={classNames('actions', {
              ['all-items-shipped-or-canceled']:
                allItemsAlreadyShippedOrCanceled,
            })}
          >
            {allItemsAlreadyShippedOrCanceled ? (
              <p>
                <ExclamationCircleIcon className="exclamation-icon" />
                {orderStatus === 'Canceled' ? (
                  'This order is already canceled.'
                ) : orderStatus === 'Shipped' ? (
                  'This order is shipped.'
                ) : (
                  <>
                    All items are{' '}
                    {allItemsAlreadyCanceled
                      ? 'canceled.'
                      : allItemsAlreadyShipped
                      ? 'shipped.'
                      : 'shipped or canceled.'}
                  </>
                )}
              </p>
            ) : (
              <button
                type="button"
                className="submit-button"
                onClick={() => {
                  cancelOrder.mutate(undefined, {
                    onSuccess: () => closeModal(),
                  });
                }}
              >
                Cancel this order
              </button>
            )}
          </div>
        </div>
      </Modal>
    </CancelOrderModalStyles>
  );
}

const CancelOrderModalStyles = styled.div`
  .custom-cancel-item-modal-class {
    position: fixed;
    padding: 0;
    height: calc(100vh - 9.75rem);
    width: 50rem;
    overflow-y: hidden;
    border: 4px solid #e5e5e5;
  }

  .custom-close-button {
    z-index: 300;
  }

  .cancel-modal-heading {
    margin-bottom: 3px;
    padding: 0 2rem;
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 4.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: #fff;
    border-bottom: 1px solid #e5e5e5;
    box-shadow: 0 4px 4px -4px rgba(0, 0, 0, 0.1);
    z-index: 200;

    h3 {
      margin: 0;
      font-size: 1.25rem;
    }

    p {
      margin: 0;
      max-width: 33rem;
      font-size: 0.9375rem;
      color: #525252;
      line-height: 150%;
    }
  }

  .modal-main-content {
    position: absolute;
    top: 4.5rem;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    padding-bottom: 4.5rem;
  }

  .modal-body {
    padding: 1.875rem 2rem 3.25rem;
    background-color: #fafafa;
  }

  .customer-details-row {
    margin: 0 0 1.5rem;
    padding: 0 0 1.5rem;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e5e5e5;
    p {
      margin: 0.375rem 0 0;
      font-size: 0.9375rem;
      font-weight: 400;
      color: #404040;
      &.customer-name {
        margin-top: 0;
        font-size: 1.0625rem;
        font-weight: 600;
        color: #0a0a0a;
      }
      a:hover {
        text-decoration: underline;
      }
    }

    .order-status {
      padding: 0.3125rem 0.875rem;
      min-width: 10rem;
      font-weight: 700;
      user-select: none;
      text-align: center;
    }
  }

  .order-details-row {
    margin: 0 0 2rem;
    padding: 0 0 1.75rem;
    display: flex;
    gap: 0 6.5rem;
    border-bottom: 1px solid #e5e5e5;

    p {
      margin: 0.5rem 0 0;
      font-size: 0.9375rem;
      font-weight: 400;
      color: #404040;
      &:first-of-type {
        margin-top: 0;
      }
      &.summary-item {
        display: flex;
        justify-content: space-between;
        text-align: right;
        span {
          display: inline-block;
          width: 6rem;
          text-align: left;
        }
      }
      .label {
        font-weight: 600;
        color: #0a0a0a;
        width: 6rem;
        display: inline-block;
      }
      a:hover {
        text-decoration: underline;
      }
    }
  }

  .instructions {
    margin: 0 0 2.25rem;
    h3 {
      margin: 0;
      font-size: 1.0625rem;
    }

    p {
      margin: 0.75rem 0 0;
      font-size: 0.9375rem;
      font-weight: 400;
      color: #404040;
      line-height: 150%;
    }
  }

  h4 {
    margin: 0 0 1.25rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #0a0a0a;
  }

  .order-items {
    display: flex;
    flex-direction: column;
    gap: 1.25rem 0;

    .order-item-button {
      padding: 0.875rem 1.25rem 0.75rem 1rem;
      width: 100%;
      background-color: #fcf3f3;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 0.375rem;
      cursor: pointer;

      &.canceled,
      &.shipped {
        background-color: #f5f5f5;
        border: 1px solid rgba(0, 0, 0, 0.1);
        pointer-events: none;
      }

      &.should-return-to-inventory {
        background-color: #effefa;
      }

      .main-item-details {
        display: flex;
        align-items: center;
        gap: 0 1rem;
      }

      .check-circle-icon,
      .minus-circle-icon,
      .no-symbol-icon {
        height: 1.5rem;
        width: 1.5rem;
      }

      .check-circle-icon {
        color: #077154;
      }

      .minus-circle-icon {
        color: #a32626;
      }

      .item-details {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.5rem 0;
        .row {
          display: flex;
          justify-content: space-between;
          width: 100%;
        }

        .item-name-status-row {
          display: flex;
          align-items: center;

          .item-status {
            margin-left: 1rem;
            padding: 0.28125rem 0.375rem;
            background: #f5f5f5;
            border-radius: 0.25rem;
            font-size: 0.5625rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.075em;
            line-height: 100%;
            border: 1px solid rgba(0, 0, 0, 0.1);

            &.unfulfilled {
              color: #9c0505;
              background-color: #f9f6f6;
              border-color: #eddbdb;
            }
            &.fulfilled {
              color: #856b02;
              background-color: #fffffd;
              border-color: #e4dfc8;
            }
            &.shipped {
              background-color: #e5f9f2;
              color: #0c3727;
            }
            &.canceled {
              background-color: #f4f4f5;
              color: #232323;
            }
          }
        }

        p {
          margin: 0;

          &.item-name {
            font-weight: 600;
          }

          .label {
            margin-right: 0.5rem;
            font-weight: 600;
          }
        }
      }

      .item-img-container {
        padding: 0.1875rem;
        width: 2.25rem;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #fff;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
        border-radius: 0.1875rem;
        .item-img {
          width: 100%;
        }
      }
    }
  }

  .personalization-details {
    margin: -0.5rem 0 0 3.25rem;
    padding: 1rem 0 0.3125rem;
    .title {
      position: relative;
      padding: 0 0 0.625rem;
      color: #09090b;
      font-size: 0.6875rem;
      font-weight: 700;
      line-height: 100%;
      letter-spacing: 0.15rem;
      text-transform: uppercase;
      text-align: center;
      &:after {
        content: '';
        display: block;
        position: absolute;
        top: 0.34375rem;
        left: 0;
        width: 100%;
        height: 1px;
        background-color: #d4d4d8;
        z-index: 0;
      }
      span {
        position: relative;
        padding: 0 1.25rem;
        z-index: 1;
        background-color: #fff;
        &.return-to-inventory {
          background-color: #effefa;
        }
        &.do-not-return-to-inventory {
          background-color: #fcf3f3;
        }
        &.is-shipped-or-canceled {
          background-color: #f5f5f5;
        }
      }
    }
    .items {
      margin: 0.4375rem 0 0;
      display: flex;
      flex-direction: column;
      padding: 0 0.625rem;
      background-color: rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.075);
      border-radius: 0.25rem;
      .personalization-item {
        padding: 0.6875rem 0.3125rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #d4d4d8;
        &:last-of-type {
          border-bottom: none;
        }
        .flex {
          display: flex;
        }
        .align-center {
          align-items: center;
        }
        p {
          margin: 0;
          &.label,
          &.value {
            font-size: 0.8125rem;
            line-height: 100%;
          }
          &.label {
            margin: 0 0.5rem 0 0;
            font-weight: 600;
            color: #18181b;
          }
          &.value {
            font-weight: 500;
            color: #3f3f46;
          }
        }
        .location {
          margin: 0 0 0 0.5rem;
          padding: 0.125rem 0.25rem;
          font-size: 0.625rem;
          font-weight: 600;
          color: #52525b;
          background-color: #fff;
          border-radius: 0.1875rem;
          border: 1px solid #dddde2;
          box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
        }
      }
    }
  }

  .actions {
    padding: 1rem 2rem;
    height: 4.5rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    border-top: 1px solid #e5e5e5;
    box-shadow: 0 -4px 4px -4px rgba(0, 0, 0, 0.1);

    &.all-items-shipped-or-canceled {
      justify-content: center;
      background-color: #fffbeb;
    }

    p {
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0 0.25rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: #171717;

      .exclamation-icon {
        height: 1.0625rem;
        width: 1.0625rem;
        color: #f59e0b;
      }
    }

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
      background-color: #2c2c2c;
      color: #fff;
      transition: all 0.075s linear;
      &:hover {
        background-color: #232323;
      }
    }
  }
`;
