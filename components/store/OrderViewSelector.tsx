import styled from 'styled-components';

import { OrderView, OrderViewOption } from '../../utils/store';

type Props = {
  viewOptions: OrderViewOption[];
  selectedView: OrderView;
  setSelectedView: (view: OrderView) => void;
};

function parseValue(value: string): OrderView {
  if (value === 'outstanding' || value === 'all') return value;
  return Number(value);
}

function labelFor(option: OrderViewOption): string {
  if (option.view === 'outstanding') return `Outstanding (${option.count})`;
  if (option.view === 'all') return `All years (${option.count})`;
  return `${option.view} (${option.count})`;
}

export default function OrderViewSelector({
  viewOptions,
  selectedView,
  setSelectedView,
}: Props) {
  if (viewOptions.length < 2) return null;

  const outstandingOption = viewOptions.find(o => o.view === 'outstanding');
  const yearAndAllOptions = viewOptions.filter(o => o.view !== 'outstanding');

  return (
    <OrderViewSelectorStyles>
      <label htmlFor="order-view" className="sr-only">
        Show orders
      </label>
      <select
        id="order-view"
        value={selectedView}
        onChange={e => setSelectedView(parseValue(e.target.value))}
      >
        {outstandingOption && (
          <option value="outstanding">{labelFor(outstandingOption)}</option>
        )}
        {outstandingOption ? (
          <optgroup label="By year">
            {yearAndAllOptions.map(option => (
              <option key={String(option.view)} value={option.view}>
                {labelFor(option)}
              </option>
            ))}
          </optgroup>
        ) : (
          yearAndAllOptions.map(option => (
            <option key={String(option.view)} value={option.view}>
              {labelFor(option)}
            </option>
          ))
        )}
      </select>
    </OrderViewSelectorStyles>
  );
}

const OrderViewSelectorStyles = styled.div`
  display: flex;
  align-items: center;

  select {
    padding: 0.4375rem 2rem 0.4375rem 0.75rem;
    background-color: #fff;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd' /%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    font-size: 0.875rem;
    font-weight: 500;
    color: #1f2937;
    cursor: pointer;
    appearance: none;

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
      border-color: #1c44b9;
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
        #1c44b9 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
    }

    &:hover {
      border-color: #9199a6;
    }
  }
`;
