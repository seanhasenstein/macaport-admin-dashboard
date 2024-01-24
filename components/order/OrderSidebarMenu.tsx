import React from 'react';
import styled from 'styled-components';
import {
  PrinterIcon,
  XCircleIcon,
  CreditCardIcon,
} from '@heroicons/react/20/solid';

import Menu from '../common/Menu';

type Props = {
  stripeId: string;
  setPrintOption: React.Dispatch<
    React.SetStateAction<
      'unfulfilled' | 'personalization' | 'single' | undefined
    >
  >;
  setShowCancelOrderModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function OrderSidebarMenu({
  stripeId,
  setPrintOption,
  setShowCancelOrderModal,
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
  const handleCancelClick = () => {
    setShowCancelOrderModal(true);
    setIsOpen(false);
  };

  return (
    <Menu {...{ isOpen, closeSidebar, toggleSidebar }}>
      <OrderSidebarMenuStyles>
        <div className="menu-items">
          {/* <button className="menu-item"><PencilSquareIcon className="icon" />Edit item</button> */}
          <button
            type="button"
            onClick={handlePrintClick}
            className="menu-button"
          >
            <PrinterIcon className="icon" /> Print order
          </button>
          <button
            type="button"
            onClick={handleCancelClick}
            className="menu-button"
          >
            <XCircleIcon className="icon" />
            Cancel order
          </button>
          <a
            href={`https://dashboard.stripe.com/payments/${stripeId}`}
            target="_blank"
            rel="noreferrer"
            className="menu-link"
          >
            <CreditCardIcon className="icon" />
            Go to Stripe dashboard
          </a>
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
      width: 0.875rem;
      height: 0.875rem;
      color: #a1a1aa;
      transition: color 100ms ease-in-out;
    }
  }
`;
