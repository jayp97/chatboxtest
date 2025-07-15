/**
 * location-detector.ts
 * Enhanced location detection tool for extracting coordinates from geography responses
 * Used to identify and track location-based queries for globe visualisation
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Define the input schema
const locationDetectionInputSchema = z.object({
  question: z.string().describe("The original user question"),
  response: z
    .string()
    .describe("The agent's response to analyse for location references"),
  locationName: z
    .string()
    .describe("The specific location name mentioned in the response"),
  latitude: z.number().describe("The latitude coordinate for the location"),
  longitude: z.number().describe("The longitude coordinate for the location"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("Confidence level in the location detection (0-1, default 0.8)"),
});

// Define the output schema
const locationDetectionOutputSchema = z.object({
  success: z.boolean(),
  hasLocation: z.boolean(),
  locationName: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  confidence: z.number().min(0).max(1),
  extractedFrom: z.string().optional(),
  shouldTrack: z.boolean(),
});

// Create the location detection tool
export const locationDetectionTool = createTool({
  id: "Location Detection",
  description: `Detect and extract location information from geography responses for globe visualisation. 
  
  Use this tool when:
  - The user asks about specific places, landmarks, or geographic features
  - Your response mentions a specific location with coordinates
  - You want to track a location for display on the globe
  
  You should provide:
  - The original user question
  - Your response text
  - The specific location name (city, landmark, country, etc.)
  - Precise latitude and longitude coordinates
  - Confidence level (how certain you are about the coordinates)
  
  Examples of trackable locations:
  - "Where is the Eiffel Tower?" → "Eiffel Tower" at [48.8584, 2.2945]
  - "What's the tallest building?" → "Burj Khalifa" at [25.1972, 55.2744]
  - "Where is Mount Everest?" → "Mount Everest" at [27.9881, 86.9250]
  - "Capital of Japan?" → "Tokyo" at [35.6762, 139.6503]`,

  inputSchema: locationDetectionInputSchema,
  outputSchema: locationDetectionOutputSchema,

  execute: async ({ context }) => {
    const {
      question,
      response,
      locationName,
      latitude,
      longitude,
      confidence = 0.8,
    } = context;

    try {
      // Basic validation
      if (!question || !response || !locationName) {
        return {
          success: false,
          hasLocation: false,
          confidence: 0,
          shouldTrack: false,
        };
      }

      // Validate coordinates
      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return {
          success: false,
          hasLocation: false,
          confidence: 0,
          shouldTrack: false,
        };
      }

      // Check coordinate bounds
      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return {
          success: false,
          hasLocation: false,
          confidence: 0,
          shouldTrack: false,
        };
      }

      // Determine if this location should be tracked
      const shouldTrack = determineTrackingEligibility(
        question,
        response,
        locationName,
        confidence
      );

      // Extract relevant portion of response for context
      const extractedFrom = extractLocationContext(response, locationName);

      return {
        success: true,
        hasLocation: true,
        locationName: locationName.trim(),
        coordinates: {
          lat: latitude,
          lng: longitude,
        },
        confidence: confidence,
        extractedFrom: extractedFrom,
        shouldTrack: shouldTrack,
      };
    } catch (error) {
      console.error("[LocationDetector] Error processing location:", error);
      return {
        success: false,
        hasLocation: false,
        confidence: 0,
        shouldTrack: false,
      };
    }
  },
});

/**
 * Determine if a location should be tracked based on various criteria
 */
function determineTrackingEligibility(
  question: string,
  response: string,
  locationName: string,
  confidence: number
): boolean {
  // Don't track if confidence is too low
  if (confidence < 0.5) {
    return false;
  }

  // Don't track very generic locations
  const genericLocations = [
    "earth",
    "world",
    "globe",
    "planet",
    "universe",
    "space",
    "sea",
    "ocean",
    "continent",
    "hemisphere",
  ];

  if (
    genericLocations.some((generic) =>
      locationName.toLowerCase().includes(generic)
    )
  ) {
    return false;
  }

  // Track if question contains location indicators
  const locationIndicators = [
    "where",
    "location",
    "situated",
    "located",
    "found",
    "capital",
    "city",
    "country",
    "building",
    "landmark",
    "tallest",
    "largest",
    "highest",
    "deepest",
    "longest",
    "mountain",
    "river",
    "lake",
    "desert",
    "forest",
    "monument",
    "tower",
    "bridge",
    "palace",
    "temple",
  ];

  const hasLocationIndicator = locationIndicators.some((indicator) =>
    question.toLowerCase().includes(indicator)
  );

  if (hasLocationIndicator) {
    return true;
  }

  // Track if response contains coordinate references
  const coordinatePattern = /\[[-+]?\d+\.?\d*,\s*[-+]?\d+\.?\d*\]/;
  if (coordinatePattern.test(response)) {
    return true;
  }

  // Track if it's a specific named location
  const specificLocationWords = [
    "tower",
    "building",
    "mountain",
    "peak",
    "river",
    "lake",
    "palace",
    "castle",
    "temple",
    "cathedral",
    "mosque",
    "stadium",
    "airport",
    "bridge",
    "tunnel",
    "dam",
  ];

  const hasSpecificLocation = specificLocationWords.some((word) =>
    locationName.toLowerCase().includes(word)
  );

  return hasSpecificLocation;
}

