import React from 'react';
import {TouchableOpacity, ActivityIndicator, StyleSheet, View} from 'react-native';
import FontText from '../FontText';
import {normalize, wp, hp} from '../../../styles/responsiveScreen';
import {useAppTheme} from '../../../hooks/useTheme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'social';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: any;
  textColor?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  rightIcon,
  style,
  textColor,
}) => {
  const colors = useAppTheme();
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isSocial = variant === 'social';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.base,
        isPrimary && {backgroundColor: colors.primary},
        isOutline && {backgroundColor: colors.white, borderWidth: 1.2, borderColor: colors.grey},
        isSocial && {
          backgroundColor: colors.white,
          borderWidth: 1.2,
          borderColor: colors.grey,
          flex: 1,
        },
        (disabled || loading) && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.white : colors.primary} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.iconLeft}>{icon}</View> : null}
          <FontText name="bold" size={normalize(15)} pureColor={textColor || (isPrimary ? colors.white : colors.black2)}>
            {title}
          </FontText>
          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  base: {
    height: hp(6.5),
    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(4),
  },
  content: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
  iconLeft: {marginRight: wp(2)},
  iconRight: {marginLeft: wp(2)},
  disabled: {opacity: 0.6},
});