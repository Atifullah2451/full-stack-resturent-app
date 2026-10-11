import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { colors, fontSizes, fonts, gradients, radii, spacing } from '../../theme/theme';
import { MenuItemCard } from '../../components/MenuItemCard';
import { CategoryChip } from '../../components/CategoryChip';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { sampleMenuItems } from '../../data/sampleMenuItems';

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Pasta', 'Sides', 'Drinks', 'Desserts'];

export const HomeScreen = ({ navigation }) => {
  const { profile } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch menu items from Firestore collection "menu"
  const fetchMenu = async () => {
    try {
      const q = query(collection(db, 'menu'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenuItems(items);
      } else {
        // Use initial gourmet catalogue if Firestore collection hasn't been seeded yet
        setMenuItems(sampleMenuItems);
      }
    } catch (err) {
      console.warn('Firestore fetch failed, using fallback items:', err.message);
      setMenuItems(sampleMenuItems);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMenu();
  }, []);

  // Filter items by category
  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory === 'All') return true;
    return (item.category || '').toLowerCase() === selectedCategory.toLowerCase();
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top greeting */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.welcomeSubtitle}>{greeting}</Text>
          <Text style={styles.welcomeName}>
            {profile?.name ? profile.name.split(' ')[0] : 'Food Explorer'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.searchIconBtn}
          onPress={() => navigation.navigate('Search')}
        >
          <Feather name="search" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Featured Banner */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1400&q=90' }}
        imageStyle={styles.promoImage}
        style={styles.promoBanner}
      >
        <LinearGradient
          colors={gradients.hero}
          style={styles.promoGradient}
        >
          <Text style={styles.promoBadgeText}>CHEF'S SELECTION</Text>
          <Text style={styles.promoTitle}>An evening well spent.</Text>
          <Text style={styles.promoDesc}>Truffle Angus Burger · made for lingering</Text>
          <TouchableOpacity
            style={styles.promoBtn}
            onPress={() => {
              const item = menuItems.find((i) => i.name.includes('Angus')) || menuItems[0];
              if (item) navigation.navigate('ItemDetail', { item });
            }}
          >
            <Text style={styles.promoBtnText}>Order now</Text>
            <Feather name="arrow-up-right" size={15} color={colors.white} />
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>

      {/* Categories Horizontal Scroll */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <Text style={styles.sectionSub}>{filteredItems.length} delicious choices</Text>
      </View>

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

      {/* Menu List Header */}
      <View style={styles.menuHeaderRow}>
        <Text style={styles.menuTitle}>
          {selectedCategory === 'All' ? 'Popular Menu' : `${selectedCategory} Selection`}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Fetching freshest menu..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            onPress={() => navigation.navigate('ItemDetail', { item })}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title="No Items in this Category"
            description="Try selecting 'All' or browse our other culinary delights."
            buttonTitle="Show All Items"
            onButtonPress={() => setSelectedCategory('All')}
          />
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
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
  listContent: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  headerContainer: {
    paddingTop: spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  welcomeSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontFamily: fonts.medium,
  },
  welcomeName: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.serif,
    color: colors.text,
  },
  searchIconBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBanner: {
    minHeight: 232,
    borderRadius: radii.lg,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    backgroundColor: colors.primaryDark,
  },
  promoImage: {
    borderRadius: radii.lg,
  },
  promoGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  promoTextCol: {
    flex: 1,
  },
  promoBadge: {
    color: colors.accent,
  },
  promoBadgeText: {
    color: colors.accent,
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    letterSpacing: 1.4,
    marginBottom: spacing.xs,
  },
  promoTitle: {
    color: colors.white,
    fontSize: fontSizes.heading,
    fontFamily: fonts.serif,
    marginBottom: spacing.xs,
  },
  promoDesc: {
    color: colors.white,
    fontSize: fontSizes.xs,
    fontFamily: fonts.regular,
    marginBottom: spacing.md,
  },
  promoBtn: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.white,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  promoBtnText: {
    color: colors.white,
    fontSize: fontSizes.xs,
    fontFamily: fonts.semibold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.title,
    fontFamily: fonts.serif,
    color: colors.text,
  },
  sectionSub: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  categoryScroll: {
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  menuHeaderRow: {
    marginBottom: spacing.md,
  },
  menuTitle: {
    fontSize: fontSizes.title,
    fontFamily: fonts.serif,
    color: colors.text,
  },
});
