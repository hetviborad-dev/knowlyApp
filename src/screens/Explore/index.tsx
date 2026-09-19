import React, {useMemo, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

import {hp, wp} from '../../styles/responsiveScreen';
import {CategoryTabs, FontText} from '../../component';
import { useAppTheme } from '../../hooks/useTheme';

interface Category {
  id: string;
  name: string;
}

interface Fact {
  id: string;
  categoryId: string;
  category: string;
  title: string;
  content: string;
}

const categories: Category[] = [
  {id: 'mix', name: 'Mix'},
  {id: 'psychology', name: 'Psychology'},
  {id: 'science', name: 'Science'},
  {id: 'money', name: 'Money'},
  {id: 'technology', name: 'Technology'},
  {id: 'history', name: 'History'},
  {id: 'life-skills', name: 'Life Skills'},
  {id: 'communication', name: 'Communication'},
  {id: 'food', name: 'Food'},
  {id: 'vehicles', name: 'Vehicles'},
  {id: 'space', name: 'Space'},
];

const dummyFacts: Fact[] = [
  {
    id: '1',
    categoryId: 'science',
    category: 'Science',
    title: 'Your brain is constantly changing',
    content:
      'The human brain can reorganize its connections throughout life. This ability is known as neuroplasticity.',
  },
  {
    id: '2',
    categoryId: 'psychology',
    category: 'Psychology',
    title: 'Your expectations can affect perception',
    content:
      'What you expect to see can influence how your brain interprets incoming information.',
  },
  {
    id: '3',
    categoryId: 'space',
    category: 'Space',
    title: 'A day on Venus is extremely long',
    content:
      'Venus rotates so slowly that one rotation takes longer than its trip around the Sun.',
  },
  {
    id: '4',
    categoryId: 'history',
    category: 'History',
    title: 'Libraries have existed for thousands of years',
    content:
      'Ancient civilizations created organized collections of written records long before modern libraries existed.',
  },
  {
    id: '5',
    categoryId: 'technology',
    category: 'Technology',
    title: 'The first computers were enormous',
    content:
      'Some early electronic computers occupied entire rooms and required large amounts of electricity.',
  },
  {
    id: '6',
    categoryId: 'money',
    category: 'Money',
    title: 'Compound interest grows on previous interest',
    content:
      'With compound interest, returns can themselves generate additional returns over time.',
  },
];

const ExploreScreen: React.FC = () => {
  const colors = useAppTheme();

  const [selectedCategory, setSelectedCategory] = useState('mix');

  const filteredFacts = useMemo(() => {
    if (selectedCategory === 'mix') {
      return dummyFacts;
    }

    return dummyFacts.filter(
      fact => fact.categoryId === selectedCategory,
    );
  }, [selectedCategory]);

  const renderFact = ({item}: {item: Fact}) => {
    return (
      <View
        style={[
          styles.factCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.separator,
          },
        ]}>
        <FontText
          size={12}
          name="bold"
          pureColor={colors.primary}>
          {item.category.toUpperCase()}
        </FontText>

        <FontText
          size={18}
          name="bold"
          pureColor={colors.black}
          style={styles.factTitle}>
          {item.title}
        </FontText>

        <FontText
          size={14}
          name="semibold"
          pureColor={colors.placeholder}
          style={styles.factContent}>
          {item.content}
        </FontText>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}>
      <View style={styles.header}>
        <FontText
          size={28}
          name="bold"
          pureColor={colors.black}>
          Explore
        </FontText>

        <FontText
          size={14}
          name="semibold"
          pureColor={colors.placeholder}
          style={styles.subtitle}>
          Discover something worth knowing.
        </FontText>
      </View>

      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <FlatList
        data={filteredFacts}
        keyExtractor={item => item.id}
        renderItem={renderFact}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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

  listContent: {
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
    paddingBottom: hp(12),
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
});

export default ExploreScreen;