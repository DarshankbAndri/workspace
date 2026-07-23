import { dropdownConfigurations } from '../../config/dropdowns/index.js';

const isDevelopment = () => import.meta.env?.DEV || import.meta.env?.MODE === 'development';

const warn = (message) => {
  if (isDevelopment()) {
    console.warn(message);
  }
};

export const getPageDropdownConfig = (pageName) => {
  const normalizedPageName = String(pageName || '').trim().toUpperCase();
  const config = dropdownConfigurations[normalizedPageName];

  if (!config) {
    warn(`[DropdownConfig] Configuration not found for page: ${normalizedPageName}`);
    return null;
  }

  return config;
};

export const getDropdownOptions = (pageName, dropdownName, options = {}) => {
  const { fallbackToCommon = true } = options;
  const normalizedPageName = String(pageName || '').trim().toUpperCase();
  const pageConfig = getPageDropdownConfig(normalizedPageName);
  const pageOptions = pageConfig?.dropDownMasterList?.[dropdownName];

  if (Array.isArray(pageOptions)) {
    return pageOptions;
  }

  if (fallbackToCommon && normalizedPageName !== 'COMMON') {
    const commonConfig = getPageDropdownConfig('COMMON');
    const commonOptions = commonConfig?.dropDownMasterList?.[dropdownName];

    if (Array.isArray(commonOptions)) {
      return commonOptions;
    }
  }

  warn(`[DropdownConfig] Dropdown "${dropdownName}" not found for page "${pageName}"`);
  return [];
};

export const getDropdownLabel = (pageName, dropdownName, value, options = {}) => {
  const dropdownOptions = getDropdownOptions(pageName, dropdownName, options);
  const option = dropdownOptions.find((item) => item.value === value);
  return option?.label ?? value ?? '';
};

export const getDropdownValue = (pageName, dropdownName, label, options = {}) => {
  const dropdownOptions = getDropdownOptions(pageName, dropdownName, options);
  const option = dropdownOptions.find((item) => item.label === label);
  return option?.value ?? null;
};

export const validateDropdownConfigurations = (configurations = dropdownConfigurations) => {
  const errors = [];
  const seenPageNames = new Set();

  Object.entries(configurations).forEach(([registryKey, config]) => {
    if (!config || typeof config !== 'object') {
      errors.push(`[DropdownConfig] ${registryKey} is not a valid configuration object.`);
      return;
    }

    if (config.pageName !== registryKey) {
      errors.push(`[DropdownConfig] Registry key "${registryKey}" must match pageName "${config.pageName}".`);
    }

    if (seenPageNames.has(config.pageName)) {
      errors.push(`[DropdownConfig] Duplicate pageName "${config.pageName}" found.`);
    }
    seenPageNames.add(config.pageName);

    if (!config.serviceType) {
      errors.push(`[DropdownConfig] ${registryKey} is missing serviceType.`);
    }

    if (!config.dropDownMasterList || typeof config.dropDownMasterList !== 'object' || Array.isArray(config.dropDownMasterList)) {
      errors.push(`[DropdownConfig] ${registryKey} is missing dropDownMasterList.`);
      return;
    }

    Object.entries(config.dropDownMasterList).forEach(([dropdownName, dropdownOptions]) => {
      if (!Array.isArray(dropdownOptions)) {
        errors.push(`[DropdownConfig] ${registryKey}.${dropdownName} must be an array.`);
        return;
      }

      const values = new Set();
      dropdownOptions.forEach((option, index) => {
        if (!option || typeof option !== 'object') {
          errors.push(`[DropdownConfig] ${registryKey}.${dropdownName}[${index}] must be an object.`);
          return;
        }
        if (!Object.prototype.hasOwnProperty.call(option, 'label')) {
          errors.push(`[DropdownConfig] ${registryKey}.${dropdownName}[${index}] is missing label.`);
        }
        if (!Object.prototype.hasOwnProperty.call(option, 'value')) {
          errors.push(`[DropdownConfig] ${registryKey}.${dropdownName}[${index}] is missing value.`);
        }

        const serializedValue = `${typeof option.value}:${String(option.value)}`;
        if (values.has(serializedValue)) {
          errors.push(`[DropdownConfig] ${registryKey}.${dropdownName} has duplicate value "${String(option.value)}".`);
        }
        values.add(serializedValue);
      });
    });
  });

  return errors;
};

export const validateDropdownConfigurationsOnStartup = () => {
  if (!isDevelopment()) {
    return [];
  }

  const errors = validateDropdownConfigurations();
  errors.forEach((error) => console.warn(error));
  return errors;
};
