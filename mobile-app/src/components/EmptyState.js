import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, fonts, spacing } from '../theme/theme';
import { CustomButton } from './CustomButton';

export const EmptyState = ({
  icon = 'coffee',
  title = 'No items found',
  description = 'Try searching with a different keyword or resetting your filters.',
  buttonTitle,
  onButtonPress,
}) => {
  return (
    <View style={styles.container}>
      <Feather name={icon} size={36} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {buttonTitle && onButtonPress && (
        <CustomButton
          title={buttonTitle}
          onPress={onButtonPress}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 280,
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.title,
    fontFamily: fonts.serif,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSizes.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  button: {
    paddingHorizontal: 28,
  },
});
