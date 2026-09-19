import React from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {SCREENS} from '../constant/screens';
import {normalize, hp, wp} from '../styles/responsiveScreen';
import {TabParamList} from '../types';

import HomeScreen from '../screens/Home';
import FactsScreen from '../screens/Facts';
import ProfileScreen from '../screens/Profile';
import ExploreScreen from '../screens/Explore';

import {useAppTheme} from '../hooks/useTheme';

const Tab = createBottomTabNavigator<TabParamList>();

type TabIconName =
  | 'home'
  | 'home-outline'
  | 'bulb'
  | 'bulb-outline'
  | 'compass'
  | 'compass-outline'
  | 'person'
  | 'person-outline';

const TabNavigation = () => {
  const colors = useAppTheme();

  const getTabIcon = (
    routeName: keyof TabParamList,
    focused: boolean,
  ): TabIconName => {
    switch (routeName) {
      case SCREENS.HOME:
        return focused ? 'home' : 'home-outline';

      case SCREENS.FACTS:
        return focused ? 'bulb' : 'bulb-outline';

      case SCREENS.EXPLORE:
        return focused ? 'compass' : 'compass-outline';

      case SCREENS.PROFILE:
        return focused ? 'person' : 'person-outline';

      default:
        return 'home-outline';
    }
  };

  return (
    <Tab.Navigator
      initialRouteName={SCREENS.HOME}
      screenOptions={({route}) => ({
        headerShown: false,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.placeholder,

        tabBarStyle: {
          height: hp(8.5),
          paddingTop: hp(0.8),
          paddingBottom: hp(1.2),
          backgroundColor: colors.cardBg,
          borderTopColor: colors.separator,
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: colors.black,
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },

        tabBarLabelStyle: {
          fontFamily: 'Nunito-Medium',
          fontSize: normalize(11),
          marginTop: hp(0.2),
        },

        tabBarIconStyle: {
          marginTop: hp(0.3),
        },

        tabBarItemStyle: {
          paddingVertical: hp(0.2),
        },

        tabBarIcon: ({focused, color}) => (
          <Ionicons
            name={getTabIcon(route.name, focused)}
            size={normalize(23)}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen
        name={SCREENS.HOME}
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />

      <Tab.Screen
        name={SCREENS.FACTS}
        component={FactsScreen}
        options={{
          title: 'Facts',
        }}
      />

      <Tab.Screen
        name={SCREENS.EXPLORE}
        component={ExploreScreen}
        options={{
          title: 'Explore',
        }}
      />

      <Tab.Screen
        name={SCREENS.PROFILE}
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;