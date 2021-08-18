import styled from 'styled-components';
import { useSession } from '../../hooks/useSession';
import Layout from '../../components/Layout';

export default function Orders() {
  const [session, sessionLoading] = useSession({ required: true });

  if (sessionLoading || !session) return <div />;

  return (
    <Layout>
      <OrdersStyles>
        <div className="title">
          <div className="details">
            <h2>Orders</h2>
          </div>
        </div>
        <div className="main-content">
          TODO: what is the best way to format this page? All orders? Orders
          separated by store? Do we need this page?
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
