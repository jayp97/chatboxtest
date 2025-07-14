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
    // Get userId from localStorage (matches pattern in TerminalUI)
    const userId = localStorage.getItem("geosys-userId");
    if (!userId) {
      console.log("No user ID found in localStorage");
      return null;
    }

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
      console.error("Failed to fetch user preferences:", response.statusText);
      return null;
    }

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

    // Extract JSON from the response
    try {
      const jsonMatch = result.match(/\{[^}]*"favourite[^}]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn("Could not parse preferences JSON:", parseError);
    }

    return null;
  } catch (error) {
    console.error("Error fetching user preferences:", error);
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
  if (preferences.favouriteDestination && preferences.favouriteDestinationCoords) {
    locations.push({
      id: "user-favourite-destination",
      name: preferences.favouriteDestination,
      lat: preferences.favouriteDestinationCoords.lat,
      lng: preferences.favouriteDestinationCoords.lng,
      type: "favourite",
    });
  }

  // Add favourite country pin (if different from destination - green pin)
  if (
    preferences.favouriteCountry &&
    preferences.favouriteCountryCoords &&
    preferences.favouriteCountry.toLowerCase() !==
      preferences.favouriteDestination?.toLowerCase()
  ) {
    locations.push({
      id: "user-favourite-country",
      name: preferences.favouriteCountry,
      lat: preferences.favouriteCountryCoords.lat,
      lng: preferences.favouriteCountryCoords.lng,
      type: "recent", // Use 'recent' type for green color
    });
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
      console.log("No user preferences found");
      return [];
    }

    const locations = convertPreferencesToLocations(preferences);
    console.log("Generated location pins:", locations);
    return locations;
  } catch (error) {
    console.error("Error getting user location pins:", error);
    return [];
  }
}