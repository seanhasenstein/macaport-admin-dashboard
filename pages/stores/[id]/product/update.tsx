import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { useSession } from '../../../../hooks/useSession';
import { Store, Size, Color, Sku, Product } from '../../../../interfaces';
import {
  createId,
  removeNonAlphanumeric,
  handleProductSkusUpdate,
} from '../../../../utils';
import BasicLayout from '../../../../components/BasicLayout';

type InitialValues = {
  id: string;
  name: string;
  description: string;
  tag: string;
  details: string[];
  sizes: Size[];
  colors: Color[];
  skus: Sku[];
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Product name is required'),
  sizes: Yup.array().of(
    Yup.object().shape({
      label: Yup.string().required('A label is required'),
      price: Yup.string()
        .matches(
          /^([0-9]{1,})(\.)([0-9]{2})$/,
          'Must be a valid price (i.e. 10.00)'
        )
        .required('A price is required'),
    })
  ),
  colors: Yup.array().of(
    Yup.object().shape({
      label: Yup.string().required('A label is required'),
      hex: Yup.string()
        .transform(value => removeNonAlphanumeric(value))
        .matches(
          /^[0-9a-fA-F]{6}$/,
          'Must be a valid 6 character hex color (includes a-f, A-F, or 0-9)'
        )
        .required('A hex color is required'),
    })
  ),
});

