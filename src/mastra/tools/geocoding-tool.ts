/**
 * geocoding-tool.ts
 * AI-powered geocoding tool for converting location names to coordinates
 * Uses OpenAI's geographic knowledge instead of hardcoded lookups
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Define the input schema  
const geocodingInputSchema = z.object({
  locationName: z.string()
    .describe("The name of the location to geocode (e.g., 'Tokyo', 'France', 'Europe')"),
  latitude: z.number()
    .describe("The latitude coordinate for the location"),
  longitude: z.number()
    .describe("The longitude coordinate for the location")
});

// Define the output schema
const geocodingOutputSchema = z.object({
  success: z.boolean(),
  locationName: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  formattedCoordinates: z.string()
});

// Create the geocoding tool
export const geocodingTool = createTool({
  id: "Geocode Location",
  description: "Provide the latitude and longitude coordinates for a location. You should use your geographic knowledge to determine the accurate coordinates for any city, country, continent, or landmark. For countries, use the capital city coordinates. For continents, use the geographic center.",
  inputSchema: geocodingInputSchema,
  outputSchema: geocodingOutputSchema,
  
  execute: async ({ context }) => {
    const { locationName, latitude, longitude } = context;
    
    // Format coordinates to 4 decimal places
    const formattedCoordinates = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    
    return {
      success: true,
      locationName: locationName.trim(),
      coordinates: {
        lat: latitude,
        lng: longitude
      },
      formattedCoordinates
    };
  }
});