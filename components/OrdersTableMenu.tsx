import React from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { OrderStatus } from '../interfaces';

type Props = {
  storeId: string;
  orderId: string;
  currentActiveId: string | undefined;
  setCurrentActiveId: React.Dispatch<React.SetStateAction<string | undefined>>;
  orderStatus: OrderStatus;
};

export default function OrdersTableMenu({
  storeId,
  orderId,
  currentActiveId,
  setCurrentActiveId,
  orderStatus,
}: Props) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [status, setStatus] = React.useState<OrderStatus>(orderStatus);
  const queryClient = useQueryClient();

  const orderStatusMutation = useMutation(
    async (newStatus: OrderStatus) => {
      const response = await fetch(
        `/api/orders/update/status?storeId=${storeId}&orderId=${orderId}`,
        {
          method: 'post',
          body: JSON.stringify({ status: newStatus }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update the order status.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onSuccess: (data, variables) => {
        setStatus(variables);
        queryClient.invalidateQueries('stores', { exact: true });
        queryClient.invalidateQueries(['store', storeId]);
        queryClient.invalidateQueries('orders', { exact: true });
        queryClient.invalidateQueries(['order', orderId]);
      },
    }
  );

  React.useEffect(() => {
    const handleEscapeKeyup = (e: KeyboardEvent) => {
      if (e.code === 'Escape') setCurrentActiveId(undefined);
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        currentActiveId === orderId &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setCurrentActiveId(undefined);
      }
    };

    if (currentActiveId) {
      document.addEventListener('keyup', handleEscapeKeyup);
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('keyup', handleEscapeKeyup);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [currentActiveId, orderId, setCurrentActiveId]);

  const handleMenuButtonClick = (id: string) => {
    if (currentActiveId === id) {
      setCurrentActiveId(undefined);
    } else {
      setCurrentActiveId(id);
    }
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    orderStatusMutation.mutate(newStatus);
    setCurrentActiveId(undefined);
  };

  return (
    <OrdersTableMenuStyles>
      <button
        type="button"
        className="menu-button"
        onClick={() => handleMenuButtonClick(orderId)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </button>
      <div
        ref={menuRef}
        className={`menu ${currentActiveId === orderId ? 'show' : ''}`}
      >
        <Link href={`/orders/${orderId}?storeId=${storeId}`}>
          <a className="view-link">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View Order
          </a>
        </Link>
        <Link href={`/orders/update?id=${orderId}?storeId=${storeId}`}>
          <a className="edit-link">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            Edit Order
          </a>
        </Link>
        <div className="order-status-buttons">
          <label
            htmlFor={`unfulfilled-${orderId}`}
            className={status === 'Unfulfilled' ? 'unfulfilled' : ''}
          >
            <input
              type="radio"
              name={`${orderId}`}
              id={`unfulfilled-${orderId}`}
              value="Unfulfilled"
              checked={status === 'Unfulfilled'}
              onChange={() => handleStatusChange('Unfulfilled')}
            />
            Unfulfilled
          </label>
          <label
            htmlFor={`fulfilled-${orderId}`}
            className={status === 'Fulfilled' ? 'fulfilled' : ''}
          >
            <input
              type="radio"
              name={`${orderId}`}
              id={`fulfilled-${orderId}`}
              value="Fulfilled"
              checked={status === 'Fulfilled'}
              onChange={() => handleStatusChange('Fulfilled')}
            />
            Fulfilled
          </label>
          <label
            htmlFor={`completed-${orderId}`}
            className={status === 'Completed' ? 'completed' : ''}
          >
            <input
              type="radio"
              name={`${orderId}`}
              id={`completed-${orderId}`}
              value="Completed"
              checked={status === 'Completed'}
              onChange={() => handleStatusChange('Completed')}
            />
            Completed
          </label>
        </div>
      </div>
    </OrdersTableMenuStyles>
  );
}

const OrdersTableMenuStyles = styled.div`
  .menu-button {
    margin-left: auto;
    padding: 0.125rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    color: #6b7280;
    cursor: pointer;

    &:hover {
      color: #111827;
    }

    svg {
      height: 1rem;
      width: 1rem;
    }
  }

  .menu {
    padding: 0 0.875rem;
    position: absolute;
    right: 1rem;
    top: 2.75rem;
    width: 11rem;
    display: none;
    flex-direction: column;
    align-items: flex-start;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px,
      rgba(0, 0, 0, 0.02) 0px 4px 6px -2px;

    &.show {
      display: flex;
      z-index: 100;
    }
  }

  .view-link,
  .edit-link {
    padding: 0.625rem 0 0.625rem 0.375rem;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    background-color: transparent;
    border: none;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    text-align: left;
    cursor: pointer;
    border-bottom: 1px solid #e5e7eb;

    &:hover {
      color: #111827;

      svg {
        color: #9ca3af;
      }
    }

    svg {
      height: 1rem;
      width: 1rem;
      color: #d1d5db;
    }
  }

  .order-status-buttons {
    display: flex;
    flex-direction: column;
    width: 100%;

    label {
      margin: 0;
      padding: 0.75rem 0.375rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      border-bottom: 1px solid #e5e7eb;
      cursor: pointer;

      &.unfulfilled,
      &:hover.unfulfilled {
        color: #b91c1c;
        z-index: 100;

        input {
          color: #b91c1c;

          &:focus {
            box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px,
              #ef4444 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
          }
        }
      }

      &.fulfilled,
      &:hover.fulfilled {
        color: #b45309;
        z-index: 100;

        input {
          color: #b45309;

          &:focus {
            box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px,
              #f59e0b 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
          }
        }
      }

      &.completed,
      &:hover.completed {
        color: #0e7490;
        z-index: 100;

        input {
          color: #0e7490;

          &:focus {
            box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px,
              #06b6d4 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
          }
        }
      }

      &:last-of-type {
        border-bottom: none;
      }

      &:hover {
        color: #111827;
      }
    }

    input[type='radio'] {
      height: 0.875rem;
      width: 0.875rem;
    }
  }
`;
