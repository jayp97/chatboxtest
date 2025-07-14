/**
 * memory-direct-access.ts
 * Direct access to Mastra memory without using LLM
 * For efficient retrieval of user preferences and coordinates
 */

import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { notifyPreferenceUpdate } from "./preference-updater";

// Initialize memory with storage
const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:../mastra.db", // Use same DB as Mastra
  }),
});

interface StoredPreferences {
  favouriteCountry?: string;
  favouriteContinent?: string;
  favouriteDestination?: string;
  favouriteCountryCoords?: { lat: number; lng: number };
  favouriteDestinationCoords?: { lat: number; lng: number };
}

/**
 * Get user preferences directly from memory storage
 * This bypasses the LLM and reads directly from the database
 */
export async function getUserPreferencesFromMemory(
  userId: string,
  threadId: string = "geosys-terminal-thread"
): Promise<StoredPreferences | null> {
  try {
    console.log("📚 [MEMORY] Directly accessing memory for user:", userId);
    
    // Query the thread for recent messages
    const { messages } = await memory.query({
      threadId,
      resourceId: userId,
      selectBy: {
        last: 50, // Get last 50 messages to find preferences
      },
    });
    
    console.log(`📝 [MEMORY] Found ${messages.length} messages in thread`);
    
    // Parse messages to extract preferences
    const preferences: StoredPreferences = {};
    
    // Look through messages for preference information
    for (const message of messages) {
      if (message.role === "assistant" && message.content) {
        const content = typeof message.content === "string" 
          ? message.content 
          : message.content.map(c => c.type === 'text' ? c.text : '').join(' ');
        
        // Look for preference confirmations in assistant messages
        if (content.includes("favourite country") || content.includes("favorite country")) {
          const countryMatch = content.match(/(?:favourite|favorite) country (?:is|=) (\w+)/i);
          if (countryMatch) preferences.favouriteCountry = countryMatch[1];
        }
        
        if (content.includes("favourite destination") || content.includes("favorite destination")) {
          const destMatch = content.match(/(?:favourite|favorite) destination (?:is|=) (\w+)/i);
          if (destMatch) preferences.favouriteDestination = destMatch[1];
        }
        
        if (content.includes("favourite continent") || content.includes("favorite continent")) {
          const contMatch = content.match(/(?:favourite|favorite) continent (?:is|=) (\w+)/i);
          if (contMatch) preferences.favouriteContinent = contMatch[1];
        }
      }
    }
    
    console.log("🎯 [MEMORY] Extracted preferences:", preferences);
    return Object.keys(preferences).length > 0 ? preferences : null;
    
  } catch (error) {
    console.error("❌ [MEMORY] Failed to access memory directly:", error);
    return null;
  }
}

/**
 * Watch for preference updates in memory
 * This function polls memory for changes and emits events when detected
 */
export async function watchMemoryForUpdates(
  userId: string,
  threadId: string = "geosys-terminal-thread",
  onUpdate: (preferences: StoredPreferences) => void
) {
  let lastPreferences: string = "";
  
  const checkForUpdates = async () => {
    const preferences = await getUserPreferencesFromMemory(userId, threadId);
    if (preferences) {
      const currentPrefs = JSON.stringify(preferences);
      if (currentPrefs !== lastPreferences) {
        console.log("🔄 [MEMORY] Detected preference change!");
        lastPreferences = currentPrefs;
        onUpdate(preferences);
        
        // Emit global update event
        notifyPreferenceUpdate({
          source: "memory-watcher",
          preferences,
          timestamp: new Date().toISOString(),
        });
      }
    }
  };
  
  // Check immediately
  await checkForUpdates();
  
  // Then check periodically (every 2 seconds)
  const interval = setInterval(checkForUpdates, 2000);
  
  // Return cleanup function
  return () => clearInterval(interval);
}