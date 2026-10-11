import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, colors, fontSizes, fonts, radii, spacing } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    bgColor: COLORS.badgePending,
    textColor: COLORS.warning,
    icon: 'clock',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  preparing: {
    label: 'Preparing in Kitchen',
    bgColor: COLORS.badgePreparing,
    textColor: COLORS.info,
    icon: 'coffee',
  },
  ready: {
    label: 'Ready for Pickup / Serving',
    bgColor: COLORS.badgeReady,
    textColor: COLORS.success,
    icon: 'bell',
  },
  completed: {
    label: 'Completed',
    bgColor: COLORS.badgeCompleted,
    textColor: COLORS.textSecondary,
    icon: 'check-circle',
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: COLORS.badgeCancelled,
    textColor: COLORS.error,
    icon: 'x-circle',
  },
};

export const OrderHistoryScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const list = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(list);
    } catch (err) {
      console.warn('Error fetching user orders:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  if (loading) {
    return <LoadingSpinner message="Loading your order history..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="file-text"
            title="No Orders Yet"
            description="You haven't placed any orders yet. Check out our menu and place your first delicious meal!"
            buttonTitle="Browse Menu"
            onButtonPress={() => navigation.navigate('Home')}
          />
        }
        renderItem={({ item }) => {
          const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
          const formattedDate = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Recent';

          return (
            <View style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderNumber}>
                    Order #{item.id.slice(0, 8)}
                  </Text>
                  <Text style={styles.orderDate}>{formattedDate}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                  <View style={styles.statusContent}>
                    <Feather name={status.icon} size={13} color={status.textColor} />
                    <Text style={[styles.statusBadgeText, { color: status.textColor }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Items List */}
              <View style={styles.itemsList}>
                {(item.items || []).map((food, idx) => (
                  <View key={idx} style={styles.foodRow}>
                    <Text style={styles.foodQty}>{food.quantity}x</Text>
                    <Text style={styles.foodName} numberOfLines={1}>
                      {food.name}
                    </Text>
                    <Text style={styles.foodPrice}>
                      ${(food.price * food.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Order Footer */}
              <View style={styles.orderFooter}>
                <Text style={styles.deliveryInfo}>
                  {item.deliveryAddress || 'Dine-In / Counter'}
                </Text>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total: </Text>
                  <Text style={styles.totalAmount}>${Number(item.total).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />
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
  listContent: {
    padding: spacing.screen,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: radii.md,
    padding: SPACING.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: fontSizes.bodyLarge,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
  },
  orderDate: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.semibold,
  },
  itemsList: {
    marginBottom: 12,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  foodQty: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.semibold,
    color: COLORS.primary,
    width: 28,
  },
  foodName: {
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
    color: COLORS.textPrimary,
    flex: 1,
  },
  foodPrice: {
    fontSize: fontSizes.body,
    fontFamily: fonts.medium,
    color: COLORS.textPrimary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  deliveryInfo: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
  },
  totalAmount: {
    fontSize: fontSizes.bodyLarge,
    fontFamily: fonts.bold,
    color: COLORS.textPrimary,
  },
});
