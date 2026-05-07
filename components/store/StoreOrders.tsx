import React from 'react';
import styled from 'styled-components';

import { Order, StoreWithOrderStatusTotals } from '../../interfaces';
import {
  filterOrdersByView,
  getStoresOrderStatusNumbers,
  OrderView,
  OrderViewOption,
} from '../../utils/store';

import OrdersTable from '../order/OrdersTable';

type Props = {
  store: StoreWithOrderStatusTotals;
  selectedOrder: Order | undefined;
  setSelectedOrder: React.Dispatch<React.SetStateAction<Order | undefined>>;
  setPrintOption: React.Dispatch<
    React.SetStateAction<
      'unfulfilled' | 'personalization' | 'single' | undefined
    >
  >;
  showCancelOrderModal: boolean;
  setShowCancelOrderModal: React.Dispatch<React.SetStateAction<boolean>>;
  openTriggerStoreShipmentModal: () => void;
  viewOptions: OrderViewOption[];
  selectedView: OrderView | undefined;
  setSelectedView: (view: OrderView) => void;
};

export default function StoreOrders({
  viewOptions,
  selectedView,
  setSelectedView,
  ...props
}: Props) {
  const { viewOrders, viewOrderStatusTotals } = React.useMemo(() => {
    if (!props.store.orders || selectedView === undefined) {
      return {
        viewOrders: props.store.orders,
        viewOrderStatusTotals: props.store.orderStatusTotals,
      };
    }
    const filtered = filterOrdersByView(props.store.orders, selectedView);
    return {
      viewOrders: filtered,
      viewOrderStatusTotals: getStoresOrderStatusNumbers({
        ...props.store,
        orders: filtered,
      }),
    };
  }, [props.store, selectedView]);

  return (
    <StoreOrdersStyles id="orders">
      {props.store.orders ? (
        <OrdersTable
          {...props}
          viewOrders={viewOrders}
          viewOrderStatusTotals={viewOrderStatusTotals}
          viewOptions={viewOptions}
          selectedView={selectedView}
          setSelectedView={setSelectedView}
        />
      ) : (
        <div className="empty">This store has no orders.</div>
      )}
    </StoreOrdersStyles>
  );
}

const StoreOrdersStyles = styled.div`
  margin: 4rem 0;

  .empty {
    margin: 2rem 0 0;
    font-size: 1rem;
    font-weight: 500;
    color: #89909d;
  }
`;
