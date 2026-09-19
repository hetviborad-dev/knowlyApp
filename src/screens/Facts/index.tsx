import React, {useCallback, useEffect, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

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

const PAGE_SIZE = 10;

const FactsScreen: React.FC = () => {
  const colors = useAppTheme();
  const {user} = useAuth();

  const {height: screenHeight} = useWindowDimensions();

  const [facts, setFacts] = useState<Fact[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchSelectedCategories = useCallback(async (): Promise<
    string[]
  > => {
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

  const fetchFacts = useCallback(
    async (
      categoryIds: string[],
      pageNumber: number,
      replace: boolean,
    ) => {
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

      const from = pageNumber * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

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
        .in('category_id', categoryIds)
        .order('created_at', {ascending: false})
        .range(from, to);

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

      const newFacts = (data ?? []) as Fact[];

      setFacts(currentFacts =>
        replace ? newFacts : [...currentFacts, ...newFacts],
      );

      setPage(pageNumber);
      setHasMore(newFacts.length === PAGE_SIZE);

      setLoading(false);
      setLoadingMore(false);
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

  const renderFact = ({item}: {item: Fact}) => {
    return (
      <View style={{height: screenHeight}}>
        <FactCard fact={item} />
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
          ]}>
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
        <View
          style={[
            styles.emptyContainer,
            {
              height: screenHeight,
            },
          ]}>
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
      <View
        style={[
          styles.emptyContainer,
          {
            height: screenHeight,
          },
        ]}>
        <FontText
          name="bold"
          size={normalize(20)}
          pureColor={colors.black2}
          textAlign="center">
          No facts yet
        </FontText>

        <FontText
          name="regular"
          size={normalize(14)}
          pureColor={colors.placeholder}
          textAlign="center"
          pTop={hp(1)}
          style={styles.emptyText}>
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
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}>

      <FlatList
        data={facts}
        keyExtractor={item => item.id}
        renderItem={renderFact}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
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
          />
        }
      />
    </View>
  );
};

export default FactsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },

  emptyText: {
    maxWidth: wp(75),
  },

  footerLoader: {
    height: hp(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
});