/**
 * update-preferences-tool.ts
 * Mastra tool for updating user preferences and notifying the UI
 */

import { z } from "zod";
import { createTool } from "@mastra/core";
import { notifyPreferenceUpdate } from "@/utils/preference-updater";

// Schema for preference updates
const updatePreferencesSchema = z.object({
  favouriteCountry: z.string().optional(),
  favouriteContinent: z.string().optional(),
  favouriteDestination: z.string().optional(),
  favouriteCountryCoords: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  favouriteDestinationCoords: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional()
});

export const updateUserPreferencesTool = createTool({
  id: "updateUserPreferences",
  description: "Update user's geographic preferences and notify UI components",
  inputSchema: updatePreferencesSchema,
  execute: async ({ context }) => {
    // Update user preferences
    
    try {
      // Store preferences in memory (this would be done by the agent)
      // For now, we just emit the update event
      
      // Emit preference update event to notify the globe
      // Just send a simple notification - the UI will fetch the data itself
      notifyPreferenceUpdate();
      
      return {
        success: true,
        message: "Preferences updated successfully",
        preferences: context
      };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return {
        success: false,
        message: "Failed to update preferences",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
});