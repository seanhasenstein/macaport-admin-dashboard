import styled from 'styled-components';

export default function TableLoadingSpinner() {
  return (
    <TableLoadingSpinnerStyles aria-hidden="true">
      <span className="spinner" />
    </TableLoadingSpinnerStyles>
  );
}

const TableLoadingSpinnerStyles = styled.div`
  padding: 0 1.5rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
  pointer-events: none;
  width: 100%;
  height: calc(100vh - 10rem);

  .spinner {
    width: 1.375rem;
    height: 1.375rem;
    border-width: 2px;
    border-style: solid;
    border-color: #eaeaee;
    border-radius: 9999px;
    border-top-color: #a5adb9;
    animation: spin 0.65s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
