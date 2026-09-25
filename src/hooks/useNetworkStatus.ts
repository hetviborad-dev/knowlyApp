import {useEffect, useState} from 'react';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';

export const useNetworkStatus = (): boolean => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let mounted = true;

    const updateStatus = (state: NetInfoState) => {
      if (!mounted) {
        return;
      }

      const connected =
        state.isConnected === true &&
        state.isInternetReachable !== false;

      setIsConnected(connected);
    };

    NetInfo.fetch()
      .then(updateStatus)
      .catch(() => {
        if (mounted) {
          setIsConnected(false);
        }
      });

    const unsubscribe = NetInfo.addEventListener(updateStatus);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return isConnected;
};