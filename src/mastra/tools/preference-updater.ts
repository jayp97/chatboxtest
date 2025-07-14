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
    .describe("The new value for the preference (e.g., 'Japan', 'Asia', 'Tokyo')")
});

// Define the output schema
const preferenceUpdaterOutputSchema = z.object({
  success: z.boolean(),
  preferenceType: z.string(),
  newValue: z.string(),
  formattedValue: z.string(),
  message: z.string()
});

// Create the preference updater tool
export const preferenceUpdaterTool = createTool({
  id: "Update Geographic Preferences",
  description: "Updates the user's favourite country, continent, or destination preference. Use this when the user explicitly asks to update or change their geographic preferences.",
  inputSchema: preferenceUpdaterInputSchema,
  outputSchema: preferenceUpdaterOutputSchema,
  
  execute: async ({ context }) => {
    const { preferenceType, value } = context;
    
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
    
    return {
      success: true,
      preferenceType,
      newValue: storedValue,
      formattedValue,
      message: `Successfully updated ${preferenceType} preference to ${formattedValue}`
    };
  }
});