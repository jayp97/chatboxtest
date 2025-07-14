# Geography Chatbot Implementation Specification

## Date: 2025-07-14

## Project Title: GEOSYS Terminal - An Extraordinary Geography Experience

## Overview

This specification outlines the complete implementation process for transforming a basic chatbox into an extraordinary retro-terminal geography expert with Mastra agent integration, dynamic ASCII art, and a living world interface.

## Development Phases

### Phase 1: Foundation and Environment Setup

#### Step 1.1: Project Initialisation
- [x] Verify Next.js 15 App Router configuration
- [x] Ensure TypeScript strict mode is enabled
- [x] Confirm Node.js v22.15.0 via nvm
- [x] Set up `.env` file with OPENAI_API_KEY placeholder

#### Step 1.2: Core Dependencies Installation
- [x] Install Mastra core packages
- [x] Install AI SDK and utilities
- [x] Install UI libraries (framer-motion, canvas-confetti)
- [x] Install type definitions

```bash
pnpm install @mastra/core@latest @mastra/memory@latest @mastra/libsql@latest @ai-sdk/openai@latest
pnpm install zod ai framer-motion canvas-confetti
pnpm install -D @types/canvas-confetti
```

#### Step 1.3: Next.js Configuration
- [x] Update `next.config.ts` to include `serverExternalPackages: ["@mastra/*"]`
- [x] Configure for Edge runtime compatibility
- [x] Set up proper TypeScript paths in `tsconfig.json`
- [x] Add `.mastra` to `.gitignore`

#### Step 1.4: Directory Structure Creation
- [x] Create src/app/components directory structure
- [x] Create src/app/styles directory
- [x] Create src/app/utils directory
- [x] Create src/mastra directory structure
```
src/
├── app/
│   ├── api/
│   │   └── stream/
│   │       └── route.ts
│   ├── components/
│   │   ├── terminal/
│   │   │   ├── TerminalUI.tsx
│   │   │   ├── BootSequence.tsx
│   │   │   ├── CRTEffects.tsx
│   │   │   └── CommandLine.tsx
│   │   ├── ascii/
│   │   │   ├── CountryArt.tsx
│   │   │   ├── WeatherArt.tsx
│   │   │   └── AnimationEngine.tsx
│   │   ├── globe/
│   │   │   ├── WorldGlobe.tsx
│   │   │   ├── LocationPins.tsx
│   │   │   └── GlobeControls.tsx
│   │   └── onboarding/
│   │       └── OnboardingFlow.tsx
│   ├── styles/
│   │   ├── terminal.css
│   │   ├── crt-effects.css
│   │   └── animations.css
│   ├── utils/
│   │   ├── ascii-library.ts
│   │   ├── sound-effects.ts
│   │   └── terminal-commands.ts
│   └── page.tsx
└── mastra/
    ├── agents/
    │   └── geography-expert.ts
    ├── tools/
    │   ├── country-info.ts
    │   ├── weather-tool.ts
    │   ├── distance-calculator.ts
    │   └── ascii-generator.ts
    └── index.ts
```

### Phase 2: Mastra Agent Implementation

#### Step 2.1: Mastra Core Configuration
- [x] Create `src/mastra/index.ts` with Mastra instance
- [x] Configure LibSQLStore for local database storage
- [x] Set up memory persistence configuration
- [x] Initialise agent registry
- [x] Create memory-config.ts with working memory system

#### Step 2.2: Geography Expert Agent Creation
- [x] Implement `geography-expert.ts` with personality traits
- [x] Configure GPT-4.1 model via OpenAI
- [x] Add British English language instructions
- [x] Set up conversation memory with context retention
- [x] Configure streaming capabilities

#### Step 2.3: Tool Development
1. **Country Information Tool**
   - [x] REST Countries API integration
   - [x] Capital, population, languages data
   - [x] Fun facts generation
   - [x] Error handling for unknown countries

2. **Weather Tool**
   - [x] Open-Meteo API integration (no key required)
   - [x] Current conditions fetching
   - [x] Weather code to description mapping
   - [x] Location geocoding

