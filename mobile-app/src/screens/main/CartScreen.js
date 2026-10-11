import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, colors, fontSizes, fonts, spacing } from '../../theme/theme';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { CustomButton } from '../../components/CustomButton';
import { EmptyState } from '../../components/EmptyState';

export const CartScreen = ({ navigation }) => {
  const {
    items,
    totalItemCount,
    subtotal,
    tax,
    grandTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
  } = useCart();
  const { user, profile } = useAuth();

  const [deliveryAddress, setDeliveryAddress] = useState(profile?.address || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or create an account to complete your restaurant order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Profile') },
        ]
      );
      return;
    }

    setIsOrdering(true);
    try {
      const order = await placeOrder({
        deliveryAddress: deliveryAddress.trim() || 'Counter Pickup / Dine-In',
        notes: specialInstructions.trim(),
      });
      setOrderSuccess(order);
    } catch (err) {
      Alert.alert('Order Failed', err.message || 'Could not place order. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  if (orderSuccess) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <View style={styles.successCard}>
          <Feather name="check-circle" size={44} color={colors.success} />
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.orderIdText}>Order ID: #{orderSuccess.id.slice(0, 8)}</Text>
          <Text style={styles.successDesc}>
            Our chefs are already preparing your meal. Track the progress in your Order History!
          </Text>

          <View style={styles.successSummaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Paid:</Text>
              <Text style={styles.summaryVal}>${orderSuccess.total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status:</Text>
              <Text style={[styles.summaryVal, { color: colors.warning, fontFamily: fonts.bold }]}>
                Pending Preparation
              </Text>
            </View>
          </View>

          <CustomButton
            title="Track in Order History"
            onPress={() => {
              setOrderSuccess(null);
              navigation.navigate('OrderHistory');
            }}
            style={styles.trackBtn}
          />
          <CustomButton
            title="Back to Home"
            variant="outline"
            onPress={() => {
              setOrderSuccess(null);
              navigation.navigate('Home');
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="shopping-bag"
          title="Your Cart is Empty"
          description="Looks like you haven't added any appetizing dishes to your cart yet."
          buttonTitle="Explore Menu"
          onButtonPress={() => navigation.navigate('Home')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <Text style={styles.headerSub}>{totalItemCount} items selected</Text>
        </View>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearCartText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cartCard}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <View style={styles.itemTitleRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Feather name="x" size={17} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.itemCategory}>{item.category}</Text>
              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>

              {/* Quantity counter */}
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => decreaseQuantity(item.id)}
                >
                  <Feather name="minus" size={15} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => increaseQuantity(item.id)}
                >
                  <Feather name="plus" size={15} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footerContainer}>
            {/* Delivery address / Instructions */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Delivery Address or Table Number</Text>
              <TextInput
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="e.g. Table #4 or 123 Main St, Apt 4B"
                placeholderTextColor={COLORS.textMuted}
                style={styles.textInput}
              />

              <Text style={styles.inputLabel}>Cooking Instructions (Optional)</Text>
              <TextInput
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                placeholder="e.g. Extra napkins, no spicy sauce"
                placeholderTextColor={COLORS.textMuted}
                style={[styles.textInput, { height: 60 }]}
                multiline
              />
            </View>

            {/* Price breakdown */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Bill Breakdown</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Restaurant Tax (8.25%)</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>${grandTotal.toFixed(2)}</Text>
              </View>

            </View>
          </View>
        }
      />
      <View style={styles.checkoutBar}>
        <CustomButton
          title={`Place Order • $${grandTotal.toFixed(2)}`}
          onPress={handlePlaceOrder}
          loading={isOrdering}
          style={styles.checkoutBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: spacing.screen,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
  },
  clearCartText: {
    fontSize: fontSizes.sm,
    color: COLORS.error,
    fontFamily: fonts.semibold,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 120,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: fontSizes.body,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  itemCategory: {
    fontSize: fontSizes.xs,
    color: COLORS.primary,
    fontFamily: fonts.semibold,
  },
  itemPrice: {
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
    color: COLORS.textPrimary,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: fontSizes.bodyLarge,
    fontFamily: fonts.bold,
    color: COLORS.textPrimary,
  },
  qtyValue: {
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
    color: COLORS.textPrimary,
    minWidth: 18,
    textAlign: 'center',
  },
  footerContainer: {
    marginTop: 10,
  },
  inputSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.semibold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  summaryTitle: {
    fontSize: fontSizes.bodyLarge,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: fontSizes.body,
    fontFamily: fonts.semibold,
    color: COLORS.textPrimary,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 6,
    marginBottom: 16,
  },
  grandTotalLabel: {
    fontSize: fontSizes.bodyLarge,
    fontFamily: fonts.bold,
    color: COLORS.textPrimary,
  },
  grandTotalValue: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: COLORS.primary,
  },
  checkoutBtn: {
    width: '100%',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.md,
  },
  successContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  successCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  successTitle: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  orderIdText: {
    fontSize: fontSizes.sm,
    color: COLORS.primary,
    fontFamily: fonts.semibold,
    marginBottom: 12,
  },
  successDesc: {
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  successSummaryBox: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 14,
    padding: 14,
    width: '100%',
    marginBottom: 20,
  },
  summaryVal: {
    fontSize: fontSizes.body,
    fontFamily: fonts.semibold,
  },
  trackBtn: {
    width: '100%',
    marginBottom: 10,
  },
});
