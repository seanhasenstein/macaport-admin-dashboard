import styled from 'styled-components';

import { Order, StoreWithOrderStatusTotals } from '../../interfaces';

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
  setShowCancelOrderModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function StoreOrders(props: Props) {
  const {
    store,
    selectedOrder,
    setSelectedOrder,
    setPrintOption,
    setShowCancelOrderModal,
  } = props;
  return (
    <StoreOrdersStyles id="orders">
      <h3>Store orders</h3>
      {store.orders ? (
        <OrdersTable
          {...{
            store,
            selectedOrder,
            setSelectedOrder,
            setPrintOption,
            setShowCancelOrderModal,
          }}
        />
      ) : (
        <div className="empty">This store has no orders.</div>
      )}
    </StoreOrdersStyles>
  );
}

const StoreOrdersStyles = styled.div`
  margin: 4.25rem 0 0;

  .empty {
    margin: 2rem 0 0;
    font-size: 1rem;
    font-weight: 500;
    color: #89909d;
  }
`;
