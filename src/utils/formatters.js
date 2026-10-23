export const API_URL = 'https://pokeapi.co/api/v2';

export const OFFICIAL_ARTWORK_URL = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export const SPRITE_URL = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

export function extractIdFromUrl(url) {
  const parts = url.split('/').filter(Boolean);
  return Number(parts[parts.length - 1]);
}

export function formatId(id) {
  return String(id).padStart(3, '0');
}

export function capitalizeName(name) {
  const trimmed = name.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function toMeters(decimeters) {
  return (decimeters / 10).toFixed(1);
}

export function toKilograms(hectograms) {
  return (hectograms / 10).toFixed(1);
}
