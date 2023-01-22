import styled from 'styled-components';
import { format } from 'date-fns';
import { InventoryProduct } from '../../interfaces';

type Props = {
  inventoryProduct: InventoryProduct;
};

export default function InventoryProductDetails(props: Props) {
  return (
    <InventoryProductDetailsStyles>
      <h3 className="section-title">Inventory product details</h3>
      <div className="details-grid">
        <div>
          <div className="detail-item">
            <div className="label">Merchandise code</div>
            <div className="value">
              {props.inventoryProduct.merchandiseCode}
            </div>
          </div>
          <div className="detail-item">
            <div className="label">Created</div>
            <div className="value">
              {format(
                new Date(props.inventoryProduct.createdAt),
                "MMM. dd, yyyy 'at' h:mmaa"
              )}
            </div>
          </div>
          <div className="detail-item">
            <div className="label">Last updated</div>
            <div className="value">
              {format(
                new Date(props.inventoryProduct.updatedAt),
                "MMM. dd, yyyy 'at' h:mmaa"
              )}
            </div>
          </div>
          <div className="detail-item">
            <div className="label">Description</div>
            <div className="value">{props.inventoryProduct.description}</div>
          </div>
          <div className="detail-item">
            <div className="label">Size Category</div>
            <div className="value">{props.inventoryProduct.sizeCategory}</div>
          </div>
          <div className="detail-item">
            <div className="label">Details</div>
            <div className="value">
              <ul>
                {props.inventoryProduct.details.length > 0 &&
                  props.inventoryProduct.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </InventoryProductDetailsStyles>
  );
}

const InventoryProductDetailsStyles = styled.div`
  .section-title {
    margin: 0 0 0.875rem;
    padding: 0 0 0.75rem;
    border-bottom: 1px solid #d1d5db;
  }

  .details-grid {
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

    ul {
      margin: 0;
      padding: 0 0 0 1rem;
    }

    li {
      padding: 0 0 0 0.25rem;
    }

    a:hover {
      color: #1c44b9;
      text-decoration: underline;
    }
  }
`;
