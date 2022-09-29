import Head from 'next/head';
import AuthorizedRoute from './AuthorizedRoute';

type Props = {
  children: React.ReactNode;
  title: string;
  requiresAuth: boolean;
};

export default function BasicLayout(props: Props) {
  return (
    <AuthorizedRoute required={props.requiresAuth}>
      <>
        <Head>
          <title>{props.title}</title>
        </Head>
        <header />
        <main>{props.children}</main>
        <footer />
      </>
    </AuthorizedRoute>
  );
}
