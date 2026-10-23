import { useCallback, useRef, useState } from 'react';
import { fetchAllPokemonNames, fetchPokemonDetail } from '../services/pokemonService';
import { extractIdFromUrl } from '../utils/formatters';

export function usePokemonSearch() {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);

  
  const search = useCallback(async (rawQuery) => {
    const normalized = String(rawQuery).trim().toLowerCase();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setActiveQuery(normalized);

    if (!normalized) {
      setResults(null);
      setStatus('idle');
      setError(null);
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const isNumeric = /^\d+$/.test(normalized);

      try {
        const detail = await fetchPokemonDetail(normalized);
        if (requestId !== requestIdRef.current) return;
        setResults([{ id: detail.id, name: detail.name }]);
        setStatus('success');
        return;
      } catch (lookupError) {
        if (lookupError.code !== 'NOT_FOUND') {
          throw lookupError;
        }

        if (isNumeric) {
          if (requestId !== requestIdRef.current) return;
          setResults([]);
          setStatus('empty');
          return;
        }
      }

      const allNames = await fetchAllPokemonNames();
      const matches = allNames
        .filter((pokemon) => pokemon.name.includes(normalized))
        .map((pokemon) => ({ id: extractIdFromUrl(pokemon.url), name: pokemon.name }));

      if (requestId !== requestIdRef.current) return;

      setResults(matches);
      setStatus(matches.length > 0 ? 'success' : 'empty');
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err.message || 'No se pudo realizar la búsqueda.');
      setStatus('error');
    }
  }, []);

  const clear = useCallback(() => {
    requestIdRef.current += 1;
    setQuery('');
    setActiveQuery('');
    setResults(null);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    activeQuery,
    results,
    status,
    error,
    search,
    clear,
  };
}
