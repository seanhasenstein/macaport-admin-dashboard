import styled from 'styled-components';
import { Store } from '../../interfaces';
import OrdersTable from '../order/OrdersTable';

type Props = {
  store: Store;
};

export default function StoreOrders(props: Props) {
  return (
    <StoreOrdersStyles id="orders">
      <h3>Store orders</h3>
      {props.store.orders ? (
        <OrdersTable store={props.store} />
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
