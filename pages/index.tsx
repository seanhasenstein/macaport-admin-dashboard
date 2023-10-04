import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
// import useHomepageData from '../hooks/useHomepageData';
import Layout from '../components/Layout';
// import PageNavButtons from '../components/PageNavButtons';
// import StoresTable from '../components/storesTable/StoresTable';
// import TableLoadingSpinner from '../components/TableLoadingSpinner';
// import HomepageMenu from '../components/home/HomepageMenu';
// import ShippingPriceModal from '../components/home/ShippingPriceModal';
// import useShippingDetailsMutation from '../hooks/useShippingDetailsMutation';

export default function Index() {
  // const query = useHomepageData();
  // const [showMenu, setShowMenu] = React.useState(false);
  // const [showShippingModal, setShowShippingModal] = React.useState(false);
  // const { updateShippingDetails } = useShippingDetailsMutation(query.data);

  return (
    <Layout
      // loading={query.isLoading}
      requiresAuth={true}
      title="Dashboard home"
    >
      <IndexStyles>
        <div className="temp-page-styles">
          <h3>Click on a link below to go to the store's dashboard.</h3>
          <ul>
            <li>
              <Link href="/stores/64d82b83c4a496000839856f">
                Sheboygan Lutheran CC
              </Link>
            </li>
            <li>
              <Link href="/stores/65131e0b2e363300081d11d3">
                New London Homecoming
              </Link>
            </li>
            <li>
              <Link href="/stores/651ae7a10d1b5f0008223edb">
                Bethlehem Lutheran
              </Link>
            </li>
            <li>
              <Link href="/stores/6512e56e804d810008517114">
                New London DECA
              </Link>
            </li>
            <li>
              <Link href="/stores/650dc37d4ef6c00008476983">
                Waupaca Hockey
              </Link>
            </li>
            <li>
              <Link href="/stores/64ee1e2a3eb408000962ac26">
                Switch Fitness
              </Link>
            </li>
          </ul>
        </div>
        {/* {(query.isLoading || query.isFetching) && <TableLoadingSpinner />}
        {query.data && !query.isFetching && (
          <>
            <div className="container">
              <div className="homepage-actions">
                <PageNavButtons />
                <HomepageMenu
                  showMenu={showMenu}
                  setShowMenu={setShowMenu}
                  shipping={query.data.shipping}
                  setShowShippingModal={setShowShippingModal}
                  successfulMutation={updateShippingDetails.isSuccess}
                />
              </div>
              <StoresTable
                stores={query.data.stores}
                tableLabel="Dashboard home"
              />
            </div>
            {showShippingModal ? (
              <ShippingPriceModal
                initialValues={query.data.shipping}
                homepageStores={query.data.stores}
                showModal={showShippingModal}
                setShowModal={setShowShippingModal}
                updateShippingDetails={updateShippingDetails}
                onSuccess={() => {
                  setShowMenu(true);
                }}
              />
            ) : null}
          </>
        )}*/}
      </IndexStyles>
    </Layout>
  );
}

const IndexStyles = styled.div`
  position: relative;

  .temp-page-styles {
    margin: 5rem 0 0;
    h3 {
      text-align: center;
    }
    ul {
      margin: 1%.5 0 0;
      padding: 0;
      list-style-type: none;
      text-align: center;
      li {
        margin: 2rem 0 0;
        a {
          text-decoration: underline;
          color: #000;
        }
      }
    }
  }

  .container {
    position: relative;
    margin: 0 auto;
    padding: 3rem 0 6rem;
    max-width: 74rem;
    width: 100%;
  }

  .homepage-actions {
    margin: 0 0 3.5rem;
    display: flex;
    justify-content: space-between;
    gap: 2rem;
  }
`;
