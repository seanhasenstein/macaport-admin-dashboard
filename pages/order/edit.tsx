import { GetServerSideProps } from 'next';
import { ObjectID } from 'mongodb';
import styled from 'styled-components';
import { connectToDb, order } from '../../db';
import Layout from '../../components/Layout';
import { Order } from '../../interfaces';

const EditStoreStyles = styled.div`
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

type Props = {
  order: Order;
  error: string;
};

export default function EditOrder({ order, error }: Props) {
  console.log(order);
  if (error) {
    return (
      <Layout>
        <EditStoreStyles>
          <div className="title">
            <h2>Edit Order Error</h2>
          </div>
          <div className="main-content">
            <h3 className="error">Error: {error}</h3>
          </div>
        </EditStoreStyles>
      </Layout>
    );
  }

  return (
    <Layout>
      <EditStoreStyles>
        <div className="title">
          <h2>Order #{order.orderId}</h2>
        </div>
        <div className="main-content">
          <pre>{JSON.stringify(order, null, 2)}</pre>
        </div>
      </EditStoreStyles>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  try {
    if (context.query.id === undefined) {
      throw new Error('A Store ID must be provided.');
    }

    const id = Array.isArray(context.query.id)
      ? context.query.id[0]
      : context.query.id;
    const { db } = await connectToDb();
    const result = await order.getOrder(db, { _id: new ObjectID(id) });
    return {
      props: {
        order: result,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        error: error.message,
      },
    };
  }
};
