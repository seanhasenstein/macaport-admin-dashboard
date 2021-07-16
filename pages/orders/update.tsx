import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { Order } from '../../interfaces';
import Layout from '../../components/Layout';

const UpdateOrderStyles = styled.div`
  .title {
    padding: 1.625rem 2.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  h2 {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 600;
    color: #111827;
  }

  h3 {
    margin: 0 0 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  .main-content {
    padding: 3.5rem 3rem;
    position: relative;
  }

  .error {
    font-size: 1.125rem;
    font-weight: 500;
    color: #1f2937;
  }
`;

export default function UpdateOrder() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    isLoading,
    isError,
    data: order,
    error,
  } = useQuery<Order>(['order', router.query.id], async () => {
    if (!router.query.id) return;
    const response = await fetch(`/api/orders/${router.query.id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch the order.');
    }

    const data = await response.json();
    return data.order;
  });

  const mutation = useMutation(
    async (order: Order) => {
      const response = await fetch(`/api/orders/update?id=${router.query.id}`, {
        method: 'POST',
        body: JSON.stringify(order),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update the order.');
      }

      const data = await response.json();
      return data.order;
    },
    {
      onSuccess: data => {
        queryClient.invalidateQueries('orders');
        queryClient.invalidateQueries('order', data._id);
        router.push(`/orders/${data._id}`);
      },
    }
  );

  return (
    <Layout>
      <UpdateOrderStyles>
        {isLoading && <div>Loading Order...</div>}
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
        {order && (
          <>
            <div className="title">
              <h2>Order #{order.orderId}</h2>
            </div>
            <div className="main-content">
              <pre>{JSON.stringify(order, null, 2)}</pre>
            </div>
          </>
        )}
      </UpdateOrderStyles>
    </Layout>
  );
}
