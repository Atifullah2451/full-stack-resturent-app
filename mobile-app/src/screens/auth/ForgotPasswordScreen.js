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
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, colors, fontSizes, fonts, radii } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';

export const ForgotPasswordScreen = ({ navigation }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(err.message || 'Could not send password reset email.');
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
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter the email associated with your account and we'll send you a password reset link.
          </Text>

          {submitted ? (
            <View style={styles.successBox}>
              <Feather name="mail" size={38} color={colors.primary} />
              <Text style={styles.successTitle}>Check Your Inbox</Text>
              <Text style={styles.successDesc}>
                We've sent instructions to reset your password to {email}.
              </Text>
              <CustomButton
                title="Back to Sign In"
                onPress={() => navigation.navigate('Login')}
                style={styles.backBtn}
              />
            </View>
          ) : (
            <>
              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <CustomInput
                label="Email Address"
                placeholder="your.email@example.com"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setErrorMessage('');
                }}
                keyboardType="email-address"
              />

              <CustomButton
                title="Send Reset Link"
                onPress={handleReset}
                loading={loading}
                style={styles.submitBtn}
              />

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => navigation.navigate('Login')}
              >
                <Feather name="arrow-left" size={15} color={colors.textMuted} />
                <Text style={styles.backLinkText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          )}
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
    marginTop: 6,
    lineHeight: 20,
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
    marginBottom: SPACING.md,
  },
  backLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
    alignItems: 'center',
    paddingVertical: 8,
  },
  backLinkText: {
    color: COLORS.textSecondary,
    fontSize: fontSizes.body,
    fontFamily: fonts.medium,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  successTitle: {
    fontSize: fontSizes.title,
    fontFamily: fonts.serif,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  successDesc: {
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  backBtn: {
    width: '100%',
  },
});
