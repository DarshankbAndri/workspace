import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSystemTime } from '../services/api';
import { clientEpochMillis, getDateTimeConfig, synchronizeDateTime } from '../utils/dateTime';

const DateTimeContext = createContext({
  ...getDateTimeConfig(),
  synchronized: false,
  synchronize: async () => false,
});

export const DateTimeProvider = ({ children }) => {
  const [state, setState] = useState(() => ({ ...getDateTimeConfig(), synchronized: false }));

  const synchronize = useCallback(async () => {
    const requestedAt = clientEpochMillis();
    try {
      const response = await getSystemTime();
      const receivedAt = clientEpochMillis();
      const synchronized = synchronizeDateTime(response.data, requestedAt, receivedAt);
      if (synchronized) {
        setState({ ...getDateTimeConfig(), synchronized: true });
      }
      return synchronized;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    synchronize();
    const interval = window.setInterval(synchronize, 5 * 60 * 1000);
    const synchronizeAfterResume = () => {
      if (document.visibilityState === 'visible') synchronize();
    };
    document.addEventListener('visibilitychange', synchronizeAfterResume);
    window.addEventListener('focus', synchronize);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', synchronizeAfterResume);
      window.removeEventListener('focus', synchronize);
    };
  }, [synchronize]);

  const value = useMemo(() => ({ ...state, synchronize }), [state, synchronize]);
  return <DateTimeContext.Provider value={value}>{children}</DateTimeContext.Provider>;
};

export const useDateTime = () => useContext(DateTimeContext);
