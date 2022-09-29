import styled from 'styled-components';
import { getStoreStatus } from '../../utils';

type Props = {
  openDate: string;
  closeDate: string | null;
};

export default function StoreStatus(props: Props) {
  return (
    <StoreStatusStyles
      className={getStoreStatus(props.openDate, props.closeDate)}
    >
      <span className="dot" />
    </StoreStatusStyles>
  );
}

const StoreStatusStyles = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 1rem;
  width: 1rem;
  border-radius: 9999px;

  .dot {
    height: 0.5rem;
    width: 0.5rem;
    border-radius: 9999px;
  }

  &.upcoming {
    background-color: #fef3c7;

    .dot {
      background-color: #fbbf24;
    }
  }

  &.open {
    background-color: #d1fae5;

    .dot {
      background-color: #34d399;
    }
  }

  &.closed {
    background-color: #fee2e2;

    .dot {
      background-color: #f87171;
    }
  }
`;
