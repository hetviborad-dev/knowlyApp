import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREENS } from '../constant/screens';
import TabNavigation from './TabNavigation';
import LoginScreen from '../screens/Login';
import CommonStyle from '../styles';
import { RootStackParamList } from '../types';
import CreateAccountScreen from '../screens/CreateAccount';
import ForgotPasswordScreen from '../screens/ForgotPassword';
import OTPScreen from '../screens/OTP';
import SetNewPasswordScreen from '../screens/SetNewPassword';
import CategoryScreen from '../screens/Category';

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
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
        <Stack.Screen name={SCREENS.SIGNUP} component={CreateAccountScreen} />
        <Stack.Screen
          name={SCREENS.FORGOTPASSWORD}
          component={ForgotPasswordScreen}
        />
        <Stack.Screen name={SCREENS.OTP} component={OTPScreen} />
        <Stack.Screen
          name={SCREENS.SETNEWPASSWORD}
          component={SetNewPasswordScreen}
        />
        <Stack.Screen name={SCREENS.CATEGORY} component={CategoryScreen} />

        <Stack.Screen name={SCREENS.DASHBOARD} component={TabNavigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
