import { API_URL } from '../utils/formatters';


export async function fetchPokemonPage(offset = 0, limit = 20) {
  const response = await fetch(`${API_URL}/pokemon?limit=${limit}&offset=${offset}`);

  if (!response.ok) {
    throw new Error('No se pudo cargar la lista de Pokémon.');
  }

  return response.json();
}

export async function fetchPokemonDetail(idOrName) {
  const query = String(idOrName).trim().toLowerCase();
  const response = await fetch(`${API_URL}/pokemon/${encodeURIComponent(query)}`);

  
  if (response.status === 404) {
    const error = new Error('No se encontró ningún Pokémon con ese nombre o número.');
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (!response.ok) {
    throw new Error('No se pudo cargar la ficha del Pokémon.');
  }

  return response.json();
}

let cachedNames = null;

export async function fetchAllPokemonNames() {
  if (cachedNames) {
    return cachedNames;
  }

  const response = await fetch(`${API_URL}/pokemon?limit=10000`);

  if (!response.ok) {
    throw new Error('No se pudo buscar Pokémon. Intenta de nuevo.');
  }

  const data = await response.json();
  cachedNames = data.results;
  return cachedNames;
}
