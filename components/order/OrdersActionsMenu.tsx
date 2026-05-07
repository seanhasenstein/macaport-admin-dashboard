import React from 'react';
import styled from 'styled-components';
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  PrinterIcon,
  TruckIcon,
} from '@heroicons/react/20/solid';

import useOutsideClick from '../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';

type Props = {
  hasActiveFilters: boolean;
  canPrintUnfulfilled: boolean;
  canPrintPersonalized: boolean;
  canPrintFiltered: boolean;
  canDownloadCsv: boolean;
  canCopyEmails: boolean;
  canTriggerShipment: boolean;
  onPrintUnfulfilled: () => void;
  onPrintPersonalized: () => void;
  onPrintFiltered: () => void;
  onDownloadCsv: () => void;
  onTriggerShipment: () => void;
  onCopyEmails: () => void;
  copyEmailsState: 'idle' | 'copied' | 'empty';
};

export default function OrdersActionsMenu({
  hasActiveFilters,
  canPrintUnfulfilled,
  canPrintPersonalized,
  canPrintFiltered,
  canDownloadCsv,
  canCopyEmails,
  canTriggerShipment,
  onPrintUnfulfilled,
  onPrintPersonalized,
  onPrintFiltered,
  onDownloadCsv,
  onTriggerShipment,
  onCopyEmails,
  copyEmailsState,
}: Props) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);

  useOutsideClick(open, setOpen, wrapperRef);
  useEscapeKeydownClose(open, setOpen);

  const close = () => setOpen(false);

  const wrap = (handler: () => void) => () => {
    handler();
    close();
  };

  return (
    <OrdersActionsMenuStyles ref={wrapperRef}>
      <button
        type="button"
        className="trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Actions
        <ChevronDownIcon className="chevron" aria-hidden="true" />
      </button>

      {open && (
        <div className="menu" role="menu">
          <button
            type="button"
            role="menuitem"
            className="menu-item"
            onClick={wrap(onPrintUnfulfilled)}
            disabled={!canPrintUnfulfilled}
          >
            <PrinterIcon aria-hidden="true" />
            <span>
              Print unfulfilled orders
              <span className="subtitle">
                {canPrintUnfulfilled
                  ? 'Whole store, ignores filters (marks as printed)'
                  : 'No unfulfilled orders to print'}
              </span>
            </span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              role="menuitem"
              className="menu-item"
              onClick={wrap(onPrintFiltered)}
              disabled={!canPrintFiltered}
            >
              <PrinterIcon aria-hidden="true" />
              <span>
                Print filtered orders
                <span className="subtitle">
                  {canPrintFiltered
                    ? 'Print exactly what’s in the table'
                    : 'No matching orders to print'}
                </span>
              </span>
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            className="menu-item"
            onClick={wrap(onPrintPersonalized)}
            disabled={!canPrintPersonalized}
          >
            <PrinterIcon aria-hidden="true" />
            <span>
              Print personalized orders
              <span className="subtitle">
                {canPrintPersonalized
                  ? 'Whole store, ignores filters'
                  : 'No personalized orders to print'}
              </span>
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            className="menu-item"
            onClick={wrap(onDownloadCsv)}
            disabled={!canDownloadCsv}
          >
            <ArrowDownTrayIcon aria-hidden="true" />
            <span>
              Download orders to CSV
              <span className="subtitle">
                {canDownloadCsv
                  ? 'Uses view, group, and shipping filters'
                  : 'No orders match the current filters'}
              </span>
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            className="menu-item"
            onClick={() => {
              onCopyEmails();
            }}
            disabled={!canCopyEmails && copyEmailsState === 'idle'}
          >
            <ClipboardDocumentIcon aria-hidden="true" />
            <span>
              {copyEmailsState === 'copied'
                ? 'Emails copied!'
                : copyEmailsState === 'empty'
                ? 'No emails to copy'
                : 'Copy customer emails'}
              {copyEmailsState === 'idle' && (
                <span className="subtitle">
                  {canCopyEmails
                    ? 'From the orders in the table'
                    : 'No orders in the current view'}
                </span>
              )}
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            className="menu-item"
            onClick={wrap(onTriggerShipment)}
            disabled={!canTriggerShipment}
          >
            <TruckIcon aria-hidden="true" />
            <span>
              Trigger a shipment
              <span className="subtitle">
                {canTriggerShipment
                  ? 'Marks fulfilled items as shipped (whole store, ignores filters)'
                  : 'Nothing to ship right now'}
              </span>
            </span>
          </button>
        </div>
      )}
    </OrdersActionsMenuStyles>
  );
}

const OrdersActionsMenuStyles = styled.div`
  position: relative;

  .trigger {
    padding: 0.4375rem 0.75rem;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    font-size: 0.875rem;
    font-weight: 500;
    color: #1f2937;
    cursor: pointer;

    .chevron {
      height: 1rem;
      width: 1rem;
      color: #6b7280;
    }

    &:hover {
      border-color: #9199a6;
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      border-color: #1c44b9;
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
        #1c44b9 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
    }
  }

  @keyframes menuOpen {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(-4px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .menu {
    position: absolute;
    top: calc(100% + 0.375rem);
    right: 0;
    min-width: 18rem;
    padding: 0.375rem 0;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1);
    z-index: 100;
    transform-origin: top right;
    animation: menuOpen 120ms ease-out;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  .menu-item {
    padding: 0.625rem 0.875rem;
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    background-color: transparent;
    border: none;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 500;
    color: #1f2937;
    cursor: pointer;

    svg {
      flex-shrink: 0;
      margin-top: 0.0625rem;
      height: 1rem;
      width: 1rem;
      color: #6b7280;
    }

    .subtitle {
      margin: 0.1875rem 0 0;
      display: block;
      font-size: 0.6875rem;
      font-weight: 400;
      color: #6b7280;
    }

    &:hover:not(:disabled) {
      background-color: #f3f4f6;

      svg {
        color: #4b5563;
      }
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      background-color: #f3f4f6;
    }

    &:disabled {
      cursor: not-allowed;
      color: #9ca3af;

      svg {
        color: #d1d5db;
      }

      .subtitle {
        color: #9ca3af;
      }
    }
  }
`;
