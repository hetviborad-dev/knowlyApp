import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {useAppTheme} from '../../../hooks/useTheme';
import {FontText} from '../..';
import {hp, wp} from '../../../styles/responsiveScreen';

interface Category {
  id: string;
  name: string;
}

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const colors = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        {categories.map(category => {
          const isSelected = selectedCategory === category.id;

          return (
            <TouchableOpacity
              key={category.id}
              activeOpacity={0.8}
              onPress={() => onSelectCategory(category.id)}
              style={[
                styles.tab,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : colors.cardBg,
                  borderColor: isSelected
                    ? colors.primary
                    : colors.separator,
                },
              ]}>
              <FontText
                size={14}
                name={isSelected ? 'bold' : 'regular'}
                pureColor={
                  isSelected ? colors.white : colors.black
                }>
                {category.name}
              </FontText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },

  container: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
    gap: wp(2.5),
  },

  tab: {
    minHeight: hp(5),
    paddingHorizontal: wp(4),
    borderRadius: wp(5),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CategoryTabs;