3. **Distance Calculator Tool**
   - [x] Haversine formula implementation
   - [x] Support for city-to-city calculations
   - [x] Favourite location shortcuts

4. **ASCII Generator Tool**
   - [x] Dynamic ASCII art generation
   - [x] Country-specific patterns
   - [x] Weather condition representations

#### Step 2.4: Streaming Endpoint Enhancement
- [x] Update `/api/stream/route.ts` for Mastra integration
- [x] Implement proper Node.js runtime configuration
- [x] Add memory context handling
- [x] Configure thread and user ID management
- [x] Set up error boundaries and fallbacks
- [x] User preferences integration with working memory

### Phase 3: Terminal UI Implementation

#### Step 3.1: Base Terminal Structure
- [x] Create `TerminalUI.tsx` main container
- [x] Implement black background with phosphor green (#00ff00) text
- [x] Set up fixed-width terminal dimensions
- [x] Add terminal frame with title bar "GEOSYS v4.2.1"

#### Step 3.2: CRT Effects Layer
- [x] Implement `CRTEffects.tsx` with CSS filters
- [x] Add scanline overlay animation
- [x] Create screen flicker effect (subtle, random intervals)
- [x] Implement chromatic aberration on edges
- [x] Add subtle screen curvature distortion
- [x] Create phosphor glow effect for text

#### Step 3.3: Boot Sequence Animation
- [x] Create `BootSequence.tsx` component
- [x] Implement typewriter effect for boot messages
- [x] Add progress bar animations
- [x] Include authentic system sounds
- [x] Sequence steps:
  ```
  GEOSYS v4.2.1 INITIALISING...
  CHECKING SYSTEM INTEGRITY... OK
  LOADING WORLD DATABASE... [████████████] 100%
  ESTABLISHING SATELLITE UPLINK... 
  CONNECTION ESTABLISHED
  READY. TYPE 'HELLO' TO BEGIN
  ```
- [x] Fixed rendering issues with undefined text and duplication

#### Step 3.4: Command Line Interface
- [x] Implement `CommandLine.tsx` with prompt styling
- [x] Add blinking cursor animation
- [x] Create command history (up/down arrows)
- [x] Implement auto-complete for common commands
- [x] Command syntax: `> query: [user input]`
- [x] Add typing sound effects

#### Step 3.5: Terminal Styling System (NEW)
- [x] Create comprehensive CSS styling system
- [x] Implement terminal.css with CRT-specific styles
- [x] Add crt-effects.css for authentic retro appearance
- [x] Create animations.css for smooth transitions
- [x] Phosphor glow effects and scanline animations

### Phase 4: ASCII Art System

#### Step 4.1: ASCII Art Library Creation
- [x] Create `ascii-library.ts` with country-specific art
- [x] Implement animation frame sequences
- [x] Design weather condition representations
- [x] Create transition effects between ASCII states

#### Step 4.2: Country-Specific Animations
1. **Japan ASCII Implementation**
   - [x] Cherry blossom falling animation:
   ```
   Frame 1:    ✿     ✿
              ╱┃╲   ╱┃╲
   Frame 2:     ✿ ✿
              ╱┃╲ ╱┃╲
   ```

2. **Brazil Carnival Dancers**
   - [x] Multi-frame dance sequence
   - [x] Rhythmic movement patterns
   - [x] Colourful character combinations

3. **Egypt Pyramid Construction**
   - [x] Line-by-line building animation
   - [x] Sand particle effects
   - [x] Hieroglyph decorations

4. **Australia Kangaroo**
   - [x] Hopping animation across screen
   - [x] Trail effect implementation
   - [x] Speed variations

5. **France Eiffel Tower**
   - [x] Assembly from base to top
   - [x] Sparkling light effects
   - [x] Completion celebration

#### Step 4.3: Weather ASCII Integration
- [x] Implement dynamic weather displays
- [x] Animate rain, snow, and sun patterns
- [x] Create smooth transitions between weather states
- [x] Sync with actual weather data from tools

#### Step 4.4: Animation Engine (NEW)
- [x] Create AnimationEngine.tsx for smooth ASCII transitions
- [x] Implement frame-by-frame animation system
- [x] Add CountryArt.tsx for country-specific displays
- [x] Create WeatherArt.tsx for weather condition animations
- [x] Optimized rendering for performance

### Phase 5: Living World Globe Implementation

#### Step 5.1: 3D Globe Foundation
- [ ] Integrate Three.js or React Three Fiber
- [ ] Create low-poly Earth mesh
- [ ] Implement rotation controls
- [ ] Add breathing animation (scale pulsing)
- [ ] Set up camera positioning

**Note: Globe components have been scaffolded (WorldGlobe.tsx, LocationPins.tsx, GlobeControls.tsx) but not yet implemented with 3D functionality.**

#### Step 5.2: Interactive Features
- [ ] Mouse drag rotation implementation
- [ ] Zoom controls with limits
- [ ] Country highlighting on hover
- [ ] Click to focus on regions
- [ ] Smooth camera transitions

#### Step 5.3: Dynamic Data Visualisation
- [ ] Location pin system for mentioned places
- [ ] Connection lines between favourites
- [ ] Real-time day/night terminator
- [ ] Cloud coverage overlay (if available)
- [ ] Heat map for conversation topics

#### Step 5.4: Ambient Animations
- [ ] Aurora borealis at poles
- [ ] Ocean current flows
- [ ] Migration path visualisations
- [ ] Volcano particle effects
- [ ] City lights on night side

### Phase 6: Onboarding Flow with Terminal Style

#### Step 6.1: Terminal-Style Onboarding
- [x] Create retro onboarding sequence
- [x] Each question appears as system prompt
- [x] User types answers in command format
- [x] Progress shown as loading bars
- [x] Questions:
  ```
  > SYSTEM: ENTER FAVOURITE COUNTRY:
  > USER: _
  ```

#### Step 6.2: Preference Storage
- [x] Local storage implementation
- [x] Context integration with Mastra agent
- [x] Preference update mechanism
- [x] Visual confirmation animations
- [x] Working memory system for persistent preferences

#### Step 6.3: ASCII Art Rewards
- [x] Display country ASCII art after selection
- [x] Celebration animation on completion
- [x] Transition to main terminal interface

#### Step 6.4: Working Memory Integration (NEW)
- [x] Implement working memory system for persistent user preferences
- [x] Resource-scoped memory to maintain context across sessions
- [x] Automatic preference storage and retrieval
- [x] Context-aware agent responses based on stored preferences

### Phase 7: Chat Interface Enhancement

#### Step 7.1: Message Display Styling
- [x] Green phosphor text for all messages
- [x] Typewriter effect for bot responses
- [x] User messages in dimmer green
- [ ] Timestamp in corner (military time)
- [ ] ASCII dividers between messages

#### Step 7.2: Streaming Integration
- [x] Character-by-character display
- [x] Cursor animation during typing
- [x] Buffer management for smooth display
- [x] Error state handling with glitch effects

#### Step 7.3: Special Effects
- "Signal interference" for loading
- Matrix-style text rain for transitions
- Glitch effects when discovering locations
- Success confirmations with ASCII checkmarks

### Phase 8: Sound Design Implementation

#### Step 8.1: Audio System Setup
- [x] Create `sound-effects.ts` utility
- [x] Implement Web Audio API integration
- [x] Volume controls and muting option
- [x] Preload critical sounds

#### Step 8.2: Sound Library
- [x] Keyboard typing sounds (mechanical)
- [ ] Modem dial-up for connections
- [x] Success beeps and error buzzes
- [ ] Ambient computer hum
- [x] Boot sequence sounds
- [ ] Message received notifications

#### Step 8.3: Interactive Audio
- [ ] Click feedback sounds
- [ ] Hover effects for interactive elements
- [ ] Globe rotation whoosh sounds
- [ ] ASCII animation accompaniments

### Phase 9: Command System and Easter Eggs

#### Step 9.1: Command Parser Implementation
- [x] Create command recognition system
- [x] Implement help command with manual
- [x] Add system commands (clear, reset, about)
- [x] Create shortcuts for common queries

#### Step 9.2: Easter Egg Features
- [ ] `sudo explore world` - Unlock hidden features
- [ ] `hack the planet` - Matrix rain effect
- [ ] `/dance` - Trigger party mode with ASCII
- [ ] `konami code` - Special animation sequence
- [ ] Hidden ASCII art gallery

#### Step 9.3: Advanced Commands
- [ ] `map [country]` - Focus globe on location
- [x] `weather [city]` - Quick weather check
- [x] `route [from] [to]` - Calculate distances
- [ ] `trivia` - Start geography quiz mode

### Phase 10: Performance Optimisation

#### Step 10.1: Rendering Optimisation
- Implement virtual scrolling for chat history
- Optimise ASCII animation frame rates
- Use requestAnimationFrame properly
- Implement component memoisation

#### Step 10.2: Asset Optimisation
- Lazy load globe component
- Compress and cache ASCII art
- Optimise font loading
- Implement progressive enhancement

#### Step 10.3: Memory Management
- Limit conversation history in UI
- Implement message pagination
- Clean up animation intervals
- Manage WebGL resources properly

### Phase 11: Polish and Refinement

#### Step 11.1: Accessibility Enhancements
- Screen reader support for terminal
- Keyboard navigation throughout
- High contrast mode option
- Reduce motion preferences

#### Step 11.2: Mobile Responsiveness
- Touch controls for globe
- Adapted terminal layout
- Virtual keyboard considerations
- Gesture support

#### Step 11.3: Error States and Edge Cases
- Network failure handling
- API timeout management
- Graceful degradation
- Helpful error messages in terminal style

### Phase 12: Testing and Quality Assurance

#### Step 12.1: Unit Testing Setup
- Test Mastra agent responses
- Tool execution verification
- Component testing framework
- ASCII animation tests

#### Step 12.2: Integration Testing
- End-to-end conversation flows
- Onboarding completion paths
- API integration verification
- Memory persistence checks

#### Step 12.3: Performance Testing
- Frame rate monitoring
- Memory leak detection
- Network request optimisation
- Load time benchmarking

### Phase 13: Documentation and Deployment Prep

#### Step 13.1: Code Documentation
- Inline documentation for complex logic
- README files for each module
- API documentation for tools
- Architecture decision records

#### Step 13.2: User Documentation
- Command reference guide
- Easter egg hints
- Troubleshooting guide
- Feature showcase

#### Step 13.3: Deployment Configuration
- Environment variable setup
- Build optimisation settings
- Error tracking integration
- Analytics implementation (privacy-conscious)

## Technical Considerations

### Browser Compatibility
- Chrome/Edge: Full feature support
- Firefox: WebGL compatibility checks
- Safari: Audio autoplay policies
- Mobile browsers: Touch optimisations

### Performance Targets
- Initial load: < 3 seconds
- Time to interactive: < 5 seconds
- Smooth 60fps animations
- Minimal memory footprint

### Security Measures
- Input sanitisation for commands
- Rate limiting for API calls
- Secure credential storage
- XSS prevention in terminal display

## Success Criteria

1. **Functional Requirements**
   - Fully operational Mastra agent integration
   - Smooth streaming responses
   - All tools working correctly
   - Persistent memory across sessions

2. **User Experience**
   - Immersive retro terminal aesthetic
   - Delightful ASCII animations
   - Responsive globe interactions
   - Engaging onboarding flow

3. **Performance Metrics**
   - Fast response times (< 200ms locally)
   - Smooth animations (60fps)
   - Efficient memory usage
   - Quick initial load

4. **Code Quality**
   - Clean, modular architecture
   - Comprehensive error handling
   - Well-documented codebase
   - Testable components

## Conclusion

This implementation creates a unique, memorable geography chatbot experience that combines cutting-edge AI technology with nostalgic terminal aesthetics. The result should feel like discovering a mysterious geographic intelligence system from an alternate timeline where terminals evolved into magical atlas interfaces.