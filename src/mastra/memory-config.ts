/**
 * memory-config.ts
 * Memory system configuration
 * Provides persistent conversation memory for agents
 */

import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { PostgresStore } from "@mastra/pg";

// Create storage based on environment
const memoryStore = process.env.POSTGRES_URL
  ? new PostgresStore({
      connectionString: process.env.POSTGRES_URL,
    })
  : new LibSQLStore({
      url: "file:./geography-memory.db",
    });

// Configure memory system with semantic search and context retention
export const agentMemory = new Memory({
  storage: memoryStore,

  // Memory configuration options
  options: {
    lastMessages: 10, // Keep last 10 messages in context
    semanticRecall: false, // Disable semantic recall for now (requires embedder)

    // Working memory configuration to persist user preferences
    workingMemory: {
      enabled: true,
      scope: "resource", // Persist across all threads for the same user
      template: `# User Geographic Preferences

## Personal Details
- **Favourite Country**: 
- **Favourite Country Coordinates**: 
- **Favourite Continent**: 
- **Favourite Continent Coordinates**: 
- **Favourite Destination**: 
- **Favourite Destination Coordinates**: 

## Conversation Context
- **Current Topic**: 
- **Recent Queries**: 
- **Areas of Interest**: 

## Geographic Learning
- **Countries Discussed**: 
- **New Facts Learned**: 
- **Travel Interests**: 
`,
    },
  },
});

// Memory configuration presets for different scenarios
export const memoryPresets = {
  // Standard conversation memory
  conversation: {
    lastMessages: 10,
    semanticRecall: false,
  },

  // Extended memory for detailed discussions
  detailed: {
    lastMessages: 20,
    semanticRecall: false,
  },

  // Minimal memory for quick interactions
  minimal: {
    lastMessages: 5,
    semanticRecall: false,
  },
};
