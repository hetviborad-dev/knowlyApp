import React from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import FontText from '../FontText';
import {normalize, wp, hp} from '../../../styles/responsiveScreen';
import {useAppTheme} from '../../../hooks/useTheme';

interface CategoryCardProps {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: any;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  emoji,
  label,
  selected,
  onPress,
  style,
}) => {
  const colors = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: selected ? colors.primaryTint : colors.cardBg,
          borderColor: selected ? colors.primary : colors.grey,
        },
        style,
      ]}>
      <FontText size={normalize(26)} pBottom={hp(1.5)}>
        {emoji}
      </FontText>
      <FontText
        name="bold"
        size={normalize(14)}
        pureColor={selected ? colors.primaryDark : colors.black2}
        lines={2}
        lineHeightFactor={1.2}>
        {label}
      </FontText>
      {selected ? (
        <View style={[styles.checkDot, {backgroundColor: colors.primary}]} />
      ) : null}
    </TouchableOpacity>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderRadius: wp(4.5),
    padding: wp(3.5),
    justifyContent: 'flex-end',
  },
  checkDot: {
    position: 'absolute',
    top: wp(3),
    right: wp(3),
    width: wp(3),
    height: wp(3),
    borderRadius: wp(3) / 2,
  },
});