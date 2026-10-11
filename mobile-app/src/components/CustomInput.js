import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, fontSizes, fonts, radii, spacing } from '../theme/theme';

export const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  leftIcon,
  rightIcon,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          focused ? styles.inputFocused : null,
          error ? styles.inputError : null,
          multiline ? styles.multilineWrapper : null,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[styles.input, inputStyle]}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  multilineWrapper: {
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.surface,
  },
  errorText: {
    fontSize: fontSizes.xs,
    color: colors.error,
    marginTop: 4,
    fontFamily: fonts.medium,
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
  },
});
