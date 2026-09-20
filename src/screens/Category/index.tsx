import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {RootStackParamList} from '../../types';
import {FontText, CustomButton, Header, CategoryCard} from '../../component';

import {normalize, wp, hp} from '../../styles/responsiveScreen';

import {useAppTheme} from '../../hooks/useTheme';
import {useAuth} from '../../context/AuthContext';
import {supabase} from '../../lib/supabase';

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

const CategoryScreen: React.FC<Props> = ({navigation, route}) => {
  const colors = useAppTheme();

  const {user, completeCategorySelection} = useAuth();

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

      const {data: categoriesData, error: categoriesError} = await supabase
        .from('categories')
        .select('id, slug, label, emoji, created_at')
        .order('created_at', {ascending: true});

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

      const {data: userCategories, error: userCategoriesError} =
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
        (userCategories ?? [])
          .map(item => item.category_id)
          .filter(Boolean),
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

  const savePreferences = async () => {
    if (!user?.id || !canContinue) {
      return;
    }

    setSaving(true);

    try {
      if (isEditMode) {
        const {error: deleteError} = await supabase
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

      const {error: insertError} = await supabase
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

  const renderItem = ({item}: {item: SupabaseCategory}) => {
    return (
      <CategoryCard
        emoji={item.emoji}
        label={item.label}
        selected={selectedIds.includes(item.id)}
        onPress={() => toggleCategory(item.id)}
        style={styles.cardSpacing}
      />
    );
  };

  const isLoading = loadingCategories || loadingPreferences;

  return (
    <View
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}>
      <Header
        showBack={isEditMode}
        containerStyle={{
          backgroundColor: colors.background,
        }}
        onBackPress={handleBackPress}
      />

      <View style={styles.headerText}>
        <FontText
          name="medium"
          size={normalize(12)}
          pureColor={colors.primary}
          pBottom={hp(1)}>
          {isEditMode ? 'YOUR PREFERENCES' : 'STEP 1 OF 3 · TASTE'}
        </FontText>

        <FontText
          name="bold"
          size={normalize(26)}
          pureColor={colors.black2}
          lineHeightFactor={1.15}
          pBottom={hp(1)}>
          {screenTitle}
        </FontText>

        <FontText
          name="regular"
          size={normalize(13)}
          pureColor={colors.placeholder}>
          {screenDescription}
        </FontText>

        {!isEditMode ? (
          <FontText
            name="regular"
            size={normalize(13)}
            pureColor={colors.placeholder}
            pTop={hp(0.8)}>
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
            pureColor={colors.placeholder}
            pTop={hp(1.5)}>
            {loadingPreferences
              ? 'Loading your topics...'
              : 'Loading topics...'}
          </FontText>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <CustomButton
          title={getButtonLabel()}
          onPress={savePreferences}
          loading={saving}
          disabled={!canContinue || isLoading}
        />
      </View>
    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  headerText: {
    paddingHorizontal: wp(6),
    paddingTop: hp(1),
    paddingBottom: hp(2),
  },

  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: wp(3),
  },

  cardSpacing: {
    marginHorizontal: wp(1),
  },

  footer: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(3),
    paddingTop: hp(1),
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});