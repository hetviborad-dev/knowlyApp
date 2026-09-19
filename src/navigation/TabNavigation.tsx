import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { SCREENS } from '../constant/screens';
import { normalize } from '../styles/responsiveScreen';
import { TabParamList } from '../types';

import HomeScreen from '../screens/Home';
import FactsScreen from '../screens/Facts';
import ProfileScreen from '../screens/Profile';
import ExploreScreen from '../screens/Explore';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName={SCREENS.HOME}
      screenOptions={{
        headerShown: true,

        headerTitleStyle: {
          fontFamily: 'Nunito-Medium',
          fontSize: normalize(20),
        },

        headerTitleAlign: 'center',

        tabBarLabelStyle: {
          fontFamily: 'Nunito-Medium',
          fontSize: normalize(11),
        },
      }}
    >
      <Tab.Screen
        name={SCREENS.HOME}
        component={HomeScreen}
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />

      <Tab.Screen
        name={SCREENS.FACTS}
        component={FactsScreen}
        options={{
          title: 'Facts',
          headerShown: false,
        }}
      />

      <Tab.Screen
        name={SCREENS.EXPLORE}
        component={ExploreScreen}
        options={{
          title: 'Explore',
          headerShown: false,
        }}
      />

      <Tab.Screen
        name={SCREENS.PROFILE}
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;
