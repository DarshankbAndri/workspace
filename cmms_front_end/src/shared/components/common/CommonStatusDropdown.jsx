import React from 'react';
import CommonDropdown from './CommonDropdown';
import { ACTIVE_STATUS_OPTIONS } from '../../constants/statusOptions';

function CommonStatusDropdown({
  options = ACTIVE_STATUS_OPTIONS,
  placeholder = 'All',
  clearable = true,
  label = 'Status',
  ...props
}) {
  return (
    <CommonDropdown
      label={label}
      options={options}
      placeholder={placeholder}
      clearable={clearable}
      {...props}
    />
  );
}

export default CommonStatusDropdown;
