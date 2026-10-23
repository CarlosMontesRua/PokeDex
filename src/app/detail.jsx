import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TypeBadge from '../components/TypeBadge';
import StatBar from '../components/StatBar';
import { ErrorState, LoadingState } from '../components/States';
import { getStatLabel, getTypeColor } from '../constants/pokemon';
import { COLORS, RADII, SPACING } from '../constants/theme';
import { fetchPokemonDetail } from '../services/pokemonService';
import {
  OFFICIAL_ARTWORK_URL,
  SPRITE_URL,
  capitalizeName,
  formatId,
  toKilograms,
  toMeters,
} from '../utils/formatters';

function TopBar({ onBack }) {
  return (
    <View style={styles.topBar}>
      <Pressable
        onPress={onBack}
        hitSlop={12}
        style={({ pressed }) => [styles.topButton, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Volver a la lista"
      >
        <Text style={styles.topButtonText}>‹ Volver</Text>
      </Pressable>
    </View>
  );
}

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [pokemon, setPokemon] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    setImageFailed(false);

    try {
      const data = await fetchPokemonDetail(id);
      setPokemon(data);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'No se pudo cargar la ficha del Pokémon.');
      setStatus('error');
    }
  }, [id]);

  
  useEffect(() => {
    load();
  }, [load]);

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right', 'bottom']}>
        <TopBar onBack={goBack} />
        <LoadingState message="Cargando ficha..." />
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right', 'bottom']}>
        <TopBar onBack={goBack} />
        <ErrorState message={error} onRetry={load} />
      </SafeAreaView>
    );
  }

  const types = pokemon.types || [];
  const stats = pokemon.stats || [];
  const accentColor = getTypeColor(types[0]?.type?.name);
  const imageUri = imageFailed ? SPRITE_URL(pokemon.id) : OFFICIAL_ARTWORK_URL(pokemon.id);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right', 'bottom']}>
      <TopBar onBack={goBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: `${accentColor}1F` }]}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
            onError={() => setImageFailed(true)}
          />
          <Text style={styles.number}>#{formatId(pokemon.id)}</Text>
          <Text style={styles.name}>{capitalizeName(pokemon.name)}</Text>
          <View style={styles.types}>
            {types.map((item) => (
              <TypeBadge key={item.type.name} type={item.type.name} />
            ))}
          </View>
        </View>

        <View style={styles.measures}>
          <View style={styles.measureCard}>
            <Text style={styles.measureLabel}>Altura</Text>
            <Text style={styles.measureValue}>{toMeters(pokemon.height)} m</Text>
          </View>
          <View style={styles.measureCard}>
            <Text style={styles.measureLabel}>Peso</Text>
            <Text style={styles.measureValue}>{toKilograms(pokemon.weight)} kg</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Estadísticas base</Text>
        <View style={styles.statsCard}>
          {stats.map((item) => (
            <StatBar
              key={item.stat.name}
              label={getStatLabel(item.stat.name)}
              value={item.base_stat}
              color={accentColor}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Volver a la lista"
        >
          <Text style={styles.backButtonText}>Volver a la lista</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  topButton: {
    alignSelf: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  topButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  hero: {
    alignItems: 'center',
    borderRadius: RADII.lg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  image: {
    width: 180,
    height: 180,
  },
  number: {
    marginTop: SPACING.sm,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.muted,
  },
  name: {
    marginTop: 2,
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text,
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  measures: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  measureCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.lg,
  },
  measureLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  measureValue: {
    marginTop: SPACING.xs,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionTitle: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  backButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '800',
  },
});
