import React from 'react';
import {StyleSheet, View} from 'react-native';

import FontText from '../FontText';
import {hp, normalize, wp} from '../../../styles/responsiveScreen';
import {useAppTheme} from '../../../hooks/useTheme';

export interface FactCardData {
  id: string;
  category_id: string;
  title: string;
  content: string;
  created_at: string;
  category?: {
    id: string;
    slug: string;
    label: string;
    emoji: string;
  } | null;
}

interface FactCardProps {
  fact: FactCardData;
}

const FactCard: React.FC<FactCardProps> = ({fact}) => {
  const colors = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.separator,
        },
      ]}>
      <View
        style={[
          styles.categoryBadge,
          {
            backgroundColor: colors.primaryTint,
          },
        ]}>
        <FontText
          name="bold"
          size={normalize(12)}
          pureColor={colors.primary}
          textAlign="center">
          {fact.category?.emoji || '✨'}{' '}
          {(fact.category?.label || 'General').toUpperCase()}
        </FontText>
      </View>

      <View style={styles.textContent}>
        <FontText
          name="bold"
          size={normalize(25)}
          pureColor={colors.black2}
          lineHeightFactor={1.15}
          textAlign="left">
          {fact.title}
        </FontText>

        <FontText
          name="regular"
          size={normalize(16)}
          pureColor={colors.placeholder}
          lineHeightFactor={1.55}
          pTop={hp(2)}>
          {fact.content}
        </FontText>
      </View>
    </View>
  );
};

export default FactCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingHorizontal: wp(6),
    paddingVertical: hp(5),
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1),
    borderRadius: wp(5),
  },

  textContent: {
    flex: 1,
    // justifyContent: 'center',
    paddingVertical: hp(4),
  },

  bottomLabel: {
    alignItems: 'center',
    paddingTop: hp(2),
  },
});