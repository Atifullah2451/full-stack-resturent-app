import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLORS, SPACING, colors, fontSizes, fonts, radii, spacing } from '../../theme/theme';
import { MenuItemCard } from '../../components/MenuItemCard';
import { CategoryChip } from '../../components/CategoryChip';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { CustomButton } from '../../components/CustomButton';
import { sampleMenuItems } from '../../data/sampleMenuItems';

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Pasta', 'Sides', 'Drinks', 'Desserts'];
const SORT_OPTIONS = [
  { id: 'default', label: 'Recommended' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating-desc', label: 'Highest Rated' },
];

export const SearchScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('default');
  const [minRating, setMinRating] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch all items from Firestore "menu" or sample fallback
  useEffect(() => {
    const loadItems = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'menu'));
        if (!snapshot.empty) {
          setAllItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        } else {
          setAllItems(sampleMenuItems);
        }
      } catch (err) {
        setAllItems(sampleMenuItems);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  // Filter and sort items with useMemo
  const filteredItems = useMemo(() => {
    let result = [...allItems];

    // Search query filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(
        (item) => (item.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Minimum rating filter
    if (minRating > 0) {
      result = result.filter((item) => Number(item.rating || 0) >= minRating);
    }

    // Availability filter
    if (availableOnly) {
      result = result.filter((item) => item.isAvailable !== false);
    }

    // Sorting
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'rating-desc':
        result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        break;
      default:
        break;
    }

    return result;
  }, [allItems, debouncedSearch, selectedCategory, minRating, availableOnly, sortOption]);

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (availableOnly ? 1 : 0) +
    (sortOption !== 'default' ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSortOption('default');
    setMinRating(0);
    setAvailableOnly(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar Header */}
      <View style={styles.searchHeader}>
        <View style={styles.inputWrapper}>
          <Feather name="search" size={17} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search burgers, pizzas, pastas..."
            placeholderTextColor={colors.textMuted}
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Feather name="x" size={17} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, activeFilterCount > 0 ? styles.filterButtonActive : null]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Feather name="sliders" size={18} color={colors.text} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Category Chips */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              name={cat}
              isSelected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Results Header */}
      <View style={styles.resultsInfoRow}>
        <Text style={styles.resultsCountText}>
          {loading ? 'Searching...' : `${filteredItems.length} items found`}
        </Text>
        {activeFilterCount > 0 && (
          <TouchableOpacity onPress={resetFilters}>
            <Text style={styles.resetFiltersText}>Reset Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {loading ? (
        <LoadingSpinner message="Searching delicious catalog..." />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MenuItemCard
              item={item}
              onPress={() => navigation.navigate('ItemDetail', { item })}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              title="No Dishes Found"
              description="No menu items matched your search query and filters. Try clearing your search or filters."
              buttonTitle="Clear Filters & Search"
              onButtonPress={() => {
                setSearchTerm('');
                resetFilters();
              }}
            />
          }
        />
      )}

      {/* Filter & Sort Bottom Sheet / Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter &amp; Sort Menu</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                  <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Sort By */}
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.sortGrid}>
                {SORT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.sortOptionItem,
                      sortOption === opt.id ? styles.sortOptionSelected : null,
                    ]}
                    onPress={() => setSortOption(opt.id)}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        sortOption === opt.id ? styles.sortOptionTextSelected : null,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Minimum Rating */}
              <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
              <View style={styles.ratingRow}>
                {[0, 4.0, 4.5, 4.8].map((ratingVal) => (
                  <TouchableOpacity
                    key={ratingVal}
                    style={[
                      styles.ratingButton,
                      minRating === ratingVal ? styles.ratingButtonSelected : null,
                    ]}
                    onPress={() => setMinRating(ratingVal)}
                  >
                    <Text
                      style={[
                        styles.ratingButtonText,
                        minRating === ratingVal ? styles.ratingButtonTextSelected : null,
                      ]}
                    >
                      {ratingVal === 0 ? 'Any' : `★ ${ratingVal}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* In-stock toggle */}
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setAvailableOnly(!availableOnly)}
              >
                <Text style={styles.toggleLabel}>Only In-Stock / Available Items</Text>
                <View
                  style={[
                    styles.checkbox,
                    availableOnly ? styles.checkboxChecked : null,
                  ]}
                >
                  {availableOnly && <Feather name="check" size={15} color={colors.white} />}
                </View>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={resetFilters}
              >
                <Text style={styles.modalResetText}>Reset All</Text>
              </TouchableOpacity>
              <CustomButton
                title={`Show ${filteredItems.length} Results`}
                onPress={() => setFilterModalVisible(false)}
                style={styles.applyBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  searchHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    alignItems: 'center',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.subtle,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: colors.white,
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
  },
  categoryContainer: {
    marginTop: spacing.sm,
  },
  categoryScroll: {
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.xs,
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingVertical: 10,
  },
  resultsCountText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontFamily: fonts.medium,
  },
  resetFiltersText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontFamily: fonts.semibold,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: fontSizes.title,
    fontFamily: fonts.serif,
    color: colors.text,
  },
  modalCloseText: {
    fontSize: fontSizes.bodyLarge,
    color: colors.textMuted,
    fontFamily: fonts.medium,
  },
  filterSectionTitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.semibold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sortGrid: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sortOptionItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sortOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.subtle,
  },
  sortOptionText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  sortOptionTextSelected: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  ratingButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.subtle,
  },
  ratingButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  ratingButtonTextSelected: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.md,
  },
  toggleLabel: {
    fontSize: fontSizes.body,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxCheck: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  modalResetBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  modalResetText: {
    color: colors.textMuted,
    fontSize: fontSizes.body,
    fontFamily: fonts.medium,
  },
  applyBtn: {
    flex: 1,
  },
});
