import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Share,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import { FactCard, FontText } from '../../component';
import { useAppTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { hp, normalize, wp } from '../../styles/responsiveScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
interface FactCategory {
  id: string;
  slug: string;
  label: string;
  emoji: string;
}

interface Fact {
  id: string;
  category_id: string;
  title: string;
  content: string;
  created_at: string;
  category: FactCategory | null;
}

const PAGE_SIZE = 10;

const FactsScreen: React.FC = () => {
  const colors = useAppTheme();
  const { user } = useAuth();

  const { height: screenHeight } = useWindowDimensions();

  const [facts, setFacts] = useState<Fact[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [savedFactIds, setSavedFactIds] = useState<Set<string>>(new Set());
  const [savingFactId, setSavingFactId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [newArray[i], newArray[j]] = [
      newArray[j],
      newArray[i],
    ];
  }

  return newArray;
};

  const fetchSelectedCategories = useCallback(async (): Promise<string[]> => {
    if (!user?.id) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_categories')
      .select('category_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Fetch selected categories error:', error);

      Alert.alert(
        'Could not load your topics',
        'Please check your connection and try again.',
      );

      return [];
    }

    const categoryIds = (data ?? [])
      .map(item => item.category_id)
      .filter(Boolean);

    setSelectedCategoryIds(categoryIds);

    return categoryIds;
  }, [user?.id]);

  const fetchFacts = useCallback(
  async (categoryIds: string[], pageNumber: number, replace: boolean) => {
    if (categoryIds.length === 0) {
      setFacts([]);
      setHasMore(false);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (pageNumber === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Fetch all facts from all selected categories
      const { data, error } = await supabase
        .from('facts')
        .select(
          `
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
          `,
        )
        .in('category_id', categoryIds);

      if (error) {
        console.error('Fetch facts error:', error);

        Alert.alert(
          'Could not load facts',
          'Please check your connection and try again.',
        );

        setLoading(false);
        setLoadingMore(false);
        return;
      }

      // Shuffle ALL selected-category facts
      const allFacts = shuffleArray((data ?? []) as Fact[]);

      // Get only the facts needed for this page
      const from = pageNumber * PAGE_SIZE;
      const to = from + PAGE_SIZE;

      const newFacts = allFacts.slice(from, to);

      setFacts(currentFacts =>
        replace ? newFacts : [...currentFacts, ...newFacts],
      );

      setPage(pageNumber);

      // If we received fewer than PAGE_SIZE,
      // there are no more facts to show.
      setHasMore(to < allFacts.length);

      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error('Fetch facts unexpected error:', error);

      Alert.alert(
        'Could not load facts',
        'Something went wrong. Please try again.',
      );

      setLoading(false);
      setLoadingMore(false);
    }
  },
  [],
);

  const loadFacts = useCallback(
    async (replace = true) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const categoryIds = await fetchSelectedCategories();

      await fetchFacts(categoryIds, 0, replace);
    },
    [user?.id, fetchSelectedCategories, fetchFacts],
  );

  useEffect(() => {
    loadFacts(true);
  }, [loadFacts]);

  const handleRefresh = async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      setFacts([]);
      setPage(0);
      setHasMore(true);

      const categoryIds = await fetchSelectedCategories();

      await fetchFacts(categoryIds, 0, true);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (
      loading ||
      loadingMore ||
      !hasMore ||
      selectedCategoryIds.length === 0
    ) {
      return;
    }

    fetchFacts(selectedCategoryIds, page + 1, false);
  };

  const handleSaveFact = async (fact: Fact) => {
    if (!user?.id) {
      Alert.alert('Please log in', 'You need to be logged in to save facts.');

      return;
    }

    if (savingFactId) {
      return;
    }

    const currentlySaved = savedFactIds.has(fact.id);

    setSavingFactId(fact.id);

    try {
      if (currentlySaved) {
        const { error } = await supabase
          .from('saved_facts')
          .delete()
          .eq('user_id', user.id)
          .eq('fact_id', fact.id);

        if (error) {
          console.error('Unsave fact error:', error);

          Alert.alert('Could not unsave fact', 'Please try again.');

          return;
        }

        setSavedFactIds(current => {
          const next = new Set(current);

          next.delete(fact.id);

          return next;
        });
      } else {
        const { error } = await supabase.from('saved_facts').insert({
          user_id: user.id,
          fact_id: fact.id,
        });

        if (error) {
          if (error.code === '23505') {
            setSavedFactIds(current => {
              const next = new Set(current);

              next.add(fact.id);

              return next;
            });

            return;
          }

          console.error('Save fact error:', error);

          Alert.alert('Could not save fact', 'Please try again.');

          return;
        }

        setSavedFactIds(current => {
          const next = new Set(current);

          next.add(fact.id);

          return next;
        });
      }
    } catch (error) {
      console.error('Save fact unexpected error:', error);

      Alert.alert('Something went wrong', 'Please try again.');
    } finally {
      setSavingFactId(null);
    }
  };

  const handleShareFact = async (fact: Fact) => {
    try {
      const category = fact.category?.label
        ? `${fact.category.emoji || '✨'} ${fact.category.label}\n\n`
        : '';

      const message =
        `${category}` +
        `${fact.title}\n\n` +
        `${fact.content}\n\n` +
        `Learn something worth knowing with Knowly.`;

      await Share.share({
        message,
        title: fact.title,
      });
    } catch (error) {
      console.error('Share fact error:', error);
    }
  };

  const renderFact = ({ item }: { item: Fact }) => {
    return (
      <View
        style={[
          styles.factContainer,
          {
            height: screenHeight,
          },
        ]}
      >
        <FactCard
          fact={item}
          isSaved={savedFactIds.has(item.id)}
          onSave={() => handleSaveFact(item)}
          onShare={() => handleShareFact(item)}
        />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View
          style={[
            styles.emptyContainer,
            {
              height: screenHeight,
            },
          ]}
        >
          <ActivityIndicator color={colors.primary} size="small" />

          <FontText
            name="medium"
            size={normalize(14)}
            pureColor={colors.placeholder}
            pTop={hp(2)}
          >
            Loading your facts...
          </FontText>
        </View>
      );
    }

    if (selectedCategoryIds.length === 0) {
      return (
        <View
          style={[
            styles.emptyContainer,
            {
              height: screenHeight,
            },
          ]}
        >
          <FontText
            name="bold"
            size={normalize(20)}
            pureColor={colors.black2}
            textAlign="center"
          >
            No topics selected
          </FontText>

          <FontText
            name="regular"
            size={normalize(14)}
            pureColor={colors.placeholder}
            textAlign="center"
            pTop={hp(1)}
            style={styles.emptyText}
          >
            Select some topics to start discovering interesting facts.
          </FontText>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.emptyContainer,
          {
            height: screenHeight,
          },
        ]}
      >
        <FontText
          name="bold"
          size={normalize(20)}
          pureColor={colors.black2}
          textAlign="center"
        >
          No facts yet
        </FontText>

        <FontText
          name="regular"
          size={normalize(14)}
          pureColor={colors.placeholder}
          textAlign="center"
          pTop={hp(1)}
          style={styles.emptyText}
        >
          We couldn't find any facts for your selected topics.
        </FontText>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#3170a8', '#e6e380', '#e5d7cc']}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <FlatList
        data={facts}
        keyExtractor={item => item.id}
        renderItem={renderFact}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        style={[styles.list,{paddingTop:insets.top}]}
        contentContainerStyle={styles.listContent}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.7}
        removeClippedSubviews
        windowSize={5}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            progressBackgroundColor="transparent"
          />
        }
      />
    </LinearGradient>
  );
};

export default FactsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  list: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  listContent: {
    backgroundColor: 'transparent',
  },

  factContainer: {
    backgroundColor: 'transparent',
  },

  topHeader: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(1.5),
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(10),
    backgroundColor: 'transparent',
  },

  emptyText: {
    maxWidth: wp(75),
  },

  footerLoader: {
    height: hp(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
