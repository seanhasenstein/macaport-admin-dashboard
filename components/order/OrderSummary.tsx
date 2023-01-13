import styled from 'styled-components';
import { OrderSummary as IOrderSummary } from '../../interfaces';
import { formatToMoney } from '../../utils';

type Props = {
  orderSummary: IOrderSummary;
};

export default function OrderSummary({ orderSummary }: Props) {
  return (
    <OrderSummaryStyles>
      <h3 className="section-title">Order summary</h3>
      <div className="detail-grid">
        <div>
          <div className="detail-item">
            <div className="label">Subtotal</div>
            <div className="value">
              {formatToMoney(orderSummary.subtotal, true)}
            </div>
          </div>

          <div className="detail-item">
            <div className="label">Sales Tax</div>
            <div className="value">
              {formatToMoney(orderSummary.salesTax, true)}
            </div>
          </div>

          <div className="detail-item">
            <div className="label">Shipping</div>
            <div className="value">
              {formatToMoney(orderSummary.shipping, true)}
            </div>
          </div>

          <div className="detail-item total">
            <div className="label">Total</div>
            <div className="value">
              {formatToMoney(orderSummary.total, true)}
            </div>
          </div>

          <div className="detail-item">
            <div className="label">Stripe Fee</div>
            <div className="value">
              -{formatToMoney(orderSummary.stripeFee, true)}
            </div>
          </div>

          <div className="detail-item">
            <div className="label">Net</div>
            <div className="value">
              {orderSummary.total - orderSummary.stripeFee < 0 ? '-' : ''}
              {formatToMoney(
                Math.abs(orderSummary.total - orderSummary.stripeFee),
                true
              )}
            </div>
          </div>
        </div>
      </div>
    </OrderSummaryStyles>
  );
}

const OrderSummaryStyles = styled.div`
  margin: 3.5rem 0 0;

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
