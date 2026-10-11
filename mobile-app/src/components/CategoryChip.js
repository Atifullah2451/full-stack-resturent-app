import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, fontSizes, fonts, radii, spacing } from '../theme/theme';

export const CategoryChip = ({ name, isSelected, onPress, count }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.chip,
        isSelected ? styles.chipSelected : styles.chipUnselected,
      ]}
    >
      <Text
        style={[
          styles.text,
          isSelected ? styles.textSelected : styles.textUnselected,
        ]}
      >
        {name}
        {count !== undefined && (
          <Text style={isSelected ? styles.countSelected : styles.countUnselected}>
            {` (${count})`}
          </Text>
        )}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radii.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  text: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
  },
  textSelected: {
    color: colors.white,
  },
  textUnselected: {
    color: colors.textMuted,
  },
  countSelected: {
    color: colors.white,
    fontSize: fontSizes.xs,
  },
  countUnselected: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
  },
});