/**
 * Extract relevant context from the response around the location mention
 */
function extractLocationContext(
  response: string,
  locationName: string
): string {
  try {
    // Find the location mention in the response
    const locationIndex = response
      .toLowerCase()
      .indexOf(locationName.toLowerCase());

    if (locationIndex === -1) {
      return response.substring(0, 100) + "...";
    }

    // Extract context around the location mention
    const contextStart = Math.max(0, locationIndex - 50);
    const contextEnd = Math.min(
      response.length,
      locationIndex + locationName.length + 50
    );

    let context = response.substring(contextStart, contextEnd);

    // Add ellipsis if we truncated
    if (contextStart > 0) {
      context = "..." + context;
    }
    if (contextEnd < response.length) {
      context = context + "...";
    }

    return context;
  } catch (error) {
    console.error("[LocationDetector] Error extracting context:", error);
    return response.substring(0, 100) + "...";
  }
}

/**
 * Helper function to validate if a string contains location keywords
 */
export function containsLocationKeywords(text: string): boolean {
  const locationKeywords = [
    "where",
    "location",
    "situated",
    "located",
    "found",
    "position",
    "capital",
    "city",
    "country",
    "nation",
    "state",
    "province",
    "building",
    "landmark",
    "monument",
    "structure",
    "tower",
    "tallest",
    "largest",
    "highest",
    "deepest",
    "longest",
    "biggest",
    "mountain",
    "peak",
    "hill",
    "valley",
    "canyon",
    "cliff",
    "river",
    "lake",
    "sea",
    "ocean",
    "bay",
    "gulf",
    "strait",
    "desert",
    "forest",
    "jungle",
    "plains",
    "plateau",
    "island",
    "palace",
    "castle",
    "temple",
    "cathedral",
    "mosque",
    "church",
    "stadium",
    "arena",
    "airport",
    "station",
    "port",
    "harbor",
    "bridge",
    "tunnel",
    "dam",
    "canal",
    "road",
    "street",
    "coordinates",
    "latitude",
    "longitude",
    "degrees",
    "north",
    "south",
    "east",
    "west",
  ];

  const normalizedText = text.toLowerCase();
  return locationKeywords.some((keyword) => normalizedText.includes(keyword));
}

/**
 * Helper function to extract coordinates from text
 */
export function extractCoordinatesFromText(
  text: string
): { lat: number; lng: number } | null {
  try {
    // Pattern for coordinates in brackets: [lat, lng]
    const bracketPattern = /\[(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\]/g;
    const bracketMatch = bracketPattern.exec(text);

    if (bracketMatch) {
      return {
        lat: parseFloat(bracketMatch[1]),
        lng: parseFloat(bracketMatch[2]),
      };
    }

    // Pattern for coordinates in parentheses: (lat, lng)
    const parenPattern = /\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/g;
    const parenMatch = parenPattern.exec(text);

    if (parenMatch) {
      return {
        lat: parseFloat(parenMatch[1]),
        lng: parseFloat(parenMatch[2]),
      };
    }

    // Pattern for degree notation: 25.1972°N, 55.2744°E
    const degreePattern = /(-?\d+\.?\d*)°?[NS],?\s*(-?\d+\.?\d*)°?[EW]/gi;
    const degreeMatch = degreePattern.exec(text);

    if (degreeMatch) {
      let lat = parseFloat(degreeMatch[1]);
      let lng = parseFloat(degreeMatch[2]);

      // Handle N/S and E/W indicators
      if (text.includes("S") || text.includes("South")) {
        lat = -Math.abs(lat);
      }
      if (text.includes("W") || text.includes("West")) {
        lng = -Math.abs(lng);
      }

      return { lat, lng };
    }

    return null;
  } catch (error) {
    console.error("[LocationDetector] Error extracting coordinates:", error);
    return null;
  }
}
