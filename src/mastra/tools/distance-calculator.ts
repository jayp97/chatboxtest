/**
 * distance-calculator.ts
 * Distance Calculator Tool
 * Calculates distances between locations
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Placeholder - will be implemented in Phase 2
export const distanceCalculatorPlaceholder = createTool({
  id: "calculateDistance",
  description: "Calculate distance between two locations",
  inputSchema: z.object({
    from: z.string().describe("Starting location"),
    to: z.string().describe("Destination location"),
  }),
  execute: async () => {
    // Implementation coming in Phase 2
    return { message: "Distance calculator placeholder" };
  },
});