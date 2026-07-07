import React from 'react';
import { Autocomplete, CircularProgress, TextField, Tooltip } from '@mui/material';

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
  renderOption,
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

  const defaultRenderOption = React.useCallback((optionProps, option) => {
    const disabledReason = option?.disabledReason || option?.reason || '';
    const isDisabledWithReason = Boolean(option?.disabled && disabledReason);
    const {
      key,
      style,
      onClick,
      onMouseDown,
      ...listItemProps
    } = optionProps;
    const labelText = getOptionLabel(option);
    const labelContent = (
      <span
        style={{
          display: 'block',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {labelText}
      </span>
    );
    const stopDisabledAction = (event, handler) => {
      if (isDisabledWithReason) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      handler?.(event);
    };

    return (
      <li
        key={key}
        {...listItemProps}
        style={{
          ...style,
          pointerEvents: isDisabledWithReason ? 'auto' : style?.pointerEvents,
          cursor: isDisabledWithReason ? 'not-allowed' : style?.cursor,
        }}
        onMouseDown={(event) => stopDisabledAction(event, onMouseDown)}
        onClick={(event) => stopDisabledAction(event, onClick)}
      >
        {disabledReason ? (
          <Tooltip title={disabledReason} placement="right" arrow>
            {labelContent}
          </Tooltip>
        ) : labelContent}
      </li>
    );
  }, [getOptionLabel]);

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
      renderOption={renderOption || defaultRenderOption}
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
