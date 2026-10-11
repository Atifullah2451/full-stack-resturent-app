import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, fontSizes, fonts, radii, spacing } from '../theme/theme';

export const CustomButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'danger'
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.disabled;
    switch (variant) {
      case 'secondary':
        return colors.subtle;
      case 'outline':
        return 'transparent';
      case 'danger':
        return colors.error;
      case 'primary':
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'secondary':
        return colors.primaryDark;
      case 'outline':
        return colors.primary;
      case 'danger':
      case 'primary':
      default:
        return colors.white;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'outline' ? colors.primary : 'transparent',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  text: {
    fontSize: fontSizes.body,
    fontFamily: fonts.semibold,
  },
});
