/**
 * /api/stream/route.ts
 * Node.js runtime streaming endpoint for GEOSYS Terminal
 * Integrates with Mastra agent for geography queries
 * 
 * Runtime: Using Node.js instead of Edge for Mastra compatibility and computational requirements
 * References:
 * - https://vercel.com/docs/functions/runtimes/node-js
 * - https://vercel.com/docs/functions/runtimes/edge
 * Node.js chosen for: Complete Node.js compatibility, Mastra agent integration, and computational workloads
 */

import { mastra } from "@/mastra";
import { LocationQuery } from "@/utils/location-query-storage";
import { containsLocationKeywords, extractCoordinatesFromText } from "@/mastra/tools/location-detector";

export const runtime = "nodejs";

// Define request/response types
interface ChatRequest {
  message: string;
  threadId?: string;
  userId?: string;
  userPreferences?: {
    favouriteCountry?: string;
    favouriteContinent?: string;
    favouriteDestination?: string;
  };
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json();
    const { message, threadId, userId } = body;

    // Validate required fields
    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the geography expert agent
    const geographyExpert = mastra.getAgent("geographyExpert");
    
    if (!geographyExpert) {
      return new Response(
        JSON.stringify({ error: "SYSTEM ERROR: Agent offline" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Use provided IDs or fallback to defaults
    // IMPORTANT: These should be provided by the client to maintain consistency
    const actualThreadId = threadId || `geosys-terminal-thread-default`;
    const actualUserId = userId || `geosys-user-default`;

    try {
      
      // Agent execution initiated
      console.log("[API] Executing agent with message:", message);

      // Execute the agent with streaming
      const response = await geographyExpert.stream(
        [
          { role: "user", content: message }
        ],
        {
          // Memory configuration - this is the key!
          memory: {
            thread: actualThreadId,
            resource: actualUserId,
          },
          // Tool configuration
          toolChoice: "auto",
          // Temperature for consistent responses
          temperature: 0.7,
        }
      );
      
      console.log("[API] Agent response received, streaming started");

      // Create a readable stream for the response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Stream the text response and collect it for location processing
            let fullResponse = "";
            
            if (response.textStream) {
              console.log("[API] Text stream available, starting to stream chunks");
              let chunkCount = 0;
              for await (const chunk of response.textStream) {
                chunkCount++;
                fullResponse += chunk;
                controller.enqueue(encoder.encode(chunk));
              }
              console.log(`[API] Streamed ${chunkCount} chunks successfully`);
              
              // Process the full response for location tracking
              // This happens after streaming is complete
              // Note: We'll send this data to the client instead of storing on server
              const locationData = processLocationData(message, fullResponse, actualUserId, actualThreadId);
              
              // Send location data to client as a special message
              if (locationData) {
                controller.enqueue(encoder.encode(`\n__LOCATION_DATA__:${JSON.stringify(locationData)}`));
              }
            } else {
              console.log("[API] No text stream available in response");
              controller.enqueue(
                encoder.encode("SYSTEM ERROR: No response generated.")
              );
            }
            
            // Close the stream when done
            controller.close();
          } catch (error) {
            console.error("[API] Stream error:", error);
            controller.enqueue(
              encoder.encode("\n\nSYSTEM ERROR: Stream interrupted. Please try again.")
            );
            controller.close();
          }
        },
      });

      // Return the stream response
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } catch (error) {
      console.error("Agent execution error:", error);
      return new Response(
        JSON.stringify({ error: "SYSTEM ERROR: Agent malfunction", details: error instanceof Error ? error.message : "Unknown error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch {
    return new Response(
      JSON.stringify({
        error: "SYSTEM MALFUNCTION: Unable to process request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Process location data from the agent response
 * This function runs after the streaming is complete
 * Returns location data to be sent to the client
 */
function processLocationData(
  question: string,
  response: string,
  userId: string,
  threadId: string
): LocationQuery | null {
  try {
    // Check if the question or response contains location keywords
    if (!containsLocationKeywords(question) && !containsLocationKeywords(response)) {
      return null;
    }
    
    // Extract coordinates from the response
    const coordinates = extractCoordinatesFromText(response);
    
    if (!coordinates) {
      console.log("[LocationProcessor] No coordinates found in response");
      return null;
    }
    
    // Try to extract location name from the response
    const locationName = extractLocationName(response);
    
    if (!locationName) {
      console.log("[LocationProcessor] No location name found in response");
      return null;
    }
    
    // Create a LocationQuery object
    const locationQuery: LocationQuery = {
      id: `location-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      question: question.trim(),
      response: response.length > 500 ? response.substring(0, 500) + "..." : response,
      locationName: locationName,
      coordinates: coordinates,
      timestamp: new Date(),
      threadId: threadId,
      userId: userId
    };
    
    console.log(`[LocationProcessor] Processed location query for: ${locationName}`);
    return locationQuery;
  } catch (error) {
    console.error("[LocationProcessor] Error processing location data:", error);
    return null;
  }
}

/**
 * Extract location name from the response text
 */
function extractLocationName(response: string): string | null {
  try {
    // Look for common patterns in the response
    const patterns = [
      // "The [location] is located..."
      /The\s+([A-Z][a-zA-Z\s]+?)\s+is\s+located/i,
      // "Located in [location]"
      /located\s+in\s+([A-Z][a-zA-Z\s]+?)[\s,\[]/i,
      // "[location] is in"
      /([A-Z][a-zA-Z\s]+?)\s+is\s+in/i,
      // "in [location]," or "in [location]."
      /in\s+([A-Z][a-zA-Z\s]+?)[\s,\.\[]/i,
      // "visit [location]"
      /visit\s+([A-Z][a-zA-Z\s]+?)[\s,\.\[]/i,
      // Pattern for coordinates: "Location Name [coordinates]"
      /([A-Z][a-zA-Z\s]+?)\s+\[[-+]?\d+\.?\d*,\s*[-+]?\d+\.?\d*\]/,
    ];
    
    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        let locationName = match[1].trim();
        
        // Clean up the location name
        locationName = locationName.replace(/\s+/g, ' ');
        locationName = locationName.replace(/^(the|a|an)\s+/i, '');
        
        // Skip if it's too short or contains common words that aren't locations
        if (locationName.length < 2 || 
            /^(is|are|was|were|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|shall)$/i.test(locationName)) {
          continue;
        }
        
        return locationName;
      }
    }
    
    return null;
  } catch (error) {
    console.error("[LocationProcessor] Error extracting location name:", error);
    return null;
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}