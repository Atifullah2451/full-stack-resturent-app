import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, colors, fontSizes, fonts } from '../../theme/theme';
import { useCart } from '../../context/CartContext';
import { CustomButton } from '../../components/CustomButton';

export const ItemDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const handleAddToCart = () => {
    addToCart(item, quantity);
    setAddedNotice(true);
    setTimeout(() => {
      navigation.goBack();
    }, 600);
  };

  const totalPrice = (Number(item.price) * quantity).toFixed(2);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero image with back button */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>

          {item.rating && (
            <View style={styles.ratingBadge}>
              <Feather name="star" size={14} color={colors.accent} />
              <Text style={styles.ratingText}>{Number(item.rating).toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Content Details */}
        <View style={styles.contentCard}>
          <View style={styles.categoryRow}>
            <Text style={styles.category}>{item.category}</Text>
            {item.preparationTime && (
              <View style={styles.prepTime}>
                <Feather name="clock" size={13} color={colors.textMuted} />
                <Text style={styles.prepTimeText}>{item.preparationTime}</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            {item.calories && (
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{item.calories} kcal</Text>
                <Text style={styles.metricLabel}>Energy</Text>
              </View>
            )}
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {item.isAvailable ? 'In Stock' : 'Unavailable'}
              </Text>
              <Text style={styles.metricLabel}>Kitchen Status</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>Chef Made</Text>
              <Text style={styles.metricLabel}>Artisanal</Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.description}>{item.description}</Text>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionHeader}>Select Quantity</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Feather name="minus" size={16} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Feather name="plus" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Add Button */}
      <View style={styles.bottomBar}>
        <CustomButton
          title={addedNotice ? '✓ Added to Cart!' : `Add to Cart • $${totalPrice}`}
          onPress={handleAddToCart}
          disabled={!item.isAvailable || addedNotice}
          style={addedNotice ? styles.btnAdded : styles.addBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.surfaceLight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.imageButton,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  backButtonText: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.semibold,
    color: COLORS.textPrimary,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: colors.imageButton,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  ratingText: {
    color: COLORS.white,
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
  },
  contentCard: {
    padding: SPACING.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  category: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prepTime: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  prepTimeText: { fontSize: fontSizes.xs, color: COLORS.textMuted, fontFamily: fonts.regular },
  title: {
    fontSize: fontSizes.display,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  price: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    padding: 12,
    marginBottom: SPACING.lg,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.bold,
    color: COLORS.textPrimary,
  },
  metricLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: fontSizes.bodyLarge,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 14,
    padding: 4,
    gap: 12,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  quantityText: {
    fontSize: fontSizes.bodyLarge,
    fontFamily: fonts.bold,
    color: COLORS.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.md,
  },
  addBtn: {
    width: '100%',
  },
  btnAdded: {
    width: '100%',
    backgroundColor: COLORS.success,
  },
});
