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
  // Coordinate data for globe pins
  favouriteCountryCoords?: { lat: number; lng: number };
  favouriteContinentCoords?: { lat: number; lng: number };
  favouriteDestinationCoords?: { lat: number; lng: number };
}

/**
 * Fetch user preferences from Mastra memory
 */
export async function fetchUserPreferences(): Promise<UserPreferences | null> {
  try {
    // Get userId from localStorage (matches pattern in page.tsx)
    const userId = localStorage.getItem("geosys-user-id");
    console.log("🔍 [DEBUG] Location Service - UserId:", userId);
    
    if (!userId) {
      console.log("❌ [DEBUG] No user ID found in localStorage");
      return null;
    }

    console.log("📡 [DEBUG] Fetching preferences from Mastra memory...");
    
    const response = await fetch("/api/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message:
          "Please provide my current preferences with coordinates. Format as JSON with keys: favouriteCountry, favouriteContinent, favouriteDestination, favouriteCountryCoords, favouriteContinentCoords, favouriteDestinationCoords. Include coordinates if available. If any are not set, omit them from the response.",
        userId: userId,
        threadId: "geosys-terminal-thread",
      }),
    });

    if (!response.ok) {
      console.error("❌ [DEBUG] Failed to fetch user preferences:", response.statusText);
      return null;
    }

    console.log("📥 [DEBUG] Received response, parsing stream...");

    // Parse streaming response to get the final JSON
    const reader = response.body?.getReader();
    let result = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
      }
    }

    console.log("📜 [DEBUG] Complete stream result:", result);

    // Extract JSON from the response - handle nested objects for coordinates
    try {
      // More comprehensive regex to capture nested coordinate objects
      const jsonMatch = result.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
      console.log("🔍 [DEBUG] JSON match found:", jsonMatch?.[0]);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("✅ [DEBUG] Parsed preferences:", parsed);
        return parsed;
      } else {
        console.warn("⚠️ [DEBUG] No JSON match found in response");
        
        // Try to find any JSON object in the response as fallback
        const fallbackMatch = result.match(/\{[\s\S]*\}/);
        if (fallbackMatch) {
          try {
            const parsed = JSON.parse(fallbackMatch[0]);
            console.log("✅ [DEBUG] Parsed preferences (fallback):", parsed);
            return parsed;
          } catch (e) {
            console.warn("❌ [DEBUG] Fallback JSON parse failed:", e);
          }
        }
      }
    } catch (parseError) {
      console.warn("❌ [DEBUG] Could not parse preferences JSON:", parseError);
      console.warn("📝 [DEBUG] Raw result that failed to parse:", result);
    }

    return null;
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
      // Handle both formats: {lat, lng} and {latitude, longitude}
      const coords = preferences.favouriteDestinationCoords as any;
      const lat = coords.lat ?? coords.latitude;
      const lng = coords.lng ?? coords.longitude;
      
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
        console.warn("⚠️ [DEBUG] Invalid coordinate format:", coords);
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
      // Handle both formats: {lat, lng} and {latitude, longitude}
      const coords = preferences.favouriteCountryCoords as any;
      const lat = coords.lat ?? coords.latitude;
      const lng = coords.lng ?? coords.longitude;
      
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
        console.warn("⚠️ [DEBUG] Invalid coordinate format:", coords);
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