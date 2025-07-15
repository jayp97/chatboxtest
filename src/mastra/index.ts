/**
 * mastra/index.ts
 * Main Mastra configuration
 * Initialises Mastra instance with agents and storage
 */

import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { PostgresStore } from "@mastra/pg";

// Import the geography expert agent
import { geographyExpert } from "./agents/geography-expert";

// Initialise storage based on environment
const storage = process.env.POSTGRES_URL
  ? new PostgresStore({
      connectionString: process.env.POSTGRES_URL,
    })
  : new LibSQLStore({
      url: "file:./geography-bot.db",
    });

// Create Mastra instance with configuration
export const mastra = new Mastra({
  // Agent registry with geography expert
  agents: {
    geographyExpert,
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
  return mastra.getAgent("geographyExpert");
}
