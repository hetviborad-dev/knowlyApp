import React, {ReactNode} from 'react';
import {View} from 'react-native';

import {useNetworkStatus} from '../hooks/useNetworkStatus';
import NoInternetModal from '../component/common/NoInternetModal';

interface NetworkProviderProps {
  children: ReactNode;
}

const NetworkProvider: React.FC<NetworkProviderProps> = ({children}) => {
  const isConnected = useNetworkStatus();

  return (
    <View style={{flex: 1}}>
      {children}

      {!isConnected ? <NoInternetModal /> : null}
    </View>
  );
};

export default NetworkProvider;