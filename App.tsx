/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import CommonStyle from './src/styles';
import RootNavigation from './src/navigation/RootNavigation';
import { AuthProvider } from './src/context/AuthContext';
import NetworkProvider from './src/context/NetworkProvider';
// import { useEffect } from 'react';
// import BootSplash from 'react-native-bootsplash';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // useEffect(() => {
  //   const hideSplash = async () => {
  //     await BootSplash.hide({fade: true});
  //   };

  //   void hideSplash();
  // }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={CommonStyle.flex} edges={['left', 'right']}>
        <StatusBar barStyle="dark-content" />
        <AuthProvider>
          <NetworkProvider>
          <RootNavigation />
          </NetworkProvider>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
