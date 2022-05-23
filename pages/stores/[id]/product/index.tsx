import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { getQueryParameter } from '../../../../utils';
import { useSession } from '../../../../hooks/useSession';
import { useStoreProductQuery } from '../../../../hooks/useStoreProductQuery';
import { useStoreProductMutations } from '../../../../hooks/useStoreProductMutations';
import Layout from '../../../../components/Layout';
import StoreProductColors from '../../../../components/storeProduct/StoreProductColors';
import StoreProductSkusTable from '../../../../components/storeProduct/StoreProductSkusTable';
import Notes from '../../../../components/Notes';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import Notification from '../../../../components/Notification';
import StoreProductMenu from '../../../../components/storeProduct/StoreProductMenu';
import StoreProductDetails from '../../../../components/storeProduct/StoreProductDetails';
import StoreProductPersonzalization from '../../../../components/storeProduct/StoreProductPersonalization';
import DeleteStoreProductModal from '../../../../components/storeProduct/DeleteStoreProductModal';

export default function Product() {
  const [session, loading] = useSession({ required: true });
  const router = useRouter();
  const {
    isLoading,
    isFetching,
    isError,
    error,
    data: storeProduct,
  } = useStoreProductQuery();
  const { deleteProduct, addNote, updateNote, deleteNote } =
    useStoreProductMutations({ storeProduct });
  const [showDeleteProductModal, setShowDeleteProductModal] =
    React.useState(false);

  if (loading || !session) return <div />;

  return (
    <Layout title="Store Product | Macaport Dashboard">
      <ProductStyles>
        <div className="container">
          {isLoading && <LoadingSpinner isLoading={isLoading} />}
          {isError && error instanceof Error && <div>Error: {error}</div>}
          {storeProduct && (
            <>
              <div className="actions-row">
                <Link href={`/stores/${router.query.id}`}>
                  <a className="back-link">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Back to store
                  </a>
                </Link>
                <StoreProductMenu
                  setShowDeleteProductModal={setShowDeleteProductModal}
                />
              </div>

              <div className="header">
                <div className="category">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  <div>Store Product</div>
                </div>
                <h2>{storeProduct.name}</h2>
                <p>{storeProduct.id}</p>
              </div>

              <div className="main-content">
                <FetchingSpinner isLoading={isFetching} />
                <StoreProductDetails storeProduct={storeProduct} />
                <StoreProductPersonzalization storeProduct={storeProduct} />
                <StoreProductSkusTable
                  storeId={getQueryParameter(router.query.id)}
                  storeProduct={storeProduct}
                  productSkus={storeProduct.productSkus}
                  inventoryProductId={storeProduct.inventoryProductId}
                />
                <StoreProductColors product={storeProduct} />
                <Notes
                  label="Store product"
                  notes={storeProduct.notes}
                  addNote={addNote}
                  updateNote={updateNote}
                  deleteNote={deleteNote}
                />
              </div>
            </>
          )}
        </div>
      </ProductStyles>

      <Notification
        query="updateProduct"
        heading="Product successfully updated"
        callbackUrl={`/stores/${router.query.id}/product?pid=${router.query.pid}`}
      />

      {showDeleteProductModal && storeProduct && (
        <DeleteStoreProductModal
          storeProduct={storeProduct}
          showModal={showDeleteProductModal}
          setShowModal={setShowDeleteProductModal}
          deleteProduct={deleteProduct}
        />
      )}
    </Layout>
  );
}

const ProductStyles = styled.div`
  position: relative;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }

  h3 {
    margin: 0 0 1.25rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  h4 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  p {
    margin: 0;
    color: #4b5563;
    line-height: 1.65;
  }

  .container {
    position: relative;
    margin: 0 auto;
    padding: 3rem 0 0;
    max-width: 74rem;
    width: 100%;
  }

  .actions-row {
    margin: 0 0 2.5rem;
    display: flex;
    justify-content: space-between;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 500;
    color: #4b5563;

    svg {
      margin: 1px 0 0;
      height: 1rem;
      width: 1rem;
      color: #9ca3af;
    }

    &:hover {
      color: #1f2937;
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      text-decoration: underline;
      color: #1c44b9;

      svg {
        color: #1c44b9;
      }
    }
  }

  .header {
    padding: 0.5rem 0 1.5rem;

    .category {
      margin: 0 0 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #374151;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;

      svg {
        height: 0.9375rem;
        width: 0.9375rem;
        color: #9ca3af;
      }
    }

    p {
      margin: 0.25rem 0 0;
      font-size: 1rem;
      font-weight: 500;
      color: #6b7280;
    }
  }

  .main-content {
    position: relative;
    margin: 0 0 3.5rem;
  }

  .section {
    margin: 3.5rem 0 0;
  }

  .section-title {
    margin: 0 0 0.875rem;
    padding: 0 0 0.75rem;
    border-bottom: 1px solid #dcdfe4;
  }
`;

const FetchingSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 3.25rem;
  right: 0;
`;
