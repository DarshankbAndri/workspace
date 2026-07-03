import React from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import api from '../../services/api';
import { commonSearchFilter, createSearchPayload, equalFilter } from '../../utils/searchPayload';

function CommonVendorDropdown({
  label = 'Vendor',
  name,
  value,
  onChange,
  siteId = '',
  activeOnly = true,
  disabled = false,
  required = false,
  error = false,
  helperText = '',
  placeholder = 'Search vendors',
  clearable = true,
  fullWidth = false,
  size,
  sx,
  pageSize = 20,
}) {
  const [options, setOptions] = React.useState([]);
  const [selectedOption, setSelectedOption] = React.useState(null);
  const [inputValue, setInputValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let ignore = false;
    const timeoutId = window.setTimeout(() => {
      setLoading(true);
      searchVendors({ search: inputValue, siteId, activeOnly, pageSize })
        .then((rows) => {
          if (ignore) return;
          setOptions(rows);
        })
        .catch(() => {
          if (!ignore) setOptions([]);
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, 300);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeOnly, inputValue, pageSize, siteId]);

  React.useEffect(() => {
    if (!value) {
      setSelectedOption(null);
      return undefined;
    }

    const existing = options.find((option) => String(option.id) === String(value));
    if (existing) {
      setSelectedOption(existing);
      return undefined;
    }

    let ignore = false;
    api.get(`/vendors/${value}`)
      .then((response) => {
        if (ignore) return;
        setSelectedOption(response.data);
      })
      .catch(() => {
        if (!ignore) setSelectedOption(null);
      });

    return () => {
      ignore = true;
    };
  }, [options, value]);

  const mergedOptions = React.useMemo(() => {
    if (!selectedOption) return options;
    return options.some((option) => String(option.id) === String(selectedOption.id))
      ? options
      : [selectedOption, ...options];
  }, [options, selectedOption]);

  const selectedValue = value
    ? mergedOptions.find((option) => String(option.id) === String(value)) || selectedOption
    : null;

  const handleChange = (event, option) => {
    const nextValue = option ? option.id : '';
    if (!onChange) return;
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
    }, option);
  };

  return (
    <Autocomplete
      options={mergedOptions}
      value={selectedValue}
      inputValue={inputValue}
      onInputChange={(event, nextInputValue, reason) => {
        if (reason === 'input' || reason === 'clear' || reason === 'reset') {
          setInputValue(nextInputValue);
        }
      }}
      onChange={handleChange}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      sx={sx}
      loading={loading}
      disableClearable={!clearable}
      filterOptions={(items) => items}
      getOptionLabel={(option) => formatVendorLabel(option)}
      isOptionEqualToValue={(option, selected) => String(option.id) === String(selected?.id)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          name={name}
          required={required}
          error={Boolean(error)}
          helperText={helperText}
          placeholder={selectedValue ? '' : placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      ListboxProps={{ style: { maxHeight: 320 } }}
    />
  );
}

function searchVendors({ search, siteId, activeOnly, pageSize }) {
  const filters = [
    commonSearchFilter(search),
    equalFilter('siteId', siteId, 'NUMBER'),
  ];
  if (activeOnly) {
    filters.push(equalFilter('active', true, 'BOOLEAN'));
  }

  const payload = createSearchPayload({
    filters,
    paginationModel: { page: 0, pageSize },
    sortModel: [{ field: 'vendorName', sort: 'asc' }],
  });

  return api.post('/vendors/search', payload).then((response) => response.data?.data || response.data || []);
}

function formatVendorLabel(vendor) {
  if (!vendor) return '';
  if (vendor.vendorCode && vendor.vendorName) return `${vendor.vendorCode} - ${vendor.vendorName}`;
  return vendor.vendorName || vendor.vendorCode || '';
}

export default CommonVendorDropdown;
