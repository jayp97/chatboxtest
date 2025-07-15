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
    console.log("🔍 [DEBUG] Location Service - UserId:", userId);
    
    if (!userId) {
      console.log("❌ [DEBUG] No user ID found in localStorage");
      return null;
    }

    console.log("📡 [DEBUG] Fetching preferences from localStorage...");
    
    // Get preferences from localStorage
    const { getUserPreferences } = await import('./preference-storage');
    const preferences = getUserPreferences(userId);
    
    console.log("✅ [DEBUG] Retrieved preferences from localStorage:", preferences);
    console.log("📍 [DEBUG] Destination coords:", preferences.favouriteDestinationCoords);
    console.log("🌍 [DEBUG] Country coords:", preferences.favouriteCountryCoords);
    
    return preferences;
  } catch (error) {
    console.error("💥 [DEBUG] Error fetching user preferences:", error);
    return null;
  }
}

/**
 * Convert user preferences to location coordinates for globe pins
 */
export function convertPreferencesToLocations(
  preferences: UserPreferences
): LocationCoordinate[] {
  console.log("🔄 [DEBUG] Converting preferences to locations:", preferences);
  
  const locations: LocationCoordinate[] = [];

  // Add favourite destination pin (highest priority - gold pin with label)
  if (preferences.favouriteDestination) {
    console.log("📍 [DEBUG] Processing favourite destination:", preferences.favouriteDestination);
    console.log("🗺️ [DEBUG] Destination coordinates:", preferences.favouriteDestinationCoords);
    
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
        
        console.log("✅ [DEBUG] Adding destination pin:", pin);
        console.log(`📍 DESTINATION COORDS: ${preferences.favouriteDestination} at lat:${lat}, lng:${lng}`);
        locations.push(pin);
      } else {
        console.warn("⚠️ [DEBUG] Invalid coordinate format:", preferences.favouriteDestinationCoords);
      }
    } else {
      console.warn("⚠️ [DEBUG] Favourite destination has no coordinates!");
    }
  } else {
    console.log("❌ [DEBUG] No favourite destination found");
  }

  // Add favourite country pin (if different from destination - green pin)
  if (preferences.favouriteCountry) {
    console.log("🏴 [DEBUG] Processing favourite country:", preferences.favouriteCountry);
    console.log("🗺️ [DEBUG] Country coordinates:", preferences.favouriteCountryCoords);
    
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
        
        console.log("✅ [DEBUG] Adding country pin:", pin);
        console.log(`🌍 COUNTRY COORDS: ${preferences.favouriteCountry} at lat:${lat}, lng:${lng}`);
        locations.push(pin);
      } else {
        console.warn("⚠️ [DEBUG] Invalid coordinate format:", preferences.favouriteCountryCoords);
      }
    } else if (!preferences.favouriteCountryCoords) {
      console.warn("⚠️ [DEBUG] Favourite country has no coordinates!");
    } else {
      console.log("⏭️ [DEBUG] Skipping country pin (same as destination)");
    }
  } else {
    console.log("❌ [DEBUG] No favourite country found");
  }

  console.log("🎯 [DEBUG] Final locations array:", locations);
  return locations;
}

/**
 * Get user location pins for the globe
 */
export async function getUserLocationPins(): Promise<LocationCoordinate[]> {
  console.log("🚀 [DEBUG] Starting getUserLocationPins...");
  
  try {
    const preferences = await fetchUserPreferences();
    if (!preferences) {
      console.log("❌ [DEBUG] No user preferences found");
      return [];
    }

    console.log("✅ [DEBUG] Preferences retrieved successfully");
    const locations = convertPreferencesToLocations(preferences);
    console.log("🎯 [DEBUG] Generated location pins:", locations);
    console.log(`📊 [DEBUG] Total pins generated: ${locations.length}`);
    
    return locations;
  } catch (error) {
    console.error("💥 [DEBUG] Error getting user location pins:", error);
    return [];
  }
}