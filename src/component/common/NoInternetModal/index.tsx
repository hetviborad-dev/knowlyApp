import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../hooks/useTheme';
import { hp, normalize, wp } from '../../../styles/responsiveScreen';
import FontText from '../FontText';


interface NoInternetModalProps {
  /** Optional custom message to display */
  message?: string;
  /** Optional custom title */
  title?: string;
}

/**
 * Universal No Internet Modal
 * Shows a full-screen overlay when there's no internet connection
 * No close button - automatically dismisses when connection is restored
 */
const NoInternetModal: React.FC<NoInternetModalProps> = ({
  message = 'Please check your internet connection and try again.',
  title = 'No Internet Connection',
}) => {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background || colors.white },
      ]}
    >
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: colors.primaryTint }]}>
            <FontText size={normalize(32)} textAlign="center">
              📡
            </FontText>
          </View>
        </View>

        <FontText
          name="bold"
          size={normalize(22)}
          pureColor={colors.black2 || '#1A1A1A'}
          textAlign="center"
          style={styles.title}
        >
          {title}
        </FontText>

        <FontText
          name="regular"
          size={normalize(15)}
          pureColor={colors.placeholder || '#7D7D7D'}
          textAlign="center"
          lineHeightFactor={1.5}
          style={styles.message}
        >
          {message}
        </FontText>

        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>

        <FontText
          name="regular"
          size={normalize(12)}
          pureColor={colors.placeholder || '#7D7D7D'}
          textAlign="center"
          style={styles.reconnectingText}
        >
          Reconnecting automatically...
        </FontText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    paddingHorizontal: wp(6),
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: hp(3),
  },
  iconBackground: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    marginBottom: hp(1.5),
    maxWidth: '85%',
  },
  message: {
    marginBottom: hp(3),
    maxWidth: '85%',
    paddingHorizontal: wp(4),
  },
  loaderContainer: {
    marginBottom: hp(2),
  },
  reconnectingText: {
    maxWidth: '85%',
  },
});

export default NoInternetModal;