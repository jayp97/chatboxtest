/**
 * preference-storage.ts
 * Client-side localStorage for user preferences
 * Stores preferences with coordinates for quick access
 */

interface StoredPreferences {
  favouriteCountry?: string;
  favouriteCountryCoords?: [number, number];
  favouriteContinent?: string;
  favouriteContinentCoords?: [number, number];
  favouriteDestination?: string;
  favouriteDestinationCoords?: [number, number];
}

const STORAGE_KEY_PREFIX = 'geosys-preferences';

export function storeUserPreferences(userId: string, preferences: Partial<StoredPreferences>) {
  if (typeof window === 'undefined') return;
  
  const key = `${STORAGE_KEY_PREFIX}-${userId}`;
  const existing = getUserPreferences(userId);
  const updated = { ...existing, ...preferences };
  
  localStorage.setItem(key, JSON.stringify(updated));
}

export function getUserPreferences(userId: string): StoredPreferences {
  if (typeof window === 'undefined') return {};
  
  const key = `${STORAGE_KEY_PREFIX}-${userId}`;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const prefs = JSON.parse(stored);
      return prefs;
    }
  } catch (error) {
    console.error('Error parsing stored preferences:', error);
  }
  
  return {};
}

export function clearUserPreferences(userId: string) {
  if (typeof window === 'undefined') return;
  
  const key = `${STORAGE_KEY_PREFIX}-${userId}`;
  localStorage.removeItem(key);
}