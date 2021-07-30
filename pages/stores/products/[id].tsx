import { useRouter } from 'next/router';
import styled from 'styled-components';
import Layout from '../../../components/Layout';

const ProductStyles = styled.div``;

export default function Product() {
  const router = useRouter();

  return (
    <Layout>
      <div className="wrapper">
        <h3>Product - {router.query.id}.</h3>
      </div>
    </Layout>
  );
}
