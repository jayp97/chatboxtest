/**
 * weather-tool.ts
 * Weather Information Tool
 * Fetches current weather conditions
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Placeholder - will be implemented in Phase 2
export const weatherToolPlaceholder = createTool({
  id: "getCurrentWeather",
  description: "Get current weather conditions for any location",
  inputSchema: z.object({
    location: z.string().describe("City name or coordinates"),
  }),
  execute: async () => {
    // Implementation coming in Phase 2
    return { message: "Weather tool placeholder" };
  },
});