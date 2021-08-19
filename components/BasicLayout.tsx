import Head from 'next/head';

type Props = {
  children: React.ReactNode;
  title: string;
};

export default function BasicLayout({ children, title }: Props) {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <header />
      <main>{children}</main>
      <footer />
    </>
  );
}
