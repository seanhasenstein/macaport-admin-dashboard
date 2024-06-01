import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';

import { getQueryParameter } from '../../../../utils';

import { useStoreProductQuery } from '../../../../hooks/useStoreProductQuery';
import { useStoreProductMutations } from '../../../../hooks/useStoreProductMutations';

import Layout from '../../../../components/Layout';
import StoreProductColors from '../../../../components/storeProduct/StoreProductColors';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import Notification from '../../../../components/Notification';
import StoreProductMenu from '../../../../components/storeProduct/StoreProductMenu';
import StoreProductDetails from '../../../../components/storeProduct/StoreProductDetails';
import StoreProductPersonzalization from '../../../../components/storeProduct/StoreProductPersonalization';
import DeleteStoreProductModal from '../../../../components/storeProduct/DeleteStoreProductModal';

export default function Product() {
  const router = useRouter();
  const {
    isLoading,
    isFetching,
    isError,
    error,
    data: storeProduct,
  } = useStoreProductQuery();
  const { deleteProduct } = useStoreProductMutations({ storeProduct });
  const [showDeleteProductModal, setShowDeleteProductModal] =
    React.useState(false);

  return (
    <Layout title="Store Product | Macaport Dashboard" requiresAuth={true}>
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
                <div className="product-image">
                  <img
                    src={
                      storeProduct.colors.find(c => c.primaryImage)
                        ?.primaryImage
                    }
                    alt={storeProduct.name}
                  />
                </div>
                <div className="product-details">
                  <p className="category">Store Product</p>
                  <p className="product-name">{storeProduct.name}</p>
                </div>
              </div>

              <div className="main-content">
                <FetchingSpinner isLoading={isFetching} />
                <StoreProductDetails storeProduct={storeProduct} />
                <StoreProductPersonzalization storeProduct={storeProduct} />
                <StoreProductColors
                  product={storeProduct}
                  storeId={getQueryParameter(router.query.id)}
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
    padding: 1.25rem 1.625rem 1.25rem 1.25rem;
    display: inline-flex;
    gap: 0 1.1875rem;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

    .product-image {
      padding-right: 1.25rem;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 4.25rem;
      background-color: #fff;
      border-radius: 0.125rem;
      border-right: 1px solid #e5e7eb;

      img {
        width: 100%;
        height: auto;
      }
    }

    .product-details {
      .category {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #6b7280;
        font-size: 0.875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.035em;
        line-height: 100%;
      }

      .product-name {
        margin: 0.9rem 0 0;
        font-size: 1.25rem;
        font-weight: 800;
        color: #1f2937;
        letter-spacing: -0.025em;
        line-height: 100%;
      }
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
    border-bottom: 1px solid #d1d5db;
  }
`;

const FetchingSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 3.25rem;
  right: 0;
`;
