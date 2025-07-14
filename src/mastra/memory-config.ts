/**
 * memory-config.ts
 * Memory system configuration
 * Provides persistent conversation memory for agents
 */

import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

// Create a dedicated memory store for conversation persistence
const memoryStore = new LibSQLStore({
  url: "file:./geography-memory.db",
  syncPeriod: 0, // Sync immediately for real-time persistence
});

// Configure memory system with semantic search and context retention
export const agentMemory = new Memory({
  storage: memoryStore,
  
  // Default configuration for memory queries
  defaultQueryOptions: {
    lastMessages: 10, // Keep last 10 messages in context
    semanticRecall: {
      enabled: true,
      topK: 5, // Retrieve top 5 semantically similar messages
    },
  },
});

// Memory configuration presets for different scenarios
export const memoryPresets = {
  // Standard conversation memory
  conversation: {
    lastMessages: 10,
    semanticRecall: {
      enabled: true,
      topK: 5,
    },
  },
  
  // Extended memory for detailed discussions
  detailed: {
    lastMessages: 20,
    semanticRecall: {
      enabled: true,
      topK: 10,
    },
  },
  
  // Minimal memory for quick interactions
  minimal: {
    lastMessages: 5,
    semanticRecall: {
      enabled: false,
    },
  },
};