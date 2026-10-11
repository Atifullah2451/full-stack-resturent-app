import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSizes, fonts, spacing } from '../theme/theme';

export const LoadingSpinner = ({ message = 'Loading delicious items...' }) => {
  return (
    <View style={styles.container}>
      {message && <Text style={styles.message}>{message}</Text>}
      {[0, 1, 2].map((row) => (
        <View key={row} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonDetails}>
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLineShort} />
            <View style={styles.skeletonPrice} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.screen,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  message: {
    marginBottom: spacing.md,
    fontSize: fontSizes.body,
    color: colors.textMuted,
    fontFamily: fonts.medium,
  },
  skeletonCard: {
    flexDirection: 'row',
    width: '100%',
    minHeight: 112,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  skeletonImage: {
    width: 96,
    minHeight: 96,
    borderRadius: 8,
    backgroundColor: colors.subtle,
  },
  skeletonDetails: {
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
  },
  skeletonLine: {
    width: '78%',
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.subtle,
  },
  skeletonLineShort: {
    width: '92%',
    height: 10,
    borderRadius: 4,
    backgroundColor: colors.subtle,
  },
  skeletonPrice: {
    width: 54,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
});
