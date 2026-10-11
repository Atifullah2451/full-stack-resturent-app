import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, fonts, radii, shadows, spacing } from '../theme/theme';
import { useCart } from '../context/CartContext';

export const MenuItemCard = ({ item, onPress }) => {
  const { addToCart, items } = useCart();
  
  // Check if item is already in cart to display count
  const cartItem = items.find((i) => i.id === item.id);
  const inCartCount = cartItem ? cartItem.quantity : 0;

  const handleAddPress = (e) => {
    e.stopPropagation?.();
    addToCart(item, 1);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {!item.isAvailable && (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutText}>Sold Out</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryText}>{item.category}</Text>
          {item.preparationTime && (
            <View style={styles.prepTime}>
              <Feather name="clock" size={11} color={colors.textMuted} />
              <Text style={styles.prepTimeText}>{item.preparationTime}</Text>
            </View>
          )}
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
          {item.rating ? (
            <View style={styles.rating}>
              <Feather name="star" size={12} color={colors.accent} />
              <Text style={styles.ratingText}>{Number(item.rating).toFixed(1)}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddPress}
            disabled={!item.isAvailable}
            style={[
              styles.addButton,
              !item.isAvailable ? styles.addButtonDisabled : null,
              inCartCount > 0 ? styles.addButtonActive : null,
            ]}
          >
            {inCartCount > 0 ? (
              <View style={styles.inCartRow}>
                <Feather name="check" size={13} color={colors.white} />
                <Text style={styles.inCartText}>{inCartCount} in Cart</Text>
              </View>
            ) : (
              <Feather name="plus" size={18} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    flexDirection: 'row',
    minHeight: 132,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  imageContainer: {
    width: 120,
    minHeight: 132,
    backgroundColor: colors.subtle,
    position: 'relative',
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    marginLeft: spacing.xs,
  },
  ratingText: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontFamily: fonts.medium,
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: fontSizes.body,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoContainer: {
    padding: spacing.md,
    flex: 1,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.semibold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  prepTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prepTimeText: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontFamily: fonts.regular,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: fontSizes.bodyLarge,
    fontFamily: fonts.serif,
    color: colors.text,
    flex: 1,
    lineHeight: 21,
  },
  description: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  price: {
    fontSize: fontSizes.bodyLarge,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonActive: {
    backgroundColor: colors.primaryDark,
  },
  addButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  inCartRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inCartText: {
    color: colors.white,
    fontSize: fontSizes.xs,
    fontFamily: fonts.semibold,
  },
});
