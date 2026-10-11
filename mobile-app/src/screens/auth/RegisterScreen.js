import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, colors, fontSizes, fonts, radii } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';

export const RegisterScreen = ({ navigation }) => {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    if (!name.trim()) return 'Please enter your full name.';
    if (!email.trim() || !email.includes('@')) return 'Please enter a valid email address.';
    if (!phone.trim() || phone.length < 8) return 'Please enter a valid phone number (min 8 digits).';
    if (!password || password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleRegister = async () => {
    const valError = validate();
    if (valError) {
      setErrorMessage(valError);
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      await signup(name, email, phone, password);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Savoria to order food &amp; reserve tables</Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <CustomInput
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={(val) => {
              setName(val);
              setErrorMessage('');
            }}
          />

          <CustomInput
            label="Email Address"
            placeholder="johndoe@example.com"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              setErrorMessage('');
            }}
            keyboardType="email-address"
          />

          <CustomInput
            label="Phone Number"
            placeholder="+1 555-0199"
            value={phone}
            onChangeText={(val) => {
              setPhone(val);
              setErrorMessage('');
            }}
            keyboardType="phone-pad"
          />

          <CustomInput
            label="Password"
            placeholder="Min 6 characters"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              setErrorMessage('');
            }}
            secureTextEntry
          />

          <CustomInput
            label="Confirm Password"
            placeholder="Re-type password"
            value={confirmPassword}
            onChangeText={(val) => {
              setConfirmPassword(val);
              setErrorMessage('');
            }}
            secureTextEntry
          />

          <CustomButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: radii.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.serif,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: colors.subtle,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: SPACING.lg,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
  },
  signInLink: {
    color: COLORS.primary,
    fontSize: fontSizes.body,
    fontFamily: fonts.semibold,
  },
});
