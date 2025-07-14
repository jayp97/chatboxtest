# Mastra Integration Guide for Geography Chatbot

## Date: 2025-07-14

## Overview

This document outlines how to integrate Mastra into our Next.js geography chatbot project, leveraging its agent framework, tools, and streaming capabilities to create an enhanced conversational experience.

## What is Mastra?

Mastra is an open-source TypeScript agent framework designed to help developers build AI applications quickly. It provides:

- **Agent Framework**: Create AI agents with memory, tools, and streaming capabilities
- **Tool System**: Extend agent capabilities with typed functions
- **MCP Support**: Model Context Protocol integration for third-party tools
- **Streaming**: Built-in support for streaming responses
- **Memory System**: Persistent conversation context and semantic recall
- **Workflow Engine**: Deterministic multi-step processes
- **Development Environment**: Local playground for testing agents

## Installation & Setup

### 1. Install Mastra Packages

```bash
npm install @mastra/core@latest @mastra/memory@latest @mastra/libsql@latest @ai-sdk/openai@latest
```

### 2. Configure Next.js

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"],
};

export default nextConfig;
```

### 3. Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── stream/
│   │       └── route.ts      # Enhanced streaming endpoint
│   └── page.tsx              # Chatbox UI
└── mastra/
    ├── agents/
    │   └── geography-expert.ts
    ├── tools/
    │   ├── country-info.ts
    │   ├── weather-tool.ts
    │   └── distance-calculator.ts
    └── index.ts              # Mastra configuration
```

## Implementation Plan

### Phase 1: Core Agent Setup

#### 1.1 Create Mastra Configuration

```typescript
// src/mastra/index.ts
import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { Memory } from "@mastra/memory";
import { geographyExpert } from "./agents/geography-expert";

export const mastra = new Mastra({
  agents: { geographyExpert },
  storage: new LibSQLStore({
    url: "file:./geography-bot.db",
  }),
});
```

#### 1.2 Create Geography Expert Agent

```typescript
// src/mastra/agents/geography-expert.ts
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { openai } from "@ai-sdk/openai";
import { countryInfoTool, weatherTool, distanceCalculator } from "../tools";

const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:./geography-memory.db",
  }),
});

export const geographyExpert = new Agent({
  name: "Geography Expert",
  description: "An expert assistant specialising in world geography",
  instructions: `You are a friendly and knowledgeable geography expert with a passion for sharing fascinating facts about the world. 

Your personality:
- Enthusiastic about geography and travel
- Educational but never condescending
- Engaging and conversational
- British English throughout

When users share their favourite country, continent, or destination:
- Remember these preferences using the conversation context
- Reference them naturally in future responses
- Suggest related places they might enjoy
- Share interesting connections between their favourites

Your capabilities:
- Answer questions about countries, cities, continents, and regions
- Provide current weather information for any location
- Calculate distances between places
- Share cultural insights, historical facts, and travel tips
- Suggest destinations based on user preferences

Always aim to make geography fun and accessible!`,
  model: openai("gpt-4o"),
  tools: {
    countryInfoTool,
    weatherTool,
    distanceCalculator,
  },
  memory,
});
```

### Phase 2: Tool Development

#### 2.1 Country Information Tool

