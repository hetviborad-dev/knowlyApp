import React from 'react';

import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

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
    <View style={styles.card}>
      <View
        style={[
          styles.categoryBadge,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
        ]}>
        <FontText
          name="bold"
          size={normalize(12)}
          pureColor={colors.white}
          textAlign="center">
          {fact.category?.emoji || '✨'}{' '}
          {(fact.category?.label || 'General').toUpperCase()}
        </FontText>
      </View>

      <View style={styles.contentArea}>
        <View style={styles.textContent}>
          <FontText
            name="bold"
            size={normalize(33)}
            pureColor={colors.white}
            lineHeightFactor={1.13}
            textAlign="left">
            {fact.content}
          </FontText>
        </View>

        <View style={styles.actionRail}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSave}
            disabled={!onSave}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? 'Remove saved fact' : 'Save fact'}
            style={styles.actionWrapper}>
            <View
              style={[
                styles.actionCircle,
                {
                  backgroundColor: isSaved
                    ? colors.primary
                    : 'rgba(0, 0, 0, 0.28)',
                  borderColor: isSaved
                    ? colors.primary
                    : 'rgba(255, 255, 255, 0.36)',
                },
              ]}>
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={normalize(22)}
                color={colors.white}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onShare}
            disabled={!onShare}
            accessibilityRole="button"
            accessibilityLabel="Share fact"
            style={styles.actionWrapper}>
            <View
              style={[
                styles.actionCircle,
                {
                  backgroundColor: 'rgba(0, 0, 0, 0.28)',
                  borderColor: 'rgba(255, 255, 255, 0.36)',
                },
              ]}>
              <Ionicons
                name="share-outline"
                size={normalize(23)}
                color={colors.white}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FactCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingHorizontal: wp(6),
    paddingTop: hp(5),
    paddingBottom: hp(17),
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: wp(10),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.9),
  },

  contentArea: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: hp(3),
  },

  textContent: {
    flex: 1,
    paddingRight: wp(3),
  },

  actionRail: {
    width: wp(15),
    alignItems: 'center',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    paddingBottom: hp(1),
    gap: hp(2.2),
  },

  actionWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: wp(14),
  },

  actionCircle: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});