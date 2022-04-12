import React from 'react';
import styled from 'styled-components';
import { PersonalizationItem } from '../../interfaces';
import { formatToMoney } from '../../utils';
import SubItem from './SubItem';

type ItemProps = {
  item: PersonalizationItem;
};

export default function AddonItem({ item }: ItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <AddonItemStyles isOpen={isOpen}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="addon-button"
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
      {isOpen ? (
        <div>
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
          {item.subItems.length > 0 ? (
            <>
              <div className="subitems">
                <h4>Subitems</h4>

                {item.subItems.map(subitem => (
                  <SubItem key={subitem.id} item={subitem} />
                ))}
              </div>
            </>
          ) : (
            <div className="detail-item">
              <div className="label">Subitems</div>
              <div className="value">None</div>
            </div>
          )}
        </div>
      ) : null}
    </AddonItemStyles>
  );
}

const AddonItemStyles = styled.div<{ isOpen: boolean }>`
  margin-top: -1px;
  padding: ${props => (props.isOpen ? '0 1rem' : '0 0.5rem')};
  max-width: 40rem;
  width: 100%;
  background-color: ${props => (props.isOpen ? '#fff' : 'transparent')};
  border-top: ${props => (props.isOpen ? '1px solid #e5e7eb;' : 'none')};
  border-bottom: 1px solid #e5e7eb;
  border-right: ${props => (props.isOpen ? '1px solid #e5e7eb' : 'none')};
  border-left: ${props => (props.isOpen ? '1px solid #e5e7eb' : 'none')};

  &:first-of-type {
    margin-top: 0;
    border-top: 1px solid #e5e7eb;
  }

  .addon-button {
    margin: ${props => (props.isOpen ? '0 0 0.25rem' : '0')};
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
    color: ${props => (props.isOpen ? '#111827' : '#4b5563')};

    svg {
      height: 1rem;
      width: 1rem;
      color: #6b7280;
      transform: ${props =>
        props.isOpen ? 'rotate(0.5turn)' : 'rotate(0turn)'};
    }

    &:hover {
      color: #111827;

      svg {
        color: #111827;
      }
    }
  }

  .detail-item {
    margin: 0 0 0.25rem;
  }

  .subitems {
    margin: 1rem 0 0;

    h4 {
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.075em;
    }
  }
`;
