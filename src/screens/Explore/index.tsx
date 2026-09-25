import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { hp, wp } from '../../styles/responsiveScreen';
import { CategoryTabs, FontText } from '../../component';
import { useAppTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Category {
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
  category: {
    id: string;
    slug: string;
    label: string;
    emoji: string;
  } | null;
}

const PAGE_SIZE = 10;

const ExploreScreen: React.FC = () => {
  const colors = useAppTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [facts, setFacts] = useState<Fact[]>([]);

  const [selectedCategory, setSelectedCategory] = useState('mix');

  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [factsLoading, setFactsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);

    const { data, error } = await supabase
      .from('categories')
      .select('id, slug, label, emoji')
      .order('created_at', { ascending: true }).eq('is_visible', true);

    if (error) {
      console.error('Fetch categories error:', error);

      Alert.alert(
        'Could not load categories',
        'Please check your connection and try again.',
      );

      setCategoriesLoading(false);
      return;
    }

    setCategories(data ?? []);
    setCategoriesLoading(false);
  }, []);

  
  const fetchFacts = useCallback(
    async (pageNumber: number, replace: boolean) => {
      if (pageNumber === 0) {
        setFactsLoading(true);
      } else {
        setLoadingMore(true);
      }

      const from = pageNumber * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
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
        .order('created_at', { ascending: false })
        .range(from, to);

      
      if (selectedCategory !== 'mix') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fetch facts error:', error);

        Alert.alert(
          'Could not load facts',
          'Please check your connection and try again.',
        );

        setFactsLoading(false);
        setLoadingMore(false);
        return;
      }

      const newFacts = (data ?? []) as Fact[];

      setFacts(currentFacts =>
        replace ? newFacts : [...currentFacts, ...newFacts],
      );

      setPage(pageNumber);

      
      setHasMore(newFacts.length === PAGE_SIZE);

      setFactsLoading(false);
      setLoadingMore(false);
    },
    [selectedCategory],
  );

  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  
  useEffect(() => {
    setFacts([]);
    setPage(0);
    setHasMore(true);

    fetchFacts(0, true);
  }, [fetchFacts]);

  
  const handleSelectCategory = (categoryId: string) => {
    if (categoryId === selectedCategory) {
      return;
    }

    setSelectedCategory(categoryId);
  };

  
  const handleLoadMore = () => {
    if (factsLoading || loadingMore || !hasMore) {
      return;
    }

    fetchFacts(page + 1, false);
  };

  
  const handleRefresh = async () => {
    setRefreshing(true);

    setFacts([]);
    setPage(0);
    setHasMore(true);

    await Promise.all([fetchCategories(), fetchFacts(0, true)]);

    setRefreshing(false);
  };

  
  const renderFact = ({ item }: { item: Fact }) => {
    return (
      <View
        style={[
          styles.factCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.separator,
          },
        ]}
      >
        <FontText size={12} name="bold" pureColor={colors.primary}>
          {(item.category?.label ?? 'General').toUpperCase()}
        </FontText>

        <FontText
          size={18}
          name="bold"
          pureColor={colors.black}
          style={styles.factTitle}
        >
          {item.title}
        </FontText>

        <FontText
          size={14}
          name="semibold"
          pureColor={colors.placeholder}
          style={styles.factContent}
        >
          {item.content}
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

  
  const renderEmpty = () => {
    if (factsLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <FontText
          size={14}
          name="semibold"
          pureColor={colors.placeholder}
          textAlign="center"
        >
          No facts found for this category.
        </FontText>
      </View>
    );
  };

  return (
    <SafeAreaView
    edges={['top']}
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.header}>
        <FontText size={28} name="bold" pureColor={colors.black}>
          Explore
        </FontText>

        <FontText
          size={14}
          name="semibold"
          pureColor={colors.placeholder}
          style={styles.subtitle}
        >
          Discover something worth knowing.
        </FontText>
      </View>

      {}
      {categoriesLoading ? (
        <View style={styles.categoryLoader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <CategoryTabs
          categories={[
            {
              id: 'mix',
              name: 'Mix',
            },
            ...categories.map(category => ({
              id: category.id,
              name: category.label,
              emoji: category.emoji
            })),
          ]}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {}
      <FlatList
        data={facts}
        keyExtractor={item => item.id}
        renderItem={renderFact}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          facts.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  header: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(1),
  },

  subtitle: {
    marginTop: hp(0.6),
  },

  categoryLoader: {
    height: hp(7),
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContent: {
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
    paddingBottom: hp(12),
  },

  emptyListContent: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },

  factCard: {
    borderWidth: 1,
    borderRadius: wp(4),
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    marginBottom: hp(1.5),
  },

  factTitle: {
    marginTop: hp(0.8),
  },

  factContent: {
    marginTop: hp(0.8),
    lineHeight: hp(2.6),
  },

  footerLoader: {
    paddingVertical: hp(2),
    alignItems: 'center',
  },
});

export default ExploreScreen;
