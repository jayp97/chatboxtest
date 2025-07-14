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
});

// Configure memory system with semantic search and context retention
export const agentMemory = new Memory({
  storage: memoryStore,
  
  // Memory configuration options
  options: {
    lastMessages: 10, // Keep last 10 messages in context
    semanticRecall: false, // Disable semantic recall for now (requires embedder)
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