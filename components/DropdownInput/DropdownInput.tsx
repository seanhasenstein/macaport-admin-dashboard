import React from 'react';
import { useField } from 'formik';
// import Select, { StylesConfig } from 'react-select';
import Select from 'react-select';

// import styles from './DropdownInput.module.scss';

// const customSelectStyles: StylesConfig<
//   Record<'value' | 'label', string | null | undefined>,
//   false
// > = {
//   control: provided => ({
//     ...provided,
//     width: '100%',
//     height: '4.5rem',
//     border: '0.1rem solid #828892',
//     borderRadius: '0.7rem',
//     cursor: 'pointer'
//   }),
//   valueContainer: provided => ({
//     ...provided,
//     padding: '0.2rem 1.6rem'
//   }),
//   placeholder: () => ({
//     color: '#828892',
//     textAlign: 'left',
//     fontSize: '1.8rem',
//     fontWeight: 'lighter'
//   }),
//   indicatorSeparator: provided => ({
//     ...provided,
//     display: 'none'
//   }),
//   menuList: provided => ({
//     ...provided,
//     border: '0.1rem solid #828892'
//   }),
//   dropdownIndicator: provided => ({
//     ...provided,
//     padding: '0.8rem 2rem'
//   }),
//   option: (provided, state) => ({
//     ...provided,
//     color: state.isSelected ? 'blue' : 'black',
//     backgroundColor: state.isSelected ? '#f3f3f3' : 'white',
//     padding: '0.7rem 2rem',
//     cursor: 'pointer',
//     ':hover': {
//       color: 'blue',
//       backgroundColor: '#f3f3f3'
//     }
//   })
// };

type FieldProps = {
  id?: string;
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
};

type Option<OptionValue> = { label: string; value: OptionValue };

type DropdownInputProps<OptionValue> = {
  label?: string;
  options?: Array<OptionValue | Option<OptionValue>>;
  placeholder?: string;
  currentValue?: {
    label: string | undefined | null;
    value: string | undefined | null;
  };
  defaultValue?: {
    label: string | undefined | null;
    value: string | undefined | null;
  };
  locked?: boolean;
  handleChange?: (value: string) => void;
};

export default function DropdownInput<OptionValue extends string = string>({
  label,
  options,
  placeholder = '',
  currentValue,
  defaultValue,
  locked,
  handleChange = () => {},
  ...props
}: FieldProps & DropdownInputProps<OptionValue>) {
  const [field, meta, helpers] = useField(props);
  const { setValue } = helpers;
  const optionsMapped = React.useMemo(() => {
    return options?.map(option => {
      if (typeof option === 'object')
        return { value: option.value, label: option.label };
      return { value: option, label: option };
    });
  }, [options]);

  return (
    <div>
      <label htmlFor={field.name}>{label}</label>
      <Select
        {...{ placeholder, defaultValue }}
        instanceId="long-value-select"
        // styles={customSelectStyles}
        id={field.name}
        value={currentValue}
        options={optionsMapped}
        name={field.name}
        isDisabled={locked}
        isSearchable={true}
        onChange={selected => {
          if (selected === null) return;
          const { value } = selected as Option<OptionValue>;
          setValue(value);
          handleChange(value);
        }}
        menuPlacement="auto"
      />
      {meta.touched && meta.error && <div>{meta.error}</div>}
    </div>
  );
}
