/**
 * preference-updater.ts
 * Tool for updating user's geographic preferences
 * Allows the AI agent to update stored preferences
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Define the input schema
const preferenceUpdaterInputSchema = z.object({
  preferenceType: z.enum(["country", "continent", "destination"])
    .describe("The type of preference to update"),
  value: z.string()
    .describe("The new value for the preference (e.g., 'Japan', 'Asia', 'Tokyo')"),
  latitude: z.number()
    .describe("The latitude coordinate for the location"),
  longitude: z.number()
    .describe("The longitude coordinate for the location")
});

// Define the output schema
const preferenceUpdaterOutputSchema = z.object({
  success: z.boolean(),
  preferenceType: z.string(),
  newValue: z.string(),
  formattedValue: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  coordinatesFormatted: z.string().optional(),
  message: z.string()
});

// Create the preference updater tool
export const preferenceUpdaterTool = createTool({
  id: "Update Geographic Preferences",
  description: "Updates the user's favourite country, continent, or destination preference with coordinates. Use this when the user explicitly asks to update or change their geographic preferences. You must provide the accurate latitude and longitude coordinates for the location using your geographic knowledge.",
  inputSchema: preferenceUpdaterInputSchema,
  outputSchema: preferenceUpdaterOutputSchema,
  
  execute: async ({ context }) => {
    const { preferenceType, value, latitude, longitude } = context;
    
    // Import the notifyPreferenceUpdate function
    const { notifyPreferenceUpdate } = await import('@/utils/preference-updater');
    
    // Process preference update request
    
    // Clean and format the value
    let cleanedValue = value.trim();
    
    // Remove common articles and punctuation
    cleanedValue = cleanedValue.replace(/^(the|a|an)\s+/i, '');
    cleanedValue = cleanedValue.replace(/[.,!?;:]$/, '');
    
    // Convert to lowercase for storage
    const storedValue = cleanedValue.toLowerCase();
    
    // Format for display (capitalize each word)
    const formattedValue = cleanedValue.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Use provided coordinates
    const coordinates = {
      lat: latitude,
      lng: longitude
    };
    
    const coordinatesFormatted = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    
    const message = `Successfully updated ${preferenceType} preference to ${formattedValue} (coordinates: ${coordinatesFormatted})`;
    
    // Notify the UI about the preference update
    const updateData: Record<string, unknown> = {
      source: 'preference-tool',
      field: preferenceType,
      value: formattedValue,
      timestamp: new Date().toISOString()
    };
    
    // Add the specific coordinate field based on preference type
    if (preferenceType === 'country') {
      updateData.favouriteCountryCoords = [latitude, longitude];
    } else if (preferenceType === 'destination') {
      updateData.favouriteDestinationCoords = [latitude, longitude];
    } else if (preferenceType === 'continent') {
      updateData.favouriteContinentCoords = [latitude, longitude];
    }
    
    // Notify the UI about the preference update
    // Add a small delay to ensure the memory is updated first
    setTimeout(() => {
      console.log("[PREFERENCE-TOOL] Notifying preference update:", updateData);
      notifyPreferenceUpdate(updateData);
    }, 1500);
    
    const result = {
      success: true,
      preferenceType,
      newValue: storedValue,
      formattedValue,
      coordinates,
      coordinatesFormatted,
      message
    };
    
    // Preference update completed successfully
    console.log("[PREFERENCE-TOOL] Tool execution complete:", result);
    
    return result;
  }
});