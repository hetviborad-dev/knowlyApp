import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontText from '../FontText';
import { normalize, wp, hp } from '../../../styles/responsiveScreen';
import { useAppTheme } from '../../../hooks/useTheme';
import { SvgIcons } from '../../../assets';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  containerStyle?: any;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  onBackPress,
  rightComponent,
  containerStyle,
}) => {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: hp(1), backgroundColor: colors.background },
        containerStyle,
      ]}
    >
      {showBack ? (
        <TouchableOpacity
          onPress={onBackPress}
          style={[styles.backBtn,]}
        >
          <SvgIcons.arrow
            style={{ transform: [{ rotate: '-180deg' }] }}
            color={colors.primary}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.backBtn} />
      )}
      {title ? (
        <FontText
          name="bold"
          size={normalize(16)}
          color="black2"
          style={styles.title}
        >
          {title}
        </FontText>
      ) : (
        <View style={styles.flexSpace} />
      )}
      {rightComponent ? (
        <View style={styles.rightWrap}>{rightComponent}</View>
      ) : (
        <View style={styles.backBtn} />
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
  },
  backBtn: {
    width: wp(12),
    height: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, textAlign: 'center' },
  flexSpace: { flex: 1 },
  rightWrap: { width: wp(11), alignItems: 'flex-end' },
});
