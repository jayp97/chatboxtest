/**
 * location-query-storage.ts
 * Storage utility for managing location-based queries and their coordinates
 * Extends the existing preference storage system to handle query history
 */

// Types for location queries
export interface LocationQuery {
  id: string;
  question: string;
  response: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
  threadId: string;
  userId: string;
}

interface LocationQueryStorage {
  queries: LocationQuery[];
  lastUpdated: Date;
  version: string;
}

// Storage configuration
const STORAGE_VERSION = "1.0.0";
const MAX_QUERIES_PER_USER = 1; // Only store the latest query

/**
 * Get the storage key for a user's location queries
 */
function getStorageKey(userId: string): string {
  const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  return `geosys-location-queries-${env}-${userId}`;
}

/**
 * Get all location queries for a user
 */
export function getLocationQueries(userId: string): LocationQuery[] {
  try {
    const key = getStorageKey(userId);
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return [];
    }
    
    const data: LocationQueryStorage = JSON.parse(stored);
    
    // Validate version compatibility
    if (data.version !== STORAGE_VERSION) {
      console.warn(`[LocationQuery] Version mismatch: expected ${STORAGE_VERSION}, got ${data.version}`);
      return [];
    }
    
    // Convert timestamp strings back to Date objects
    const queries = data.queries.map(query => ({
      ...query,
      timestamp: new Date(query.timestamp)
    }));
    
    return queries;
  } catch (error) {
    console.error('[LocationQuery] Error reading location queries:', error);
    return [];
  }
}

/**
 * Store a new location query (only keeps the latest one)
 */
export function storeLocationQuery(query: LocationQuery): void {
  try {
    const key = getStorageKey(query.userId);
    
    // Only store the latest query (replace any existing ones)
    const storageData: LocationQueryStorage = {
      queries: [query], // Only keep this one query
      lastUpdated: new Date(),
      version: STORAGE_VERSION
    };
    
    // Store in localStorage
    localStorage.setItem(key, JSON.stringify(storageData));
    
    console.log(`[LocationQuery] Stored latest query for location: ${query.locationName}`);
  } catch (error) {
    console.error('[LocationQuery] Error storing location query:', error);
  }
}

/**
 * Clear all location queries for a user
 */
export function clearLocationQueries(userId: string): void {
  try {
    const key = getStorageKey(userId);
    localStorage.removeItem(key);
    console.log(`[LocationQuery] Cleared all queries for user: ${userId}`);
  } catch (error) {
    console.error('[LocationQuery] Error clearing location queries:', error);
  }
}

/**
 * Export location queries as JSON string
 */
export function exportLocationQueries(userId: string): string {
  try {
    const queries = getLocationQueries(userId);
    return JSON.stringify(queries, null, 2);
  } catch (error) {
    console.error('[LocationQuery] Error exporting location queries:', error);
    return '[]';
  }
}

/**
 * Import location queries from JSON string
 */
export function importLocationQueries(userId: string, data: string): void {
  try {
    const queries: LocationQuery[] = JSON.parse(data);
    
    // Validate imported data
    if (!Array.isArray(queries)) {
      throw new Error('Invalid data format: expected array');
    }
    
    // Validate each query
    queries.forEach((query, index) => {
      if (!query.id || !query.locationName || !query.coordinates) {
        throw new Error(`Invalid query at index ${index}: missing required fields`);
      }
      
      if (typeof query.coordinates.lat !== 'number' || typeof query.coordinates.lng !== 'number') {
        throw new Error(`Invalid coordinates at index ${index}`);
      }
    });
    
    // Store imported queries (replacing existing ones)
    const storageData: LocationQueryStorage = {
      queries: queries.slice(0, MAX_QUERIES_PER_USER),
      lastUpdated: new Date(),
      version: STORAGE_VERSION
    };
    
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(storageData));
    
    console.log(`[LocationQuery] Imported ${queries.length} queries for user: ${userId}`);
  } catch (error) {
    console.error('[LocationQuery] Error importing location queries:', error);
    throw error;
  }
}

/**
 * Get the most recent location query (for globe display)
 * Since we only store one query now, this returns either the query or empty array
 */
export function getRecentLocationQueries(userId: string, limit: number = 1): LocationQuery[] {
  const allQueries = getLocationQueries(userId);
  return allQueries.slice(0, limit);
}

/**
 * Get the latest location query (returns single query or null)
 */
export function getLatestLocationQuery(userId: string): LocationQuery | null {
  const queries = getLocationQueries(userId);
  return queries.length > 0 ? queries[0] : null;
}

/**
 * Check if a location query already exists (to prevent duplicates)
 */
export function hasLocationQuery(userId: string, locationName: string, question: string): boolean {
  try {
    const queries = getLocationQueries(userId);
    return queries.some(query => 
      query.locationName.toLowerCase() === locationName.toLowerCase() &&
      query.question.toLowerCase() === question.toLowerCase()
    );
  } catch (error) {
    console.error('[LocationQuery] Error checking for duplicate query:', error);
    return false;
  }
}

/**
 * Get location queries by location name
 */
export function getLocationQueriesByName(userId: string, locationName: string): LocationQuery[] {
  try {
    const queries = getLocationQueries(userId);
    return queries.filter(query => 
      query.locationName.toLowerCase().includes(locationName.toLowerCase())
    );
  } catch (error) {
    console.error('[LocationQuery] Error getting queries by location:', error);
    return [];
  }
}

/**
 * Get storage statistics
 */
export function getLocationQueryStats(userId: string): {
  totalQueries: number;
  oldestQuery: Date | null;
  newestQuery: Date | null;
  storageSize: number;
} {
  try {
    const queries = getLocationQueries(userId);
    const key = getStorageKey(userId);
    const stored = localStorage.getItem(key);
    
    return {
      totalQueries: queries.length,
      oldestQuery: queries.length > 0 ? queries[queries.length - 1].timestamp : null,
      newestQuery: queries.length > 0 ? queries[0].timestamp : null,
      storageSize: stored ? stored.length : 0
    };
  } catch (error) {
    console.error('[LocationQuery] Error getting storage stats:', error);
    return {
      totalQueries: 0,
      oldestQuery: null,
      newestQuery: null,
      storageSize: 0
    };
  }
}