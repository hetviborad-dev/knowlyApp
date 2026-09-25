import React, {useCallback, useEffect, useRef, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Share,
  StyleSheet,
  View,
  useWindowDimensions,
  ViewToken,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {FactCard, FontText} from '../../component';
import {useAppTheme} from '../../hooks/useTheme';
import {useAuth} from '../../context/AuthContext';
import {supabase} from '../../lib/supabase';
import {hp, normalize, wp} from '../../styles/responsiveScreen';

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

interface FactViewRow {
  fact_id: string;
  viewed_at: string;
  fact: Fact | Fact[] | null;
}

const PAGE_SIZE = 10;

const FactsScreen: React.FC = () => {
  const colors = useAppTheme();
  const {user} = useAuth();
  const {height: screenHeight} = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [facts, setFacts] = useState<Fact[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const [savedFactIds, setSavedFactIds] = useState<Set<string>>(new Set());
  const [savingFactId, setSavingFactId] = useState<string | null>(null);
  const [showingOldFacts, setShowingOldFacts] = useState(false);

  // Facts already placed in this FlatList session.
  const feedFactIdsRef = useRef<Set<string>>(new Set());

  // Facts already marked as viewed in DB for this session.
  const markedViewedIdsRef = useRef<Set<string>>(new Set());

  // Viewed fact IDs fetched once per full refresh.
  const viewedFactIdsRef = useRef<Set<string>>(new Set());

  // All facts from selected categories, cached for this session.
  const allFactsCacheRef = useRef<Fact[]>([]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const result = [...array];

    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [
        result[randomIndex],
        result[index],
      ];
    }

    return result;
  };

  const fetchSelectedCategories = useCallback(async (): Promise<string[]> => {
    if (!user?.id) {
      return [];
    }

    const {data, error} = await supabase
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

  const fetchSavedFactIds = useCallback(async () => {
    if (!user?.id) {
      setSavedFactIds(new Set());
      return;
    }

    const {data, error} = await supabase
      .from('saved_facts')
      .select('fact_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Fetch saved fact IDs error:', error);
      return;
    }

    setSavedFactIds(new Set((data ?? []).map(item => item.fact_id)));
  }, [user?.id]);

  const fetchViewedFactIds = useCallback(async (): Promise<Set<string>> => {
    if (!user?.id) {
      return new Set();
    }

    const {data, error} = await supabase
      .from('fact_views')
      .select('fact_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Fetch viewed fact IDs error:', error);
      throw error;
    }

    return new Set((data ?? []).map(item => item.fact_id).filter(Boolean));
  }, [user?.id]);

  const fetchAllFactsForCategories = useCallback(
    async (categoryIds: string[]): Promise<Fact[]> => {
      if (!categoryIds.length) {
        return [];
      }

      const {data, error} = await supabase
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
        throw error;
      }

      return (data ?? []) as Fact[];
    },
    [],
  );

  const fetchOldestViewedFacts = useCallback(
    async (
      categoryIds: string[],
      excludedFactIds: Set<string>,
      limit: number,
    ): Promise<Fact[]> => {
      if (!user?.id || !categoryIds.length) {
        return [];
      }

      const {data, error} = await supabase
        .from('fact_views')
        .select(
          `
            fact_id,
            viewed_at,
            fact:facts!inner (
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
        .in('fact.category_id', categoryIds)
        .order('viewed_at', {ascending: true});

      if (error) {
        console.error('Fetch old viewed facts error:', error);
        throw error;
      }

      const oldFacts = (data ?? [])
        .map(row => {
          const typedRow = row as FactViewRow;
          if (Array.isArray(typedRow.fact)) {
            return typedRow.fact[0] ?? null;
          }
          return typedRow.fact;
        })
        .filter((fact): fact is Fact => Boolean(fact))
        .filter(fact => !excludedFactIds.has(fact.id))
        .slice(0, limit);

      return oldFacts;
    },
    [user?.id],
  );

  const markFactAsViewed = useCallback(
    async (factId: string) => {
      if (!user?.id || markedViewedIdsRef.current.has(factId)) {
        return;
      }

      markedViewedIdsRef.current.add(factId);

      const {error} = await supabase.from('fact_views').upsert(
        {
          user_id: user.id,
          fact_id: factId,
          viewed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,fact_id',
          ignoreDuplicates: true,
        },
      );

      if (error) {
        console.error('Mark fact as viewed error:', error);
        markedViewedIdsRef.current.delete(factId);
      }
    },
    [user?.id],
  );

  const loadFacts = useCallback(
    async (replace: boolean) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      if (replace) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        let categoryIds = selectedCategoryIds;

        if (replace) {
          categoryIds = await fetchSelectedCategories();
        }

        if (!categoryIds.length) {
          setFacts([]);
          setHasMore(false);
          setShowingOldFacts(false);
          return;
        }

        // On full refresh, reload everything once.
        if (replace) {
          feedFactIdsRef.current = new Set();
          markedViewedIdsRef.current = new Set();
          viewedFactIdsRef.current = new Set();
          allFactsCacheRef.current = [];
          setShowingOldFacts(false);

          const [allFacts, viewedSet] = await Promise.all([
            fetchAllFactsForCategories(categoryIds),
            fetchViewedFactIds(),
          ]);

          allFactsCacheRef.current = allFacts;
          viewedFactIdsRef.current = viewedSet;
        }

        const allFacts = allFactsCacheRef.current;
        const viewedSet = viewedFactIdsRef.current;

        const excludedIds = feedFactIdsRef.current;

        // Only unseen facts for this user in this session.
        const unseenFacts = allFacts.filter(
          fact =>
            !viewedSet.has(fact.id) &&
            !excludedIds.has(fact.id),
        );

        const nextUnseenFacts = shuffleArray(unseenFacts).slice(0, PAGE_SIZE);

        let nextFacts = nextUnseenFacts;
        let usingOldFacts = false;

        // If we cannot fill a page with unseen facts, use oldest viewed.
        if (nextFacts.length < PAGE_SIZE) {
          const usedIds = new Set([
            ...excludedIds,
            ...nextFacts.map(fact => fact.id),
          ]);

          const olderFacts = await fetchOldestViewedFacts(
            categoryIds,
            usedIds,
            PAGE_SIZE - nextFacts.length,
          );

          if (olderFacts.length > 0) {
            nextFacts = [...nextFacts, ...olderFacts];
            usingOldFacts = true;
          }
        }

        if (replace) {
          feedFactIdsRef.current = new Set(nextFacts.map(fact => fact.id));
          setFacts(nextFacts);
          setShowingOldFacts(usingOldFacts);
        } else {
          nextFacts.forEach(fact => feedFactIdsRef.current.add(fact.id));
          setFacts(currentFacts => [...currentFacts, ...nextFacts]);

          if (usingOldFacts) {
            setShowingOldFacts(true);
          }
        }

        setHasMore(nextFacts.length === PAGE_SIZE);
      } catch (error) {
        console.error('Load facts error:', error);
        Alert.alert(
          'Could not load facts',
          'Please check your connection and try again.',
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      user?.id,
      selectedCategoryIds,
      fetchAllFactsForCategories,
      fetchOldestViewedFacts,
      fetchSelectedCategories,
      fetchViewedFactIds,
    ],
  );

  // Run once on mount / user change.
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        await fetchSavedFactIds();
        if (!mounted) return;

        await loadFacts(true);
      } catch (err) {
        console.error('Init facts error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void init();

    return () => {
      mounted = false;
    };
  }, [user?.id]); // do NOT depend on loadFacts here

  const handleRefresh = async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await loadFacts(true);
      await fetchSavedFactIds();
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

    void loadFacts(false);
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
        const {error} = await supabase
          .from('saved_facts')
          .delete()
          .eq('user_id', user.id)
          .eq('fact_id', fact.id);

        if (error) throw error;

        setSavedFactIds(current => {
          const next = new Set(current);
          next.delete(fact.id);
          return next;
        });
      } else {
        const {error} = await supabase.from('saved_facts').upsert(
          {
            user_id: user.id,
            fact_id: fact.id,
          },
          {
            onConflict: 'user_id,fact_id',
          },
        );

        if (error) throw error;

        setSavedFactIds(current => {
          const next = new Set(current);
          next.add(fact.id);
          return next;
        });
      }
    } catch (error) {
      console.error('Save fact error:', error);
      Alert.alert('Could not update saved fact', 'Please try again.');
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
        `${category}${fact.title}\n\n${fact.content}\n\n` +
        'Learn something worth knowing with Knowly.';

      await Share.share({
        message,
        title: fact.title,
      });

      if (user?.id) {
        await supabase
          .from('fact_views')
          .update({shared: true})
          .eq('user_id', user.id)
          .eq('fact_id', fact.id);
      }
    } catch (error) {
      console.error('Share fact error:', error);
    }
  };

  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      const visibleFact = viewableItems.find(
        item => item.isViewable && item.item?.id,
      );

      if (visibleFact?.item?.id) {
        void markFactAsViewed(visibleFact.item.id);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70,
    minimumViewTime: 500,
  }).current;

  const renderFact = ({item}: {item: Fact}) => {
    return (
      <View style={[styles.factContainer, {height: screenHeight}]}>
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
        <View style={[styles.emptyContainer, {height: screenHeight}]}>
          <ActivityIndicator color={colors.primary} size="small" />
          <FontText
            name="medium"
            size={normalize(14)}
            pureColor={colors.placeholder}
            pTop={hp(2)}>
            Loading your facts...
          </FontText>
        </View>
      );
    }

    if (selectedCategoryIds.length === 0) {
      return (
        <View style={[styles.emptyContainer, {height: screenHeight}]}>
          <FontText
            name="bold"
            size={normalize(20)}
            pureColor={colors.black2}
            textAlign="center">
            No topics selected
          </FontText>

          <FontText
            name="regular"
            size={normalize(14)}
            pureColor={colors.placeholder}
            textAlign="center"
            pTop={hp(1)}
            style={styles.emptyText}>
            Select some topics to start discovering interesting facts.
          </FontText>
        </View>
      );
    }

    return (
      <View style={[styles.emptyContainer, {height: screenHeight}]}>
        <FontText
          name="bold"
          size={normalize(20)}
          pureColor={colors.black2}
          textAlign="center">
          You have seen every fact
        </FontText>

        <FontText
          name="regular"
          size={normalize(14)}
          pureColor={colors.placeholder}
          textAlign="center"
          pTop={hp(1)}
          style={styles.emptyText}>
          Add more topics or come back when new facts are available.
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

  const renderHeader = () => {
    if (!showingOldFacts) {
      return null;
    }

    return (
      <View style={styles.replayNotice}>
        <FontText
          name="medium"
          size={normalize(12)}
          pureColor={colors.primary}
          textAlign="center">
          You have explored all new facts. Here are older discoveries again.
        </FontText>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#3170a8', '#e6e380', '#e5d7cc']}
      locations={[0, 0.5, 1]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}>
      {/* {renderHeader()} */}

      <FlatList
        data={facts}
        keyExtractor={item => item.id}
        renderItem={renderFact}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        style={[styles.list, {paddingTop: insets.top}]}
        contentContainerStyle={styles.listContent}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.7}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
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

  replayNotice: {
    position: 'absolute',
    top: hp(6),
    left: wp(5),
    right: wp(5),
    zIndex: 10,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.1),
    borderRadius: wp(4),
    backgroundColor: 'rgba(255, 240, 209, 0.94)',
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