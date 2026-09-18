import React from 'react';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {SCREENS} from '../constant/screens';
import {normalize} from '../styles/responsiveScreen';
import { TabParamList } from '../types';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName={SCREENS.HOME}
      // tabBar={renderCustomTabBar}
      screenOptions={{
        headerShown: true,
        headerTitleStyle: {
          fontFamily: 'Nunito-Medium',
          fontSize: normalize(20),
        },
        headerTitleAlign: 'center',
      }}>
    </Tab.Navigator>
  );
};

export default TabNavigation;
