import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPokemonPage } from '../services/pokemonService';
import { extractIdFromUrl } from '../utils/formatters';

export const PAGE_SIZE = 20;

export function usePokemonList() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const offsetRef = useRef(0);
  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchPage = useCallback(async (offset) => {
    const data = await fetchPokemonPage(offset, PAGE_SIZE);
    const results = (data.results || []).map((pokemon) => ({
      id: extractIdFromUrl(pokemon.url),
      name: pokemon.name,
    }));

    offsetRef.current = offset + results.length;
    return {
      results,
      hasMore: Boolean(data.next) && results.length > 0,
    };
  }, []);

   
  const loadInitial = useCallback(async () => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setStatus('loading');
    setError(null);
    setLoadMoreError(null);

    try {
      const { results, hasMore: next } = await fetchPage(0);
      if (!mountedRef.current) return;

      offsetRef.current = results.length;
      setItems(results);
      setHasMore(next);
      setStatus('success');
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message || 'No se pudieron cargar los Pokémon.');
      setStatus('error');
    } finally {
      isFetchingRef.current = false;
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore || status !== 'success') return;

    isFetchingRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const { results, hasMore: next } = await fetchPage(offsetRef.current);
      if (!mountedRef.current) return;

      setItems((previous) => [...previous, ...results]);
      setHasMore(next);
    } catch (err) {
      if (!mountedRef.current) return;
      setLoadMoreError(err.message || 'No se pudieron cargar más Pokémon.');
    } finally {
      isFetchingRef.current = false;
      if (mountedRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [fetchPage, hasMore, status]);

  useEffect(() => {
    mountedRef.current = true;
    loadInitial();

    return () => {
      mountedRef.current = false;
    };
  }, [loadInitial]);

  return {
    items,
    status,
    error,
    hasMore,
    isLoadingMore,
    loadMoreError,
    loadMore,
    retry: loadInitial,
  };
}
