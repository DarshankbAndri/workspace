export const createSearchPayload = ({ filters = [], paginationModel, sortModel }) => {
  const activeSort = sortModel?.[0];
  return {
    searchCriteriaList: filters.filter((filter) => {
      if (!filter) return false;
      if (Array.isArray(filter.value)) return filter.value.length > 0;
      return filter.value !== null && filter.value !== undefined && String(filter.value).trim() !== '';
    }),
    dataOption: 'all',
    pagination: {
      status: 'ON',
      recordsPerPage: paginationModel?.pageSize || 10,
      sortBy: activeSort?.field || null,
      sortMode: activeSort?.sort ? activeSort.sort.toUpperCase() : null,
      pageNumber: paginationModel?.page || 0,
      pageSize: 0,
    },
  };
};

export const commonSearchFilter = (value) => ({
  filterKey: 'commonSearch',
  dataType: 'VARCHAR',
  value,
  operation: 'contains',
});

export const equalFilter = (filterKey, value, dataType = 'VARCHAR') => ({
  filterKey,
  dataType,
  value,
  operation: 'equal',
});

export const inFilter = (filterKey, value, dataType = 'VARCHAR') => ({
  filterKey,
  dataType,
  value,
  operation: 'in',
});

export const rangeFilter = (filterKey, value, operation, dataType = 'DATE') => ({
  filterKey,
  dataType,
  value,
  operation,
});
