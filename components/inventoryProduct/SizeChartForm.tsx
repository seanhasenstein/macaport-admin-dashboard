import React from 'react';
import styled from 'styled-components';
import { Form, Formik, FieldArray, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { TrashIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/outline';

import { useInventoryProductMutations } from '../../hooks/useInventoryProductMutations';

import { InventoryProduct } from '../../interfaces';

const sizeChartFormSchema = Yup.object().shape({
  categories: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('Category name is required'),
      unit: Yup.string().required('Unit is required'),
      sizes: Yup.array().of(
        Yup.object().shape({
          label: Yup.string(),
          value: Yup.string(),
        })
      ),
    })
  ),
});

type Props = {
  inventoryProduct: InventoryProduct;
  onSuccess?: () => void;
  onError?: () => void;
};

export default function SizeChartForm({
  inventoryProduct,
  onError,
  onSuccess,
}: Props) {
  const { sizeChart, sizes } = inventoryProduct;

  const blankCategory = {
    name: '',
    unit: '',
    sizes: sizes.map(size => ({ label: size.label, value: '' })),
  };

  const { updateProduct } = useInventoryProductMutations(inventoryProduct);

  const hasInitialSizeChart = sizeChart && sizeChart.length > 0;

  return (
    <SizeChartFormStyles>
      <Formik
        initialValues={{
          categories: sizeChart?.length ? sizeChart : [blankCategory],
        }}
        validationSchema={sizeChartFormSchema}
        onSubmit={values => {
          if (!hasInitialSizeChart && !values.categories.length) {
            return;
          }

          const updatedInventoryProduct = {
            ...inventoryProduct,
            sizeChart: values.categories,
          };
          updateProduct.mutate(updatedInventoryProduct, {
            onSuccess: () => {
              if (onSuccess) onSuccess();
            },
            onError: () => {
              if (onError) onError();
            },
          });
        }}
      >
        {({ values, submitCount }) => (
          <Form>
            <FieldArray
              name="categories"
              render={categoriesArrayHelpers => (
                <div>
                  {values.categories.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <div key={categoryIndex} className="category">
                        <p className="category-section-label">
                          <span>Category #{categoryIndex + 1}</span>
                        </p>
                        <button
                          type="button"
                          className="delete-category-btn"
                          onClick={e => {
                            e.stopPropagation();
                            categoriesArrayHelpers.remove(categoryIndex);
                          }}
                        >
                          <span className="sr-only">Delete category</span>
                          <TrashIcon className="trash-icon" />
                        </button>
                        <div className="form-items-grid">
                          <div className="form-item">
                            <label htmlFor={`categories.${categoryIndex}.name`}>
                              Category (Chest, Hip, etc.)
                            </label>
                            <Field
                              type="text"
                              name={`categories.${categoryIndex}.name`}
                              value={category.name}
                            />
                            <ErrorMessage
                              name={`categories.${categoryIndex}.name`}
                              component="div"
                              className="validation-error"
                            />
                          </div>
                          <div className="form-item">
                            <label htmlFor={`categories.${categoryIndex}.unit`}>
                              Unit (in, cm, etc.)
                            </label>
                            <Field
                              type="text"
                              name={`categories.${categoryIndex}.unit`}
                              value={category.unit}
                            />
                            <ErrorMessage
                              name={`categories.${categoryIndex}.unit`}
                              component="div"
                              className="validation-error"
                            />
                          </div>
                        </div>
                        <FieldArray
                          name={`categories.${categoryIndex}.sizes`}
                          render={() => (
                            <div className="sizes-row">
                              {category.sizes.map((size, sizeIndex) => (
                                <div key={sizeIndex} className="size-item">
                                  <div className="form-item">
                                    <label
                                      htmlFor={`categories.${categoryIndex}.sizes.${sizeIndex}.label`}
                                    >
                                      <span className="sr-only">Size</span>
                                    </label>
                                    <Field
                                      type="text"
                                      name={`categories.${categoryIndex}.sizes.${sizeIndex}.label`}
                                      value={size.label}
                                      readOnly
                                      disabled
                                    />
                                  </div>
                                  <div className="form-item">
                                    <label
                                      htmlFor={`categories.${categoryIndex}.sizes.${sizeIndex}.value`}
                                    >
                                      <span className="sr-only">Value</span>
                                    </label>
                                    <Field
                                      type="text"
                                      name={`categories.${categoryIndex}.sizes.${sizeIndex}.value`}
                                      value={size.value}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-category-btn"
                    onClick={() => categoriesArrayHelpers.push(blankCategory)}
                  >
                    <PlusIcon strokeWidth={2} className="plus-icon" />
                    Add {values.categories.length > 0 ? 'another ' : 'a '}
                    category
                  </button>
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={updateProduct.isLoading}
                    >
                      {updateProduct.isLoading
                        ? 'Saving...'
                        : hasInitialSizeChart && !values.categories.length
                        ? 'Remove existing size chart'
                        : 'Save size chart'}
                    </button>
                    {!hasInitialSizeChart &&
                    !values.categories.length &&
                    submitCount ? (
                      <div className="validation-error">
                        At least 1 category is required to save
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            />
          </Form>
        )}
      </Formik>
    </SizeChartFormStyles>
  );
}

const SizeChartFormStyles = styled.div`
  max-width: 100%;
  .form-item {
    display: flex;
    flex-direction: column;
  }
  .group {
    position: relative;
    margin: 1.5rem auto 0;
    padding-bottom: 1.625rem;
    &:first-of-type {
      margin-top: 1.5rem;
    }
  }
  .group-section-label,
  .category-section-label {
    position: relative;
    font-size: 0.75rem;
    font-weight: 700;
    color: #111827;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-align: center;
    &:after {
      position: absolute;
      top: 0.4375rem;
      left: 0;
      content: '';
      display: block;
      width: 100%;
      height: 1px;
      background-color: #d1d5db;
      z-index: 0;
    }
    span {
      position: relative;
      padding: 0 1rem;
      background-color: #fff;
      z-index: 10;
    }
  }
  .group-section-label {
    margin: 0 auto 1.75rem;
    &:after {
      left: 0;
      width: calc(100% - 2.125rem);
    }
    span {
      background-color: #fff;
    }
  }
  .category-section-label {
    margin: 0 0 0.5rem;
    &:after {
      position: absolute;
      top: 0.4375rem;
      right: 1.75rem;
      width: calc(100% - 1.75rem);
    }
    span {
      background-color: #f9fafb;
    }
  }
  .delete-group-btn,
  .delete-category-btn {
    position: absolute;
    padding: 0;
    background-color: transparent;
    border: none;
    box-shadow: none;
    color: #3f3f46;
    cursor: pointer;
    transition: color 0.2s ease;
    &:hover {
      color: #b91c1c;
    }
    .trash-icon {
      height: 0.9375rem;
      width: 0.9375rem;
    }
  }
  .delete-group-btn {
    top: -0.125rem;
    right: 0;
  }
  .delete-category-btn {
    top: 1.1875rem;
    right: 1rem;
  }
  .category {
    position: relative;
    margin: 1.75rem 0 0;
    padding: 1.3125rem 1.1875rem 1.1875rem;
    display: flex;
    flex-direction: column;
    gap: 1rem 0;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%);
    .form-items-grid {
      display: grid;
      gap: 1rem;
      .form-item {
        width: 100%;
      }
    }
  }
  .sizes-row {
    .size-item {
      display: grid;
      grid-template-columns: 1fr 1fr;
      &:first-of-type {
        .form-item {
          &:first-of-type {
            input {
              border-top-left-radius: 0.375rem;
            }
          }
          &:last-of-type {
            input {
              border-top-right-radius: 0.375rem;
            }
          }
        }
      }
      &:last-of-type {
        .form-item {
          &:first-of-type {
            input {
              border-bottom-left-radius: 0.375rem;
            }
          }
          &:last-of-type {
            input {
              border-bottom-right-radius: 0.375rem;
            }
          }
        }
      }
      &:not(first-of-type) {
        margin-left: -1px;
      }
      .form-item {
        &:first-of-type {
          input {
            font-size: 0.8125rem;
            font-weight: 500;
            color: #52525b;
          }
        }
        &:not(first-of-type) {
          margin-top: -1px;
          margin-left: -1px;
        }
        label {
          margin: 0;
        }
        input {
          border-radius: 0;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #000;
          z-index: 10;
          &:focus-visible {
            z-index: 20;
          }
        }
      }
    }
  }
  .add-category-btn,
  .add-group-btn {
    padding: 0.625rem 1.25rem;
    display: flex;
    justify-content: center;
    width: 100%;
    color: #111827;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;
    transition: background-color 150ms linear;
    &:hover {
      background-color: #fafafa;
    }
    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }
    &:focus-visible {
      text-decoration: underline;
    }
    .plus-icon {
      margin: 0.0625rem 0.1875rem 0 0;
      height: 0.875rem;
      width: 0.875rem;
      color: #52525b;
    }
  }
  .add-category-btn {
    margin-top: 1.5rem;
  }
  .add-group-section {
    margin-top: 0.375rem;
    padding-top: 1.625rem;
    border-top: 1px solid #d1d5db;
  }
  .form-actions {
    margin-top: 1.625rem;
    padding-top: 1.625rem;
    border-top: 1px solid #d1d5db;
    .submit-btn {
      padding: 0.625rem 1.25rem;
      width: 100%;
      color: #fff;
      background-color: #111827;
      border: none;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 150ms linear;
      &:hover {
        background-color: #1f2937;
      }
      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }
      &:focus-visible {
        text-decoration: underline;
      }
    }
    .validation-error {
      margin-top: 0.625rem;
    }
  }
  .validation-error {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #b91c1c;
  }
`;
