import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, colors, fontSizes, fonts, radii, spacing } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { CustomButton } from '../../components/CustomButton';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
  '08:00 PM', '08:30 PM', '09:00 PM'
];

export const BookingsScreen = ({ navigation }) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('book'); // 'book' | 'history'

  // Booking Form State
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
  const [guestCount, setGuestCount] = useState(2);
  const [specialNote, setSpecialNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedSlotsForDate, setBookedSlotsForDate] = useState([]);

  // My Bookings State
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Generate next 7 days for quick date selector
  const availableDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  // Check occupied slots for selected date to prevent double booking
  const checkDateOccupancy = async (date) => {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('date', '==', date),
        where('status', 'in', ['confirmed', 'pending'])
      );
      const snapshot = await getDocs(q);
      const counts = {};
      snapshot.docs.forEach((docSnap) => {
        const time = docSnap.data().time;
        counts[time] = (counts[time] || 0) + 1;
      });
      // A slot is full if 6 tables are booked
      const fullyBooked = Object.keys(counts).filter((t) => counts[t] >= 6);
      setBookedSlotsForDate(fullyBooked);
    } catch (e) {
      console.warn('Occupancy check error:', e.message);
    }
  };

  useEffect(() => {
    checkDateOccupancy(selectedDate);
  }, [selectedDate]);

  // Fetch current user bookings
  const fetchMyBookings = async () => {
    if (!user) return;
    setLoadingBookings(true);
    try {
      const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const list = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setMyBookings(list);
    } catch (e) {
      console.warn('Failed to load user bookings:', e.message);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchMyBookings();
    }
  }, [activeTab, user]);

  // Handle table reservation submission
  const handleReserveTable = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to reserve a table.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('Profile') },
      ]);
      return;
    }

    if (bookedSlotsForDate.includes(selectedTime)) {
      Alert.alert('Slot Unavailable', 'This time slot is fully booked. Please choose another time.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Double booking clash check: verify if user already has an active reservation for this slot
      const existingQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid),
        where('date', '==', selectedDate),
        where('time', '==', selectedTime),
        where('status', '==', 'confirmed')
      );
      const existingSnap = await getDocs(existingQuery);
      if (!existingSnap.empty) {
        Alert.alert('Already Reserved', 'You already have an active table reserved for this time!');
        setIsSubmitting(false);
        return;
      }

      const assignedTable = Math.floor(Math.random() * 15) + 1;

      const bookingPayload = {
        userId: user.uid,
        userEmail: user.email || '',
        guestName: profile?.name || 'Valued Guest',
        phone: profile?.phone || '',
        date: selectedDate,
        time: selectedTime,
        guests: guestCount,
        tableNumber: assignedTable,
        note: specialNote.trim(),
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'bookings'), bookingPayload);

      Alert.alert(
        'Table Reserved!',
        `Table #${assignedTable} is booked for ${guestCount} guests on ${selectedDate} at ${selectedTime}.`,
        [
          {
            text: 'View My Bookings',
            onPress: () => {
              setActiveTab('history');
              fetchMyBookings();
            },
          },
        ]
      );

      // Reset form
      setSpecialNote('');
      checkDateOccupancy(selectedDate);
    } catch (err) {
      Alert.alert('Reservation Failed', err.message || 'Could not complete reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel reservation
  const handleCancelBooking = async (bookingId) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this table reservation?',
      [
        { text: 'Keep Reservation', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'bookings', bookingId), {
                status: 'cancelled',
                updatedAt: new Date().toISOString(),
              });
              setMyBookings((prev) =>
                prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
              );
              Alert.alert('Cancelled', 'Your table reservation has been cancelled.');
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not cancel booking.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'book' ? styles.tabItemActive : null]}
          onPress={() => setActiveTab('book')}
        >
          <Text
            style={[styles.tabItemText, activeTab === 'book' ? styles.tabItemTextActive : null]}
          >
            Reserve Table
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'history' ? styles.tabItemActive : null]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[
              styles.tabItemText,
              activeTab === 'history' ? styles.tabItemTextActive : null,
            ]}
          >
            My Reservations
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'book' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroBadge}>FINE DINING EXPERIENCE</Text>
            <Text style={styles.heroTitle}>Reserve Your Table</Text>
            <Text style={styles.heroSubtitle}>
              Experience artisanal Italian &amp; American cuisine in a warm, welcoming ambience.
            </Text>
          </View>

          {/* Date Picker */}
          <Text style={styles.sectionTitle}>1. Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScroll}
          >
            {availableDates.map((item) => {
              const isSelected = selectedDate === item.iso;
              return (
                <TouchableOpacity
                  key={item.iso}
                  style={[styles.dateCard, isSelected ? styles.dateCardSelected : null]}
                  onPress={() => setSelectedDate(item.iso)}
                >
                  <Text style={[styles.dateDayName, isSelected ? styles.dateTextSelected : null]}>
                    {item.dayName}
                  </Text>
                  <Text style={[styles.dateNumber, isSelected ? styles.dateTextSelected : null]}>
                    {item.dayNumber}
                  </Text>
                  <Text style={[styles.dateMonth, isSelected ? styles.dateTextSelected : null]}>
                    {item.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Time Slots */}
          <Text style={styles.sectionTitle}>2. Select Time Slot</Text>
          <View style={styles.timeSlotsGrid}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot;
              const isFull = bookedSlotsForDate.includes(slot);
              return (
                <TouchableOpacity
                  key={slot}
                  disabled={isFull}
                  style={[
                    styles.timeSlotBtn,
                    isSelected ? styles.timeSlotBtnSelected : null,
                    isFull ? styles.timeSlotBtnDisabled : null,
                  ]}
                  onPress={() => setSelectedTime(slot)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      isSelected ? styles.timeSlotTextSelected : null,
                      isFull ? styles.timeSlotTextDisabled : null,
                    ]}
                  >
                    {slot}
                  </Text>
                  {isFull && <Text style={styles.fullBadge}>FULL</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Guests Count */}
          <Text style={styles.sectionTitle}>3. Number of Guests</Text>
          <View style={styles.guestsSelector}>
            {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.guestChip,
                  guestCount === num ? styles.guestChipSelected : null,
                ]}
                onPress={() => setGuestCount(num)}
              >
                <Text
                  style={[
                    styles.guestChipText,
                    guestCount === num ? styles.guestChipTextSelected : null,
                  ]}
                >
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Special Requests */}
          <Text style={styles.sectionTitle}>4. Special Requests (Optional)</Text>
          <TextInput
            placeholder="e.g. Window booth, anniversary celebration, high chair needed"
            placeholderTextColor={COLORS.textMuted}
            value={specialNote}
            onChangeText={setSpecialNote}
            style={styles.noteInput}
            multiline
            numberOfLines={3}
          />

          <CustomButton
            title={`Confirm Table for ${guestCount} Guests`}
            onPress={handleReserveTable}
            loading={isSubmitting}
            style={styles.reserveBtn}
          />
        </ScrollView>
      ) : (
        /* My Reservations Tab */
        <View style={styles.historyContainer}>
          {loadingBookings ? (
            <LoadingSpinner message="Loading your bookings..." />
          ) : (
            <FlatList
              data={myBookings}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.bookingsList}
              ListEmptyComponent={
                <EmptyState
                  icon="calendar"
                  title="No Reservations Yet"
                  description="You don't have any table reservations booked. Plan your next fine dining night!"
                  buttonTitle="Book a Table Now"
                  onButtonPress={() => setActiveTab('book')}
                />
              }
              renderItem={({ item }) => (
                <View style={styles.bookingCard}>
                  <View style={styles.bookingCardHeader}>
                    <View>
                      <Text style={styles.bookingDateText}>
                        {item.date} • {item.time}
                      </Text>
                      <Text style={styles.bookingTableText}>
                        Table #{item.tableNumber || 4} • {item.guests} Guests
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        item.status === 'confirmed'
                          ? styles.statusConfirmed
                          : styles.statusCancelled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          item.status === 'confirmed'
                            ? styles.statusConfirmedText
                            : styles.statusCancelledText,
                        ]}
                      >
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {item.note ? (
                    <Text style={styles.bookingNote}>Note: "{item.note}"</Text>
                  ) : null}

                  {item.status === 'confirmed' && (
                    <TouchableOpacity
                      style={styles.cancelBookingBtn}
                      onPress={() => handleCancelBooking(item.id)}
                    >
                      <Text style={styles.cancelBookingText}>Cancel Reservation</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          )}
        </View>
      )}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
  },
  tabItemText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.semibold,
    color: COLORS.textSecondary,
  },
  tabItemTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    padding: spacing.screen,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: colors.subtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  heroBadge: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 6,
  },
  dateScroll: {
    gap: 10,
    marginBottom: SPACING.md,
  },
  dateCard: {
    width: 64,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  dateCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateDayName: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.medium,
    color: COLORS.textSecondary,
  },
  dateNumber: {
    fontSize: fontSizes.bodyLarge,
    fontFamily: fonts.semibold,
    color: COLORS.textPrimary,
    marginVertical: 2,
  },
  dateMonth: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.regular,
    color: COLORS.textMuted,
  },
  dateTextSelected: {
    color: COLORS.white,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.md,
  },
  timeSlotBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    minWidth: '30%',
    position: 'relative',
  },
  timeSlotBtnSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeSlotBtnDisabled: {
    backgroundColor: colors.subtle,
    borderColor: colors.border,
  },
  timeSlotText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    color: COLORS.textPrimary,
  },
  timeSlotTextSelected: {
    color: COLORS.white,
    fontFamily: fonts.bold,
  },
  timeSlotTextDisabled: {
    color: colors.textMuted,
  },
  fullBadge: {
    fontSize: fontSizes.xs,
    color: COLORS.error,
    fontFamily: fonts.bold,
    marginTop: 2,
  },
  guestsSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.md,
  },
  guestChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  guestChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  guestChipText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    color: COLORS.textSecondary,
  },
  guestChipTextSelected: {
    color: COLORS.white,
    fontFamily: fonts.semibold,
  },
  noteInput: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 12,
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
    color: COLORS.textPrimary,
    minHeight: 70,
    marginBottom: SPACING.lg,
  },
  reserveBtn: {
    width: '100%',
  },
  historyContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  bookingsList: {
    paddingBottom: 40,
  },
  bookingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookingDateText: {
    fontSize: fontSizes.bodyLarge,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  bookingTableText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusConfirmed: {
    backgroundColor: COLORS.badgeReady,
  },
  statusCancelled: {
    backgroundColor: COLORS.badgeCancelled,
  },
  statusPillText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
  },
  statusConfirmedText: {
    color: colors.success,
  },
  statusCancelledText: {
    color: colors.error,
  },
  bookingNote: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.regular,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  cancelBookingBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.badgeCancelled,
    marginTop: 6,
  },
  cancelBookingText: {
    color: COLORS.error,
    fontSize: fontSizes.xs,
    fontFamily: fonts.semibold,
  },
});
