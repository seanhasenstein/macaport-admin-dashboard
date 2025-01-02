import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { format } from 'date-fns';

import { InventoryProductSearchResult as InvProdSearchResultType } from '../../interfaces';

type Props = InvProdSearchResultType & {
  buttonOnClick?: () => void;
  readOnly?: boolean;
  as?: 'li' | 'div';
};

export default function InventoryProductSearchResult(props: Props) {
  const renderButton = props.buttonOnClick && !props.readOnly;
  const renderLink = !props.buttonOnClick && !props.readOnly;
  const renderDiv = !renderButton && !renderLink;
  const as = props.as || 'li';

  return (
    <InventoryProductSearchResultStyles as={as}>
      {renderButton ? (
        <button
          type="button"
          onClick={props.buttonOnClick}
          className="search-result-button"
        >
          <div className="inv-prod-details">
            <p className="name">
              {props.name} ({props.merchandiseCode})
            </p>
            <div className="meta-row">
              {props.tag ? <p className="tag">{props.tag}</p> : null}
              <p className="total-colors">Colors: {props.colorsCount}</p>
              <p className="total-sizes">Sizes: {props.sizesCount}</p>
            </div>
          </div>
          <p className="last-updated">
            Last updated
            <br />
            {format(new Date(props.updatedAt), "MMM. d, yyyy 'at' K:mmaaa")}
          </p>
        </button>
      ) : null}
      {renderLink ? (
        <Link href={`/inventory-products/${props._id}`}>
          <a className="search-result-link">
            <div className="inv-prod-details">
              <p className="name">
                {props.name} ({props.merchandiseCode})
              </p>
              <div className="meta-row">
                {props.tag ? <p className="tag">{props.tag}</p> : null}
                <p className="total-colors">Colors: {props.colorsCount}</p>
                <p className="total-sizes">Sizes: {props.sizesCount}</p>
              </div>
            </div>
            <p className="last-updated">
              Last updated
              <br />
              {format(new Date(props.updatedAt), "MMM. d, yyyy 'at' K:mmaaa")}
            </p>
          </a>
        </Link>
      ) : null}
      {renderDiv ? (
        <div className="search-result-div">
          <div className="inv-prod-details">
            <p className="name">
              {props.name} ({props.merchandiseCode})
            </p>
            <div className="meta-row">
              {props.tag ? <p className="tag">{props.tag}</p> : null}
              <p className="total-colors">Colors: {props.colorsCount}</p>
              <p className="total-sizes">Sizes: {props.sizesCount}</p>
            </div>
          </div>
          <p className="last-updated">
            Last updated
            <br />
            {format(new Date(props.updatedAt), "MMM. d, yyyy 'at' K:mmaaa")}
          </p>
        </div>
      ) : null}
    </InventoryProductSearchResultStyles>
  );
}

const InventoryProductSearchResultStyles = styled.div`
  margin: 0;
  padding: 0;
  border-bottom: 1px solid #e5e7eb;
  list-style-type: none;
  &:last-of-type {
    border-bottom: none;
  }
  .search-result-link,
  .search-result-button,
  .search-result-div {
    margin: 0;
    padding: 0.75rem 1rem;
    display: grid;
    grid-template-columns: 1fr 10rem;
    align-items: center;
    width: 100%;
    background-color: transparent;
    border: none;
    text-align: left;
    .inv-prod-details {
      .name {
        margin: 0;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #111827;
      }
      .meta-row {
        margin: 0.1875rem 0 0;
        display: flex;
        .tag,
        .total-colors,
        .total-sizes {
          margin: 0;
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
        }
        .tag,
        .total-colors {
          padding-right: 0.625rem;
          border-right: 1px solid #e5e7eb;
        }
        .total-colors,
        .total-sizes {
          padding-left: 0.625rem;
        }
      }
    }
    .last-updated {
      margin: 0;
      font-size: 0.75rem;
      font-weight: 500;
      color: #6b7280;
      text-align: right;
      line-height: 150%;
    }
  }
  .search-result-link,
  .search-result-button {
    cursor: pointer;
    transition: background-color 0.2s ease;
    &:hover {
      background-color: #fafafa;
    }
  }
`;
