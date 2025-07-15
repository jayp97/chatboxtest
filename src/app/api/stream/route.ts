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
            // Stream the text response
            if (response.textStream) {
              console.log("[API] Text stream available, starting to stream chunks");
              let chunkCount = 0;
              for await (const chunk of response.textStream) {
                chunkCount++;
                controller.enqueue(encoder.encode(chunk));
              }
              console.log(`[API] Streamed ${chunkCount} chunks successfully`);
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