import React from 'react';
import styled from 'styled-components';
import { PersonalizationItem } from '../../interfaces';
import { formatToMoney } from '../../utils';

type ItemProps = {
  item: PersonalizationItem;
};

export default function StoreProductSubItem({ item }: ItemProps) {
  const [isSubItemOpen, setIsSubItemOpen] = React.useState(false);

  return (
    <SubItemStyles $isSubItemOpen={isSubItemOpen}>
      <button
        type="button"
        onClick={() => setIsSubItemOpen(!isSubItemOpen)}
        className="subitem-button"
      >
        <span>{item.name}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isSubItemOpen ? (
        <div className="subitem">
          <div className="detail-item">
            <div className="label">Type</div>
            <div className="value">
              {item.type === 'list'
                ? 'List'
                : item.type === 'number'
                ? 'Numbers'
                : 'Alphanumeric characters (A-Z and 0-9)'}
            </div>
          </div>
          {item.type === 'list' ? (
            <div className="detail-item">
              <div className="label">List</div>
              <div className="value">
                {item.list.map((listItem, i, a) => {
                  if (i + 1 === a.length) {
                    return listItem;
                  } else {
                    return `${listItem}, `;
                  }
                })}
              </div>
            </div>
          ) : null}
          <div className="detail-item">
            <div className="label">Price</div>
            <div className="value">{formatToMoney(item.price, true)}</div>
          </div>
          <div className="detail-item">
            <div className="label">Location</div>
            <div className="value">{item.location}</div>
          </div>
          <div className="detail-item">
            <div className="label">Lines</div>
            <div className="value">{item.lines}</div>
          </div>
          <div className="detail-item">
            <div className="label">Limit</div>
            <div className="value">{item.limit}</div>
          </div>
        </div>
      ) : null}
    </SubItemStyles>
  );
}

const SubItemStyles = styled.div<{ $isSubItemOpen: boolean }>`
  margin: -1px 0 0;
  padding: 0 0.5rem;
  max-width: 40rem;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;

  &:last-of-type {
    border-bottom: none;
  }

  .subitem-button {
    margin: ${props => (props.$isSubItemOpen ? '0 0 0.25rem' : '0')};
    padding: 0.875rem 0;
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.9375rem;
    font-weight: 500;
    color: ${props => (props.$isSubItemOpen ? '#111827' : '#4b5563')};

    svg {
      height: 1rem;
      width: 1rem;
      color: #6b7280;
      transform: ${props =>
        props.$isSubItemOpen ? 'rotate(0.5turn)' : 'rotate(0turn)'};
    }

    &:hover {
      color: #111827;

      svg {
        color: #111827;
      }
    }
  }
`;
