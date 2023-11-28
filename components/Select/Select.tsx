import React from 'react';
import { useField } from 'formik';
import styled from 'styled-components';
import classNames from 'classnames';

type Props = {
  name: string;
  label: string;
  placeholder?: string;
  customClassName?: string;
  onInput?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  customErrorMessage?: string;
  options: { value: string; label: string }[];
};

const Select = React.forwardRef<HTMLSelectElement, Props>(
  ({ label, customClassName, customErrorMessage, options, ...props }, ref) => {
    const [field, meta] = useField(props);
    const { name, placeholder, onInput, onBlur } = props;

    return (
      <SelectStyles className={classNames('form-item', customClassName)}>
        <label htmlFor={name}>{label}</label>
        <select
          // className={styles.input}
          {...field}
          {...props}
          id={name}
          ref={ref}
          onInput={onInput}
          onBlur={e => {
            field.onBlur(e);
            onBlur && onBlur(e);
          }}
          placeholder={placeholder}
        >
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {meta.touched && meta.error ? (
          <div className="validation-error">{meta.error}</div>
        ) : customErrorMessage ? (
          <div className="validation-error">{customErrorMessage}</div>
        ) : null}
      </SelectStyles>
    );
  }
);

Select.displayName = 'Select';

export default Select;

const SelectStyles = styled.div`
  &.form-item {
    select {
      width: 100%;
    }
  }
  .validation-error {
    margin: 0.5rem 0 0;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #b91c1c;
  }
`;
