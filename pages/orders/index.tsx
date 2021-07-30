import styled from 'styled-components';
import Layout from '../../components/Layout';
import OrdersTable from '../../components/OrdersTable';

export default function Orders() {
  return (
    <Layout>
      <OrdersStyles>
        <div className="title">
          <div className="details">
            <h2>Orders</h2>
          </div>
        </div>
        <div className="main-content">
          <OrdersTable />
        </div>
      </OrdersStyles>
    </Layout>
  );
}

const OrdersStyles = styled.div`
  .title {
    padding: 1.625rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
  }

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
    padding: 2rem 3rem;
    position: relative;
  }
`;
