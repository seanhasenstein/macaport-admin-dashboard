import { format } from 'date-fns';
import styled from 'styled-components';
import { Order } from '../../interfaces';
import { formatPhoneNumber } from '../../utils';

type Props = {
  order: Order;
  store: {
    requireGroupSelection: boolean;
    groupTerm: string;
  };
};

export default function OrderDetails({ order, store }: Props) {
  return (
    <OrderDetailsStyles>
      <h3 className="section-title">Order details</h3>
      <div className="detail-grid">
        <div>
          <div className="detail-item">
            <div className="label">Order Date</div>
            <div className="value">
              {format(new Date(order.createdAt), "MMM. dd, yyyy 'at' h:mmaa")}
            </div>
          </div>

          <div className="detail-item">
            <div className="label">Order No.</div>
            <div className="value">{order.orderId}</div>
          </div>

          <div className="detail-item">
            <div className="label">Store</div>
            <div className="value">{order.store.name}</div>
          </div>

          {store.requireGroupSelection && (
            <div className="detail-item">
              <div className="label">{store.groupTerm}</div>
              <div className="value">{order.group}</div>
            </div>
          )}

          <div className="detail-item">
            <div className="label">Shipping Method</div>
            <div className="value">{order.shippingMethod}</div>
          </div>

          <div className="detail-item">
            <div className="label">Shipping address</div>
            <div className="value">
              {order.shippingAddress?.name && order.shippingAddress?.name}
              {order.shippingAddress?.street && (
                <>
                  <br />
                  {order.shippingAddress?.street}
                </>
              )}{' '}
              {order.shippingAddress?.street2 && (
                <>
                  <br />
                  {order.shippingAddress?.street2}
                </>
              )}
              {order.shippingAddress.city ||
              order.shippingAddress.state ||
              order.shippingAddress.zipcode ? (
                <br />
              ) : null}
              {order.shippingAddress?.city}
              {order.shippingAddress?.state &&
                `, ${order.shippingAddress?.state}`}{' '}
              {order.shippingAddress?.zipcode}
            </div>
          </div>
        </div>

        <div>
          <div className="detail-item">
            <div className="label">Customer name</div>
            <div className="value">
              {order.customer.firstName} {order.customer.lastName}
            </div>
          </div>

          <div className="detail-item">
            <div className="label">Customer email</div>
            <div className="value">
              <a href={`mailto:${order.customer.email}`}>
                {order.customer.email}
              </a>
            </div>
          </div>

          <div className="detail-item">
            <div className="label">Customer phone</div>
            <div className="value">
              {formatPhoneNumber(order.customer.phone)}
            </div>
          </div>

          <div className="detail-item">
            <div className="label">Order note</div>
            <div className="value">{order.note ?? ''}</div>
          </div>
        </div>
      </div>
    </OrderDetailsStyles>
  );
}

const OrderDetailsStyles = styled.div`
  .section-title {
    margin: 0 0 0.875rem;
    padding: 0 0 0.75rem;
    border-bottom: 1px solid #d1d5db;
  }

  .detail-grid {
    margin: 1.5rem 0 0;
    padding: 0 0 0.5rem;
    display: flex;
    gap: 8rem;
    border-bottom: 1px solid #d1d5db;
  }

  .detail-item {
    margin: 0 0 0.75rem;
    display: grid;
    grid-template-columns: 10rem 1fr;
  }

  .label {
    margin: 0 0 0.4375rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #6b7280;
    text-transform: capitalize;
  }

  .value {
    font-size: 0.9375rem;
    color: #111827;
    line-height: 1.5;

    a:hover {
      color: #1c44b9;
      text-decoration: underline;
    }
  }
`;
