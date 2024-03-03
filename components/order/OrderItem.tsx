import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';

import OrderItemMenu from './OrderItemMenu';

import { useOrderItemMutation } from '../../hooks/useOrderItemMutation';

import { formatToMoney } from '../../utils';

import {
  Order,
  OrderItem as OrderItemInterface,
  Store,
} from '../../interfaces';

type Props = {
  orderItems: OrderItemInterface[];
  item: OrderItemInterface;
  order: Order;
  store: Store;
  userId: string | undefined;
};

export default function OrderItem({
  orderItems,
  item,
  order,
  store,
  userId,
}: Props) {
  const [menuIsOpen, setMenuIsOpen] = React.useState(false);

  const {
    id,
    image,
    itemTotal,
    merchandiseCode,
    name,
    personalizationAddons,
    quantity,
    sku,
    artworkId,
    status,
  } = item;
  const { color, size } = sku;
  const { label: colorLabel, hex } = color;
  const { label: sizeLabel } = size;
  const { current: itemStatus } = status;

  const handleToggleItemStatus = async (orderItem: OrderItemInterface) => {
    if (!menuIsOpen) {
      updateOrderItemStatus.mutate({ orderItems, orderItem });
    }
  };

  const { updateOrderItemStatus } = useOrderItemMutation({
    order,
    store,
    userId: userId || '',
  });

  return (
    <OrderItemStyles
      key={`order-${id}`}
      onClick={() => handleToggleItemStatus(item)}
      className={classNames('item', itemStatus.toLowerCase())}
    >
      <div className="status">
        <span>{itemStatus}</span>
      </div>
      <div className="main-details">
        <div className="full-width flex">
          <div className="featured-img">
            <img src={image} alt={name} />
          </div>
          <div className="full-width">
            <div className="top-row">
              <p className="item-name">{name}</p>
              <div className="flex align-center ">
                <p className="merch-code">
                  {merchandiseCode ? `${merchandiseCode}` : ''}
                </p>
                <OrderItemMenu
                  isOpen={menuIsOpen}
                  setIsOpen={setMenuIsOpen}
                  orderItem={item}
                  {...{
                    orderItems,
                    order,
                    store,
                    userId: userId || '',
                  }}
                />
              </div>
            </div>
            <div>
              <div className="full-width flex justify-between align-center">
                <p className="color">
                  <span className="dot" style={{ backgroundColor: hex }} />
                  {colorLabel}
                </p>
                <p className="artwork-id">
                  <span>Artwork:</span> {artworkId ? artworkId : 'None'}
                </p>
              </div>
              <div className="item-data">
                <p className="quantity-and-size">
                  <span className="quantity">{quantity}</span>
                  <span className="x">x</span>
                  <span className="size">{sizeLabel}</span>
                </p>
                <p className="item-total">{formatToMoney(itemTotal, true)}</p>
              </div>
            </div>
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
            <span>Item personalization</span>
          </p>
          <div className="items">
            {personalizationAddons.map((item, index) => {
              const { addon, location, subItems, value } = item;
              return (
                <>
                  <div
                    key={`${item.id}-${index}`}
                    className="personalization-item"
                  >
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
                            <p className="label">{subItem.addon}:</p>
                            <p className="value">{subItem.value}</p>
                          </div>
                          <span className="location">{subItem.location}</span>
                        </div>
                      ))}
                    </>
                  ) : null}
                </>
              );
            })}
          </div>
        </div>
      )}
    </OrderItemStyles>
  );
}

