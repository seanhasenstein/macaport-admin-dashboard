import React from 'react';
import Link from 'next/link';

type Props = {
  storeId: string;
  productId: string;
  showMenu: string | undefined;
  setShowMenu: (v: string | undefined) => void;
  handleDeleteButtonClick: (id: string) => void;
};

export default function StoreProductMenu({
  storeId,
  productId,
  showMenu,
  setShowMenu,
  handleDeleteButtonClick,
}: Props) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleEscapeKeyup = (e: KeyboardEvent) => {
      if (e.code === 'Escape') setShowMenu(undefined);
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        showMenu === productId &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      )
        setShowMenu(undefined);
    };

    if (showMenu) {
      document.addEventListener('keyup', handleEscapeKeyup);
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('keyup', handleEscapeKeyup);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showMenu, setShowMenu, productId]);

  return (
    <div
      ref={menuRef}
      className={`menu ${showMenu === productId ? 'show' : ''}`}
    >
      <Link href={`/stores/${storeId}/product?prodId=${productId}`}>
        <a className="menu-link">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          View Product
        </a>
      </Link>
      <Link href={`/stores/products/update?id=${productId}`}>
        <a className="menu-link">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          Edit Product
        </a>
      </Link>
      <button
        type="button"
        className="delete-button"
        onClick={() => handleDeleteButtonClick(productId)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Delete Product
      </button>
    </div>
  );
}
