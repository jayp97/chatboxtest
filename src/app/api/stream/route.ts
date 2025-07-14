/**
 * /api/stream/route.ts
 * Node.js runtime streaming endpoint for GEOSYS Terminal
 * Integrates with Mastra agent for geography queries
 */

import { mastra } from "@/mastra";

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
    const { message, threadId, userId, userPreferences } = body;

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

    // Generate thread and user IDs if not provided
    // Use consistent thread ID for session persistence
    const actualThreadId = threadId || `geosys-terminal-thread`;
    const actualUserId = userId || `geosys-user-${Date.now()}`;

    try {
      
      // Build context message with user preferences for working memory
      const contextMessage = userPreferences 
        ? `GEOSYS PROFILE UPDATE: User has provided geographic preferences.
          Favourite Country: ${userPreferences.favouriteCountry || "Not provided"}
          Favourite Continent: ${userPreferences.favouriteContinent || "Not provided"}  
          Favourite Destination: ${userPreferences.favouriteDestination || "Not provided"}
          
          Please update your working memory with these preferences and reference them naturally in responses.`
        : "";

      // Agent execution initiated

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

      // Create a readable stream for the response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Stream the text response
            if (response.textStream) {
              for await (const chunk of response.textStream) {
                controller.enqueue(encoder.encode(chunk));
              }
            }
            
            // Close the stream when done
            controller.close();
          } catch {
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