const OrderItemStyles = styled.div`
  position: relative;
  margin: 2rem 0 0;
  width: 100%;
  padding: 1.25rem 1.125rem 1.3125rem 1rem;
  background-color: #fff;
  border: 1px solid #dddde2;
  border-radius: 0.5rem;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
  user-select: none;
  cursor: pointer;
  &:first-of-type {
    margin-top: 2.5rem;
  }
  &.unfulfilled,
  &.fulfilled,
  &.shipped,
  &.canceled {
    border-color: rgba(0, 0, 0, 0.15);
    .main-details .top-row,
    .personalization-details span,
    .personalization-details .title:after {
      border-color: rgba(0, 0, 0, 0.15);
    }
  }
  &.unfulfilled {
    background-color: #fcf3f3;
    .status {
      span {
        background: linear-gradient(to bottom, #f9fafb 50%, #fcf3f3 50%);
        color: #770404;
      }
    }
    .personalization-details .title span {
      background-color: #fcf3f3;
    }
  }
  &.fulfilled {
    background-color: #fbf9ee;
    .status {
      span {
        background: linear-gradient(to bottom, #f9fafb 50%, #fbf9ee 50%);
        color: #92400e;
      }
    }
    .personalization-details .title span {
      background-color: #fbf9ee;
    }
  }
  &.shipped {
    background-color: #e6f9f1;
    .status {
      span {
        background: linear-gradient(to bottom, #f9fafb 50%, #e6f9f1 50%);
        color: #064e3b;
      }
    }
    .personalization-details .title span {
      background-color: #e6f9f1;
    }
  }
  &.canceled {
    background-color: #ecf1fb;
    /* text-decoration: line-through; */
    pointer-events: none;
    .status {
      span {
        background: linear-gradient(to bottom, #f9fafb 50%, #ecf1fb 50%);
        color: #3f3f46;
      }
    }
    .personalization-details .title span {
      background-color: #ecf1fb;
    }
  }
  .status {
    position: absolute;
    top: -0.5rem;
    left: 0;
    right: 0;
    width: 100%;
    text-align: center;
    font-size: 0.75rem;
    font-weight: 700;
    color: #18181b;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    z-index: 20;
    span {
      padding: 0 1.5rem;
      background: linear-gradient(to bottom, #f9fafb 50%, #fff 50%);
    }
  }
  .main-details {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0 2rem;
    .featured-img {
      margin-right: 1rem;
      width: 2.5rem;
      display: flex;
      flex-direction: column;
      img {
        max-height: 3.25rem;
        width: auto;
        object-fit: contain;
        padding: 0.25rem 0.3125rem;
        background-color: #fff;
        border: 1px solid #dddde2;
        border-radius: 0.25rem;
        box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
      }
    }
    .top-row {
      margin-bottom: 1.25rem;
      padding-bottom: 0.9375rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0 1rem;
      border-bottom: 1px solid #d4d4d8;
    }
    .item-name,
    .merch-code {
      color: #09090b;
      font-size: 0.875rem;
      font-weight: 600;
      line-height: 130%;
    }
    .color {
      margin: 0;
      display: flex;
      align-items: center;
      color: #52525b;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 100%;
      span {
        margin: 0 0.375rem 0 0;
      }
      .dot {
        flex-shrink: 0;
        margin: 0 0.375rem 0 0;
        display: inline-block;
        height: 0.875rem;
        width: 0.875rem;
        border: 1px solid rgba(0, 0, 0, 0.4);
        border-radius: 9999px;
      }
    }
    .artwork-id,
    .color {
      margin: 0;
      color: #27272a;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 130%;
      span {
        color: #09090b;
      }
    }
    .item-data {
      margin: 1.375rem 0 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      .quantity-and-size,
      .item-total {
        color: #52525b;
        font-size: 0.875rem;
        font-weight: 500;
        line-height: 130%;
        span {
          color: #09090b;
        }
        &.item-total {
          text-align: right;
        }
      }
      .quantity-and-size {
        display: grid;
        grid-template-columns: auto 5rem 1fr;
        .x {
          margin: -0.0625rem 0.5rem 0;
          color: #71717a;
          text-align: center;
        }
        .size {
          text-align: left;
        }
      }
    }
  }
  .personalization-details {
    margin: 0.25rem 0 0 3.25rem;
    padding: 1rem 0 0;
    .title {
      position: relative;
      padding: 0 0 1rem;
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
        p {
          margin: 0;
          &.label,
          &.value {
            font-size: 0.875rem;
            font-weight: 500;
            line-height: 100%;
          }
          &.label {
            margin: 0 0.625rem 0 0;
            color: #18181b;
          }
          &.value {
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
`;
