import { StyleSheet, Text, View } from 'react-native';
import { getTypeColor, getTypeLabel } from '../constants/pokemon';
import { COLORS, RADII, SPACING } from '../constants/theme';

export default function TypeBadge({ type }) {
  return (
    <View style={[styles.badge, { backgroundColor: getTypeColor(type) }]}>
      <Text style={styles.label}>{getTypeLabel(type)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADII.pill,
  },
  label: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
