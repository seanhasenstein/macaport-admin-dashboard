import styled from 'styled-components';
import { StoreProduct } from '../../interfaces';
import StoreProductAddon from './StoreProductAddon';

type Props = {
  storeProduct: StoreProduct;
};

export default function StoreProductPersonzalization({ storeProduct }: Props) {
  return (
    <PersonalizationStyles>
      <h3 className="section-title">Personalization Addons</h3>
      <div className="detail-item">
        <div className="label">Status</div>
        <div className="value">
          {storeProduct.personalization.active ? 'Active' : 'Inactive'}
        </div>
      </div>

      {storeProduct.personalization.active ? (
        <>
          <div className="detail-item">
            <div className="label">Max lines</div>
            <div className="value">{storeProduct.personalization.maxLines}</div>
          </div>

          <div className="addon-items">
            <h4>Addon items</h4>
            {storeProduct.personalization.addons.map(item => (
              <StoreProductAddon key={item.id} item={item} />
            ))}
          </div>
        </>
      ) : null}
    </PersonalizationStyles>
  );
}

const PersonalizationStyles = styled.div`
  margin: 3.5rem 0 0;

  .addon-items {
    margin: 1.5rem 0 0;
  }

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
  }
`;
