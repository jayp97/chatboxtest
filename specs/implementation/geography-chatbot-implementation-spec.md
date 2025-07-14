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

#### Step 2.2: Geography Expert Agent Creation
- [ ] Implement `geography-expert.ts` with personality traits
- [ ] Configure GPT-4.1 model via OpenAI
- [ ] Add British English language instructions
- [ ] Set up conversation memory with context retention
- [ ] Configure streaming capabilities

#### Step 2.3: Tool Development
1. **Country Information Tool**
   - [ ] REST Countries API integration
   - [ ] Capital, population, languages data
   - [ ] Fun facts generation
   - [ ] Error handling for unknown countries

2. **Weather Tool**
   - [ ] Open-Meteo API integration (no key required)
   - Current conditions fetching
   - Weather code to description mapping
   - Location geocoding

3. **Distance Calculator Tool**
   - Haversine formula implementation
   - Support for city-to-city calculations
   - Favourite location shortcuts

4. **ASCII Generator Tool**
   - Dynamic ASCII art generation
   - Country-specific patterns
   - Weather condition representations

#### Step 2.4: Streaming Endpoint Enhancement
- Update `/api/stream/route.ts` for Mastra integration
- Implement proper Edge runtime configuration
- Add memory context handling
- Configure thread and user ID management
- Set up error boundaries and fallbacks

### Phase 3: Terminal UI Implementation

#### Step 3.1: Base Terminal Structure
- Create `TerminalUI.tsx` main container
- Implement black background with phosphor green (#00ff00) text
- Set up fixed-width terminal dimensions
- Add terminal frame with title bar "GEOSYS v4.2.1"

#### Step 3.2: CRT Effects Layer
- Implement `CRTEffects.tsx` with CSS filters
- Add scanline overlay animation
- Create screen flicker effect (subtle, random intervals)
- Implement chromatic aberration on edges
- Add subtle screen curvature distortion
- Create phosphor glow effect for text

#### Step 3.3: Boot Sequence Animation
- Create `BootSequence.tsx` component
- Implement typewriter effect for boot messages
- Add progress bar animations
- Include authentic system sounds
- Sequence steps:
  ```
  GEOSYS v4.2.1 INITIALISING...
  CHECKING SYSTEM INTEGRITY... OK
  LOADING WORLD DATABASE... [████████████] 100%
  ESTABLISHING SATELLITE UPLINK... 
  CONNECTION ESTABLISHED
  READY. TYPE 'HELLO' TO BEGIN
  ```

#### Step 3.4: Command Line Interface
- Implement `CommandLine.tsx` with prompt styling
- Add blinking cursor animation
- Create command history (up/down arrows)
- Implement auto-complete for common commands
- Command syntax: `> query: [user input]`
- Add typing sound effects

### Phase 4: ASCII Art System

#### Step 4.1: ASCII Art Library Creation
- Create `ascii-library.ts` with country-specific art
- Implement animation frame sequences
- Design weather condition representations
- Create transition effects between ASCII states

#### Step 4.2: Country-Specific Animations
1. **Japan ASCII Implementation**
   ```
   Cherry blossom falling animation:
   Frame 1:    ✿     ✿
              ╱┃╲   ╱┃╲
   Frame 2:     ✿ ✿
              ╱┃╲ ╱┃╲
   ```

2. **Brazil Carnival Dancers**
   - Multi-frame dance sequence
   - Rhythmic movement patterns
   - Colourful character combinations

3. **Egypt Pyramid Construction**
   - Line-by-line building animation
   - Sand particle effects
   - Hieroglyph decorations

4. **Australia Kangaroo**
   - Hopping animation across screen
   - Trail effect implementation
   - Speed variations

5. **France Eiffel Tower**
   - Assembly from base to top
   - Sparkling light effects
   - Completion celebration

#### Step 4.3: Weather ASCII Integration
- Implement dynamic weather displays
- Animate rain, snow, and sun patterns
- Create smooth transitions between weather states
- Sync with actual weather data from tools

### Phase 5: Living World Globe Implementation

#### Step 5.1: 3D Globe Foundation
- Integrate Three.js or React Three Fiber
- Create low-poly Earth mesh
- Implement rotation controls
- Add breathing animation (scale pulsing)
- Set up camera positioning

#### Step 5.2: Interactive Features
- Mouse drag rotation implementation
- Zoom controls with limits
- Country highlighting on hover
- Click to focus on regions
- Smooth camera transitions

#### Step 5.3: Dynamic Data Visualisation
- Location pin system for mentioned places
- Connection lines between favourites
- Real-time day/night terminator
- Cloud coverage overlay (if available)
- Heat map for conversation topics

#### Step 5.4: Ambient Animations
- Aurora borealis at poles
- Ocean current flows
- Migration path visualisations
- Volcano particle effects
- City lights on night side

### Phase 6: Onboarding Flow with Terminal Style

#### Step 6.1: Terminal-Style Onboarding
- Create retro onboarding sequence
- Each question appears as system prompt
- User types answers in command format
- Progress shown as loading bars
- Questions:
  ```
  > SYSTEM: ENTER FAVOURITE COUNTRY:
  > USER: _
  ```

#### Step 6.2: Preference Storage
- Local storage implementation
- Context integration with Mastra agent
- Preference update mechanism
- Visual confirmation animations

#### Step 6.3: ASCII Art Rewards
- Display country ASCII art after selection
- Celebration animation on completion
- Transition to main terminal interface

### Phase 7: Chat Interface Enhancement

#### Step 7.1: Message Display Styling
- Green phosphor text for all messages
- Typewriter effect for bot responses
- User messages in dimmer green
- Timestamp in corner (military time)
- ASCII dividers between messages

#### Step 7.2: Streaming Integration
- Character-by-character display
- Cursor animation during typing
- Buffer management for smooth display
- Error state handling with glitch effects

#### Step 7.3: Special Effects
- "Signal interference" for loading
- Matrix-style text rain for transitions
- Glitch effects when discovering locations
- Success confirmations with ASCII checkmarks

### Phase 8: Sound Design Implementation

#### Step 8.1: Audio System Setup
- Create `sound-effects.ts` utility
- Implement Web Audio API integration
- Volume controls and muting option
- Preload critical sounds

#### Step 8.2: Sound Library
- Keyboard typing sounds (mechanical)
- Modem dial-up for connections
- Success beeps and error buzzes
- Ambient computer hum
- Boot sequence sounds
- Message received notifications

#### Step 8.3: Interactive Audio
- Click feedback sounds
- Hover effects for interactive elements
- Globe rotation whoosh sounds
- ASCII animation accompaniments

### Phase 9: Command System and Easter Eggs

#### Step 9.1: Command Parser Implementation
- Create command recognition system
- Implement help command with manual
- Add system commands (clear, reset, about)
- Create shortcuts for common queries

#### Step 9.2: Easter Egg Features
- `sudo explore world` - Unlock hidden features
- `hack the planet` - Matrix rain effect
- `/dance` - Trigger party mode with ASCII
- `konami code` - Special animation sequence
- Hidden ASCII art gallery

#### Step 9.3: Advanced Commands
- `map [country]` - Focus globe on location
- `weather [city]` - Quick weather check
- `route [from] [to]` - Calculate distances
- `trivia` - Start geography quiz mode

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