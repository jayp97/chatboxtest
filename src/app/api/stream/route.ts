/**
 * /api/stream/route.ts
 * Edge runtime streaming endpoint for GEOSYS Terminal
 * Integrates with Mastra agent for geography queries
 */

import { mastra } from "@/mastra";

export const runtime = "edge";

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
      console.error("[STREAM API] Geography expert agent not found");
      return new Response(
        JSON.stringify({ error: "SYSTEM ERROR: Agent offline" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate thread and user IDs if not provided
    const actualThreadId = threadId || `thread-${Date.now()}`;
    const actualUserId = userId || `user-${Date.now()}`;

    try {
      console.log(`[GEOSYS] Processing query: ${message}`);
      
      // Build context message with user preferences
      const contextMessage = userPreferences 
        ? `User preferences: 
          Favourite Country: ${userPreferences.favouriteCountry || "Not set"}
          Favourite Continent: ${userPreferences.favouriteContinent || "Not set"}
          Favourite Destination: ${userPreferences.favouriteDestination || "Not set"}`
        : "";

      // Execute the agent with streaming
      const response = await geographyExpert.stream(
        [
          { role: "user", content: message }
        ],
        {
          // Add context if we have preferences
          ...(contextMessage && { 
            context: [{ 
              role: "system" as const, 
              content: contextMessage 
            }] 
          }),
          // Memory configuration
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
          } catch (error) {
            console.error("[GEOSYS] Streaming error:", error);
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
      console.error("[GEOSYS] Agent execution error:", error);
      return new Response(
        JSON.stringify({ error: "SYSTEM ERROR: Agent malfunction" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("[STREAM API] Error:", error);
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