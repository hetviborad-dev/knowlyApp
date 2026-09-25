import React, { useEffect, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { RootStackParamList } from '../../types';
import { CustomButton, FontText, Header } from '../../component';

import { normalize, wp, hp } from '../../styles/responsiveScreen';

import { useAppTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Category'>;

type CategoryMode = 'onboarding' | 'edit';

interface SupabaseCategory {
  id: string;
  slug: string;
  label: string;
  emoji: string;
  created_at: string;
}

const MIN_SELECTION = 1;
const NUM_COLUMNS = 3;

const SCREEN_BACKGROUND = '#F8F7F2';
const CARD_BACKGROUND = '#F8F7F2';
const SELECTED_BACKGROUND = '#EAF2FF';
const DARK_TEXT = '#20201D';
const MUTED_TEXT = '#9B9A95';
const UNSELECTED_BORDER = '#E2E1DC';
const SELECTED_BORDER = '#FFAA0A';

const CategoryScreen: React.FC<Props> = ({ navigation, route }) => {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();

  const { user, completeCategorySelection } = useAuth();

  const mode: CategoryMode = route.params?.mode ?? 'onboarding';
  const isEditMode = mode === 'edit';

  const [categories, setCategories] = useState<SupabaseCategory[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingPreferences, setLoadingPreferences] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadScreen = async () => {
      setLoadingCategories(true);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, slug, label, emoji, created_at')
        .order('created_at', { ascending: true }).eq('is_visible', true);

      if (!mounted) {
        return;
      }

      if (categoriesError) {
        console.error('Fetch categories error:', categoriesError);

        Alert.alert(
          'Something went wrong',
          'We could not load the topics. Please try again.',
        );

        setLoadingCategories(false);
        setLoadingPreferences(false);
        return;
      }

      setCategories(categoriesData ?? []);
      setLoadingCategories(false);

      if (!isEditMode || !user?.id) {
        setLoadingPreferences(false);
        return;
      }

      setLoadingPreferences(true);

      const { data: userCategories, error: userCategoriesError } =
        await supabase
          .from('user_categories')
          .select('category_id')
          .eq('user_id', user.id);

      if (!mounted) {
        return;
      }

      if (userCategoriesError) {
        console.error(
          'Fetch user category preferences error:',
          userCategoriesError,
        );

        Alert.alert(
          'Could not load preferences',
          'We could not load your saved topics. Please try again.',
        );

        setLoadingPreferences(false);
        return;
      }

      setSelectedIds(
        (userCategories ?? []).map(item => item.category_id).filter(Boolean),
      );

      setLoadingPreferences(false);
    };

    loadScreen();

    return () => {
      mounted = false;
    };
  }, [isEditMode, user?.id]);

  const toggleCategory = (id: string) => {
    setSelectedIds(previousIds =>
      previousIds.includes(id)
        ? previousIds.filter(item => item !== id)
        : [...previousIds, id],
    );
  };

  const canContinue = selectedIds.length >= MIN_SELECTION;
  const isLoading = loadingCategories || loadingPreferences;

  const savePreferences = async () => {
    if (!user?.id || !canContinue || saving) {
      return;
    }

    setSaving(true);

    try {
      if (isEditMode) {
        const { error: deleteError } = await supabase
          .from('user_categories')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Delete old categories error:', deleteError);

          Alert.alert(
            'Could not update topics',
            'We could not remove your old topics. Please try again.',
          );

          return;
        }
      }

      const { error: insertError } = await supabase
        .from('user_categories')
        .insert(
          selectedIds.map(categoryId => ({
            user_id: user.id,
            category_id: categoryId,
          })),
        );

      if (insertError) {
        console.error('Save categories error:', insertError);

        Alert.alert(
          'Could not save topics',
          'Something went wrong while saving your topics. Please try again.',
        );

        return;
      }

      if (isEditMode) {
        navigation.goBack();
      } else {
        completeCategorySelection();
      }
    } catch (error) {
      console.error('Save preferences unexpected error:', error);

      Alert.alert('Could not save topics', 'Please try again in a moment.');
    } finally {
      setSaving(false);
    }
  };

  const handleBackPress = () => {
    if (isEditMode) {
      navigation.goBack();
    }
  };

  const screenTitle = useMemo(() => {
    return isEditMode ? 'Update your topics' : 'Choose your topics';
  }, [isEditMode]);

  const screenDescription = useMemo(() => {
    return isEditMode
      ? 'Choose the topics you want to see in your daily facts.'
      : 'Pick topics you will never stop wondering about.';
  }, [isEditMode]);

  const getButtonLabel = () => {
    if (selectedIds.length === 0) {
      return `Pick ${MIN_SELECTION} to continue`;
    }

    return isEditMode
      ? `Save ${selectedIds.length} ${
          selectedIds.length === 1 ? 'topic' : 'topics'
        }`
      : `Continue with ${selectedIds.length} ${
          selectedIds.length === 1 ? 'topic' : 'topics'
        }`;
  };

  const renderCategory = ({ item }: { item: SupabaseCategory }) => {
    const selected = selectedIds.includes(item.id);

    return (
      <CategoryTile
        category={item}
        selected={selected}
        onPress={() => toggleCategory(item.id)}
      />
    );
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.container,
        {
          backgroundColor: SCREEN_BACKGROUND,
        },
      ]}
    >
      <Header
        showBack={isEditMode}
        containerStyle={{
          backgroundColor: SCREEN_BACKGROUND,
        }}
        onBackPress={handleBackPress}
      />

      <View style={styles.header}>
        <FontText
          name="medium"
          size={normalize(13)}
          pureColor={colors.primary}
          pBottom={hp(1)}
        >
          {isEditMode ? 'YOUR PREFERENCES' : 'STEP 1 OF 3 · TASTE'}
        </FontText>

        <FontText
          name="bold"
          size={normalize(30)}
          pureColor={DARK_TEXT}
          lineHeightFactor={1.1}
          pBottom={hp(1)}
        >
          {screenTitle}
        </FontText>

        <FontText
          name="regular"
          size={normalize(15)}
          pureColor={MUTED_TEXT}
          lineHeightFactor={1.35}
        >
          {screenDescription}
        </FontText>

        {!isEditMode ? (
          <FontText
            name="regular"
            size={normalize(13)}
            pureColor={MUTED_TEXT}
            pTop={hp(0.8)}
          >
            {categories.length} topics available.
          </FontText>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />

          <FontText
            name="regular"
            size={normalize(13)}
            pureColor={MUTED_TEXT}
            pTop={hp(1.4)}
          >
            {loadingPreferences
              ? 'Loading your topics...'
              : 'Loading topics...'}
          </FontText>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          renderItem={renderCategory}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: hp(16) + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
        />
      )}

      <View
        style={[
          styles.footer,
          {
            backgroundColor: SCREEN_BACKGROUND,
            paddingBottom: Math.max(insets.bottom, hp(2)),
          },
        ]}
      >
        <CustomButton
          title={getButtonLabel()}
          onPress={savePreferences}
          loading={saving}
          disabled={!canContinue || isLoading || saving}
          style={styles.saveButton}
        />
      </View>
    </SafeAreaView>
  );
};

