import React, {useState} from 'react';
import {TextInput, View, TouchableOpacity, StyleSheet} from 'react-native';
import FontText from '../FontText';
import {normalize, wp, hp} from '../../../styles/responsiveScreen';
import {useAppTheme} from '../../../hooks/useTheme';
import {SvgIcons} from '../../../assets';

interface CustomInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  containerStyle?: any;
  editable?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label, value, onChangeText, placeholder, secureTextEntry = false,
  leftIcon, rightIcon, onRightIconPress, keyboardType = 'default',
  autoCapitalize = 'none', error, containerStyle, editable = true,
}) => {
  const colors = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(true);
  const showPasswordToggle = secureTextEntry;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <FontText name="medium" size={normalize(13)} color="black2" pBottom={hp(0.8)}>{label}</FontText> : null}
      <View style={[styles.inputBox, {borderColor: error ? colors.error || 'red' : isFocused ? colors.primary : colors.grey, backgroundColor: colors.white}]}>
        {leftIcon ? <View style={styles.iconWrap}>{leftIcon}</View> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder || colors.grey}
          secureTextEntry={showPasswordToggle ? isSecure : false}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, {color: colors.black2, fontFamily: 'Nunito-Regular'}]}
        />
        {showPasswordToggle ? (
          <TouchableOpacity onPress={() => {setIsSecure(value => !value); onRightIconPress?.();}} style={styles.iconWrap} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            {isSecure ? <SvgIcons.eyeOff color={colors.black2} /> : <SvgIcons.eye color={colors.black2} />}
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} style={styles.iconWrap} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>{rightIcon}</TouchableOpacity>
        ) : null}
      </View>
      {error ? <FontText size={normalize(11)} pureColor={colors.error || 'red'} pTop={hp(0.5)}>{error}</FontText> : null}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  wrapper: {marginVertical: hp(1), width: '100%'},
  inputBox: {flexDirection: 'row', alignItems: 'center', borderWidth: 1.2, borderRadius: wp(4), paddingHorizontal: wp(4), height: hp(6.5)},
  input: {flex: 1, fontSize: normalize(14), paddingVertical: 0},
  iconWrap: {paddingHorizontal: wp(1.5), alignItems: 'center', justifyContent: 'center'},
});
