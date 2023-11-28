import React from 'react';
import Link from 'next/link';

type WithButtonProps = {
  withButton: true;
  onClick: (...args: unknown[]) => void;
  withLink?: false;
  href?: never;
};

type WithLinkProps = {
  withLink: true;
  href: string;
  withButton?: false;
  onClick?: never;
};

type Props = {
  children: React.ReactNode;
  customClassName?: string;
} & (WithButtonProps | WithLinkProps);

export default function Td({
  children,
  customClassName,
  withButton,
  onClick,
  withLink,
  href,
}: Props) {
  if (withButton) {
    return (
      <td className={customClassName}>
        <button type="button" onClick={onClick}>
          {children}
        </button>
      </td>
    );
  }

  if (withLink) {
    return (
      <td className={customClassName}>
        <Link href={href}>
          <a>{children}</a>
        </Link>
      </td>
    );
  }

  return <td className={customClassName}>{children}</td>;
}
