import { useQuery } from 'react-query';
import styled from 'styled-components';
import { Order } from '../../interfaces';
import Layout from '../../components/Layout';

const OrdersStyles = styled.div`
  .title {
    padding: 1.625rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;

    h2 {
      margin: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.375rem;
      font-weight: 600;
      color: #111827;
    }

    h3 {
      margin: 0 0 1rem;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    h4 {
      margin: 0 0 1rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
    }

    .main-content {
      padding: 4rem 3rem;
      position: relative;
    }

    .wrapper {
      width: 100%;
    }
  }
`;

export default function Orders() {
  const {
    isLoading,
    isError,
    data: orders,
    error,
  } = useQuery<Order[]>('orders', async () => {
    const response = await fetch('/api/orders');

    if (!response.ok) {
      throw new Error('Failed to fetch the orders.');
    }

    const data = await response.json();
    return data.orders;
  });
  return (
    <Layout>
      <OrdersStyles>
        {isLoading && <div>Loading Orders...</div>}
        {isError && error instanceof Error && (
          <>
            <div className="title">
              <div className="details">
                <h2>Order Error!</h2>
              </div>
            </div>
            <div className="main-content">
              <div className="wrapper">
                <div>Error: {error.message}</div>
              </div>
            </div>
          </>
        )}
        {orders && (
          <>
            <div className="title">
              <div className="details">
                <h2>Orders</h2>
              </div>
            </div>
            <div className="main-content">
              <div className="wrapper">
                <pre>{JSON.stringify(orders, null, 2)}</pre>
              </div>
            </div>
          </>
        )}
      </OrdersStyles>
    </Layout>
  );
}
