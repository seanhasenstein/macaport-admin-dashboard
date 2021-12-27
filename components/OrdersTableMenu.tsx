import React from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { Order, OrderStatus, Store } from '../interfaces';

type Props = {
  store: Store;
  order: Order;
  currentActiveId: string | undefined;
  setCurrentActiveId: React.Dispatch<React.SetStateAction<string | undefined>>;
  orderStatus: OrderStatus;
};

export default function OrdersTableMenu({
  store,
  order,
  currentActiveId,
  setCurrentActiveId,
  orderStatus,
}: Props) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const updateOrderStatusMutation = useMutation(
    async (newStatus: OrderStatus) => {
      const response = await fetch(
        `/api/orders/update/status?sid=${store._id}&oid=${order.orderId}`,
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
      onMutate: async newStatus => {
        await queryClient.cancelQueries([
          'stores',
          'store',
          'order',
          order.orderId,
        ]);
        const updatedOrder = { ...order, orderStatus: newStatus };
        const updatedOrders = store.orders.map(o => {
          if (o.orderId === order.orderId) {
            return updatedOrder;
          }
          return o;
        });
        const updatedStore = { ...store, orders: updatedOrders };
        queryClient.setQueryData(['stores', 'store', store._id], updatedStore);
        return { previousStatus: order.orderStatus, updatedStatus: newStatus };
      },
      onError: () => {
        // TODO: trigger a notification
        queryClient.setQueryData(['stores', 'store', store._id], store);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['stores', 'store', store._id]);
        queryClient.invalidateQueries([
          'stores',
          'store',
          'order',
          order.orderId,
        ]);
      },
    }
  );

  React.useEffect(() => {
    const handleEscapeKeyup = (e: KeyboardEvent) => {
      if (e.code === 'Escape') setCurrentActiveId(undefined);
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        currentActiveId === order.orderId &&
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
  }, [currentActiveId, order.orderId, setCurrentActiveId]);

  const handleMenuButtonClick = (id: string) => {
    if (currentActiveId === id) {
      setCurrentActiveId(undefined);
    } else {
      setCurrentActiveId(id);
    }
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateOrderStatusMutation.mutate(newStatus);
    setCurrentActiveId(undefined);
  };

  return (
    <OrdersTableMenuStyles>
      <button
        type="button"
        className="order-menu-button"
        onClick={() => handleMenuButtonClick(order.orderId)}
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
        className={`menu ${currentActiveId === order.orderId ? 'show' : ''}`}
      >
        <Link href={`/orders/${order.orderId}?sid=${store._id}`}>
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
        <Link href={`/orders/update?id=${order.orderId}&sid=${store._id}`}>
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
            htmlFor={`unfulfilled-${order.orderId}`}
            className={status === 'Unfulfilled' ? 'unfulfilled' : ''}
          >
            <input
              type="radio"
              name={`${order.orderId}`}
              id={`unfulfilled-${order.orderId}`}
              value="Unfulfilled"
              checked={orderStatus === 'Unfulfilled'}
              onChange={() => handleStatusChange('Unfulfilled')}
            />
            Unfulfilled
          </label>
          <label
            htmlFor={`fulfilled-${order.orderId}`}
            className={status === 'Fulfilled' ? 'fulfilled' : ''}
          >
            <input
              type="radio"
              name={`${order.orderId}`}
              id={`fulfilled-${order.orderId}`}
              value="Fulfilled"
              checked={orderStatus === 'Fulfilled'}
              onChange={() => handleStatusChange('Fulfilled')}
            />
            Fulfilled
          </label>
          <label
            htmlFor={`completed-${order.orderId}`}
            className={status === 'Completed' ? 'completed' : ''}
          >
            <input
              type="radio"
              name={`${order.orderId}`}
              id={`completed-${order.orderId}`}
              value="Completed"
              checked={orderStatus === 'Completed'}
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
  position: relative;

  .order-menu-button {
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
    padding: 0 1rem;
    position: absolute;
    right: -0.5rem;
    top: 1.625rem;
    width: 11rem;
    display: none;
    flex-direction: column;
    align-items: flex-start;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
      rgba(17, 24, 39, 0.05) 0px 0px 0px 1px,
      rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;

    &.show {
      display: flex;
      z-index: 100;
    }
  }

  .view-link,
  .edit-link {
    padding: 0.75rem 2rem 0.75rem 0;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: transparent;
    border: none;
    font-size: 0.875rem;
    font-weight: 400;
    color: #111827;
    text-align: left;
    cursor: pointer;
    border-bottom: 1px solid #e5e7eb;

    &:hover {
      color: #4338ca;

      svg {
        color: #4338ca;
      }
    }

    svg {
      height: 1rem;
      width: 1rem;
      color: #9ca3af;
    }
  }

  .order-status-buttons {
    display: flex;
    flex-direction: column;
    width: 100%;

    label {
      margin: 0;
      padding: 0.75rem 2rem 0.75rem 0;
      display: flex;
      align-items: center;
      gap: 0.5625rem;
      font-size: 0.875rem;
      font-weight: 400;
      color: #111827;
      line-height: 1;
      border-bottom: 1px solid #e5e7eb;
      cursor: pointer;

      &.unfulfilled,
      &:hover.unfulfilled {
        color: #7f1d1d;
        font-weight: 500;
        z-index: 100;

        input {
          color: #dc2626;

          &:focus {
            box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px,
              #dc2626 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
          }
        }
      }

      &.fulfilled,
      &:hover.fulfilled {
        color: #713f12;
        font-weight: 500;
        z-index: 100;

        input {
          color: #eab308;

          &:focus {
            box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px,
              #eab308 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
          }
        }
      }

      &.completed,
      &:hover.completed {
        color: #064e3b;
        font-weight: 500;
        z-index: 100;

        input {
          color: #10b981;

          &:focus {
            box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px,
              #10b981 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
          }
        }
      }

      &:last-of-type {
        border-bottom: none;
      }

      &:hover {
        color: #4338ca;
      }
    }

    input[type='radio'] {
      height: 0.875rem;
      width: 0.875rem;
    }
  }
`;
