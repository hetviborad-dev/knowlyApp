import React from 'react';
import {Text} from 'react-native';
import {normalize} from '../../../styles/responsiveScreen';
import {fonts} from '../../../assets';
import {useAppTheme} from '../../../hooks/useTheme';

interface FontTextProps {
  children: React.ReactNode;
  style?: any;
  color?: string;
  pureColor?: string;
  size?: number;
  name?: 'default' | 'regular' | 'medium' | 'bold' | 'semibold';
  lineHeightFactor?: number;
  lines?: number;
  opacity?: number;
  pTop?: number;
  pLeft?: number;
  pRight?: number;
  pBottom?: number;
  textAlign?: 'left' | 'center' | 'right';
  textDecoration?: 'underline' | 'line-through' | 'none' | null;
  onLayout?: () => void;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

const FontText: React.FC<FontTextProps> = ({
  children,
  style,
  color = 'black',
  pureColor,
  size = normalize(14),
  name = 'default',
  lineHeightFactor = 1.2,
  lines = 0,
  opacity = 1,
  pTop = 0,
  pLeft = 0,
  pRight = 0,
  pBottom = 0,
  textAlign = 'left',
  textDecoration = null,
  onLayout,
  ellipsizeMode = undefined,
}) => {
  const colors = useAppTheme();
  const fontSize = size;
  const textStyle: any = {
    fontSize,
    fontFamily: fonts[name],
    color: pureColor || (colors as any)[color] || colors.black2,
    lineHeight: fontSize * lineHeightFactor,
    opacity,
    paddingTop: pTop,
    paddingLeft: pLeft,
    paddingRight: pRight,
    paddingBottom: pBottom,
    textAlign,
    textDecorationLine: textDecoration,
    textDecorationColor: textDecoration ? pureColor || (colors as any)[color] : null,
    textDecorationStyle: textDecoration ? 'solid' : null,
  };
  return (
    <Text
      allowFontScaling={false}
      ellipsizeMode={ellipsizeMode}
      numberOfLines={lines}
      onLayout={onLayout}
      style={[textStyle, style]}>
      {children}
    </Text>
  );
};

export default FontText;