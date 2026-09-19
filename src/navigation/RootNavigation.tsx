import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SCREENS } from '../constant/screens';

import TabNavigation from './TabNavigation';

import LoginScreen from '../screens/Login';
import CreateAccountScreen from '../screens/CreateAccount';
import ForgotPasswordScreen from '../screens/ForgotPassword';
import OTPScreen from '../screens/OTP';
import SetNewPasswordScreen from '../screens/SetNewPassword';
import CategoryScreen from '../screens/Category';

import { RootStackParamList } from '../types';

import { useAuth } from '../context/AuthContext';

import { useAppTheme } from '../hooks/useTheme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigation = () => {
  const { session, loading, needsCategorySelection, isPasswordRecovery } =
    useAuth();

  const colors = useAppTheme();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.white,
        }}
      >
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!session ? (
          <>
            <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />

            <Stack.Screen
              name={SCREENS.SIGNUP}
              component={CreateAccountScreen}
            />

            <Stack.Screen
              name={SCREENS.FORGOTPASSWORD}
              component={ForgotPasswordScreen}
            />

            <Stack.Screen name={SCREENS.OTP} component={OTPScreen} />

            <Stack.Screen
              name={SCREENS.SETNEWPASSWORD}
              component={SetNewPasswordScreen}
            />
          </>
        ) : isPasswordRecovery ? (
          /*
           * The user has verified the password-reset OTP.
           *
           * Supabase has created a temporary recovery
           * session, but the user is NOT considered
           * normally logged in for navigation purposes.
           */
          <>
            <Stack.Screen
              name={SCREENS.SETNEWPASSWORD}
              component={SetNewPasswordScreen}
            />
          </>
        ) : needsCategorySelection ? (
          <Stack.Screen name={SCREENS.CATEGORY} component={CategoryScreen} />
        ) : (
          <Stack.Screen name={SCREENS.DASHBOARD} component={TabNavigation} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
