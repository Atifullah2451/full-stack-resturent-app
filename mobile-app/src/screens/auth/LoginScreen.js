import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, colors, fontSizes, fonts, radii } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';

export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
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
        <View style={styles.header}>
          <Feather name="coffee" size={32} color={colors.primary} />
          <Text style={styles.brandTitle}>Savoria</Text>
          <Text style={styles.tagline}>Artisan Dining &amp; Express Delivery</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to your account</Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <CustomInput
            label="Email Address"
            placeholder="e.g. foodlover@example.com"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              setErrorMessage('');
            }}
            keyboardType="email-address"
          />

          <CustomInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              setErrorMessage('');
            }}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.forgotPassBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPassText}>Forgot Password?</Text>
          </TouchableOpacity>

          <CustomButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.signInButton}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signUpLink}>Create Account</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  brandIcon: {
    marginBottom: SPACING.sm,
  },
  brandTitle: {
    fontSize: fontSizes.display,
    fontFamily: fonts.serif,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: radii.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  welcomeTitle: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
  },
  welcomeSubtitle: {
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
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
    marginTop: -4,
  },
  forgotPassText: {
    color: COLORS.primary,
    fontSize: fontSizes.sm,
    fontFamily: fonts.semibold,
  },
  signInButton: {
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
  signUpLink: {
    color: COLORS.primary,
    fontSize: fontSizes.body,
    fontFamily: fonts.semibold,
  },
});
