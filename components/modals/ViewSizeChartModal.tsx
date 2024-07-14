import React from 'react';
import styled from 'styled-components';

import Modal from '../Modal';

import { Size, SizeChart } from '../../interfaces';

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  productName: string;
  productSizes: Size[];
  sizeChart: SizeChart | undefined;
};

export default function ViewSizeChartModal({
  isOpen,
  closeModal,
  productName,
  productSizes,
  sizeChart,
}: Props) {
  const initialSizes = productSizes.map(size => [size.label]);
  const tableHeaderItems = [
    'Size',
    ...(sizeChart?.map(cat => `${cat.name} (${cat.unit.toLowerCase()})`) || []),
  ];
  const formattedSizeChart = sizeChart?.reduce((acc, currCategory) => {
    const accumulatorUpdate = acc.map(sizeArray => {
      const categorySize = currCategory.sizes.find(
        catSize => catSize.label === sizeArray[0]
      );
      return [...sizeArray, categorySize ? categorySize.value : ''];
    });
    return accumulatorUpdate;
  }, initialSizes);

  if (!isOpen) return null;

  return (
    <SizeChartModalComponent>
      <Modal
        isOpen={isOpen}
        closeModal={closeModal}
        customModalClass="custom-modal-container"
        customCloseClass="custom-close-btn"
      >
        <div className="modal-header">
          <div className="product-image">
            <img src="/images/primary-image-example.jpg" alt={productName} />
          </div>
          <h3 className="modal-title">Size Guide - {productName}</h3>
        </div>
        <div className="size-chart-table">
          <table>
            <thead>
              <tr>
                {tableHeaderItems.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formattedSizeChart?.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </SizeChartModalComponent>
  );
}

const SizeChartModalComponent = styled.div`
  .custom-modal-container {
    padding: 1rem 1.25rem;
    width: calc(100% - 2.5rem);
    max-width: 50rem;
    height: calc(100vh - 2.5rem);
    overflow-y: auto;
    background-color: #fafafa;
    .modal-header {
      margin: 0.25rem 0 0;
      display: flex;
      gap: 0 0.875rem;
      .product-image {
        padding: 0.3125rem;
        height: 3rem;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #fff;
        border: 1px solid #d4d4d8;
        border-radius: 0.25rem;
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        img {
          height: 100%;
          width: auto;
        }
      }
      .modal-title {
        margin: 0;
        padding-right: 2rem;
        max-width: 22rem;
        font-size: 1rem;
        font-weight: 600;
        line-height: 140%;
        color: #111827;
        letter-spacing: -0.01em;
      }
    }
    .custom-close-btn {
      color: #71717a;
      svg {
        height: 1.625rem;
        width: 1.625rem;
      }
    }
    .size-chart-table {
      overflow-x: auto;
      margin: 1.5rem 0 0;
      border: 1px solid #e4e4e7;
      border-radius: 0.375rem;
      background-color: #fff;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.035),
        0 2px 4px -2px rgb(0 0 0 / 0.035);

      table {
        border-collapse: separate;
        border-spacing: 0;
        min-width: 100%;
        th,
        td {
          padding-left: 1rem;
          padding-right: 1rem;
          min-width: 8rem;
          &:first-of-type {
            position: sticky;
            left: 0;
            z-index: 2;
            white-space: nowrap;
          }
        }
        th {
          padding-top: 0.6875rem;
          padding-bottom: 0.6875rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #f4f4f5;
          text-align: left;
          border-right: 1px solid #52525b;
          background-color: #27272a;
          &:first-of-type {
            border-top-left-radius: 0.375rem;
          }
          &:last-of-type {
            border-top-right-radius: 0.375rem;
          }
        }
        td {
          padding-top: 0.625rem;
          padding-bottom: 0.625rem;
          font-size: 0.8125rem;
          color: #000;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
        }
        tr {
          &:nth-of-type(odd) {
            td {
              background-color: #fff;
            }
          }
          &:nth-of-type(even) {
            td {
              background-color: #f4f4f5;
            }
          }
          th,
          td {
            &:last-of-type {
              border-right: none;
            }
          }
          &:last-of-type {
            td {
              border-bottom: none;
            }
          }
        }
      }
    }
  }

  @media (min-width: 768px) {
    .custom-modal-container {
      padding: 1.375rem 2rem;
    }
  }
`;
