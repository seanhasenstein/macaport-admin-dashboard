import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { format } from 'date-fns';
import { Store } from '../../interfaces';
import useCsvDownload from '../../hooks/useCsvDownload';
import useOutsideClick from '../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';
import { getQueryParameter, slugify } from '../../utils';
import LoadingSpinner from '../LoadingSpinner';

type Props = {
  containerRef: React.RefObject<HTMLDivElement>;
  store: Store;
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CSVDownloadModal({
  containerRef,
  store,
  showModal,
  setShowModal,
}: Props) {
  const router = useRouter();

  const [allFields, setAllFields] = React.useState(true);
  const [fields, setFields] = React.useState(() => [
    { id: 1, field: 'orderId', checked: true },
    { id: 2, field: 'date', checked: true },
    ...(store.requireGroupSelection
      ? [{ id: 3, field: store.groupTerm, checked: true }]
      : []),
    { id: 4, field: 'customer.firstName', checked: true },
    { id: 5, field: 'customer.lastName', checked: true },
    { id: 6, field: 'customer.email', checked: true },
    { id: 7, field: 'customer.phone', checked: true },
    { id: 8, field: 'note', checked: true },
    { id: 9, field: 'orderItems', checked: true },
    { id: 10, field: 'uniqueItems', checked: true },
    { id: 11, field: 'totalItems', checked: true },
    { id: 12, field: 'orderStatus', checked: true },
    { id: 13, field: 'summary.subtotal', checked: true },
    { id: 14, field: 'summary.shipping', checked: true },
    { id: 15, field: 'summary.salesTax', checked: true },
    { id: 16, field: 'summary.total', checked: true },
    { id: 17, field: 'summary.stripeFee', checked: true },
    { id: 18, field: 'summary.netTotal', checked: true },
    { id: 19, field: 'shippingMethod', checked: true },
    ...(store.hasPrimaryShippingLocation || store.allowDirectShipping
      ? [
          { id: 20, field: 'shippingAddress.street', checked: true },
          { id: 21, field: 'shippingAddress.street2', checked: true },
          { id: 22, field: 'shippingAddress.city', checked: true },
          { id: 23, field: 'shippingAddress.state', checked: true },
          { id: 24, field: 'shippingAddress.zipcode', checked: true },
        ]
      : []),
    { id: 25, field: 'stripeId', checked: true },
  ]);

  const csvLinkRef = React.useRef<HTMLAnchorElement>(null);

  const closeModal = () => setShowModal(false);

  useOutsideClick(showModal, closeModal, containerRef);
  useEscapeKeydownClose(showModal, closeModal);

  const [enableCsvQuery, csvQuery] = useCsvDownload(
    getQueryParameter(router.query.id),
    fields,
    {
      onSuccess: (data: string) => {
        csvLinkRef.current?.setAttribute(
          'href',
          `data:text/csv;charset=utf-8,${data}`
        );
        csvLinkRef.current?.setAttribute(
          'download',
          `${slugify(store.name || '')}-orders-${format(
            new Date(),
            'MMddyyHHmmss'
          )}.csv`
        );
        csvLinkRef.current?.click();
        enableCsvQuery(false);
      },
    }
  );

  React.useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'inherit';
    };
  }, [showModal]);

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldId: number
  ) => {
    setFields(prevFields =>
      prevFields.map(pf =>
        pf.id === fieldId ? { ...pf, checked: !pf.checked } : pf
      )
    );

    if (e.target.value && allFields) {
      setAllFields(false);
    }
  };

  const handleAllFieldsChange = () => {
    setFields(fields.map(f => ({ ...f, checked: !allFields })));
    setAllFields(!allFields);
  };

  return (
    <CSVDownloadModalStyles>
      <div ref={containerRef} className="modal">
        <div className="heading">
          <h3>Download {store.name} Orders CSV</h3>

          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="close-button"
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
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        <div className="body">
          <h4>Select Fields</h4>
          <div className="fields">
            <div className="field fields-header">
              <div className="field-checkbox">
                <input
                  type="checkbox"
                  name="allFields"
                  id="allFields"
                  checked={allFields}
                  onChange={() => handleAllFieldsChange()}
                />
                <label htmlFor="allFields" className="sr-only">
                  Toggle All Fields
                </label>
              </div>
              <div className="field-index" />
              <div className="field-name">Field Name</div>
            </div>
            {fields.map((f, i) => (
              <div key={f.id} className="field">
                <div className="field-checkbox">
                  <input
                    type="checkbox"
                    name={f.field}
                    id={f.field}
                    checked={f.checked}
                    onChange={e => handleCheckboxChange(e, f.id)}
                  />
                  <label htmlFor={f.field} className="sr-only">
                    {f.field}
                  </label>
                </div>
                <div className="field-index">{i}</div>
                <div className="field-name">{f.field}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="actions">
          {csvQuery.isFetching ? (
            <LoadingSpinner isLoading={csvQuery.isFetching} />
          ) : (
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="cancel-button"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() => enableCsvQuery(true)}
            disabled={csvQuery.isFetching}
            className="download-button"
          >
            Download File
          </button>
          <a ref={csvLinkRef} className="sr-only">
            Download orders
          </a>
          {csvQuery.isSuccess && (
            <div className="success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Download successful</span>
            </div>
          )}
        </div>
      </div>
    </CSVDownloadModalStyles>
  );
}

const CSVDownloadModalStyles = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;

  .modal {
    position: relative;
    margin: 6rem 0 0;
    padding: 2rem 2.5rem 1.5rem;
    max-width: 40rem;
    width: 100%;
    text-align: left;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  }

  .heading {
    display: flex;
    justify-content: space-between;
  }

  .close-button {
    padding: 0.125rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;
    border-radius: 9999px;
    border: none;
    color: #9ca3af;
    cursor: pointer;

    svg {
      height: 1.125rem;
      width: 1.125rem;
    }

    &:hover {
      color: #1f2937;
    }
  }

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }

  .body {
    margin: 2.5rem 0 0;
  }

  h4 {
    margin: 0;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #111827;
  }

  .fields {
    margin: 1rem 0 0;
    max-height: 300px;
    overflow-y: scroll;
    border: 1px solid #e5e7eb;
    border-radius: 0.125rem;
  }

  .field {
    display: grid;
    grid-template-columns: 2rem 2rem auto;
    font-family: 'Menlo', monospace;
    font-size: 0.8125rem;
    border-bottom: 1px solid #e5e7eb;

    &.fields-header {
      background-color: #f3f4f6;
      font-size: 0.75rem;
      font-weight: 600;
    }

    > div {
      padding: 0.375rem 0.5rem;
      display: flex;
      align-items: center;
      border-right: 1px solid #e5e7eb;
      line-height: 1;

      &:last-of-type {
        border-right: none;
      }
    }

    .field-checkbox {
      justify-content: center;

      input {
        margin: 0;
        border-radius: 0.1875rem;
      }
    }

    .field-index {
      text-align: center;
      justify-content: center;
      color: #6b7280;
    }

    .field-name {
      color: #111827;
    }

    &:last-of-type {
      border-bottom: none;
    }
  }

  .actions {
    position: relative;
    margin: 2rem 0 0;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .cancel-button,
  .download-button {
    padding: 0.4375rem 1rem;
    display: flex;
    align-items: center;
    font-weight: 500;
    border-radius: 0.25rem;
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

  .cancel-button {
    background-color: #fff;
    border: 1px solid #b2b7c1;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);

    &:hover {
      border-color: #9199a6;
    }
  }

  .download-button {
    background-color: #059669;
    border: 1px solid #065f46;
    color: #fff;
    box-shadow: inset 0 1px 1px #10b981;

    &:hover {
      background-color: #0b9067;
    }
  }

  .success {
    position: absolute;
    bottom: 0.375rem;
    left: 0;
    display: flex;
    align-items: center;
    gap: 0.375rem;

    svg {
      height: 1.125rem;
      width: 1.125rem;
      color: #059669;
    }

    span {
      font-size: 0.9375rem;
      font-weight: 500;
      color: #374151;
      line-height: 1.35;
    }
  }
`;
