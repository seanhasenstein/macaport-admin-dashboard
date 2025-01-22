import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';

type Props = {
  label: string;
  value: string | number | JSX.Element | null | undefined;
  customClass?: string;
  customLabelClass?: string;
  customValueClass?: string;
};

export default function OrderDetailItem({
  label,
  value,
  customClass,
  customLabelClass,
  customValueClass,
}: Props) {
  return (
    <OrderDetailItemStyles className={classNames(customClass)}>
      <p className={classNames('label', customLabelClass)}>{label}</p>
      <p className={classNames('value', customValueClass)}>
        {value ? value : ''}
      </p>
    </OrderDetailItemStyles>
  );
}

const OrderDetailItemStyles = styled.div`
  display: flex;
  .label {
    min-width: 9.5rem;
    color: #09090b;
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 120%;
  }
  .value {
    color: #52525b;
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 120%;
  }
`;
