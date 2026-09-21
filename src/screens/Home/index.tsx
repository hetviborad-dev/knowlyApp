import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@react-native-vector-icons/ionicons';

import { FontText } from '../../component';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';
import { hp, normalize, wp } from '../../styles/responsiveScreen';
import { RootStackParamList } from '../../types';
import LinearGradient from 'react-native-linear-gradient';

type HomeNavigationProp = NativeStackScreenProps<
  RootStackParamList,
  'Dashboard'
>['navigation'];

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
  category: Category | null;
}

const HomeScreen: React.FC = () => {
  const colors = useAppTheme();
  const { user } = useAuth();
  const navigation = useNavigation<HomeNavigationProp>();

  const [fact, setFact] = useState<Fact | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const username =
    user?.user_metadata?.full_name || user?.user_metadata?.name || 'Explorer';

  const fetchHomeFact = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data: userCategories, error: categoryError } = await supabase
        .from('user_categories')
        .select(
          `
            category_id,
            category:categories (
              id,
              slug,
              label,
              emoji
            )
          `,
        )
        .eq('user_id', user.id);

      if (categoryError) {
        console.error('Fetch user categories error:', categoryError);

        Alert.alert(
          'Could not load your topics',
          'Please check your connection and try again.',
        );

        return;
      }

      if (!userCategories || userCategories.length === 0) {
        setFact(null);
        setSelectedCategory(null);
        return;
      }

      const firstCategory = userCategories[0]?.category as Category | null;

      setSelectedCategory(firstCategory);

      const categoryIds = userCategories
        .map(item => item.category_id)
        .filter(Boolean);

      if (categoryIds.length === 0) {
        setFact(null);
        return;
      }

      const { count, error: countError } = await supabase
        .from('facts')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .in('category_id', categoryIds);

      if (countError) {
        console.error('Count facts error:', countError);

        Alert.alert(
          'Could not load fact',
          'Please check your connection and try again.',
        );

        return;
      }

      if (!count || count === 0) {
        setFact(null);
        return;
      }

      const randomIndex = Math.floor(Math.random() * count);

      const { data: factData, error: factError } = await supabase
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
        .range(randomIndex, randomIndex);

      if (factError) {
        console.error('Fetch random fact error:', factError);

        Alert.alert(
          'Could not load fact',
          'Please check your connection and try again.',
        );

        return;
      }

      setFact((factData?.[0] as Fact) || null);
    } catch (error) {
      console.error('Home fact error:', error);

      Alert.alert('Something went wrong', 'We could not load your fact.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchHomeFact();
  }, [fetchHomeFact]);

  const handleRefresh = async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await fetchHomeFact();
    } finally {
      setRefreshing(false);
    }
  };

  const renderHomeFactCard = () => {
    if (!fact) {
      return null;
    }

    return (
      <LinearGradient
        colors={['#6C6A3A', '#4F5030', '#303127', '#171816', '#090A0A']}
        locations={[0, 0.22, 0.48, 0.72, 1]}
        start={{ x: 0.95, y: 0 }}
        end={{ x: 0.25, y: 1 }}
        style={styles.homeFactCard}
      >
        <View style={styles.homeFactCategory}>
          <View
            style={[
              styles.homeFactCategoryIcon,
              {
                backgroundColor: colors.primaryTint,
              },
            ]}
          >
            <FontText size={normalize(18)} textAlign="center">
              {fact.category?.emoji || '✨'}
            </FontText>
          </View>

          <FontText
            name="bold"
            size={normalize(12)}
            pureColor={'#F7F5EF'}
            pLeft={wp(2)}
          >
            {(fact.category?.label || 'General').toUpperCase()}
          </FontText>
        </View>

        <View style={styles.homeFactContent}>
          <FontText
            name="bold"
            size={normalize(25)}
            pureColor={'#F0EEE8'}
            lineHeightFactor={1.15}
          >
            {fact.title}
          </FontText>

          <FontText
            name="regular"
            size={normalize(15)}
            pureColor={'#F0EEE8'}
            lineHeightFactor={1.5}
            pTop={hp(2)}
          >
            {fact.content}
          </FontText>
        </View>
      </LinearGradient>
    );
  };

  const renderCategoryButton = () => {
    if (!selectedCategory) {
      return null;
    }

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('Category', {
            mode: 'edit',
          })
        }
        accessibilityRole="button"
        accessibilityLabel="Change topic preferences"
        style={[
          styles.categoryButton,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.separator,
          },
        ]}
      >
        <FontText size={normalize(23)} textAlign="center">
          {selectedCategory.emoji}
        </FontText>

        <View
          style={[
            styles.categoryEditBadge,
            {
              backgroundColor: colors.primary,
              borderColor: colors.cardBg,
            },
          ]}
        >
          <Ionicons name="pencil" size={normalize(10)} color={colors.white} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <FontText
              name="semibold"
              size={normalize(14)}
              pureColor={colors.primary}
              pBottom={hp(0.3)}
            >
              Hello,
            </FontText>

            <FontText
              name="bold"
              size={normalize(23)}
              pureColor={colors.black2}
              lines={1}
              ellipsizeMode="tail"
            >
              {username}
            </FontText>
          </View>

          {renderCategoryButton()}
        </View>

        <View style={styles.intro}>
          <FontText
            name="bold"
            size={normalize(27)}
            pureColor={colors.black2}
            lineHeightFactor={1.15}
          >
            Something worth knowing
          </FontText>

          <FontText
            name="regular"
            size={normalize(14)}
            pureColor={colors.placeholder}
            pTop={hp(0.8)}
          >
            Discover a fact from your favourite topics.
          </FontText>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : fact ? (
          renderHomeFactCard()
        ) : (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.separator,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: colors.primaryTint,
                },
              ]}
            >
              <Ionicons
                name="sparkles-outline"
                size={normalize(26)}
                color={colors.primary}
              />
            </View>

            <FontText
              name="bold"
              size={normalize(19)}
              pureColor={colors.black2}
              textAlign="center"
              pTop={hp(2)}
            >
              No fact available
            </FontText>

            <FontText
              name="regular"
              size={normalize(14)}
              pureColor={colors.placeholder}
              textAlign="center"
              lineHeightFactor={1.4}
              pTop={hp(0.8)}
            >
              We couldn't find a fact for your selected topics.
            </FontText>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },

  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  greetingContainer: {
    flex: 1,
    paddingRight: wp(4),
  },

  categoryButton: {
    width: wp(13),
    height: wp(13),
    borderRadius: wp(4),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',

    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },

  categoryEditBadge: {
    position: 'absolute',
    right: -wp(1),
    bottom: -wp(1),
    width: wp(5),
    height: wp(5),
    borderRadius: wp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },

  intro: {
    paddingTop: hp(4),
    paddingBottom: hp(2.5),
  },

  homeFactCard: {
    width: '100%',
    height: hp(58),
    borderRadius: wp(6),
    paddingHorizontal: wp(6),
    paddingVertical: hp(4),
    justifyContent: 'space-between',
    overflow: 'hidden',

    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  homeFactCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  homeFactCategoryIcon: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(3.5),
    alignItems: 'center',
    justifyContent: 'center',
  },

  homeFactContent: {
    flex: 1,
    paddingVertical: hp(4),
  },

  homeFactBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  learnMoreIcon: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingContainer: {
    width: '100%',
    height: hp(58),
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyCard: {
    width: '100%',
    minHeight: hp(35),
    borderRadius: wp(6),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(8),
    paddingVertical: hp(5),
  },

  emptyIcon: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
