import { StyleSheet, Text, View } from 'react-native';
import { MAX_STAT } from '../constants/pokemon';
import { COLORS, SPACING } from '../constants/theme';

export default function StatBar({ label, value, color }) {
  const percentage = Math.max(0, Math.min(100, (value / MAX_STAT) * 100));

  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  label: {
    width: 100,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
    marginHorizontal: SPACING.sm,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  value: {
    width: 36,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
});
