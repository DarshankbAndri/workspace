import React from 'react';

function useDropdownOptions({
  fetcher,
  labelKey = 'label',
  valueKey = 'value',
  dependencies = [],
  enabled = true,
  mapOption,
  filterOption,
  onError,
}) {
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(Boolean(enabled));
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

  return { options, loading, error };
}

export default useDropdownOptions;
