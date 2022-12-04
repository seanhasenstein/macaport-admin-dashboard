import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { formatToMoney } from '../../utils';
import { Order } from '../../interfaces';
import Table from '../common/Table';

type Props = {
  order: Order;
};

export default function OrderItems({ order }: Props) {
  const router = useRouter();

  return (
    <OrderItemsStyles>
      <h4>Order items</h4>
      <Table>
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
                  <div className="meta-item">
                    <span className="label">Artwork ID:</span>
                    <span className="value">
                      {item.artworkId || 'Not provided'}
                    </span>
                  </div>
                  {item.personalizationAddons.length > 0 && (
                    <div className="addon-items">
                      {item.personalizationAddons.map(addonItem => (
                        <div key={addonItem.id} className="meta-item">
                          <div className="flex-row-center">
                            <span className="label">{addonItem.addon}:</span>
                            <span className="value">{addonItem.value}</span>
                            <span className="addon-location">
                              [{addonItem.location.toLowerCase()}]
                            </span>
                          </div>
                          {addonItem.subItems.map(subitem => (
                            <div
                              key={subitem.id}
                              className="meta-item flex-row-center"
                            >
                              <span className="label">{subitem.addon}:</span>
                              <span className="value">{subitem.value}</span>
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
      </Table>
    </OrderItemsStyles>
  );
}

const OrderItemsStyles = styled.div`
  margin: 3.5rem 0 0;

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

  .addon-items {
    margin: 0.3125rem 0 0 0;
  }

  .meta-item {
    margin: 0.25rem 0 0;
  }

  .flex-row-center {
    display: flex;
    align-items: center;
  }

  .label {
    margin: 0 0.25rem 0 0;
    display: inline-flex;
    color: #6b7280;
  }

  .value {
    font-size: 0.8125rem;
    color: #1f2937;
  }

  .addon-location {
    margin: 0 0 0 0.25rem;
    font-size: 0.6875rem;
    color: #6b7280;
  }
`;