```typescript
// src/mastra/tools/country-info.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const countryInfoTool = createTool({
  id: "getCountryInfo",
  description:
    "Get detailed information about a country including capital, population, languages, and interesting facts",
  inputSchema: z.object({
    country: z.string().describe("The name of the country"),
  }),
  outputSchema: z.object({
    name: z.string(),
    capital: z.string(),
    population: z.number(),
    languages: z.array(z.string()),
    currency: z.string(),
    continent: z.string(),
    funFacts: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    // Integration with REST Countries API or similar
    const response = await fetch(
      `https://restcountries.com/v3.1/name/${context.country}`
    );
    const data = await response.json();

    // Transform and return country data
    return {
      name: data[0].name.common,
      capital: data[0].capital[0],
      population: data[0].population,
      languages: Object.values(data[0].languages),
      currency: Object.values(data[0].currencies)[0].name,
      continent: data[0].region,
      funFacts: [
        // Add interesting facts from the data
      ],
    };
  },
});
```

#### 2.2 Weather Tool

```typescript
// src/mastra/tools/weather-tool.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const weatherTool = createTool({
  id: "getCurrentWeather",
  description: "Get current weather conditions for any location worldwide",
  inputSchema: z.object({
    location: z.string().describe("City name or coordinates"),
  }),
  outputSchema: z.object({
    location: z.string(),
    temperature: z.number(),
    conditions: z.string(),
    humidity: z.number(),
    windSpeed: z.number(),
  }),
  execute: async ({ context }) => {
    // Use Open-Meteo API (no key required)
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      context.location
    )}`;
    const geoResponse = await fetch(geocodingUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results?.[0]) {
      throw new Error(`Location '${context.location}' not found`);
    }

    const { latitude, longitude, name } = geoData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    return {
      location: name,
      temperature: weatherData.current.temperature_2m,
      conditions: getWeatherCondition(weatherData.current.weathercode),
      humidity: weatherData.current.relative_humidity_2m,
      windSpeed: weatherData.current.wind_speed_10m,
    };
  },
});
```

### Phase 3: Enhanced Streaming Endpoint

```typescript
// src/app/api/stream/route.ts
import { mastra } from "@/mastra";
import { StreamingTextResponse } from "ai";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages, threadId, userId } = await req.json();

    const agent = mastra.getAgent("geographyExpert");

    // Handle streaming with memory context
    const stream = await agent.stream(messages, {
      memory: {
        thread: threadId || `thread-${Date.now()}`,
        resource: userId || "anonymous",
        options: {
          lastMessages: 10,
          semanticRecall: {
            topK: 5,
          },
          workingMemory: {
            enabled: true,
            template:
              "User preferences: Favourite country: {country}, Favourite continent: {continent}, Favourite destination: {destination}",
          },
        },
      },
      maxSteps: 5, // Allow multiple tool calls
      onStepFinish: ({ text, toolCalls, toolResults }) => {
        console.log("Step completed:", { text, toolCalls, toolResults });
      },
    });

    // Convert Mastra stream to Response stream
    const textEncoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream.textStream) {
          controller.enqueue(textEncoder.encode(chunk));
        }
        controller.close();
      },
    });

    return new StreamingTextResponse(readableStream);
  } catch (error) {
    console.error("Streaming error:", error);
    return new Response("Error processing request", { status: 500 });
  }
}
```

### Phase 4: Onboarding Flow Implementation

```typescript
// src/app/components/OnboardingFlow.tsx
"use client";

import { useState } from "react";

interface OnboardingData {
  favouriteCountry?: string;
  favouriteContinent?: string;
  favouriteDestination?: string;
}

export function OnboardingFlow({
  onComplete,
}: {
  onComplete: (data: OnboardingData) => void;
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({});

  const questions = [
    {
      id: "favouriteCountry",
      question: "What's your favourite country?",
      placeholder: "e.g., Japan, Brazil, Italy...",
    },
    {
      id: "favouriteContinent",
      question: "Which continent fascinates you most?",
      placeholder: "e.g., Asia, Europe, Africa...",
    },
    {
      id: "favouriteDestination",
      question: "What's your dream destination?",
      placeholder: "e.g., Machu Picchu, Great Barrier Reef...",
    },
  ];

  const currentQuestion = questions[step - 1];

  const handleSubmit = (value: string) => {
    const newData = { ...data, [currentQuestion.id]: value };
    setData(newData);

    if (step < questions.length) {
      setStep(step + 1);
    } else {
      onComplete(newData);
    }
  };

  return (
    <div className="onboarding-flow">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(step / questions.length) * 100}%` }}
        />
      </div>

      <h3>{currentQuestion.question}</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSubmit(formData.get("answer") as string);
        }}
      >
        <input
          name="answer"
          type="text"
          placeholder={currentQuestion.placeholder}
          required
          autoFocus
        />
        <button type="submit">
          {step < questions.length ? "Next" : "Start Chatting"}
        </button>
      </form>

      {step > 1 && (
        <button onClick={() => setStep(step - 1)} className="back-button">
          Back
        </button>
      )}
    </div>
  );
}
```

### Phase 5: Chatbox UI Enhancement

```typescript
// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useChat } from "ai/react";
import { OnboardingFlow } from "./components/OnboardingFlow";

