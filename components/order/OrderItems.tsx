import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { formatToMoney } from '../../utils';
import { Order } from '../../interfaces';

type Props = {
  order: Order;
};

export default function OrderItems({ order }: Props) {
  const router = useRouter();

  return (
    <OrderItemsStyles>
      <h4>Order items</h4>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Color</th>
              <th>Size</th>
              <th>Price</th>
              <th className="text-center">Qty.</th>
              <th className="text-right">Item Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={`${item.sku.id}-${index}`} className="order-item">
                <td>
                  <div className="product-name">
                    <Link
                      href={`/stores/${router.query.sid}/product?pid=${item.sku.storeProductId}`}
                    >
                      {item.name}
                    </Link>
                  </div>
                  {item.personalizationAddons.length > 0 && (
                    <div className="addon-items">
                      {item.personalizationAddons.map(addonItem => (
                        <div key={addonItem.id} className="addon-item">
                          <div className="flex-row-center">
                            <span className="addon-label">
                              {addonItem.addon}:
                            </span>
                            <span className="addon-value">
                              {addonItem.value}
                            </span>
                            <span className="addon-location">
                              [{addonItem.location.toLowerCase()}]
                            </span>
                          </div>
                          {addonItem.subItems.map(subitem => (
                            <div
                              key={subitem.id}
                              className="addon-item flex-row-center"
                            >
                              <span className="addon-label">
                                {subitem.addon}:
                              </span>
                              <span className="addon-value">
                                {subitem.value}
                              </span>
                              <span className="addon-location">
                                [{subitem.location.toLowerCase()}]
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td>{item.sku.color.label}</td>
                <td>{item.sku.size.label}</td>
                <td>{formatToMoney(item.price)}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">
                  {formatToMoney(item.itemTotal, true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </OrderItemsStyles>
  );
}

const OrderItemsStyles = styled.div`
  margin: 3.5rem 0 0;

  .table-container {
    width: 100%;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  td,
  th {
    border-bottom: 1px solid #e5e7eb;
  }

  th {
    padding: 0.875rem 1rem;
    background-color: #f3f4f6;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.0375em;
    color: #6b7280;

    &:first-of-type {
      border-top-left-radius: 0.375rem;
    }

    &:last-of-type {
      border-top-right-radius: 0.375rem;
    }
  }

  tr:last-of-type {
    td {
      border-bottom: none;

      &:first-of-type {
        border-bottom-left-radius: 0.375rem;
      }

      &:last-of-type {
        border-bottom-right-radius: 0.375rem;
      }
    }
  }

  td {
    padding: 0.875rem 1rem;
    background-color: #fff;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;

    .product-name {
      margin: 0 0 1px;
      font-weight: 500;
      color: #000;
    }

    .product-id {
      font-family: 'Dank Mono', monospace;
      font-size: 0.875rem;
      font-weight: 700;
      color: #6b7280;
    }

    a {
      &:hover {
        text-decoration: underline;
      }

      &:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      &:focus-visible {
        text-decoration: underline;
        color: #1c44b9;
      }
    }
  }

  .addon-items {
    margin: 0.3125rem 0 0 0;
  }

  .addon-item {
    margin: 0.25rem 0 0;
    font-size: 0.8125rem;
    color: #374151;
  }

  .flex-row-center {
    display: flex;
    align-items: center;
  }

  .addon-label {
    margin: 0 0.25rem 0 0;
    display: inline-flex;
    color: #6b7280;
  }

  .addon-location {
    margin: 0 0 0 0.25rem;
    font-size: 0.625rem;
    color: #6b7280;
  }
`;
