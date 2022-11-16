import React from 'react';
import { useRouter } from 'next/router';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { Size, FormSize } from '../../../../interfaces';
import {
  getQueryParameter,
  removeNonAlphanumeric,
  updateProductSkus,
} from '../../../../utils';
import {
  createBlankPersonalizedItem,
  formatPersonalizationValues,
} from '../../../../utils/storeProduct';
import { useUpdateStoreProduct } from '../../../../hooks/useUpdateStoreProduct';
import { useStoreQuery } from '../../../../hooks/useStoreQuery';
import { useStoreProductMutations } from '../../../../hooks/useStoreProductMutations';
import { useInventoryProductQuery } from '../../../../hooks/useInventoryProductQuery';
import BasicLayout from '../../../../components/BasicLayout';
import LoadingSpinner from '../../../../components/LoadingSpinner';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Product name is required'),
  personalization: Yup.object().shape({
    maxLines: Yup.string().required('Max lines is required.'),
    addons: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required('A name is required'),
        location: Yup.string().required('A location is required'),
        lines: Yup.string().required('Lines is required'),
        list: Yup.string().when('type', {
          is: 'list',
          then: Yup.string().required('A list is required'),
        }),
        price: Yup.string().required('A price is required'),
        limit: Yup.string().required('A limit is required'),
        subItems: Yup.array().of(
          Yup.object().shape({
            name: Yup.string().required('A name is required'),
            location: Yup.string().required('A location is required'),
            lines: Yup.string().required('Lines is required'),
            list: Yup.string().when('type', {
              is: 'list',
              then: Yup.string().required('A list is required.'),
            }),
            price: Yup.string().required('A price is required'),
            limit: Yup.string().required('A limit is required'),
          })
        ),
      })
    ),
  }),
  sizes: Yup.array().of(
    Yup.object().shape({
      label: Yup.string().required('A label is required'),
      price: Yup.string().required('A price is required'),
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
  const router = useRouter();
  const [invProdId, setInvProdId] = React.useState<string>();
  const storeQuery = useStoreQuery();
  const inventoryProductQuery = useInventoryProductQuery(invProdId);
  const { updateProduct } = useStoreProductMutations({
    store: storeQuery.data,
  });
  const {
    initialValues,
    product,
    primaryImageStatus,
    secondaryImageStatus,
    handlePrimaryImageChange,
    handleAddSecondaryImages,
    handleRemoveSecondaryImage,
    handleAddClick,
  } = useUpdateStoreProduct({ inventoryProductQuery, storeQuery });

  React.useEffect(() => {
    if (storeQuery.data) {
      const storeProduct = storeQuery.data.products.find(
        storeProduct => storeProduct.id === getQueryParameter(router.query.pid)
      );

      setInvProdId(storeProduct?.inventoryProductId);
    }
  }, [router.query.pid, storeQuery.data]);

  return (
    <BasicLayout
      title="Update Product | Macaport Dashboard"
      requiresAuth={true}
    >
      <UpdateProductStyles>
        <div className="main-content">
          <div className="form-container">
            {(storeQuery.isLoading || inventoryProductQuery.isLoading) && (
              <div>Loading...</div>
            )}
            {storeQuery.isError && storeQuery.error instanceof Error && (
              <div>Error: {storeQuery.error.message}</div>
            )}
            {storeQuery.data && inventoryProductQuery.data && (
              <Formik
                initialValues={initialValues}
                enableReinitialize={true}
                validationSchema={validationSchema}
                onSubmit={values => {
                  if (!product) {
                    throw new Error('Failed to load the product.');
                  }

                  const updatedSizes: Size[] = values.sizes.map(size => {
                    return {
                      ...size,
                      price: Number(size.price) * 100,
                    };
                  });

                  const updatedPersonalization = formatPersonalizationValues(
                    values.personalization
                  );

                  const updatedFormValues = {
                    ...values,
                    personalization: updatedPersonalization,
                    sizes: updatedSizes,
                  };

                  const updatedSkus = updateProductSkus(
                    product.productSkus,
                    updatedFormValues
                  );

                  const updatedProduct = {
                    ...values,
                    personalization: updatedPersonalization,
                    sizes: updatedSizes,
                    productSkus: updatedSkus,
                  };

                  updateProduct.mutate(updatedProduct);
                }}
              >
                {({ values, setFieldValue }) => (
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
                          {updateProduct.isLoading ? (
                            <LoadingSpinner
                              isLoading={updateProduct.isLoading}
                              theme="dark"
                            />
                          ) : (
                            'Update product'
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="section">
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
                      <div className="toggle-header-row">
                        <h3>Personalization addons</h3>
                        <button
                          type="button"
                          onClick={() =>
                            setFieldValue(
                              'personalization.active',
                              !values.personalization.active
                            )
                          }
                          role="switch"
                          aria-checked={values.personalization.active}
                          className={`toggle-button ${
                            values.personalization.active ? 'on' : 'off'
                          }`}
                        >
                          <span aria-hidden="true" className="switch" />
                          <span className="sr-only">
                            Toggle personalization{' '}
                            {values.personalization.active
                              ? 'active'
                              : 'inactive'}
                          </span>
                        </button>
                      </div>

                      {values.personalization.active ? (
                        <>
                          <div className="item">
                            <label htmlFor="personalization.maxLines">
                              Maximum lines allowed for this product
                            </label>
                            <Field
                              name="personalization.maxLines"
                              id="personalization.maxLines"
                            />
                            <ErrorMessage
                              name="personalization.maxLines"
                              component="div"
                              className="validation-error"
                            />
                          </div>

                          <FieldArray
                            name="personalization.addons"
                            render={arrayHelpers => (
                              <>
                                {values.personalization.addons.length > 0 &&
                                  values.personalization.addons.map(
                                    (item, index) => (
                                      <div
                                        key={item.id}
                                        className="personalization-item"
                                      >
                                        <h3>Addon {index + 1}</h3>

                                        <div className="item">
                                          <label
                                            htmlFor={`personalization.addons.${index}.name`}
                                          >
                                            Name (Name, Number, Event, etc.)
                                          </label>
                                          <Field
                                            name={`personalization.addons.${index}.name`}
                                            id={`personalization.addons.${index}.name`}
                                          />
                                          <ErrorMessage
                                            name={`personalization.addons.${index}.name`}
                                            component="div"
                                            className="validation-error"
                                          />
                                        </div>

                                        <div className="item">
                                          <label
                                            htmlFor={`personalization.addons.${index}.location`}
                                          >
                                            Location (Back, Front, Shoulder,
                                            etc.)
                                          </label>
                                          <Field
                                            name={`personalization.addons.${index}.location`}
                                            id={`personalization.addons.${index}.location`}
                                          />
                                          <ErrorMessage
                                            name={`personalization.addons.${index}.location`}
                                            component="div"
                                            className="validation-error"
                                          />
                                        </div>

                                        <div className="item">
                                          <label
                                            htmlFor={`personalization.addons.${index}.lines`}
                                          >
                                            Lines (How many lines does this
                                            addon take up?)
                                          </label>
                                          <Field
                                            name={`personalization.addons.${index}.lines`}
                                            id={`personalization.addons.${index}.lines`}
                                          />
                                          <ErrorMessage
                                            name={`personalization.addons.${index}.lines`}
                                            component="div"
                                            className="validation-error"
                                          />
                                        </div>

                                        <div className="item radio-group">
                                          <div className="radio-group-label">
                                            Type
                                          </div>
                                          <div>
                                            <label
                                              htmlFor={`personalization.addons.${index}.string`}
                                              className="radio-item"
                                            >
                                              <Field
                                                type="radio"
                                                name={`personalization.addons.${index}.type`}
                                                id={`personalization.addons.${index}.string`}
                                                value="string"
                                              />
                                              Alphanumeric characters (A-Z and
                                              0-9)
                                            </label>
                                          </div>
                                          <div>
                                            <label
                                              htmlFor={`personalization.addons.${index}.number`}
                                              className="radio-item"
                                            >
                                              <Field
                                                type="radio"
                                                name={`personalization.addons.${index}.type`}
                                                id={`personalization.addons.${index}.number`}
                                                value="number"
                                              />
                                              Numbers only
                                            </label>
                                          </div>
                                          <div>
                                            <label
                                              htmlFor={`personalization.addons.${index}.type-list`}
                                              className="radio-item"
                                            >
                                              <Field
                                                type="radio"
                                                name={`personalization.addons.${index}.type`}
                                                id={`personalization.addons.${index}.type-list`}
                                                value="list"
                                              />
                                              A list that customers must choose
                                              from
                                            </label>
                                          </div>
                                        </div>

                                        {values.personalization.addons[index]
                                          .type === 'list' ? (
                                          <div className="item">
                                            <label
                                              htmlFor={`personalization.addons.${index}.list`}
                                            >
                                              List (separated by commas)
                                            </label>
                                            <Field
                                              as="textarea"
                                              name={`personalization.addons.${index}.list`}
                                              id={`personalization.addons.${index}.list`}
                                            />
                                            <ErrorMessage
                                              name={`personalization.addons.${index}.list`}
                                              component="div"
                                              className="validation-error"
                                            />
                                          </div>
                                        ) : null}

                                        <div className="item">
                                          <label
                                            htmlFor={`personalization.addons.${index}.price`}
                                          >
                                            Price
                                          </label>
                                          <Field
                                            name={`personalization.addons.${index}.price`}
                                            id={`personalization.addons.${index}.price`}
                                          />
                                          <ErrorMessage
                                            name={`personalization.addons.${index}.price`}
                                            component="div"
                                            className="validation-error"
                                          />
                                        </div>

                                        <div className="item">
                                          <label
                                            htmlFor={`personalization.addons.${index}.limit`}
                                          >
                                            Limit
                                          </label>
                                          <Field
                                            name={`personalization.addons.${index}.limit`}
                                            id={`personalization.addons.${index}.limit`}
                                          />
                                          <ErrorMessage
                                            name={`personalization.addons.${index}.limit`}
                                            component="div"
                                            className="validation-error"
                                          />
                                        </div>

                                        <FieldArray
                                          name={`personalization.addons.${index}.subItems`}
                                          render={subtItemArrayHelpers => (
                                            <>
                                              {values.personalization.addons[
                                                index
                                              ].subItems.map(
                                                (subItem, subItemIndex) => (
                                                  <div
                                                    key={subItem.id}
                                                    className="subitem"
                                                  >
                                                    <h3>
                                                      Subitem {subItemIndex + 1}
                                                    </h3>

                                                    <div className="item">
                                                      <label
                                                        htmlFor={`personalization.addons.${index}.subItems.${subItemIndex}.name`}
                                                      >
                                                        Name (Name, Number,
                                                        Event, etc.)
                                                      </label>
                                                      <Field
                                                        name={`personalization.addons.${index}.subItems.${subItemIndex}.name`}
                                                        id={`personalization.addons.${index}.subItems.${subItemIndex}.name`}
                                                      />
                                                      <ErrorMessage
                                                        name={`personalization.addons.${index}.subItems.${subItemIndex}.name`}
                                                        component="div"
                                                        className="validation-error"
                                                      />
                                                    </div>

                                                    <div className="item">
                                                      <label
                                                        htmlFor={`personalization.addons.${index}.subItems.${subItemIndex}.location`}
                                                      >
                                                        Location (Back, Front,
                                                        Shoulder, etc.)
                                                      </label>
                                                      <Field
                                                        name={`personalization.addons.${index}.subItems.${subItemIndex}.location`}
                                                        id={`personalization.addons.${index}.subItems.${subItemIndex}.location`}
                                                      />
                                                      <ErrorMessage
                                                        name={`personalization.addons.${index}.subItems.${subItemIndex}.location`}
                                                        component="div"
                                                        className="validation-error"
                                                      />
                                                    </div>

                                                    <div className="item">
                                                      <label
                                                        htmlFor={`personalization.addons.${index}.subItems.${subItemIndex}.lines`}
                                                      >
                                                        Lines (How many lines
                                                        does this addon take
                                                        up?)
                                                      </label>
                                                      <Field
                                                        name={`personalization.addons.${index}.subItems.${subItemIndex}.lines`}
                                                        id={`personalization.addons.${index}.subItems.${subItemIndex}.lines`}
                                                      />
                                                      <ErrorMessage
                                                        name={`personalization.addons.${index}.subItems.${subItemIndex}.lines`}
                                                        component="div"
                                                        className="validation-error"
                                                      />
                                                    </div>

                                                    <div className="item radio-group">
                                                      <div className="radio-group-label">
                                                        Type
                                                      </div>
                                                      <div>
                                                        <label
                                                          htmlFor={`personalization.addons.${index}.subItems.${subItemIndex}.string`}
                                                          className="radio-item"
                                                        >
                                                          <Field
                                                            type="radio"
                                                            name={`personalization.addons.${index}.subItems.${subItemIndex}.type`}
                                                            id={`personalization.addons.${index}.subItems.${subItemIndex}.string`}
                                                            value="string"
                                                          />
                                                          Alphanumeric
                                                          characters (A-Z and
                                                          0-9)
                                                        </label>
                                                      </div>
                                                      <div>
                                                        <label
                                                          htmlFor={`personalization.addons.${index}.subItems.${subItemIndex}.number`}
                                                          className="radio-item"
                                                        >
                                                          <Field
                                                            type="radio"
                                                            name={`personalization.addons.${index}.subItems.${subItemIndex}.type`}
                                                            id={`personalization.addons.${index}.subItems.${subItemIndex}.number`}
                                                            value="number"
                                                          />
                                                          Numbers only
                                                        </label>
                                                      </div>
                                                      <div>
                                                        <label
                                                          htmlFor={`personalization.addons.${index}.subItems.${subItemIndex}.type-list`}
                                                          className="radio-item"
                                                        >
                                                          <Field
                                                            type="radio"
                                                            name={`personalization.addons.${index}.subItems.${subItemIndex}.type`}
                                                            id={`personalization.addons.${index}.subItems.${subItemIndex}.type-list`}
                                                            value="list"
                                                          />
                                                          A list that customers
                                                          must choose from
                                                        </label>
                                                      </div>
                                                    </div>

                                                    {subItem.type === 'list' ? (
                                                      <div className="item">
                                                        <label
                                                          htmlFor={`personalization.addons.${index}.subItems.${subItemIndex}.list`}
                                                        >
                                                          List (separated by
                                                          commas)
                                                        </label>
                                                        <Field
                                                          as="textarea"
                                                          name={`personalization.addons.${index}.subItems.${subItemIndex}.list`}
                                                          id={`personalization.addons.${index}.subItems.${subItemIndex}.list`}
                                                        />
                                                        <ErrorMessage
                                                          name={`personalization.addons.${index}.subItems.${subItemIndex}.list`}
                                                          component="div"
                                                          className="validation-error"
                                                        />
                                                      </div>
                                                    ) : null}

                                                    <div className="item">
                                                      <label
                                                        htmlFor={`personalization.addons.${index}.subItems.${subItemIndex}.price`}
                                                      >
                                                        Price
                                                      </label>
                                                      <Field
                                                        name={`personalization.addons.${index}.subItems.${subItemIndex}.price`}
                                                        id={`personalization.addons.${index}.subItems.${subItemIndex}.price`}
                                                      />
                                                      <ErrorMessage
                                                        name={`personalization.addons.${index}.subItems.${subItemIndex}.price`}
                                                        component="div"
                                                        className="validation-error"
                                                      />
                                                    </div>

                                                    <div className="item">
                                                      <label
                                                        htmlFor={`personalization.addons.${index}.subItems.${subItemIndex}.limit`}
                                                      >
                                                        Limit
                                                      </label>
                                                      <Field
                                                        name={`personalization.addons.${index}.subItems.${subItemIndex}.limit`}
                                                        id={`personalization.addons.${index}.subItems.${subItemIndex}.limit`}
                                                      />
                                                      <ErrorMessage
                                                        name={`personalization.addons.${index}.subItems.${subItemIndex}.limit`}
                                                        component="div"
                                                        className="validation-error"
                                                      />
                                                    </div>

                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        subtItemArrayHelpers.remove(
                                                          subItemIndex
                                                        )
                                                      }
                                                      className="remove-addon-button"
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
                                                        Remove subitem{' '}
                                                        {subItemIndex + 1}
                                                      </span>
                                                    </button>
                                                  </div>
                                                )
                                              )}
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  subtItemArrayHelpers.push(
                                                    createBlankPersonalizedItem(
                                                      'si'
                                                    )
                                                  )
                                                }
                                                className="secondary-button"
                                              >
                                                Add{' '}
                                                {values.personalization.addons[
                                                  index
                                                ].subItems.length > 0
                                                  ? 'another'
                                                  : 'a'}{' '}
                                                subitem to{' '}
                                                {values.personalization.addons[
                                                  index
                                                ].name.toLowerCase()}
                                              </button>
                                            </>
                                          )}
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            arrayHelpers.remove(index)
                                          }
                                          className="remove-addon-button"
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
                                            Remove addon {index + 1}
                                          </span>
                                        </button>
                                      </div>
                                    )
                                  )}
                                <div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      arrayHelpers.push(
                                        createBlankPersonalizedItem('pi')
                                      )
                                    }
                                    className="secondary-button"
                                  >
                                    Add{' '}
                                    {values.personalization.addons.length > 0
                                      ? 'another'
                                      : 'a'}{' '}
                                    personalization item
                                  </button>
                                </div>
                              </>
                            )}
                          />
                        </>
                      ) : null}
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
                                  <div
                                    key={detailIndex}
                                    className="details-item"
                                  >
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
                              className="primary-button"
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
                      <h3>Product sizes</h3>
                      <FieldArray
                        name="sizes"
                        render={() => (
                          <>
                            {values.sizes.length > 0 &&
                              values.sizes.map((size: FormSize, sizeIndex) => (
                                <div key={sizeIndex} className="size-item">
                                  <div className="grid-col-2">
                                    <div className="item">
                                      <label
                                        htmlFor={`sizes.${sizeIndex}.label`}
                                      >
                                        Size label
                                      </label>
                                      <input
                                        type="text"
                                        name={`sizes.${sizeIndex}.label`}
                                        id={`sizes.${sizeIndex}.label`}
                                        value={size.label}
                                        readOnly
                                      />
                                    </div>
                                    <div className="item">
                                      <label
                                        htmlFor={`sizes.${sizeIndex}.price`}
                                      >
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
                                </div>
                              ))}
                          </>
                        )}
                      />
                    </div>
                    <div className="section">
                      <h3>Product colors</h3>
                      <FieldArray
                        name="colors"
                        render={() => (
                          <>
                            {values.colors.length > 0 &&
                              values.colors.map((color, colorIndex) => (
                                <div key={colorIndex} className="color-item">
                                  <div>
                                    <div className="grid-col-2">
                                      <div className="item">
                                        <label
                                          htmlFor={`colors.${colorIndex}.label`}
                                        >
                                          Color label
                                        </label>
                                        <input
                                          type="text"
                                          name={`colors.${colorIndex}.label`}
                                          id={`colors.${colorIndex}.label`}
                                          value={color.label}
                                          readOnly
                                        />
                                      </div>
                                      <div className="item">
                                        <label
                                          htmlFor={`colors.${colorIndex}.hex`}
                                        >
                                          Hex color value
                                        </label>
                                        <input
                                          type="text"
                                          name={`colors.${colorIndex}.hex`}
                                          id={`colors.${colorIndex}.hex`}
                                          value={color.hex}
                                          readOnly
                                        />
                                      </div>
                                    </div>
                                    <div className="item primary-image-item">
                                      <h5>Primary image</h5>
                                      <div className="row">
                                        <div className="primary-thumbnail">
                                          {color.primaryImage ? (
                                            <img
                                              src={color.primaryImage}
                                              alt={`${values.name} - ${color.label}`}
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
                                            {primaryImageStatus ===
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
                                                {color.primaryImage
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
                                              handleAddSecondaryImages(
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
                                        {color.secondaryImages.map(
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
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </>
                        )}
                      />
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        </div>
      </UpdateProductStyles>
    </BasicLayout>
  );
}

const UpdateProductStyles = styled.div`
  .title {
    padding: 1.5rem 2.5rem;
    position: fixed;
    top: 0;
    left: 0;
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

    .primary-button {
      min-width: 8.5rem;
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
  }

  .secondary-button,
  .primary-button {
    padding: 0.5rem 1.125rem;
    width: 100%;
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
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c44b9 0px 0px 0px 4px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }

  .primary-button {
    min-width: 7.25rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
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

  .secondary-button {
    background-color: #1f2937;
    color: #f3f4f6;
    border: 1px solid #000;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

    &:hover {
      color: #fff;
      background-color: #111827;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.1);

      svg {
        color: #6b7280;
      }
    }

    svg {
      height: 0.875rem;
      width: 0.875rem;
      color: #9ca3af;
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
    padding: 7rem 3rem 3rem;
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

  .toggle-header-row {
    margin: 0 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;

    h3 {
      margin: 0;
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
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c44b9 0px 0px 0px 4px,
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

  .personalization-item,
  .subitem {
    position: relative;
    margin: 2rem 0;
    padding: 1.5rem 1.5rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .personalization-item {
    background-color: #fff;
  }

  .subitem {
    background-color: #f9fafb;
  }

  .remove-addon-button {
    position: absolute;
    top: 1.25rem;
    right: 1rem;
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: #6b7280;

    &:hover {
      color: #111827;
    }

    svg {
      height: 1.125rem;
      width: 1.125rem;
    }
  }

  .radio-group {
    margin: 2rem 0;
  }

  .radio-group-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6e788c;
  }

  .radio-item {
    margin: 0.75rem 0 0;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
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
      top: -0.75rem;
      right: -0.75rem;
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
`;
