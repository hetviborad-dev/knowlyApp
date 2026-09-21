import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../../../hooks/useTheme';
import { hp, normalize, wp } from '../../../styles/responsiveScreen';

type IconName =
  | 'home'
  | 'home-outline'
  | 'bulb'
  | 'bulb-outline'
  | 'compass'
  | 'compass-outline'
  | 'person'
  | 'person-outline';

interface TabIconConfig {
  active: IconName;
  inactive: IconName;
  size: number;
}

const ACTIVE_TAB_SIZE = wp(12);
const TAB_BAR_HORIZONTAL_PADDING = wp(2);

const FloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();

  const [tabsWidth, setTabsWidth] = useState(0);

  const slideAnimation = useRef(new Animated.Value(0)).current;
  const selectedIconScale = useRef(new Animated.Value(1)).current;

  const iconConfig = useMemo<Record<string, TabIconConfig>>(
    () => ({
      Home: {
        active: 'home',
        inactive: 'home-outline',
        size: normalize(21),
      },

      Facts: {
        active: 'bulb',
        inactive: 'bulb-outline',
        size: normalize(22),
      },

      Explore: {
        active: 'compass',
        inactive: 'compass-outline',
        size: normalize(21),
      },

      Profile: {
        active: 'person',
        inactive: 'person-outline',
        size: normalize(22),
      },
    }),
    [],
  );

  const selectedIndex = state.index;
  const tabCount = state.routes.length;

  const tabWidth = tabsWidth > 0 ? tabsWidth / tabCount : 0;

  const getIconConfig = (routeName: string): TabIconConfig => {
    return (
      iconConfig[routeName] || {
        active: 'home',
        inactive: 'home-outline',
        size: normalize(21),
      }
    );
  };

  const animateToSelectedTab = (index: number) => {
    if (tabWidth <= 0) {
      return;
    }

    Animated.parallel([
      Animated.spring(slideAnimation, {
        toValue: index * tabWidth + (tabWidth - ACTIVE_TAB_SIZE) / 2,
        useNativeDriver: true,
        speed: 18,
        bounciness: 7,
      }),

      Animated.sequence([
        Animated.timing(selectedIconScale, {
          toValue: 0.88,
          duration: 90,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.spring(selectedIconScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 18,
          bounciness: 10,
        }),
      ]),
    ]).start();
  };

  useEffect(() => {
    animateToSelectedTab(selectedIndex);
  }, [selectedIndex, tabWidth]);

  const handleTabsLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;

    if (width !== tabsWidth) {
      setTabsWidth(width);
    }
  };

  const handleTabPress = (
    route: (typeof state.routes)[number],
    index: number,
  ) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented && state.index !== index) {
      navigation.navigate(route.name);
    }
  };

  const handleTabLongPress = (route: (typeof state.routes)[number]) => {
    navigation.emit({
      type: 'tabLongPress',
      target: route.key,
    });
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, hp(1.2)),
        },
      ]}
    >
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.white,
            shadowColor: colors.black,
          },
        ]}
      >
        <View style={styles.tabsContainer} onLayout={handleTabsLayout}>
          {tabWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.activeTabBackground,
                {
                  width: ACTIVE_TAB_SIZE,
                  height: ACTIVE_TAB_SIZE,
                  borderRadius: ACTIVE_TAB_SIZE / 2,
                  backgroundColor: colors.primary,
                  transform: [
                    {
                      translateX: slideAnimation,
                    },
                  ],
                },
              ]}
            />
          ) : null}

          {state.routes.map((route, index) => {
            const isFocused = selectedIndex === index;
            const { options } = descriptors[route.key];

            const tabIcon = getIconConfig(route.name);

            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const accessibilityLabel =
              options.tabBarAccessibilityLabel !== undefined
                ? options.tabBarAccessibilityLabel
                : `${String(label)} tab`;

            const iconName = isFocused ? tabIcon.active : tabIcon.inactive;

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={accessibilityLabel}
                testID={options.tabBarButtonTestID}
                onPress={() => handleTabPress(route, index)}
                onLongPress={() => handleTabLongPress(route)}
                style={[
                  styles.tabButton,
                  {
                    width: tabWidth || `${100 / tabCount}%`,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.iconWrap,
                    isFocused && {
                      transform: [
                        {
                          scale: selectedIconScale,
                        },
                        {
                          translateY: -1,
                        },
                      ],
                    },
                  ]}
                >
                  <Ionicons
                    name={iconName}
                    size={tabIcon.size}
                    color={
                      isFocused ? colors.white : colors.placeholder || '#7D7D7D'
                    }
                  />
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default FloatingTabBar;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },

  bar: {
    width: '100%',
    minHeight: hp(7.2),
    borderRadius: wp(10),
    paddingHorizontal: TAB_BAR_HORIZONTAL_PADDING,
    paddingVertical: hp(0.8),
    justifyContent: 'center',

    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 10,
  },

  tabsContainer: {
    width: '100%',
    height: ACTIVE_TAB_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },

  activeTabBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabButton: {
    height: ACTIVE_TAB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  iconWrap: {
    width: ACTIVE_TAB_SIZE,
    height: ACTIVE_TAB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
