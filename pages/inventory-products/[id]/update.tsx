import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import { useSession } from '../../../hooks/useSession';
import { InventoryProduct, InventorySize } from '../../../interfaces';
import { createId, formatHexColors } from '../../../utils';
import {
  updateInventoryProductSkus,
  UpdateFormValues,
} from '../../../utils/inventoryProduct';
import BasicLayout from '../../../components/BasicLayout';

export default function UpdateInventoryProduct() {
  const [session, sessionLoading] = useSession({ required: true });
  const router = useRouter();
  const queryClient = useQueryClient();
  const [initialValues, setInitialValues] = React.useState<UpdateFormValues>({
    _id: '',
    inventoryProductId: '',
    merchandiseCode: '',
    name: '',
    description: '',
    tag: '',
    details: [],
    sizes: [],
    colors: [],
    skus: [],
  });

  const inventoryProductQuery = useQuery<InventoryProduct>(
    ['inventory-products', 'inventory-product', router.query.id],
    async () => {
      if (!router.query.id) return;
      const response = await fetch(
        `/api/inventory-products/${router.query.id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch the inventory product.');
      }

      const data = await response.json();
      return data.inventoryProduct;
    },
    {
      initialData: () => {
        return queryClient
          .getQueryData<InventoryProduct[]>(['inventory-products'])
          ?.find(ip => ip.inventoryProductId === router.query.id);
      },
      initialDataUpdatedAt: () =>
        queryClient.getQueryState(['inventory-products'])?.dataUpdatedAt,
      staleTime: 1000 * 60 * 10,
    }
  );

  const updateInventoryProductMutation = useMutation(
    async (values: UpdateFormValues) => {
      const formattedColors = formatHexColors(values.colors);
      const response = await fetch('/api/inventory-products/update-form', {
        method: 'post',
        body: JSON.stringify({ ...values, colors: formattedColors }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update the inventory product.');
      }

      const data = await response.json();
      return data.inventoryProduct;
    },
    {
      onMutate: values => {
        queryClient.cancelQueries([
          'inventory-products',
          'inventory-product',
          router.query.id,
        ]);
        const updatedInventoryProduct = {
          ...inventoryProductQuery.data,
          ...values,
        };
        queryClient.setQueryData(
          ['inventory-products', 'inventory-product', router.query.id],
          updatedInventoryProduct
        );
        return updatedInventoryProduct;
      },
      onError: () => {
        queryClient.setQueryData(
          ['inventory-products', 'inventory-product', router.query.id],
          inventoryProductQuery.data
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries('inventory-products');
        queryClient.invalidateQueries('stores');
      },
      onSuccess: (_data, variables) => {
        router.push(`/inventory-products/${variables.inventoryProductId}`);
      },
    }
  );

  React.useEffect(() => {
    if (inventoryProductQuery.data) {
      const ip = inventoryProductQuery.data;

      setInitialValues({
        _id: ip._id,
        inventoryProductId: ip.inventoryProductId,
        merchandiseCode: ip.merchandiseCode,
        name: ip.name,
        description: ip.description,
        tag: ip.tag,
        details: ip.details,
        sizes: ip.sizes,
        colors: ip.colors,
        skus: ip.skus,
      });
    }
  }, [inventoryProductQuery.data]);

  const handleAddClick = async (callback: () => void, selector: string) => {
    await callback();
    document.querySelector<HTMLInputElement>(selector)?.focus();
  };

  if (sessionLoading || !session) return <div />;

  if (!inventoryProductQuery.data) {
    return <div>Failed to get the inventory product.</div>;
  }

  return (
    <BasicLayout title={`Update Inventory Product ${router.query.id}`}>
      <UpdateInventoryProductStyles>
        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          onSubmit={async (values: UpdateFormValues) => {
            const updatedSkus = updateInventoryProductSkus(
              inventoryProductQuery.data,
              values
            );
            updateInventoryProductMutation.mutate({
              ...values,
              skus: updatedSkus,
            });
          }}
        >
          {({ values, isSubmitting }) => (
            <Form>
              <div className="title">
                <div>
                  <button
                    type="button"
                    className="cancel-link"
                    onClick={() => router.back()}
                  >
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
                  </button>
                  <h2>Update Inventory Product</h2>
                </div>
                <div className="save-buttons">
                  <button type="submit" className="primary-button">
                    {isSubmitting ? 'Saving...' : 'Update inventory product'}
                  </button>
                </div>
              </div>
              <div className="main-content">
                <div className="form-container">
                  <h3>Update Inventory Product</h3>
                  <p>
                    Updating the name, description, tag, or details will not
                    cause any changes to current store products that use this
                    inventory product.
                  </p>
                  <p>
                    Updates to the merchandise code, sizes, or colors will cause
                    updates to the store products that use this inventory
                    product. Any new skus for store products will intially be
                    set to 'inactive'. If size or colors were removed they will
                    also be removed in the store products (size, color, and
                    skus).
                  </p>
                  <div className="section">
                    <div className="item">
                      <label htmlFor="name">Merchandise Code</label>
                      <Field name="merchandiseCode" id="merchandiseCode" />
                      <ErrorMessage
                        name="merchandiseCode"
                        component="div"
                        className="validation-error"
                      />
                    </div>
                    <div className="item">
                      <label htmlFor="name">Inventory Product Name</label>
                      <Field name="name" id="name" />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="validation-error"
                      />
                    </div>
                    <div className="item">
                      <label htmlFor="description">
                        Inventory Product Description
                      </label>
                      <Field
                        as="textarea"
                        name="description"
                        id="description"
                      />
                    </div>
                    <div className="item">
                      <label htmlFor="tag">Inventory Product Tag</label>
                      <Field
                        name="tag"
                        id="tag"
                        placeholder="i.e. Adult Sizes"
                      />
                    </div>
                  </div>
                  <div className="section">
                    <h3>Inventory Product Details</h3>
                    <FieldArray
                      name="details"
                      render={arrayHelpers => (
                        <>
                          {values.details.length > 0 &&
                            values.details.map(
                              (_detail: string, detailIndex) => (
                                <div key={detailIndex} className="details-item">
                                  <div className="item">
                                    <label htmlFor={`details.${detailIndex}`}>
                                      Detail {detailIndex + 1}
                                    </label>
                                    <Field
                                      name={`details.${detailIndex}`}
                                      id={`details.${detailIndex}`}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    className="remove-button"
                                    onClick={() =>
                                      arrayHelpers.remove(detailIndex)
                                    }
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
                                    <span className="sr-only">
                                      Remove detail
                                    </span>
                                  </button>
                                </div>
                              )
                            )}
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              handleAddClick(
                                () => arrayHelpers.push(''),
                                `#details\\.${values.details.length}`
                              )
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
                            Add a{values.details.length > 0 ? 'nother' : ''}{' '}
                            detail
                          </button>
                        </>
                      )}
                    />
                  </div>
                  <div className="section">
                    <h3>Inventory Product Sizes</h3>
                    <FieldArray
                      name="sizes"
                      render={arrayHelpers => (
                        <>
                          {values.sizes.length > 0 &&
                            values.sizes.map(
                              (_size: InventorySize, sizeIndex) => (
                                <div key={sizeIndex} className="size-item">
                                  <div>
                                    <div className="item">
                                      <label
                                        htmlFor={`sizes.${sizeIndex}.label`}
                                      >
                                        Size Label
                                      </label>
                                      <Field
                                        name={`sizes.${sizeIndex}.label`}
                                        id={`sizes.${sizeIndex}.label`}
                                        placeholder="S, M, L, XL, XXL, etc."
                                      />
                                      <ErrorMessage
                                        name={`sizes.${sizeIndex}.label`}
                                        component="div"
                                        className="validation-error"
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="remove-button"
                                    onClick={() =>
                                      arrayHelpers.remove(sizeIndex)
                                    }
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
                              )
                            )}
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              handleAddClick(
                                () =>
                                  arrayHelpers.push({
                                    id: createId('size'),
                                    label: '',
                                  }),
                                `#sizes\\.${values.sizes.length}\\.label`
                              )
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
                    <h3>Inventory Product Colors</h3>
                    <FieldArray
                      name="colors"
                      render={arrayHelpers => (
                        <>
                          {values.colors.length > 0 &&
                            values.colors.map((_color, colorIndex) => (
                              <div key={colorIndex} className="color-item">
                                <div>
                                  <div className="item">
                                    <label
                                      htmlFor={`colors.${colorIndex}.label`}
                                    >
                                      Color Label
                                    </label>
                                    <Field
                                      name={`colors.${colorIndex}.label`}
                                      id={`colors.${colorIndex}.label`}
                                    />
                                    <ErrorMessage
                                      name={`colors.${colorIndex}.label`}
                                      component="div"
                                      className="validation-error"
                                    />
                                  </div>
                                  <div className="item">
                                    <label htmlFor={`colors.${colorIndex}.hex`}>
                                      Hex Color Value
                                    </label>
                                    <Field
                                      name={`colors.${colorIndex}.hex`}
                                      id={`colors.${colorIndex}.hex`}
                                      placeholder="i.e. #ffffff"
                                    />
                                    <ErrorMessage
                                      name={`colors.${colorIndex}.hex`}
                                      component="div"
                                      className="validation-error"
                                    />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="remove-button"
                                  onClick={() =>
                                    arrayHelpers.remove(colorIndex)
                                  }
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
                              handleAddClick(
                                () =>
                                  arrayHelpers.push({
                                    id: createId('color'),
                                    label: '',
                                    hex: '',
                                  }),
                                `#colors\\.${values.colors.length}\\.label`
                              )
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
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </UpdateInventoryProductStyles>
    </BasicLayout>
  );
}

const UpdateInventoryProductStyles = styled.div`
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
      border-radius: 0.3125rem;
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
    font-size: 0.8125rem;
    font-weight: 500;
    border-radius: 0.3125rem;
    cursor: pointer;

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c5eb9 0px 0px 0px 4px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }

  .secondary-button {
    background-color: transparent;
    color: #1f2937;
    border: 1px solid #d1d5db;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

    &:hover {
      color: #000;
      border-color: #c6cbd2;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.1);

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
    background-color: #1f2937;
    color: #f9fafb;
    border: 1px solid transparent;

    svg {
      margin: 0 0.25rem 0 0;
      height: 0.875rem;
      width: 0.875rem;
      color: #4b5563;
    }

    &:hover {
      background-color: #263244;
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
    margin: 0 0 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  p {
    margin: 0 0 1.25rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #6b7280;
    line-height: 1.5;
  }

  .main-content {
    padding: 10rem 3rem 6rem;
    position: relative;
  }

  .form-container {
    margin: 0 auto;
    width: 32rem;
  }

  .section {
    padding: 3rem 0;
    border-bottom: 1px solid #d1d5db;

    &:first-of-type {
      padding-top: 1.75rem;
    }
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
    border: none;
    color: #6b7280;
    border-radius: 9999px;
    cursor: pointer;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0) 0px 1px 2px 0px;

    &:hover {
      color: #111827;
    }
  }

  .primary-image-item,
  .secondary-images-item {
    padding: 1.5rem 0;

    h5 {
      margin: 0 0 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6e788c;
    }

    label {
      margin: 0.125rem 0 0;
      padding: 0.375rem 1rem;
      display: inline-flex;
      align-items: center;
      width: inherit;
      background-color: #fff;
      border: 1px solid #d1d5db;
      font-size: 0.8125rem;
      font-weight: 500;
      border-radius: 0.3125rem;
      color: #374151;
      cursor: pointer;
      box-shadow: rgb(0 0 0 / 0%) 0px 0px 0px 0px,
        rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 10%) 0px 1px 2px 0px,
        rgb(0 0 0 / 2%) 0px 1px 1px 0px;

      svg {
        margin: 0 0.375rem 0 0;
        height: 0.875rem;
        width: 0.875rem;
        color: #9ca3af;
      }

      &:hover {
        background-color: #f9fafb;
        color: #111827;

        svg {
          color: #6b7280;
        }
      }
    }

    .row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .primary-thumbnail {
      margin: 0.75rem 0 0;
      padding: 0.5rem 0.875rem;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 5rem;
      height: 5rem;
      background-color: #fff;
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
        rgba(17, 24, 39, 0.05) 0px 0px 0px 1px,
        rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,
        rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
      border-radius: 0.125rem;

      .placeholder {
        background-color: #f3f4f7;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 0.125rem;
      }

      img {
        width: 100%;
      }
    }

    .placeholder-icon {
      height: 1.5rem;
      width: 1.5rem;
      color: #d1d5db;
    }

    .secondary-thumbnails {
      margin: 1.875rem 0 0;
      display: flex;
      gap: 1.25rem;

      .thumbnail {
        padding: 0.5rem 0.875rem;
        position: relative;
        background-color: #fff;
        box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
          rgba(17, 24, 39, 0.05) 0px 0px 0px 1px,
          rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,
          rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
        border-radius: 0.125rem;
        width: 5rem;
        height: 5rem;
      }

      img {
        width: 100%;
      }
    }

    .remove-img-button {
      padding: 0;
      position: absolute;
      top: -0.875rem;
      right: -0.875rem;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #1f2937;
      background-color: #fff;
      border: none;
      border-radius: 9999px;
      cursor: pointer;

      &:hover {
        color: #991b1b;
      }

      svg {
        height: 1.5rem;
        width: 1.5rem;
      }
    }
  }

  .size-item {
    align-items: center;
  }

  .validation-error {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    font-weight: 500;
    color: #b91c1c;
  }

  .option {
    padding: 0.75rem 0;
    max-width: 20rem;
    display: flex;
    align-items: center;
    gap: 0.875rem;
    border-top: 1px solid #e5e7eb;

    &:last-of-type {
      margin: 0;
      border-bottom: 1px solid #e5e7eb;
    }
  }

  .toggle-button {
    padding: 0;
    position: relative;
    flex-shrink: 0;
    display: inline-flex;
    height: 1.5rem;
    width: 2.75rem;
    border: 2px solid transparent;
    border-radius: 9999px;
    transition-property: background-color, border-color, color, fill, stroke;
    transition-duration: 0.2s;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c5eb9 0px 0px 0px 4px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }

    &.on {
      background-color: #1955a8;

      & .switch {
        transform: translateX(1.25rem);
      }
    }

    &.off {
      background-color: #e5e7eb;

      & .switch {
        transform: translateX(0rem);
      }
    }
  }

  .switch {
    display: inline-block;
    width: 1.25rem;
    height: 1.25rem;
    background-color: #fff;
    border-radius: 9999px;
    box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
      rgba(59, 130, 246, 0.5) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
    pointer-events: none;
    transition-duration: 0.2s;
    transition-property: background-color, border-color, color, fill, stroke,
      opacity, box-shadow, transform, filter, backdrop-filter,
      -webkit-backdrop-filter;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  .toggle-description {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    line-height: 1;

    span {
      color: #6b7280;
    }
  }
`;
