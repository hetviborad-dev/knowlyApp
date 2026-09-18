import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SCREENS} from '../constant/screens';
import TabNavigation from './TabNavigation';
import LoginScreen from '../screens/Login';
import CommonStyle from '../styles';
import { RootStackParamList } from '../types';
import CreateAccountScreen from '../screens/CreateAccount';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigation = () => {
  const [initialScreen, setInitialScreen] =
    useState<keyof RootStackParamList>();

  const handleProfileCheck = (profile: any) => {
    setInitialScreen('');
  };

  return (
    <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialScreen}
          screenOptions={{headerShown: false}}>
          <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
          <Stack.Screen name={SCREENS.SIGNUP} component={CreateAccountScreen} />

          {/* <Stack.Screen name={SCREENS.HOME} component={TabNavigation} /> */}
        </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
