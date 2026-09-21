import React from 'react';

import { Share, StyleSheet, TouchableOpacity, View } from 'react-native';

import FontText from '../FontText';

import { hp, normalize, wp } from '../../../styles/responsiveScreen';

import { useAppTheme } from '../../../hooks/useTheme';

import Ionicons from '@react-native-vector-icons/ionicons';

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

  isSaved?: boolean;

  onSave?: () => void;

  onShare?: () => void;
}

const FactCard: React.FC<FactCardProps> = ({
  fact,
  isSaved = false,
  onSave,
  onShare,
}) => {
  const colors = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
      ]}
    >
      {/* Category */}
      <View
        style={[
          styles.categoryBadge,
          {
            backgroundColor: 'white',
          },
        ]}
      >
        <FontText
          name="bold"
          size={normalize(12)}
          pureColor={colors.primary}
          textAlign="center"
        >
          {fact.category?.emoji || '✨'}{' '}
          {(fact.category?.label || 'General').toUpperCase()}
        </FontText>
      </View>

      {/* Fact content */}
      <View style={styles.textContent}>
        <FontText
          name="bold"
          size={normalize(35)}
          pureColor={colors.white}
          lineHeightFactor={1.15}
          textAlign="left"
        >
          {fact.content}
        </FontText>
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomActions}>
        {' '}
        {/* Save */}{' '}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSave}
          disabled={!onSave}
          style={[
            styles.actionButton,
            {
              backgroundColor: isSaved ? colors.primary : colors.white,
              borderColor: isSaved ? colors.primary : colors.white,
            },
          ]}
        >
          {' '}
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={normalize(20)}
            color={isSaved ? colors.white : colors.primary}
          />{' '}
          <FontText
            name="semibold"
            size={normalize(13)}
            pureColor={isSaved ? colors.white : colors.primary}
            pLeft={wp(2)}
          >
            {' '}
            {isSaved ? 'Saved' : 'Save'}{' '}
          </FontText>{' '}
        </TouchableOpacity>{' '}
        {/* Share */}{' '}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onShare}
          disabled={!onShare}
          style={[
            styles.actionButton,
            { backgroundColor: colors.white, borderColor: colors.white },
          ]}
        >
          {' '}
          <Ionicons
            name="share-outline"
            size={normalize(20)}
            color={colors.primary}
          />{' '}
          <FontText
            name="semibold"
            size={normalize(13)}
            pureColor={colors.primary}
            pLeft={wp(2)}
          >
            {' '}
            Share{' '}
          </FontText>{' '}
        </TouchableOpacity>{' '}
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

    backgroundColor: 'transparent',
  },

  categoryBadge: {
    alignSelf: 'flex-start',

    paddingHorizontal: wp(3.5),

    paddingVertical: hp(1),

    borderRadius: wp(10),

    backgroundColor: 'transparent',

    borderWidth: 1,

    borderColor: 'transparent',
  },

  textContent: {
    flex: 1,

    paddingVertical: hp(4),

    // backgroundColor: 'transparent',

    // justifyContent: 'center',
  },

  bottomActions: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    gap: wp(3),
    bottom: hp(10),
  },

  actionButton: {
    flex: 1,

    minHeight: hp(5.8),

    borderRadius: wp(4),

    borderWidth: 1,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: wp(3),
  },
});
