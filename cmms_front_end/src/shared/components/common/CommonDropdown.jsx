import React from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';

const defaultGetOptionLabel = (option) => {
  if (option == null) return '';
  if (typeof option !== 'object') return String(option);
  return option.label ?? option.name ?? option.title ?? option.value ?? '';
};

const defaultGetOptionValue = (option) => {
  if (option == null) return '';
  if (typeof option !== 'object') return option;
  return option.value ?? option.id ?? option.code ?? '';
};

function CommonDropdown({
  label,
  name,
  value,
  options = [],
  onChange,
  disabled = false,
  required = false,
  error = false,
  helperText = '',
  placeholder = '',
  multiple = false,
  loading = false,
  clearable = false,
  fullWidth = false,
  size,
  getOptionLabel = defaultGetOptionLabel,
  getOptionValue = defaultGetOptionValue,
  sx,
  InputProps: textInputProps,
  ListboxProps,
  SelectProps,
  ...textFieldProps
}) {
  const optionValueMatches = React.useCallback((option, selectedValue) => (
    String(getOptionValue(option)) === String(selectedValue)
  ), [getOptionValue]);

  const findOption = React.useCallback((selectedValue) => {
    if (selectedValue == null || selectedValue === '') return null;
    if (typeof selectedValue === 'object') {
      return options.find((option) => optionValueMatches(option, getOptionValue(selectedValue))) || selectedValue;
    }
    return options.find((option) => optionValueMatches(option, selectedValue)) || null;
  }, [getOptionValue, optionValueMatches, options]);

  const selectedValue = multiple
    ? (Array.isArray(value) ? value.map(findOption).filter(Boolean) : [])
    : findOption(value);

  const handleChange = (event, selectedOption) => {
    if (!onChange) return;
    const nextValue = multiple
      ? (selectedOption || []).map((option) => getOptionValue(option))
      : (selectedOption ? getOptionValue(selectedOption) : '');

    onChange({
      ...event,
      target: {
        ...(event?.target || {}),
        name,
        value: nextValue,
      },
      currentTarget: {
        ...(event?.currentTarget || {}),
        name,
        value: nextValue,
      },
    }, selectedOption);
  };

  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      value={selectedValue}
      onChange={handleChange}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      size={size}
      sx={sx}
      loading={loading}
      disableClearable={!clearable && !multiple}
      getOptionLabel={(option) => getOptionLabel(option)}
      isOptionEqualToValue={(option, selectedOption) => optionValueMatches(option, getOptionValue(selectedOption))}
      getOptionDisabled={(option) => Boolean(option?.disabled)}
      renderInput={(params) => (
        <TextField
          {...params}
          {...textFieldProps}
          label={label}
          name={name}
          required={required}
          error={Boolean(error)}
          helperText={helperText}
          placeholder={selectedValue ? '' : placeholder}
          InputProps={{
            ...params.InputProps,
            ...(textInputProps || {}),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
                {textInputProps?.endAdornment}
              </>
            ),
          }}
        />
      )}
      ListboxProps={{
        style: { maxHeight: 320 },
        ...(ListboxProps || {}),
      }}
    />
  );
}

export default CommonDropdown;
