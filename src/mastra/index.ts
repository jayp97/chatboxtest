/**
 * mastra/index.ts
 * Main Mastra configuration
 * Initialises Mastra instance with agents and storage
 */

import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";

// Agent will be imported once implemented
// import { geographyExpert } from "./agents/geography-expert";

// Initialise storage for persistence
const storage = new LibSQLStore({
  url: "file:./geography-bot.db",
  syncPeriod: 0, // Sync immediately
});

// Create Mastra instance with configuration
export const mastra = new Mastra({
  // Agent registry - will be populated in Step 2.2
  agents: {
    // geographyExpert,
  },
  
  // Storage configuration for data persistence
  storage,
  
  // Logger configuration (uses default console logger)
  // Can be enhanced with custom logging later
  
  // Server configuration for local development
  server: {
    port: 4111,
    host: "localhost",
    cors: {
      origin: "*",
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
  },
});

// Helper function to get agent with type safety
export async function getGeographyExpert() {
  // Will be implemented once agent is created
  // return mastra.getAgent("geographyExpert");
  throw new Error("Geography Expert agent not yet implemented");
}