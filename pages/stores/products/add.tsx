import { useRouter } from 'next/router';
import Link from 'next/link';
import { Formik, Form, Field, FieldArray } from 'formik';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { Size } from '../../../interfaces';
import { createId } from '../../../utils';
import BasicLayout from '../../../components/BasicLayout';
import { ChangeEvent } from 'mongodb';
import React from 'react';

const initialValues = {
  id: createId('prod'),
  productName: '',
  description: '',
  tag: '',
  details: [],
  sizes: [],
  colors: [],
};

export default function AddProduct() {
  const router = useRouter();
  const [primaryImage, setPrimaryImage] = React.useState();
  const queryClient = useQueryClient();
  const productsQuery = useQuery(['store', router.query.id], async () => {
    if (!router.query.id) return;
    const response = await fetch(`/api/stores/${router.query.id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch the store.');
    }

    const data = await response.json();
    return data.store;
  });
  const addProductMutation = useMutation(
    async () => {
      const productId = createId('prod');
      const colorId = createId('col');
      const sizeId = createId('size');
      const product = {
        id: productId,
        productName: 'Cotton Short Sleeve T-Shirt',
        description: 'This is the descriptio...',
        details: ['Made in the USA', '100% Cotton'],
        tag: 'Adult Sizes',
        sizes: [
          {
            id: sizeId,
            label: 'S',
            price: 1500,
          },
        ],
        colors: [
          {
            id: colorId,
            label: 'Gray',
            hex: 'dddddd',
            primaryImage: 'www.image.com',
            secondaryImages: [],
          },
        ],
        skus: [
          {
            id: createId('sku'),
            productId,
            color: {
              id: colorId,
              label: 'Gray',
            },
            size: {
              id: sizeId,
              label: 'S',
              price: 1500,
            },
          },
        ],
      };

      const prevProducts = productsQuery.data.products || [];

      const response = await fetch(`/api/stores/update?id=${router.query.id}`, {
        method: 'post',
        body: JSON.stringify({
          products: [...prevProducts, product],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to add the product.');
      }

      const data = await response.json();
      return data.store;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stores');
        queryClient.invalidateQueries(['store', router.query.id]);
        router.push(`/stores/${router.query.id}#products`);
      },
    }
  );

  const handlePrimaryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) {
      throw new Error('');
    }
    setPrimaryImage(e.target.files[0]);
  };

  return (
    <BasicLayout>
      <AddProductStyles>
        <div className="title">
          <div>
            <Link href={`/stores/${router.query.id}#products`}>
              <a className="cancel-link">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </a>
            </Link>
            <h2>Add a product</h2>
          </div>
          <div className="save-buttons">
            <button
              type="button"
              className="secondary-button"
              // onClick={() =>
              //   addProductMutation.mutate({
              //     ...values,
              //     redirectTo: 'add_product',
              //   })
              // }
            >
              Save and add another
            </button>
            <button
              type="button"
              className="primary-button"
              // onClick={() => addProductMutation.mutate(values)}
            >
              Save product
            </button>
          </div>
        </div>
        <div className="main-content">
          <div className="form-container">
            <Formik
              initialValues={initialValues}
              onSubmit={() => console.log('submitting...')}
            >
              {({ values }) => (
                <Form>
                  <div className="section">
                    <h3>Product information</h3>
                    <div className="item">
                      <label htmlFor="productName">Product name</label>
                      <Field name="productName" id="productName" />
                    </div>
                    <div className="item">
                      <label htmlFor="description">Product description</label>
                      <Field
                        as="textarea"
                        name="description"
                        id="description"
                      />
                    </div>
                    <div className="item">
                      <label htmlFor="tag">Product tag</label>
                      <Field
                        name="tag"
                        id="tag"
                        placeholder="i.e. Adult Sizes"
                      />
                    </div>
                  </div>
                  <div className="section">
                    <h3>Product details</h3>
                    <FieldArray
                      name="details"
                      render={arrayHelpers => (
                        <>
                          {values.details.length > 0 &&
                            values.details.map((d: string, i) => (
                              <div key={i} className="details-item">
                                <div className="item">
                                  <label htmlFor={`details.${i}`}>
                                    Detail {i + 1}
                                  </label>
                                  <Field
                                    name={`details.${i}`}
                                    id={`details.${i}`}
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="remove-button"
                                  onClick={() => arrayHelpers.remove(i)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="sr-only">Remove detail</span>
                                </button>
                              </div>
                            ))}
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => arrayHelpers.push('')}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Add a{values.details.length > 0 ? 'nother' : ''}{' '}
                            detail
                          </button>
                        </>
                      )}
                    />
                  </div>
                  <div className="section">
                    <h3>Product sizes</h3>
                    <FieldArray
                      name="sizes"
                      render={arrayHelpers => (
                        <>
                          {values.sizes.length > 0 &&
                            values.sizes.map((s: Size, i) => (
                              <div key={i} className="size-item">
                                <div>
                                  <div className="item">
                                    <label htmlFor={`sizes.${i}.label`}>
                                      Size label
                                    </label>
                                    <Field
                                      name={`sizes.${i}.label`}
                                      id={`sizes.${i}.label`}
                                    />
                                  </div>
                                  <div className="item">
                                    <label htmlFor={`sizes.${i}.price`}>
                                      Size price
                                    </label>
                                    <Field
                                      name={`sizes.${i}.price`}
                                      id={`sizes.${i}.price`}
                                    />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="remove-button"
                                  onClick={() => arrayHelpers.remove(i)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="sr-only">Remove size</span>
                                </button>
                              </div>
                            ))}
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              arrayHelpers.push({
                                id: createId('size'),
                                label: '',
                                price: '',
                              })
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Add a{values.sizes.length > 0 ? 'nother' : ''} size
                          </button>
                        </>
                      )}
                    />
                  </div>
                  <div className="section">
                    <h3>Product colors</h3>
                    <FieldArray
                      name="colors"
                      render={arrayHelpers => (
                        <>
                          {values.colors.length > 0 &&
                            values.colors.map((s: Size, i) => (
                              <div key={i} className="color-item">
                                <div>
                                  <div className="item">
                                    <label htmlFor={`colors.${i}.label`}>
                                      Color label
                                    </label>
                                    <Field
                                      name={`colors.${i}.label`}
                                      id={`colors.${i}.label`}
                                    />
                                  </div>
                                  <div className="item">
                                    <label htmlFor={`colors.${i}.hex`}>
                                      Hex color value
                                    </label>
                                    <Field
                                      name={`colors.${i}.hex`}
                                      id={`colors.${i}.hex`}
                                      placeholder="i.e. #ffffff"
                                    />
                                  </div>
                                  <div className="item">
                                    <label htmlFor={`colors.${i}.primaryImage`}>
                                      Primary image
                                    </label>
                                    <input
                                      type="file"
                                      accept="image/png, image/jpeg"
                                      name={`colors.${i}.primaryImage`}
                                      id={`colors.${i}.primaryImage`}
                                      onChange={handlePrimaryImageChange}
                                    />
                                  </div>
                                  <div className="item">
                                    <p>TODO: add secondary images...</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="remove-button"
                                  onClick={() => arrayHelpers.remove(i)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="sr-only">Remove color</span>
                                </button>
                              </div>
                            ))}
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              arrayHelpers.push({
                                id: createId('color'),
                                label: '',
                                hex: '',
                                primaryImage: '',
                                secondaryImages: [],
                              })
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Add a{values.colors.length > 0 ? 'nother' : ''}{' '}
                            color
                          </button>
                        </>
                      )}
                    />
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </AddProductStyles>
    </BasicLayout>
  );
}

const AddProductStyles = styled.div`
  .title {
    padding: 1.5rem 2.5rem;
    position: fixed;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    border-bottom: 1px solid #e5e7eb;
    z-index: 100;

    > div {
      display: flex;
      align-items: center;
    }

    .cancel-link {
      padding: 0.375rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #fff;
      border: none;
      color: #6b7280;
      cursor: pointer;

      &:hover {
        color: #111827;
      }

      svg {
        height: 1.125rem;
        width: 1.125rem;
      }
    }

    h2 {
      margin: 0 0 0 0.75rem;
      padding: 0 0 0 1.125rem;
      border-left: 1px solid #d1d5db;
    }

    .save-buttons {
      margin: 0;
      display: flex;
      gap: 0.875rem;
    }
  }

  .secondary-button,
  .primary-button {
    padding: 0.5rem 1.125rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    border-radius: 0.3125rem;
    cursor: pointer;
  }

  .secondary-button {
    background-color: #fff;
    border: 1px solid #d1d5db;
    color: #374151;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px 0px,
      rgba(0, 0, 0, 0.02) 0px 1px 1px 0px;

    &:hover {
      background-color: #f9fafb;
      color: #111827;

      svg {
        color: #6b7280;
      }
    }

    svg {
      height: 1rem;
      width: 1rem;
      color: #9ca3af;
    }
  }

  .primary-button {
    background-color: #4f46e5;
    color: #fff;
    border: 1px solid transparent;

    &:hover {
      background-color: #4338ca;
    }
  }

  h2 {
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 500;
    color: #111827;
    line-height: 1;
  }

  h3 {
    margin: 0 0 2.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  h4 {
    margin: 0 0 1.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
  }

  p {
    margin: 0 0 2rem;
    font-size: 0.9375rem;
    color: #6b7280;
    line-height: 1.5;
  }

  .main-content {
    padding: 10rem 3rem 3rem;
    position: relative;
  }

  .form-container {
    margin: 0 auto;
    width: 32rem;
  }

  .section {
    padding: 3rem 0;
  }

  .grid-col-1 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .grid-col-2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
    gap: 1rem;
  }

  .grid-col-3 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
    gap: 1rem;
  }

  .open-date-inputs {
    margin: 0.75rem 0 0;
  }

  .item {
    margin: 0 0 1.5rem;
    display: flex;
    flex-direction: column;
  }

  .details-item {
    display: grid;
    grid-template-columns: 1fr 2rem;
    gap: 0.5rem;
    align-items: center;
  }

  .size-item,
  .color-item {
    padding: 2.5rem 0;
    display: grid;
    grid-template-columns: 1fr 2rem;
    gap: 2rem;
    border-bottom: 1px solid #e5e7eb;

    &:first-of-type {
      padding-top: 0;
    }

    &:last-of-type {
      border-bottom: none;
    }
  }

  .remove-button {
    padding: 0.125rem 0.375rem;
    height: 1.875rem;
    width: 1.875rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: 1px solid transparent;
    color: #6b7280;
    border-radius: 0.25rem;
    cursor: pointer;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0) 0px 1px 2px 0px;

    &:hover {
      color: #374151;
      border-color: #e5e7eb;
      box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
        rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
    }
  }
`;
