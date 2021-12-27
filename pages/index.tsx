import { useSession } from '../hooks/useSession';
import Layout from '../components/Layout';
import StoresTable from '../components/StoresTable';

export default function Index() {
  const [session, loading] = useSession({ required: true });

  if (loading || !session) return <div />;

  return (
    <Layout title="Macaport Dashboard Home">
      <StoresTable />
    </Layout>
  );
}
