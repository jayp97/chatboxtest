/**
 * location-service.ts
 * Service for fetching user preferences with coordinates from Mastra memory
 * Works with AI-powered geocoding instead of hardcoded lookups
 */

export interface LocationCoordinate {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'favourite' | 'recent' | 'current' | 'historical';
}

export interface UserPreferences {
  favouriteCountry?: string;
  favouriteContinent?: string;
  favouriteDestination?: string;
  // Coordinate data for globe pins - can be array [lat, lng] or object {lat, lng}
  favouriteCountryCoords?: { lat: number; lng: number } | [number, number];
  favouriteContinentCoords?: { lat: number; lng: number } | [number, number];
  favouriteDestinationCoords?: { lat: number; lng: number } | [number, number];
}

/**
 * Fetch user preferences from Mastra memory
 */
export async function fetchUserPreferences(): Promise<UserPreferences | null> {
  try {
    // Get userId from localStorage (matches pattern in page.tsx)
    const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
    const userKey = `geosys-user-id-${env}`;
    
    const userId = localStorage.getItem(userKey);
    
    if (!userId) {
      return null;
    }

    
    // Get preferences from localStorage
    const { getUserPreferences } = await import('./preference-storage');
    const preferences = getUserPreferences(userId);
    
    
    return preferences;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
}

/**
 * Convert user preferences to location coordinates for globe pins
 */
export function convertPreferencesToLocations(
  preferences: UserPreferences
): LocationCoordinate[] {
  
  const locations: LocationCoordinate[] = [];

  // Add favourite destination pin (highest priority - gold pin with label)
  if (preferences.favouriteDestination) {
    
    if (preferences.favouriteDestinationCoords) {
      // Handle both formats: [lat, lng] array and {lat, lng} object
      let lat: number | undefined;
      let lng: number | undefined;
      
      if (Array.isArray(preferences.favouriteDestinationCoords)) {
        // Handle array format [lat, lng]
        lat = preferences.favouriteDestinationCoords[0];
        lng = preferences.favouriteDestinationCoords[1];
      } else {
        // Handle object formats: {lat, lng} and {latitude, longitude}
        const coords = preferences.favouriteDestinationCoords as { lat?: number; lng?: number; latitude?: number; longitude?: number };
        lat = coords.lat ?? coords.latitude;
        lng = coords.lng ?? coords.longitude;
      }
      
      if (lat !== undefined && lng !== undefined) {
        const pin = {
          id: "user-favourite-destination",
          name: preferences.favouriteDestination,
          lat: lat,
          lng: lng,
          type: "favourite" as const,
        };
        
        locations.push(pin);
      } else {
      }
    } else {
    }
  } else {
  }

  // Add favourite country pin (if different from destination - green pin)
  if (preferences.favouriteCountry) {
    
    if (
      preferences.favouriteCountryCoords &&
      preferences.favouriteCountry.toLowerCase() !==
        preferences.favouriteDestination?.toLowerCase()
    ) {
      // Handle both formats: [lat, lng] array and {lat, lng} object
      let lat: number | undefined;
      let lng: number | undefined;
      
      if (Array.isArray(preferences.favouriteCountryCoords)) {
        // Handle array format [lat, lng]
        lat = preferences.favouriteCountryCoords[0];
        lng = preferences.favouriteCountryCoords[1];
      } else {
        // Handle object formats: {lat, lng} and {latitude, longitude}
        const coords = preferences.favouriteCountryCoords as { lat?: number; lng?: number; latitude?: number; longitude?: number };
        lat = coords.lat ?? coords.latitude;
        lng = coords.lng ?? coords.longitude;
      }
      
      if (lat !== undefined && lng !== undefined) {
        const pin = {
          id: "user-favourite-country",
          name: preferences.favouriteCountry,
          lat: lat,
          lng: lng,
          type: "recent" as const, // Use 'recent' type for green color
        };
        
        locations.push(pin);
      } else {
      }
    } else if (!preferences.favouriteCountryCoords) {
    } else {
    }
  } else {
  }

  return locations;
}

/**
 * Get user location pins for the globe
 */
export async function getUserLocationPins(): Promise<LocationCoordinate[]> {
  
  try {
    const preferences = await fetchUserPreferences();
    if (!preferences) {
      return [];
    }

    const locations = convertPreferencesToLocations(preferences);
    
    return locations;
  } catch (error) {
    return [];
  }
}