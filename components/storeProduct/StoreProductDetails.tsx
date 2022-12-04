import styled from 'styled-components';
import { StoreProduct } from '../../interfaces';

type Props = {
  storeProduct: StoreProduct;
};

export default function StoreProductDetails({ storeProduct }: Props) {
  return (
    <StoreProductDetailsStyles>
      <h3 className="section-title">Store product details</h3>

      <div className="detail-item">
        <div className="label">Artwork ID</div>
        <div className="value">{storeProduct.artworkId || 'Not provided'}</div>
      </div>

      <div className="detail-item">
        <div className="label">Merchandise code</div>
        <div className="value">{storeProduct.merchandiseCode}</div>
      </div>

      {storeProduct.description && (
        <div className="detail-item">
          <div className="label">Product description</div>
          <div className="value">{storeProduct.description}</div>
        </div>
      )}

      {storeProduct.tag && (
        <div className="detail-item">
          <div className="label">Tag</div>
          <div className="value">{storeProduct.tag}</div>
        </div>
      )}

      {storeProduct.details && storeProduct.details.length > 0 && (
        <div className="detail-item">
          <div className="label">Details</div>
          <div className="value">
            <ul>
              {storeProduct.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </StoreProductDetailsStyles>
  );
}

const StoreProductDetailsStyles = styled.div`
  margin: 3.5rem 0 0;

  .detail-item {
    margin: 0 0 0.75rem;
    display: grid;
    grid-template-columns: 11rem 1fr;
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

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      margin: 0 0 0.25rem;
    }
  }
`;
