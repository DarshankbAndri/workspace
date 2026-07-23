import React from 'react';
import { getDropdownOptions } from '../utils/dropdownHelper';

function useDropdownOptions(configOrPageName, dropdownName, helperOptions) {
  const staticOptions = React.useMemo(
    () => (typeof configOrPageName === 'string'
      ? getDropdownOptions(configOrPageName, dropdownName, helperOptions)
      : []),
    [configOrPageName, dropdownName, helperOptions],
  );

  const {
    fetcher,
    labelKey = 'label',
    valueKey = 'value',
    dependencies = [],
    enabled = true,
    mapOption,
    filterOption,
    onError,
  } = typeof configOrPageName === 'string' ? {} : (configOrPageName || {});

  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(Boolean(enabled && fetcher));
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!enabled || !fetcher) {
      setOptions([]);
      setLoading(false);
      return undefined;
    }

    let ignore = false;
    setLoading(true);
    setError('');

    Promise.resolve(fetcher())
      .then((response) => {
        if (ignore) return;
        const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        const mapped = list
          .filter((item) => (filterOption ? filterOption(item) : true))
          .map((item) => (mapOption ? mapOption(item) : {
            ...item,
            label: item?.[labelKey],
            value: item?.[valueKey],
          }));
        setOptions(mapped);
      })
      .catch((err) => {
        if (ignore) return;
        setError(err.response?.data?.message || err.message || 'Unable to load dropdown options.');
        setOptions([]);
        if (onError) onError(err);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, fetcher, ...dependencies]);

  if (typeof configOrPageName === 'string') {
    return staticOptions;
  }

  return { options, loading, error };
}

export default useDropdownOptions;
