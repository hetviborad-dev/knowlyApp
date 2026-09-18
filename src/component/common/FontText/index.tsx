import React from 'react';
import {Text} from 'react-native';
import {normalize} from '../../../styles/responsiveScreen';
import {fonts} from '../../../assets';
import {useAppTheme} from '../../../hooks/useTheme';

const FontText = ({
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
}: any) => {
  const colors = useAppTheme();
  const fontSize = size;
  const textStyle = {
    fontSize,
    fontFamily: fonts[name],
    color: pureColor || colors[color],
    lineHeight: fontSize * lineHeightFactor,
    opacity,
    paddingTop: pTop,
    paddingLeft: pLeft,
    paddingRight: pRight,
    paddingBottom: pBottom,
    textAlign,
    textDecorationLine: textDecoration,
    textDecorationColor: textDecoration ? pureColor || colors[color] : null,
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
