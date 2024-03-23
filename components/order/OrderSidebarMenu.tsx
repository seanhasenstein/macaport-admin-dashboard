import React from 'react';
import styled from 'styled-components';
import {
  PrinterIcon,
  XCircleIcon,
  CreditCardIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

import Menu from '../common/Menu';

import { Store } from '../../interfaces';

type Props = {
  orderIsCanceled: boolean;
  stripeId: string;
  setPrintOption: React.Dispatch<
    React.SetStateAction<
      'unfulfilled' | 'personalization' | 'single' | undefined
    >
  >;
  setShowCancelOrderModal: React.Dispatch<React.SetStateAction<boolean>>;
  store: Store;
  openTriggerStoreShipmentModal: () => void;
};

export default function OrderSidebarMenu({
  orderIsCanceled,
  stripeId,
  setPrintOption,
  setShowCancelOrderModal,
  openTriggerStoreShipmentModal,
}: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);
  const handlePrintClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setPrintOption('single');
    setIsOpen(false);
  };
  const handleCancelClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setShowCancelOrderModal(true);
    setIsOpen(false);
  };

  return (
    <Menu {...{ isOpen, closeSidebar, toggleSidebar }}>
      <OrderSidebarMenuStyles>
        <div className="menu-items">
          <button
            type="button"
            className="menu-button"
            onClick={e => {
              e.stopPropagation();
              openTriggerStoreShipmentModal();
              setIsOpen(false);
            }}
          >
            <CheckCircleIcon className="icon" strokeWidth={2} />
            <span>
              Trigger a shipment
              <span className="subtitle">
                Set all fulfilled order items to shipped
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={handlePrintClick}
            className="menu-button"
          >
            <PrinterIcon className="icon" strokeWidth={2} /> Print order
          </button>
          <a
            href={`https://dashboard.stripe.com/payments/${stripeId}`}
            target="_blank"
            rel="noreferrer"
            className="menu-link"
          >
            <CreditCardIcon className="icon" strokeWidth={2} />
            View in Stripe dashboard
          </a>
          {!orderIsCanceled ? (
            <button
              type="button"
              onClick={handleCancelClick}
              className="menu-button"
            >
              <XCircleIcon className="icon" strokeWidth={2} />
              Cancel order
            </button>
          ) : null}
        </div>
      </OrderSidebarMenuStyles>
    </Menu>
  );
}

const OrderSidebarMenuStyles = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  .menu-button,
  .menu-link {
    padding: 0.875rem 0;
    width: 100%;
    display: flex;
    align-items: center;
    background-color: transparent;
    border-width: 0 0 1px 0;
    border-style: solid;
    border-color: #e4e4e7;
    cursor: pointer;
    color: #1f2937;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 100%;
    text-align: left;
    transition: color 100ms ease-in-out;
    .subtitle {
      margin: 0.1875rem 0 0;
      display: block;
      font-size: 0.6875rem;
      color: #6b7280;
    }
    &:last-child {
      border-bottom: none;
    }
    &:hover {
      color: #000;
      .icon {
        color: #71717a;
      }
    }
    .icon {
      margin-right: 0.5rem;
      height: 0.9375rem;
      width: 0.9375rem;
      color: #9ca3af;
      transition: color 100ms ease-in-out;
    }
  }
`;
