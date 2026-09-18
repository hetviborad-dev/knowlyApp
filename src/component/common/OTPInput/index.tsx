import React, {useRef, useState} from 'react';
import {View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData} from 'react-native';
import {wp, hp, normalize} from '../../../styles/responsiveScreen';
import {useAppTheme} from '../../../hooks/useTheme';
import FontText from '../FontText';

interface OTPInputProps {
  length?: number;
  value: string;
  onChangeText: (value: string) => void;
  autoFocus?: boolean;
  containerStyle?: any;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChangeText,
  autoFocus = true,
  containerStyle,
}) => {
  const colors = useAppTheme();
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(autoFocus ? 0 : -1);

  const digits = Array.from({length}, (_, i) => value[i] || '');

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (!cleaned) {
      const newValue = value.slice(0, index) + value.slice(index + 1);
      onChangeText(newValue);
      return;
    }
    const chars = cleaned.split('');
    let newValue = value.split('');
    chars.forEach((char, i) => {
      const targetIndex = index + i;
      if (targetIndex < length) {
        newValue[targetIndex] = char;
      }
    });
    const joined = newValue.join('').slice(0, length);
    onChangeText(joined);

    const nextIndex = Math.min(index + cleaned.length, length - 1);
    if (cleaned.length && nextIndex < length) {
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={[styles.row, containerStyle]}>
      {digits.map((digit, index) => {
        const isFilled = digit !== '';
        const isFocused = focusedIndex === index;
        const borderColor = isFocused
          ? colors.primary
          : isFilled
          ? colors.success || '#2FAE60'
          : colors.grey;
        const backgroundColor = isFilled
          ? colors.successBg || '#E8F6EC'
          : colors.white;

        return (
          <TextInput
            key={index}
            ref={ref => {
              inputRefs.current[index] = ref;
            }}
            value={digit}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(-1)}
            keyboardType="number-pad"
            maxLength={length}
            autoFocus={autoFocus && index === 0}
            style={[
              styles.box,
              {
                borderColor,
                backgroundColor,
                color: colors.black2,
              },
              isFocused && styles.focusedShadow,
            ]}
          />
        );
      })}
    </View>
  );
};

export default OTPInput;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  box: {
    width: wp(13),
    height: wp(15),
    borderWidth: 1.6,
    borderRadius: wp(3.5),
    textAlign: 'center',
    fontSize: normalize(20),
    fontWeight: '700',
  },
  focusedShadow: {
    shadowColor: '#2F80ED',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
});