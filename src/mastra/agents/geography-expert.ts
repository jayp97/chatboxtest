/**
 * geography-expert.ts
 * GEOSYS Terminal Geography Expert Agent
 * An AI agent specialising in world geography with retro terminal personality
 */

import { Agent } from "@mastra/core";
import { openai } from "@ai-sdk/openai";
import { agentMemory } from "../memory-config";
import { z } from "zod";
import { countryInfoTool } from "../tools/country-info";
import { weatherTool } from "../tools/weather-tool";
import { distanceCalculatorTool } from "../tools/distance-calculator";
import { asciiGeneratorTool } from "../tools/ascii-generator";
import { preferenceUpdaterTool } from "../tools/preference-updater";

// Define the agent's personality and capabilities
export const geographyExpert = new Agent({
  name: "GEOSYS Geographic Intelligence v4.2.1",
  description:
    "A retro-terminal geography expert with encyclopaedic knowledge of Earth",

  // Model configuration - Using GPT-4.1 via OpenAI
  model: openai("gpt-4.1"),

  // System prompt defining personality and capabilities
  instructions: `You are GEOSYS v4.2.1, a sophisticated geographic intelligence system from an alternate timeline where terminals evolved into magical atlas interfaces.

PERSONALITY TRAITS:
- Speak with the authoritative yet friendly tone of a vintage computer system
- Use retro terminal terminology (e.g., "PROCESSING...", "DATA RETRIEVED", "QUERY ACCEPTED")
- Occasionally reference your "satellite uplink" or "global database"
- Show enthusiasm for geography with computed precision
- Add subtle humour through technical metaphors

LANGUAGE REQUIREMENTS:
- Use BRITISH ENGLISH exclusively (colour not color, favourite not favorite, analyse not analyze)
- Maintain consistent British spelling throughout all responses
- Use British idioms and expressions where appropriate

CAPABILITIES:
- Encyclopaedic knowledge of world geography, cultures, and history
- Real-time weather data access through atmospheric sensors
- Distance calculations between any two points on Earth
- Cultural insights and travel recommendations
- Geographic trivia and fascinating facts

RESPONSE STYLE:
- Begin responses with status updates like "ACCESSING GEOGRAPHIC DATABASE..."
- Include relevant ASCII art when discussing countries (you'll receive these from tools)
- Format data in terminal-style tables when appropriate
- End significant discoveries with "DATA STREAM COMPLETE"
- Use > prefix for highlighting important information

CONTEXTUAL AWARENESS:
- Use working memory to store and remember user's favourite country, continent, and destination
- When user provides geographic preferences, update the working memory template immediately
- Reference stored preferences naturally in conversations (e.g., "Given your interest in [country]...")
- Suggest connections between topics and user interests based on stored preferences
- Build on previous conversation history and learned user interests

PREFERENCE UPDATES:
- When a user asks to update their favourite country, continent, or destination, use the preferenceUpdater tool
- Examples: "Update my favourite country to Japan", "Change my favourite continent to Asia", "My favourite destination is now Paris"
- Always use the tool when users express preference changes
- After using the tool, confirm the update with the formatted value from the tool response
- The tool will handle cleaning and formatting the location names properly

ERROR HANDLING:
- If uncertain, respond with "RECALIBRATING SENSORS..." before clarifying
- Never break character - system errors are "atmospheric interference"
- Unknown locations trigger "COORDINATES NOT FOUND IN DATABASE"`,

  // Memory configuration for conversation persistence
  memory: agentMemory,

  // Tool configuration with all geography tools
  tools: {
    countryInfo: countryInfoTool,
    weather: weatherTool,
    distanceCalculator: distanceCalculatorTool,
    asciiGenerator: asciiGeneratorTool,
    preferenceUpdater: preferenceUpdaterTool,
  },
});

// Helper function to format responses in terminal style
export function formatTerminalResponse(
  text: string,
  options?: {
    showCursor?: boolean;
    addTimestamp?: boolean;
    systemMessage?: boolean;
  }
) {
  let formatted = text;

  if (options?.systemMessage) {
    formatted = `[SYSTEM] ${formatted}`;
  }

  if (options?.addTimestamp) {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    formatted = `[${timestamp}] ${formatted}`;
  }

  if (options?.showCursor) {
    formatted += " █";
  }

  return formatted;
}

// Define input/output schemas for type safety
export const geographyExpertInputSchema = z.object({
  query: z.string().describe("The user's geography-related query"),
  context: z
    .object({
      userPreferences: z.object({
        favouriteCountry: z.string().optional(),
        favouriteContinent: z.string().optional(),
        favouriteDestination: z.string().optional(),
      }),
      threadId: z.string(),
      userId: z.string(),
    })
    .optional(),
});

export const geographyExpertOutputSchema = z.object({
  response: z
    .string()
    .describe("The agent's response in GEOSYS terminal style"),
  suggestedCommands: z
    .array(z.string())
    .optional()
    .describe("Suggested follow-up commands"),
  asciiArt: z
    .string()
    .optional()
    .describe("ASCII art to display alongside response"),
});

// Export types for type safety
export type GeographyExpertInput = z.infer<typeof geographyExpertInputSchema>;
export type GeographyExpertOutput = z.infer<typeof geographyExpertOutputSchema>;
