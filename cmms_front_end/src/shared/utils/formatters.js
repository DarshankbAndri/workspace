const invalidValues = new Set([null, undefined, '', 'null', 'undefined', 'NaN', 'Invalid Date']);

export const safeText = (value, fallback = '-') => {
  if (invalidValues.has(value)) return fallback;
  return String(value);
};

export const formatCurrency = (value, fallback = '-') => {
  if (value === null || value === undefined || value === '') return fallback;
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

export const formatNumber = (value, options = {}, fallback = '-') => {
  if (value === null || value === undefined || value === '') return fallback;
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return new Intl.NumberFormat('en-IN', options).format(number);
};

export const formatDate = (value, fallback = '-') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (value, fallback = '-') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatStatusLabel = (value, fallback = '-') => {
  if (!value) return fallback;
  return String(value)
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const formatEmployeeName = (employee, fallback = '-') => {
  if (!employee) return fallback;
  if (typeof employee === 'string') return employee || fallback;
  const name = [employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(' ').trim();
  return name || employee.employeeName || employee.name || fallback;
};
