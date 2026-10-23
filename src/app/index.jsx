import { useCallback, useRef } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SearchBar from '../components/SearchBar';
import PokemonCard from '../components/PokemonCard';
import { EmptyState, ErrorState, FooterError, LoadingState } from '../components/States';
import { usePokemonList } from '../hooks/usePokemonList';
import { usePokemonSearch } from '../hooks/usePokemonSearch';
import { COLORS, SPACING } from '../constants/theme';

export default function IndexScreen() {
  const router = useRouter();
  const {
    items,
    status: listStatus,
    error: listError,
    isLoadingMore,
    loadMoreError,
    loadMore,
    retry: retryList,
  } = usePokemonList();

  const {
    query,
    setQuery,
    activeQuery,
    results,
    status: searchStatus,
    error: searchError,
    search: runSearch,
    clear: clearSearch,
  } = usePokemonSearch();

  const isSearchActive = searchStatus !== 'idle';
  const endReachedRef = useRef(false);

  const openDetail = useCallback(
    (id) => {
      router.push({ pathname: '/detail', params: { id: String(id) } });
    },
    [router]
  );

  
  const renderItem = useCallback(
    ({ item }) => {
      if (item.spacer) {
        return <View style={styles.spacer} />;
      }
      return <PokemonCard pokemon={item} onPress={openDetail} />;
    },
    [openDetail]
  );

  const handleQueryChange = useCallback(
    (text) => {
      setQuery(text);
      if (!text.trim() && searchStatus !== 'idle') {
        clearSearch();
      }
    },
    [clearSearch, searchStatus, setQuery]
  );

  const handleSearch = useCallback(() => {
    runSearch(query);
  }, [query, runSearch]);

  const handleEndReached = useCallback(() => {
    if (endReachedRef.current) return;
    endReachedRef.current = true;
    loadMore();
  }, [loadMore]);

  const renderGrid = (data) => {
    const gridData =
      data.length % 2 === 1 ? [...data, { id: '__spacer__', spacer: true }] : data;

    return (
    <FlatList
      data={gridData}
      renderItem={renderItem}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      columnWrapperStyle={styles.column}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onEndReached={isSearchActive ? undefined : handleEndReached}
      onEndReachedThreshold={0.6}
      onMomentumScrollBegin={() => {
        endReachedRef.current = false;
      }}
      ListEmptyComponent={
        <EmptyState title="Sin Pokémon" message="No hay Pokémon disponibles." />
      }
      ListFooterComponent={
        isSearchActive ? null : isLoadingMore ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.footerText}>Cargando más...</Text>
          </View>
        ) : loadMoreError ? (
          <FooterError
            message={loadMoreError}
            onRetry={() => {
              endReachedRef.current = false;
              loadMore();
            }}
          />
        ) : null
      }
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
    />
    );
  };

  const renderContent = () => {
    if (isSearchActive) {
      if (searchStatus === 'loading') {
        return <LoadingState message="Buscando..." />;
      }
      if (searchStatus === 'error') {
        return <ErrorState message={searchError} onRetry={() => runSearch(activeQuery)} />;
      }
      if (searchStatus === 'empty') {
        return (
          <EmptyState
            title="Sin resultados"
            message={`No se encontró ningún Pokémon para "${activeQuery}".`}
            actionLabel="Limpiar búsqueda"
            onAction={clearSearch}
          />
        );
      }
      if (searchStatus === 'success') {
        return renderGrid(results || []);
      }
    }

    if (listStatus === 'loading') {
      return <LoadingState message="Cargando Pokémon..." />;
    }
    if (listStatus === 'error') {
      return <ErrorState message={listError} onRetry={retryList} />;
    }

    return renderGrid(items);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>PokéDex Explorer</Text>
        <SearchBar
          value={query}
          onChangeText={handleQueryChange}
          onSearch={handleSearch}
          onClear={clearSearch}
        />
      </View>

      <View style={styles.body}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  body: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    flexGrow: 1,
  },
  column: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  spacer: {
    flex: 1,
  },
  footerLoading: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 13,
  },
});