export default function UpdateProduct() {
  const [session, sessionLoading] = useSession({ required: true });
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    isLoading,
    isError,
    error,
    data: product,
  } = useQuery(
    ['product', router.query.prodId],
    async () => {
      if (!router.query.id || !router.query.prodId) return;
      const response = await fetch(`/api/stores/${router.query.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch the store.');
      }
      const { store }: { store: Store } = await response.json();
      const product = store.products.find(p => p.id === router.query.prodId);
      if (!product) {
        throw new Error('Product not found.');
      }
      return product;
    },
    {
      initialData: () => {
        const store = queryClient.getQueryData<Store>([
          'store',
          router.query.id,
        ]);
        return store?.products.find(p => p.id === router.query.prodId);
      },
      initialDataUpdatedAt: () =>
        queryClient.getQueryState(['store', router.query.id])?.dataUpdatedAt,
      staleTime: 600000,
    }
  );

  const updateProductMutation = useMutation(async (product: Product) => {
    console.log(product);
  });

  // const handleRemoveColorClick = (colorIndex, remove) => {
  //   /**/
  // };

  if (sessionLoading || !session) return <div />;
  if (isLoading) return <div>Loading...</div>;
  if (isError && error instanceof Error)
    return <div>Error: {error.message}</div>;
  if (!product) return <div>TODO: Handle this error!</div>;

  const initialValues: InitialValues = {
    id: createId('prod'),
    name: product.name ? product.name : '',
    description: product.description ? product.description : '',
    tag: product.tag ? product.tag : '',
    details: product.details ? product.details : [],
    sizes: product.sizes,
    colors: product.colors,
    skus: product.skus,
  };

  // TODO: handle primaryImages
  // TODO: handle secondaryImages
  // TODO: Need to check for size/color deletions and handle removing the relevant skus (this is a separate function!)

  return (
    <BasicLayout>
      <UpdateProductStyles>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={values => {
            const updatedSkus = handleProductSkusUpdate(product, values);
            const updatedProduct = { ...values, skus: updatedSkus };
            updateProductMutation.mutate(updatedProduct);
          }}
        >
          {({ values }) => (
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
                  <h2>Edit product</h2>
                </div>
                <div className="save-buttons">
                  <button type="submit" className="primary-button">
                    Save product
                  </button>
                </div>
              </div>
              <div className="main-content">
                <div className="form-container">
                  <div className="section">
                    <h3>Product details</h3>
                    <div className="item">
                      <label htmlFor="name">Product name</label>
                      <Field name="name" id="name" />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="validation-error"
                      />
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
                            values.sizes.map((_size: Size, sizeIndex) => (
                              <div key={sizeIndex} className="size-item">
                                <div>
                                  <div className="item">
                                    <label htmlFor={`sizes.${sizeIndex}.label`}>
                                      Size label
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
                                  <div className="item">
                                    <label htmlFor={`sizes.${sizeIndex}.price`}>
                                      Size price
                                    </label>
                                    <Field
                                      name={`sizes.${sizeIndex}.price`}
                                      id={`sizes.${sizeIndex}.price`}
                                      placeholder="0.00"
                                    />
                                    <ErrorMessage
                                      name={`sizes.${sizeIndex}.price`}
                                      component="div"
                                      className="validation-error"
                                    />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="remove-button"
                                  onClick={() => arrayHelpers.remove(sizeIndex)}
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
                                price: '0.00',
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
                            values.colors.map((color, colorIndex) => (
                              <div key={colorIndex} className="color-item">
                                <div>
                                  <div className="item">
                                    <label
                                      htmlFor={`colors.${colorIndex}.label`}
                                    >
                                      Color label
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
                                      Hex color value
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
                                  {/* <div className="item primary-image-item">
                                    <h5>Primary image</h5>
                                    <div className="row">
                                      <div className="primary-thumbnail">
                                        {primaryImages &&
                                        primaryImages[colorIndex] ? (
                                          <img
                                            src={primaryImages[colorIndex]}
                                            alt={`${values.name} - ${values.colors[colorIndex].label}`}
                                          />
                                        ) : (
                                          <div className="placeholder">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="placeholder-icon"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                              />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <label
                                          htmlFor={`primaryImage${colorIndex}`}
                                        >
                                          {primaryImageStatus === 'loading' ? (
                                            'Loading...'
                                          ) : (
                                            <>
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
                                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                                />
                                              </svg>
                                              {primaryImages[colorIndex]
                                                ? 'Upload a different image'
                                                : 'Upload an image'}
                                            </>
                                          )}
                                        </label>
                                        <input
                                          type="file"
                                          accept="image/png, image/jpeg"
                                          name={`primaryImage${colorIndex}`}
                                          id={`primaryImage${colorIndex}`}
                                          className="sr-only"
                                          onChange={e =>
                                            handlePrimaryImageChange(
                                              colorIndex,
                                              values.id,
                                              color,
                                              values.colors,
                                              setFieldValue,
                                              e
                                            )
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="item secondary-images-item">
                                    <h5>Secondary image</h5>
                                    <div className="row">
                                      <div>
                                        <label
                                          htmlFor={`secondaryImages${colorIndex}`}
                                        >
                                          {secondaryImageStatus ===
                                          'loading' ? (
                                            'Loading...'
                                          ) : (
                                            <>
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
                                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                                />
                                              </svg>
                                              Upload images
                                            </>
                                          )}
                                        </label>
                                        <input
                                          type="file"
                                          multiple
                                          accept="image/png, image/jpeg"
                                          name={`secondaryImages${colorIndex}`}
                                          id={`secondaryImages${colorIndex}`}
                                          className="sr-only"
                                          onChange={e =>
                                            handleSecondaryImagesChange(
                                              colorIndex,
                                              values.id,
                                              color,
                                              values.colors,
                                              setFieldValue,
                                              e
                                            )
                                          }
                                        />
                                      </div>
                                    </div>
                                    <div className="secondary-thumbnails">
                                      {secondaryImages[colorIndex] &&
                                        secondaryImages[colorIndex].map(
                                          (secImg, secImgIndex) => {
                                            return (
                                              <div
                                                key={secImgIndex}
                                                className="thumbnail"
                                              >
                                                <img
                                                  src={secImg}
                                                  alt={`Secondary number ${secImgIndex} for color number ${colorIndex}`}
                                                />
                                                <button
                                                  type="button"
                                                  className="remove-img-button"
                                                  onClick={() =>
                                                    handleRemoveSecondaryImage(
                                                      colorIndex,
                                                      secImgIndex,
                                                      color,
                                                      values.colors,
                                                      setFieldValue
                                                    )
                                                  }
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
                                                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                  </svg>
                                                  <span className="sr-only">
                                                    Remove Image
                                                  </span>
                                                </button>
                                              </div>
                                            );
                                          }
                                        )}
                                    </div>
                                  </div>*/}
                                </div>
                                <button
                                  type="button"
                                  className="remove-button"
                                  // onClick={() =>
                                  //   handleRemoveColorClick(
                                  //     colorIndex,
                                  //     arrayHelpers.remove
                                  //   )
                                  // }
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
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </UpdateProductStyles>
    </BasicLayout>
  );
}

const UpdateProductStyles = styled.div`
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
    font-size: 0.8125rem;
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
      border: 1px solid #e5e7eb;
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
        border: 1px solid #e5e7eb;
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
      background-color: #fff;
      color: #6b7280;
      border: none;
      cursor: pointer;

      &:hover {
        color: #991b1b;
      }

      svg {
        height: 1.625rem;
        width: 1.625rem;
      }
    }
  }

  .validation-error {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    font-weight: 500;
    color: #b91c1c;
  }
`;
