import React, {useState} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import {FontText, CustomButton, Header, CategoryCard} from '../../component';
import {normalize, wp, hp} from '../../styles/responsiveScreen';
import {useAppTheme} from '../../hooks/useTheme';
import {MOCK_CATEGORIES, Category} from '../../constant/categories';
import {SCREENS} from '../../constant/screens';

type Props = NativeStackScreenProps<RootStackParamList, 'Category'>;

const MIN_SELECTION = 1;
const NUM_COLUMNS = 3;

const CategoryScreen: React.FC<Props> = ({navigation}) => {
  const colors = useAppTheme();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  const canContinue = selectedIds.length >= MIN_SELECTION;

  const handleContinue = () => {
    if (!canContinue) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // TODO: Persist selectedIds to Supabase user profile once wired up.
      navigation.navigate(SCREENS.DASHBOARD);
    }, 800);
  };

  const renderItem = ({item}: {item: Category}) => (
    <CategoryCard
      emoji={item.emoji}
      label={item.label}
      selected={selectedIds.includes(item.id)}
      onPress={() => toggleCategory(item.id)}
      style={styles.cardSpacing}
    />
  );

  const getButtonLabel = () => {
    if (selectedIds.length === 0) return `Pick ${MIN_SELECTION} to continue`;
    return `Continue with ${selectedIds.length} ${
      selectedIds.length === 1 ? 'topic' : 'topics'
    }`;
  };

  return (
    <View style={[styles.safeArea, {backgroundColor: colors.background}]}>
      <Header
        showBack
        containerStyle={{backgroundColor: colors.background}}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.headerText}>
        <FontText name="medium" size={normalize(12)} pureColor={colors.primary} pBottom={hp(1)}>
          STEP 1 OF 3 · TASTE
        </FontText>
        <FontText
          name="bold"
          size={normalize(26)}
          color="black2"
          lineHeightFactor={1.15}
          pBottom={hp(1)}>
          Pick topics you'll never stop wondering about.
        </FontText>
        <FontText name="regular" size={normalize(13)} pureColor={colors.placeholder}>
          {MOCK_CATEGORIES.length} topics. Change these any time.
        </FontText>
      </View>

      <FlatList
        data={MOCK_CATEGORIES}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <CustomButton
          title={getButtonLabel()}
          onPress={handleContinue}
          loading={loading}
          disabled={!canContinue}
        />
      </View>
    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1},
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
});