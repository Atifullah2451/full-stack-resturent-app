import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, colors, fontSizes, fonts, spacing } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { CustomButton } from '../../components/CustomButton';
import { CustomInput } from '../../components/CustomInput';
import { getApiBaseUrl, setApiBaseUrl } from '../../config/api';

export const ProfileScreen = ({ navigation }) => {
  const { user, profile, logout, updateProfileData } = useAuth();

  // Edit Profile Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const [editAddress, setEditAddress] = useState(profile?.address || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Server IP Config Modal (for physical phone testing)
  const [ipModalVisible, setIpModalVisible] = useState(false);
  const [serverUrl, setServerUrl] = useState('');

  const openEditModal = () => {
    setEditName(profile?.name || '');
    setEditPhone(profile?.phone || '');
    setEditAddress(profile?.address || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfileData({
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      });
      setEditModalVisible(false);
      Alert.alert('Profile Updated', 'Your profile details have been saved to Firestore.');
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenIpConfig = async () => {
    const currentUrl = await getApiBaseUrl();
    setServerUrl(currentUrl);
    setIpModalVisible(true);
  };

  const handleSaveIp = async () => {
    await setApiBaseUrl(serverUrl);
    setIpModalVisible(false);
    Alert.alert('API Host Updated', `Backend API URL set to: ${serverUrl || 'Default'}`);
  };

  const handleLogout = () => {
    Alert.alert('Confirm Sign Out', 'Are you sure you want to log out of Savoria?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guestContainer}>
          <Feather name="user" size={42} color={colors.primary} />
          <Text style={styles.guestTitle}>Welcome to Savoria</Text>
          <Text style={styles.guestSubtitle}>
            Sign in to track orders, save favorite delivery addresses, and reserve dining tables.
          </Text>
          <CustomButton
            title="Sign In / Register"
            onPress={() => navigation.navigate('Login')}
            style={styles.guestBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.name || user.email || 'U')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.name || 'Customer'}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          {profile?.phone ? (
            <Text style={styles.profilePhone}>{profile.phone}</Text>
          ) : null}

          <TouchableOpacity style={styles.editProfileBtn} onPress={openEditModal}>
            <Feather name="edit-2" size={14} color={colors.text} />
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Address summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Default Delivery Address</Text>
          <Text style={styles.addressText}>
            {profile?.address ? profile.address : 'No address saved yet. Tap "Edit Profile" to add.'}
          </Text>
        </View>

        {/* Quick Menu Links */}
        <View style={styles.menuLinksCard}>
          <TouchableOpacity
            style={styles.menuLinkRow}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <View style={styles.menuLinkLeft}>
              <Feather name="package" size={18} color={colors.primary} />
              <Text style={styles.menuLinkLabel}>My Order History</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuLinkRow}
            onPress={() => navigation.navigate('Bookings')}
          >
            <View style={styles.menuLinkLeft}>
              <Feather name="calendar" size={18} color={colors.primary} />
              <Text style={styles.menuLinkLabel}>My Table Reservations</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuLinkRow}
            onPress={handleOpenIpConfig}
          >
            <View style={styles.menuLinkLeft}>
              <Feather name="settings" size={18} color={colors.primary} />
              <Text style={styles.menuLinkLabel}>Backend API Server IP</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <CustomButton
          title="Log Out"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutBtn}
          textStyle={{ color: COLORS.error }}
        />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <CustomInput
              label="Full Name"
              value={editName}
              onChangeText={setEditName}
              placeholder="e.g. Sarah Jenkins"
            />

            <CustomInput
              label="Phone Number"
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="+1 555-0199"
              keyboardType="phone-pad"
            />

            <CustomInput
              label="Delivery Address"
              value={editAddress}
              onChangeText={setEditAddress}
              placeholder="123 Ocean Blvd, Apt 4B"
              multiline
              numberOfLines={2}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <CustomButton
                title="Save Profile"
                onPress={handleSaveProfile}
                loading={savingProfile}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Backend IP Config Modal */}
      <Modal
        visible={ipModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Backend API URL</Text>
            <Text style={styles.modalSubtitle}>
              For testing with Expo Go on a physical phone, enter your computer's local Wi-Fi IP address (e.g. http://192.168.1.50:5000).
            </Text>

            <CustomInput
              label="Server Base URL"
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://192.168.1.XX:5000"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIpModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <CustomButton
                title="Save URL"
                onPress={handleSaveIp}
                style={{ flex: 1 }}
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
    backgroundColor: COLORS.background,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  scrollContent: {
    padding: spacing.screen,
    paddingBottom: 40,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  guestIcon: {
    fontSize: fontSizes.display,
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  guestBtn: {
    width: '100%',
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: fontSizes.display,
    fontFamily: fonts.bold,
    color: COLORS.primaryDark,
  },
  profileName: {
    fontSize: fontSizes.title,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
  },
  profileEmail: {
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  profilePhone: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  editProfileBtn: {
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  editProfileBtnText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.semibold,
    color: COLORS.textPrimary,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  addressText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  menuLinksCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLinkLabel: {
    fontSize: fontSizes.body,
    fontFamily: fonts.medium,
    color: COLORS.textPrimary,
  },
  logoutBtn: {
    borderColor: colors.error,
    backgroundColor: COLORS.card,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: fontSizes.title,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.medium,
    color: COLORS.textSecondary,
  },
});
