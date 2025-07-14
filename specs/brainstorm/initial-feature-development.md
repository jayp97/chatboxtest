# Initial Feature Development Brainstorm

## Date: 2025-07-14

## Project Overview
Transforming a basic chatbox into an extraordinary geography-focused conversational agent with onboarding flow and OpenAI GPT-4.1 integration.

## Core Features to Implement

### 1. Onboarding Flow
- **Purpose**: Personalise user experience and gather preferences
- **Questions**:
  - Favourite country
  - Favourite continent  
  - Favourite destination
- **Technical Considerations**:
  - Store preferences in local state/context
  - Allow users to update preferences later
  - Consider progressive disclosure (one question at a time)
  - Smooth transitions between questions

### 2. Geography Chatbot Integration
- **Model**: GPT-4.1 via OpenAI API
- **Focus**: World geography expertise
- **Features**:
  - Answer geography-related questions
  - Provide interesting facts about user's favourite locations
  - Suggest related destinations based on preferences
  - Interactive geography quizzes/trivia

### 3. Streaming Response Implementation
- **Current**: Echo endpoint exists at `/api/stream`
- **Enhancement**: Integrate OpenAI streaming API
- **Edge Runtime**: Maintain for low latency
- **Error Handling**: Graceful fallbacks for API failures

## Architectural Decisions

### State Management
- **User Preferences**: React Context or Zustand for global state
- **Chat History**: Local state with optional persistence
- **Onboarding State**: Finite state machine pattern

### UI/UX Enhancements
- **Chat Interface**:
  - Typing indicators during streaming
  - Message timestamps
  - User avatar/bot avatar distinction
  - Smooth auto-scroll behaviour
  
- **Onboarding Experience**:
  - Welcome message
  - Progress indicator
  - Skip option
  - Engaging animations/transitions

### API Design
- **Endpoints**:
  - `/api/stream` - Main chat streaming endpoint
  - `/api/preferences` - Update user preferences (if needed)
  
- **Prompt Engineering**:
  - System prompt with geography expertise
  - Context injection with user preferences
  - Response formatting guidelines

## Creative Enhancements

### 1. Interactive Features
- **Map Integration**: Show locations on an interactive map
- **Country/City Cards**: Rich media responses with images
- **Fun Facts**: Automatically inject interesting trivia
- **Travel Recommendations**: Based on preferences and chat context

### 2. Personality & Tone
- **Bot Persona**: Friendly geography expert/travel guide
- **British English**: As specified in requirements
- **Encouraging**: Celebrate user's geography knowledge
- **Educational**: Always teaching something new

### 3. Advanced Features (Time Permitting)
- **Geography Quiz Mode**: Test user's knowledge
- **Virtual Tours**: Descriptive "visits" to locations
- **Climate/Weather Info**: Current conditions for discussed places
- **Cultural Insights**: Food, customs, languages
- **Distance Calculator**: Between user's favourites

## Technical Implementation Plan

### Phase 1: Core Setup (30 mins)
1. Set up OpenAI client with streaming
2. Update `/api/stream` endpoint
3. Basic prompt engineering
4. Environment variable configuration

### Phase 2: Onboarding (30 mins)
1. Create onboarding component
2. State management setup
3. Preference storage logic
4. UI transitions

### Phase 3: Chat Enhancement (30 mins)
1. Improve chat UI/UX
2. Add typing indicators
3. Message formatting
4. Error states

### Phase 4: Creative Features (30+ mins)
1. Rich responses
2. Interactive elements
3. Polish and refinement
4. Testing edge cases

## Potential Challenges
- **Streaming Complexity**: Handling partial responses gracefully
- **Context Length**: Managing conversation history
- **Geography Scope**: Defining boundaries of expertise
- **Performance**: Keeping Edge runtime fast

## Success Metrics
- Smooth onboarding experience
- Natural, informative conversations
- Fast response times
- Delightful UI interactions
- Clear geography focus

## Mastra MCP Integration for Agentic Workflow

### What is MCP?
- **Model Context Protocol**: Universal plugin system for AI agents
- **Purpose**: Enables AI models to discover and interact with external tools
- **Benefits**: Language-agnostic tool integration, dynamic tool discovery

### Mastra Integration Approaches

#### 1. Direct Integration (Recommended for this project)
- Bundle Mastra directly with Next.js
- Simpler deployment for assessment
- Code example:
```typescript
// In API route or server component
import { mastra } from "../../mastra";

export async function handleGeographyQuery(query: string, userPrefs: UserPreferences) {
  const agent = mastra.getAgent("geographyExpert");
  const result = await agent.generate(query, {
    context: userPrefs
  });
  return result;
}
```

#### 2. Implementation Plan with Mastra
1. **Install Mastra**: `npx mastra@latest init`
2. **Configure for Next.js**:
   - Add to `next.config.ts`: `serverExternalPackages: ["@mastra/*"]`
   - Update package.json scripts
3. **Create Geography Agent**:
   - Define agent with geography expertise
   - Configure GPT-4.1 model
   - Set up streaming responses
4. **MCP Tools Integration**:
   - Geography database queries
   - Map services
   - Weather APIs
   - Cultural information sources

### Enhanced Architecture with Mastra

```
/src
  /app
    /api
      /stream/route.ts      # Enhanced with Mastra agent
      /preferences/route.ts # User preference management
    /components
      /ChatInterface.tsx    # Main chat UI
      /OnboardingFlow.tsx   # Preference collection
  /mastra
    /agents
      /geography-expert.ts  # Main agent definition
    /tools
      /geography-tools.ts   # MCP tool configurations
    /index.ts              # Mastra configuration
```

## Next Steps
1. ~~Research Mastra MCP integration~~ ✓
2. Set up Mastra in the project
3. Create geography expert agent
4. Implement streaming with Mastra
5. Build onboarding flow
6. Connect UI to Mastra backend