import React from 'react';
import { useField } from 'formik';
import styled from 'styled-components';
import classNames from 'classnames';

type Props = {
  name: string;
  label: string;
  placeholder?: string;
  customClassName?: string;
  onInput?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  customErrorMessage?: string;
};

const TextArea = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ label, customClassName, customErrorMessage, ...props }, ref) => {
    const [field, meta] = useField(props);
    const { name, placeholder, onInput, onBlur } = props;

    return (
      <TextAreaStyles className={classNames('form-item', customClassName)}>
        <label htmlFor={name}>{label}</label>
        <textarea
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
        />
        {meta.touched && meta.error ? (
          <div className="validation-error">{meta.error}</div>
        ) : customErrorMessage ? (
          <div className="validation-error">{customErrorMessage}</div>
        ) : null}
      </TextAreaStyles>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;

const TextAreaStyles = styled.div`
  &.form-item {
    display: flex;
    flex-direction: column;
  }
  .validation-error {
    margin: 0.5rem 0 0;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #b91c1c;
  }
`;