export default function ChatboxPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userPreferences, setUserPreferences] = useState({});
  const [threadId] = useState(`thread-${Date.now()}`);
  const [userId] = useState(`user-${Math.random().toString(36).substring(7)}`);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/stream",
      body: {
        threadId,
        userId,
        userPreferences,
      },
    });

  const handleOnboardingComplete = (data: any) => {
    setUserPreferences(data);
    setHasCompletedOnboarding(true);

    // Send initial context to the agent
    handleSubmit({
      preventDefault: () => {},
      currentTarget: {
        elements: {
          input: {
            value: `My favourite country is ${data.favouriteCountry}, I love ${data.favouriteContinent}, and my dream destination is ${data.favouriteDestination}. Please remember these preferences!`,
          },
        },
      },
    } as any);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
      >
        🌍
      </button>

      {/* Chatbox */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h2 className="text-lg font-semibold">Geography Expert</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-grey-200"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {!hasCompletedOnboarding ? (
              <div className="p-4">
                <OnboardingFlow onComplete={handleOnboardingComplete} />
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-grey-100 text-grey-800"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-grey-100 text-grey-800 p-3 rounded-lg">
                        <span className="typing-indicator">...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask me about any place in the world..."
                      className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Preferences Button */}
          {hasCompletedOnboarding && (
            <div className="p-2 border-t">
              <button
                onClick={() => setHasCompletedOnboarding(false)}
                className="text-sm text-grey-600 hover:text-grey-800"
              >
                Update preferences
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
```

## Key Benefits of Mastra Integration

### 1. **Enhanced Agent Capabilities**

- Tools for real-time data (weather, country info)
- Semantic memory for contextual responses
- Multi-step reasoning with tool chaining

### 2. **Better User Experience**

- Streaming responses for immediate feedback
- Persistent memory across conversations
- Personalised interactions based on preferences

### 3. **Developer Experience**

- Type-safe tool creation
- Built-in error handling
- Local development playground
- Easy testing and debugging

### 4. **Scalability**

- Edge runtime compatibility
- Efficient memory storage
- Modular architecture

## Testing Strategy

### 1. **Local Development**

```bash
# Run Mastra dev server
npm run dev:mastra

# Access playground at http://localhost:4111
```

### 2. **Test Scenarios**

- Onboarding flow completion
- Memory persistence across sessions
- Tool execution (weather, country info)
- Error handling for invalid locations
- Streaming response performance

### 3. **Example Interactions**

```
User: "What's the weather like in Tokyo?"
Bot: [Uses weather tool] "Currently in Tokyo, it's 22°C with clear skies..."

User: "How far is it from my favourite country?"
Bot: [Uses memory + distance tool] "The distance from Japan (your favourite country) to Tokyo is..."

User: "Tell me about Brazil"
Bot: [Uses country info tool] "Brazil is the largest country in South America..."
```

## Deployment Considerations

### 1. **Environment Variables**

```env
OPENAI_API_KEY=your-key-here
DATABASE_URL=file:./geography-bot.db  # Or use Turso for production
```

### 2. **Production Database**

Consider using Turso (LibSQL) for production:

```typescript
const memory = new Memory({
  storage: new LibSQLStore({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  }),
});
```

### 3. **Performance Optimisation**

- Implement caching for frequently requested data
- Use edge functions for API routes
- Optimise tool execution with parallel calls

## Future Enhancements

### 1. **Additional Tools**

- Time zone converter
- Currency exchange rates
- Flight distance calculator
- Cultural etiquette guide
- Language translator

### 2. **Advanced Features**

- Image recognition for landmarks
- Interactive maps integration
- Quiz mode for geography learning
- Travel itinerary suggestions

### 3. **MCP Integration**

- Connect to external geography databases
- Integration with mapping services
- Access to real-time travel advisories

## Conclusion

Mastra provides a robust foundation for building our enhanced geography chatbot. Its agent framework, tool system, and streaming capabilities align perfectly with our requirements, while the memory system enables truly personalised conversations. The modular architecture ensures we can easily extend functionality as needed.
