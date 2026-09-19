import React from 'react';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {SCREENS} from '../constant/screens';
import {normalize} from '../styles/responsiveScreen';
import {TabParamList} from '../types';

import HomeScreen from '../screens/Home';
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
      }}>
      <Tab.Screen
        name={SCREENS.HOME}
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />

      <Tab.Screen
  name="Explore"
  component={ExploreScreen}
/>

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;