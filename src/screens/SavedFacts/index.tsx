import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { FontText, Header } from '../../component';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';
import { hp, normalize, wp } from '../../styles/responsiveScreen';
import { RootStackParamList } from '../../types';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedFacts'>;

interface FactCategory {
  id: string;
  slug: string;
  label: string;
  emoji: string;
}

interface SavedFact {
  id: string;
  category_id: string;
  title: string;
  content: string;
  created_at: string;
  category: FactCategory | null;
}

interface SavedFactRow {
  fact_id: string;
  created_at: string;
  fact: SavedFact | SavedFact[] | null;
}

const SCREEN_BACKGROUND = '#F8F7F2';
const CARD_BACKGROUND = '#FFFFFF';
const DARK_TEXT = '#272621';
const MUTED_TEXT = '#929088';
const SOFT_PRIMARY = '#FFF0D1';
const BORDER_COLOR = '#ECE9E1';

const SavedFactsScreen: React.FC<Props> = ({ navigation }) => {
  const colors = useAppTheme();
  const { user } = useAuth();

  const [facts, setFacts] = useState<SavedFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingFactId, setRemovingFactId] = useState<string | null>(null);

  const normalizeFact = (
    fact: SavedFact | SavedFact[] | null,
  ): SavedFact | null => {
    if (Array.isArray(fact)) {
      return fact[0] || null;
    }

    return fact;
  };

  const fetchSavedFacts = useCallback(async () => {
    if (!user?.id) {
      setFacts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('saved_facts')
      .select(
        `
          fact_id,
          created_at,
          fact:facts (
            id,
            category_id,
            title,
            content,
            created_at,
            category:categories (
              id,
              slug,
              label,
              emoji
            )
          )
        `,
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch saved facts error:', error);

      Alert.alert(
        'Could not load saved facts',
        'Please check your connection and try again.',
      );

      setLoading(false);
      return;
    }

    const savedRows = (data ?? []) as SavedFactRow[];

    const savedFacts = savedRows
      .map(row => normalizeFact(row.fact))
      .filter((fact): fact is SavedFact => Boolean(fact));

    setFacts(savedFacts);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchSavedFacts();
  }, [fetchSavedFacts]);

  const handleRefresh = async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await fetchSavedFacts();
    } finally {
      setRefreshing(false);
    }
  };

  const handleUnsave = async (fact: SavedFact) => {
    if (!user?.id || removingFactId) {
      return;
    }

    setRemovingFactId(fact.id);

    const { error } = await supabase
      .from('saved_facts')
      .delete()
      .eq('user_id', user.id)
      .eq('fact_id', fact.id);

    if (error) {
      console.error('Unsave fact error:', error);

      Alert.alert('Could not remove fact', 'Please try again in a moment.');

      setRemovingFactId(null);
      return;
    }

    setFacts(currentFacts =>
      currentFacts.filter(savedFact => savedFact.id !== fact.id),
    );

    setRemovingFactId(null);
  };

  const handleShare = async (fact: SavedFact) => {
    try {
      const category = fact.category?.label
        ? `${fact.category.emoji || '✨'} ${fact.category.label}\n\n`
        : '';

      const message =
        `${category}` +
        `${fact.title}\n\n` +
        `${fact.content}\n\n` +
        'Learn something worth knowing with Knowly.';

      await Share.share({
        title: fact.title,
        message,
      });
    } catch (error) {
      console.error('Share saved fact error:', error);
    }
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerContent}>
        <FontText
          name="medium"
          size={normalize(12)}
          pureColor={colors.primary}
          pBottom={hp(0.8)}
        >
          YOUR COLLECTION
        </FontText>

        <FontText
          name="bold"
          size={normalize(30)}
          pureColor={DARK_TEXT}
          lineHeightFactor={1.1}
        >
          Saved facts
        </FontText>

        <FontText
          name="regular"
          size={normalize(14)}
          pureColor={MUTED_TEXT}
          lineHeightFactor={1.4}
          pTop={hp(0.8)}
        >
          Keep the discoveries you want to remember.
        </FontText>

        {!loading && facts.length > 0 ? (
          <View style={styles.countBadge}>
            <Ionicons
              name="bookmark"
              size={normalize(13)}
              color={colors.primary}
            />

            <FontText
              name="bold"
              size={normalize(12)}
              pureColor={colors.primary}
              pLeft={wp(1.3)}
            >
              {facts.length} {facts.length === 1 ? 'saved fact' : 'saved facts'}
            </FontText>
          </View>
        ) : null}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="small" color={colors.primary} />

          <FontText
            name="medium"
            size={normalize(14)}
            pureColor={MUTED_TEXT}
            textAlign="center"
            pTop={hp(1.5)}
          >
            Loading your saved facts...
          </FontText>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <View
          style={[
            styles.emptyIcon,
            {
              backgroundColor: SOFT_PRIMARY,
            },
          ]}
        >
          <Ionicons
            name="bookmark-outline"
            size={normalize(31)}
            color={colors.primary}
          />
        </View>

        <FontText
          name="bold"
          size={normalize(21)}
          pureColor={DARK_TEXT}
          textAlign="center"
          pTop={hp(2)}
        >
          Nothing saved yet
        </FontText>

        <FontText
          name="regular"
          size={normalize(14)}
          pureColor={MUTED_TEXT}
          textAlign="center"
          lineHeightFactor={1.45}
          pTop={hp(0.8)}
          style={styles.emptyDescription}
        >
          When you find a fact you love, tap the bookmark icon to keep it here.
        </FontText>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: SCREEN_BACKGROUND,
        },
      ]}
    >
      <Header
        title="Saved facts"
        showBack
        containerStyle={{
          backgroundColor: SCREEN_BACKGROUND,
        }}
        onBackPress={() => navigation.goBack()}
      />

      {renderHeader()}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          facts.length === 0 && !loading && styles.emptyScrollContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {facts.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.factsList}>
            {facts.map(fact => {
              const isRemoving = removingFactId === fact.id;

              return (
                <View
                  key={fact.id}
                  style={[
                    styles.factCard,
                    {
                      backgroundColor: CARD_BACKGROUND,
                      borderColor: BORDER_COLOR,
                    },
                    isRemoving && styles.removingCard,
                  ]}
                >
                  <View style={styles.factCardHeader}>
                    <View style={styles.categoryInfo}>
                      <View
                        style={[
                          styles.categoryEmoji,
                          {
                            backgroundColor: SOFT_PRIMARY,
                          },
                        ]}
                      >
                        <FontText size={normalize(17)}>
                          {fact.category?.emoji || '✨'}
                        </FontText>
                      </View>

                      <FontText
                        name="bold"
                        size={normalize(11)}
                        pureColor={colors.primary}
                        pLeft={wp(2)}
                      >
                        {(fact.category?.label || 'GENERAL').toUpperCase()}
                      </FontText>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleUnsave(fact)}
                      disabled={isRemoving}
                      accessibilityRole="button"
                      accessibilityLabel="Remove saved fact"
                      style={styles.iconButton}
                    >
                      {isRemoving ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.primary}
                        />
                      ) : (
                        <Ionicons
                          name="bookmark"
                          size={normalize(21)}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  </View>

                  {fact.title ? (
                    <FontText
                      name="bold"
                      size={normalize(20)}
                      pureColor={DARK_TEXT}
                      lineHeightFactor={1.2}
                      pTop={hp(1.8)}
                    >
                      {fact.title}
                    </FontText>
                  ) : null}

                  <FontText
                    name="regular"
                    size={normalize(15)}
                    pureColor="#55544E"
                    lineHeightFactor={1.48}
                    pTop={hp(1)}
                  >
                    {fact.content}
                  </FontText>

                  <View style={styles.factCardFooter}>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleShare(fact)}
                      style={styles.shareButton}
                      accessibilityRole="button"
                      accessibilityLabel="Share saved fact"
                    >
                      <Ionicons
                        name="share-outline"
                        size={normalize(18)}
                        color={colors.primary}
                      />

                      <FontText
                        name="semibold"
                        size={normalize(13)}
                        pureColor={colors.primary}
                        pLeft={wp(1.5)}
                      >
                        Share
                      </FontText>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SavedFactsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(0.5),
    paddingBottom: hp(16),
  },

  emptyScrollContent: {
    flexGrow: 1,
  },

  headerContent: {
    paddingTop: hp(1),
    paddingBottom: hp(1.5),
    paddingHorizontal: wp(5),
  },

  countBadge: {
    alignSelf: 'flex-start',
    marginTop: hp(1.5),
    minHeight: hp(3.6),
    borderRadius: wp(8),
    paddingHorizontal: wp(3),
    backgroundColor: SOFT_PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
  },

  factsList: {
    gap: hp(1.7),
  },

  factCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: wp(5.5),
    paddingHorizontal: wp(4.5),
    paddingVertical: hp(2.3),

    shadowColor: '#5F5A4E',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  removingCard: {
    opacity: 0.55,
  },

  factCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryEmoji: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SOFT_PRIMARY,
  },

  factCardFooter: {
    marginTop: hp(2),
    paddingTop: hp(1.5),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER_COLOR,
    alignItems: 'flex-end',
  },

  shareButton: {
    minHeight: hp(4),
    paddingHorizontal: wp(3),
    borderRadius: wp(5),
    backgroundColor: SOFT_PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: {
    flex: 1,
    minHeight: hp(53),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(8),
  },

  emptyIcon: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyDescription: {
    maxWidth: wp(72),
  },
});
