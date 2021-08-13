type Props = {
  children: React.ReactNode;
};

export default function BasicLayout({ children }: Props) {
  return (
    <>
      <header />
      <main>{children}</main>
      <footer />
    </>
  );
}