interface CategoryTileProps {
  category: SupabaseCategory;
  selected: boolean;
  onPress: () => void;
}

const CategoryTile: React.FC<CategoryTileProps> = ({
  category,
  selected,
  onPress,
}) => {
  console.log('category: w', category);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{
        selected,
      }}
      accessibilityLabel={`${category.label}${selected ? ', selected' : ''}`}
      style={[
        styles.tile,
        {
          backgroundColor: selected ? SELECTED_BACKGROUND : CARD_BACKGROUND,
          borderColor: selected ? SELECTED_BORDER : UNSELECTED_BORDER,
        },
      ]}
    >
      <View style={styles.emojiContainer}>
        <FontText size={normalize(35)} textAlign="left">
          {category.emoji}
        </FontText>
      </View>

      <FontText
        name={selected ? 'bold' : 'semibold'}
        size={normalize(12)}
        pureColor={selected ? SELECTED_BORDER : DARK_TEXT}
        lineHeightFactor={1.14}
        lines={2}
      >
        {category.label}
      </FontText>

      {selected ? (
        <View style={styles.selectedIndicator}>
          <IoniconsCheck />
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const IoniconsCheck = () => {
  return (
    <View style={styles.checkCircle}>
      <FontText
        name="bold"
        size={normalize(11)}
        pureColor="#FFFFFF"
        textAlign="center"
      >
        ✓
      </FontText>
    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: wp(6),
    paddingTop: hp(1.2),
    paddingBottom: hp(2.2),
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: {
    paddingHorizontal: wp(5),
    paddingTop: hp(0.3),
  },

  columnWrapper: {
    // justifyContent: 'space-between',
    gap: wp(3),
    marginBottom: wp(3.2),
  },

  tile: {
    width: wp(28.2),
    height: wp(31.5),
    borderWidth: 1.8,
    borderRadius: wp(5.2),
    paddingHorizontal: wp(3.5),
    paddingTop: wp(3.8),
    paddingBottom: wp(3),
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  emojiContainer: {
    height: wp(12),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  selectedIndicator: {
    position: 'absolute',
    top: wp(2.5),
    right: wp(2.5),
  },

  checkCircle: {
    width: wp(5.5),
    height: wp(5.5),
    borderRadius: wp(2.75),
    backgroundColor: SELECTED_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: wp(6),
    paddingTop: hp(1.3),

    shadowColor: '#6C675D',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },

  saveButton: {
    height: hp(7.2),
    borderRadius: wp(5),
  },
});
