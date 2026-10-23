import { memo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, RADII, SPACING } from '../constants/theme';
import { OFFICIAL_ARTWORK_URL, SPRITE_URL, capitalizeName, formatId } from '../utils/formatters';

function PokemonCard({ pokemon, onPress }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUri = imageFailed ? SPRITE_URL(pokemon.id) : OFFICIAL_ARTWORK_URL(pokemon.id);
  const displayName = capitalizeName(pokemon.name);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(pokemon.id)}
      android_ripple={{ color: COLORS.border }}
      accessibilityRole="button"
      accessibilityLabel={`Ver ficha de ${displayName}`}
    >
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="contain"
        onError={() => setImageFailed(true)}
      />
      <Text style={styles.number}>#{formatId(pokemon.id)}</Text>
      <Text style={styles.name} numberOfLines={1}>
        {displayName}
      </Text>
    </Pressable>
  );
}

// Concepto: memo evita re-renderizar tarjetas que no cambiaron (rendimiento en FlatList).
export default memo(PokemonCard);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.9,
  },
  image: {
    width: 104,
    height: 104,
  },
  number: {
    marginTop: SPACING.sm,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
  },
  name: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
});
