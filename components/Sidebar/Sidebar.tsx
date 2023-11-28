import React from 'react';
import styled from 'styled-components';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';
import useOutsideClick from '../../hooks/useOutsideClick';
import classNames from 'classnames';

type Props = {
  children: React.ReactNode;
  customClassName?: string;
  isOpen: boolean;
  closeSidebar: () => void;
};

export default function Sidebar({
  children,
  customClassName,
  isOpen,
  closeSidebar,
}: Props) {
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  useOutsideClick(isOpen, closeSidebar, sidebarRef);
  useEscapeKeydownClose(isOpen, closeSidebar);

  return (
    <SidebarStyles>
      <div className={isOpen ? 'overlay' : ''} />
      <div
        ref={sidebarRef}
        className={classNames(customClassName, 'sidebar-container', {
          open: isOpen,
        })}
      >
        {children}
      </div>
    </SidebarStyles>
  );
}

const SidebarStyles = styled.div`
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.25);
  }
  .sidebar-container {
    overflow-y: auto;
    position: fixed;
    top: 10px;
    right: 10px;
    bottom: 10px;
    max-width: 32rem;
    width: 100%;
    background-color: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 0.625rem;
    box-shadow: 0 0 10px 6px rgb(0 0 0 / 0.05),
      inset 0 0 0 2px rgba(229, 231, 235, 0.9);
    transform: translateX(120%);
    transition: transform 400ms ease-in-out;

    &.open {
      transform: translateX(0);
    }
  }
`;
