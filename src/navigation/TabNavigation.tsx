import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { SCREENS } from '../constant/screens';
import { TabParamList } from '../types';

import HomeScreen from '../screens/Home';
import FactsScreen from '../screens/Facts';
import ProfileScreen from '../screens/Profile';
import ExploreScreen from '../screens/Explore';

import FloatingTabBar from '../component/common/FloatingTabBar';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigation: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName={SCREENS.HOME}
      tabBar={props => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none',
        },
        tabBarShowLabel: false,
        tabBarButton: () => null,
      }}
    >
      <Tab.Screen
        name={SCREENS.HOME}
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />

      <Tab.Screen
        name={SCREENS.FACTS}
        component={FactsScreen}
        options={{
          title: 'Facts',
          tabBarAccessibilityLabel: 'Facts tab',
        }}
      />

      <Tab.Screen
        name={SCREENS.EXPLORE}
        component={ExploreScreen}
        options={{
          title: 'Explore',
          tabBarAccessibilityLabel: 'Explore tab',
        }}
      />

      <Tab.Screen
        name={SCREENS.PROFILE}
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;
