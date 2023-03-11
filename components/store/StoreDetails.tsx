import styled from 'styled-components';
import { format } from 'date-fns';
import { formatPhoneNumber } from '../../utils';
import { Store } from '../../interfaces';

type Props = {
  store: Store;
};

export default function StoreDetails({ store }: Props) {
  const { name, street, street2, city, state, zipcode } =
    store.primaryShippingLocation;

  return (
    <StoreDetailsStyles>
      <h3 className="section-title">Store details</h3>
      <div className="grid">
        <div>
          <div className="detail-item">
            <div className="label">Open date</div>
            <div className="value">
              {format(new Date(store.openDate), "MMM. dd, yyyy 'at' h:mmaa")}
            </div>
          </div>

          <div className="detail-item">
            <div className="label">Close date</div>
            <div className="value">
              {store.closeDate
                ? format(new Date(store.closeDate), "MMM. dd, yyyy 'at' h:mmaa")
                : 'Permanently Open'}
            </div>
          </div>

          <div className="detail-item">
            <div className="label">Primary shipping</div>
            <div className="value">
              {store.hasPrimaryShippingLocation ? (
                <>
                  {name && <div>{name}</div>}
                  <div>
                    {street} {street2} {city}
                    {city && state && ','} {state} {zipcode}
                  </div>
                </>
              ) : (
                'None'
              )}
            </div>
          </div>

          <div className="detail-item">
            <div className="label">Direct shipping</div>
            <div className="value">
              {store.allowDirectShipping ? 'Yes' : 'No'}
            </div>
          </div>

          <div className="detail-item">
            <div className="label">Name</div>
            <div className="value">
              {store.contact.firstName} {store.contact.lastName}
            </div>
          </div>

          <div className="detail-item">
            <div className="label">Email</div>
            <div className="value">
              <a href={`mailto:${store.contact.email}`}>
                {store.contact.email}
              </a>
            </div>
          </div>

          <div className="detail-item">
            <div className="label">Phone</div>
            <div className="value">
              {formatPhoneNumber(store.contact.phone)}
            </div>
          </div>
          <div className="detail-item">
            <div className="label">Show on stores page</div>
            <div className="value">{store.showOnStoresPage ? 'Yes' : 'No'}</div>
          </div>
        </div>

        <div>
          <div className="detail-item">
            <div className="label">Require group</div>
            <div className="value capitalize">
              {store.requireGroupSelection ? store.groupTerm : 'No'}
            </div>
          </div>

          {store.requireGroupSelection && (
            <div className="detail-item">
              <div className="label capitalize">{`${store.groupTerm}s`}</div>
              <div className="value">
                <ul>
                  {store.groups.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </StoreDetailsStyles>
  );
}

const StoreDetailsStyles = styled.div`
  margin: 1.5rem 0 0;
  padding: 0 0 0.5rem;
  border-bottom: 1px solid #d1d5db;

  .grid {
    padding: 0.875rem 0 0;
    display: flex;
    gap: 8rem;
  }

  .detail-item {
    margin: 0 0 0.75rem;
    display: grid;
    grid-template-columns: 12rem 1fr;
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
      padding: 0;
      list-style: none;
    }

    li {
      margin: 0 0 0.25rem;
    }

    a:hover {
      color: #1c44b9;
      text-decoration: underline;
    }
  }
`;
