import Layout from '../../components/Layout';
import InventoryProductsTable from '../../components/InventoryProductsTable';

export default function InventoryProducts() {
  return (
    <Layout title="Inventory Products | Macaport Dashboard" requiresAuth={true}>
      <InventoryProductsTable />
    </Layout>
  );
}
