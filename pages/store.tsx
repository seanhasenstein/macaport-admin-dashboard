import { GetServerSideProps } from 'next';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { connectToDb, store } from '../db';
import { Store as StoreInterface } from '../interfaces';

const StoreStyles = styled.div`
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
  store: StoreInterface;
  error: string;
};

export default function Store({ store, error }: Props) {
  if (error) {
    return (
      <Layout>
        <StoreStyles>
          <div className="title">
            <h2>Store Error</h2>
          </div>
          <div className="main-content">
            <h3 className="error">Error: {error}</h3>
          </div>
        </StoreStyles>
      </Layout>
    );
  }

  return (
    <Layout>
      <StoreStyles>
        <div className="title">
          <h2>{store.name} Store</h2>
        </div>
        <div className="main-content">
          <pre>{JSON.stringify(store, null, 2)}</pre>
        </div>
      </StoreStyles>
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
    const result = await store.getStore(db, id);
    return {
      props: {
        store: result,
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
