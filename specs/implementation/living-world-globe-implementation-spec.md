# Living World Globe Implementation Specification

## Date: 2025-07-14

## Feature: Interactive 3D Globe Companion for GEOSYS Terminal

## Overview

This specification details the implementation of an interactive 3D globe that will be displayed on the right side of the page, complementing the terminal UI on the left. The globe will visualise geographic data, show user preferences, and create an immersive "living world" experience.

## Layout Architecture

### Screen Division
- **Left Side (60% width)**: Terminal UI
- **Right Side (40% width)**: Living World Globe
- **Responsive Breakpoint**: Stack vertically on screens < 1024px

## Implementation Phases

### Phase 1: Foundation and Layout Setup

#### Step 1.1: Layout Restructuring
- [ ] Update `src/app/page.tsx` to create split-screen layout
- [ ] Create flex container with proper proportions (60/40 split)
- [ ] Implement responsive breakpoints for mobile devices
- [ ] Add resize handler for dynamic adjustments
- [ ] Create backdrop gradient for visual separation

#### Step 1.2: Three.js Integration
- [ ] Install required dependencies:
  ```bash
  pnpm install three @react-three/fiber @react-three/drei @react-three/postprocessing
  pnpm install -D @types/three
  ```
- [ ] Set up Three.js canvas container
- [ ] Configure WebGL renderer settings
- [ ] Implement performance monitoring
- [ ] Add fallback for WebGL unsupported browsers

#### Step 1.3: Globe Container Component
- [ ] Create `src/components/globe/GlobeContainer.tsx`
- [ ] Implement proper sizing and aspect ratio
- [ ] Add loading state with terminal-style loader
- [ ] Set up error boundaries for 3D rendering
- [ ] Create performance optimisation controls

### Phase 2: 3D Globe Core Implementation

#### Step 2.1: Earth Mesh Creation
- [ ] Update `src/components/globe/WorldGlobe.tsx` with Three.js implementation
- [ ] Create Earth sphere geometry (segments: 64x64)
- [ ] Implement custom shader for atmosphere effect
- [ ] Add earth texture mapping:
  - [ ] Day texture (8K downsampled to 2K for performance)
  - [ ] Night texture with city lights
  - [ ] Normal map for terrain elevation
  - [ ] Specular map for water reflection
  - [ ] Cloud layer with transparency

#### Step 2.2: Lighting System
- [ ] Add directional light for sun simulation
- [ ] Implement ambient light for base illumination
- [ ] Create dynamic light position based on real time
- [ ] Add rim lighting for atmospheric glow
- [ ] Implement shadow mapping for realism

#### Step 2.3: Atmosphere and Effects
- [ ] Create atmospheric scattering shader
- [ ] Implement glowing edge effect
- [ ] Add star field background
- [ ] Create aurora borealis shader for poles
- [ ] Implement cloud shadow casting

### Phase 3: Globe Interactions

#### Step 3.1: Camera Controls
- [ ] Update `src/components/globe/GlobeControls.tsx`
- [ ] Implement OrbitControls with constraints:
  - [ ] Min zoom: 1.5x Earth radius
  - [ ] Max zoom: 4x Earth radius
  - [ ] Rotation damping: 0.05
  - [ ] Pan disabled (rotation only)
- [ ] Add smooth camera transitions
- [ ] Implement focus-on-location functionality
- [ ] Create zoom-to-country animations

#### Step 3.2: Mouse Interactions
- [ ] Implement raycasting for mouse detection
- [ ] Add country/region highlighting on hover
- [ ] Create tooltip system showing country names
- [ ] Implement click-to-focus behaviour
- [ ] Add right-click context menu for locations

#### Step 3.3: Touch Controls (Mobile)
- [ ] Implement pinch-to-zoom
- [ ] Add single-finger rotation
- [ ] Create momentum scrolling
- [ ] Implement double-tap to focus
- [ ] Add gesture hints overlay

### Phase 4: Dynamic Data Visualisation

#### Step 4.1: Location Pin System
- [ ] Update `src/components/globe/LocationPins.tsx`
- [ ] Create 3D pin geometry with animations
- [ ] Implement pin types:
  - [ ] User favourite locations (gold pins)
  - [ ] Recently mentioned places (green pins)
  - [ ] Current query location (pulsing pin)
  - [ ] Historical searches (faded pins)
- [ ] Add pin clustering for zoom levels
- [ ] Create pin labels with occlusion handling

#### Step 4.2: Connection Visualisation
- [ ] Implement curved path generation between points
- [ ] Create animated particle system along paths
- [ ] Add different path styles:
  - [ ] Distance calculations (dashed line)
  - [ ] Travel routes (animated arrows)
  - [ ] Favourite connections (golden threads)
- [ ] Implement path glow effects
- [ ] Add distance labels on paths

#### Step 4.3: Data Overlays
- [ ] Create heatmap shader for topic density
- [ ] Implement country colouring by data:
  - [ ] Population density
  - [ ] Temperature/weather
  - [ ] User interest level
- [ ] Add toggle controls for overlay types
- [ ] Create smooth transitions between overlays

### Phase 5: Living World Features

#### Step 5.1: Real-time Environmental Effects
- [ ] Implement day/night terminator line
- [ ] Calculate sun position based on actual time
- [ ] Add seasonal tilt adjustments
- [ ] Create realistic shadow rendering
- [ ] Implement twilight zone gradient

#### Step 5.2: Animated Weather System
- [ ] Create particle system for weather:
  - [ ] Rain particles with splash effects
  - [ ] Snow accumulation shader
  - [ ] Storm clouds with lightning
  - [ ] Sandstorm particle effects
- [ ] Sync with weather tool data
- [ ] Add wind direction visualisation
- [ ] Create weather transition animations

#### Step 5.3: Breathing Globe Animation
- [ ] Implement subtle scale pulsing (0.98-1.02)
- [ ] Add rotation wobble for organic feel
- [ ] Create tectonic plate shift animations
- [ ] Implement ocean current flow lines
- [ ] Add atmospheric particle movements

#### Step 5.4: Special Effects Library
- [ ] Volcano eruption particle system
- [ ] Earthquake ripple effects
- [ ] Aurora borealis animated shader
- [ ] Meteor shower background events
- [ ] Solar flare impacts on atmosphere

### Phase 6: Terminal Integration

#### Step 6.1: Command-Globe Synchronisation
- [ ] Create globe command interface:
  - [ ] `/globe focus [country]` - Center on location
  - [ ] `/globe zoom [level]` - Adjust zoom
  - [ ] `/globe overlay [type]` - Change data overlay
  - [ ] `/globe animate [on/off]` - Toggle animations
- [ ] Implement command parsing and execution
- [ ] Add visual feedback for commands
- [ ] Create help documentation

#### Step 6.2: Real-time Updates
- [ ] Connect globe to agent responses
- [ ] Highlight mentioned countries automatically
- [ ] Show flight paths for distance calculations
- [ ] Display weather conditions on globe
- [ ] Animate to locations during conversations

#### Step 6.3: Preference Visualisation
- [ ] Show user's favourite country with special effects
- [ ] Create connection lines between preferences
- [ ] Add preference badges on locations
- [ ] Implement preference-based colour themes
- [ ] Create celebration animation for new preferences

### Phase 7: Performance Optimisation

#### Step 7.1: Level of Detail (LOD) System
- [ ] Implement multiple mesh resolutions
- [ ] Create distance-based LOD switching
- [ ] Optimise texture resolutions by zoom level
- [ ] Reduce particle counts at distance
- [ ] Implement frustum culling

#### Step 7.2: Rendering Optimisation
- [ ] Enable instanced rendering for pins
- [ ] Implement texture atlasing
- [ ] Create efficient shader programs
- [ ] Use geometry merging where possible
- [ ] Implement requestAnimationFrame throttling

#### Step 7.3: Memory Management
- [ ] Implement texture disposal system
- [ ] Create geometry pooling
- [ ] Add resource usage monitoring
- [ ] Implement dynamic quality adjustment
- [ ] Create WebGL context loss recovery

### Phase 8: Visual Polish

#### Step 8.1: Post-processing Effects
- [ ] Add bloom effect for glowing elements
- [ ] Implement FXAA anti-aliasing
- [ ] Create depth of field for close zooms
- [ ] Add chromatic aberration (subtle)
- [ ] Implement vignette effect

#### Step 8.2: Terminal-Themed Styling
- [ ] Create retro-futuristic globe shader
- [ ] Add scan line effect overlay
- [ ] Implement phosphor glow for pins
- [ ] Create digital glitch transitions
- [ ] Add CRT curve distortion (optional)

#### Step 8.3: Colour Theming
- [ ] Implement configurable colour schemes:
  - [ ] Classic (green phosphor theme)
  - [ ] Amber (vintage monitor)
  - [ ] Blue (modern terminal)
  - [ ] High contrast mode
- [ ] Create smooth theme transitions
- [ ] Sync with terminal colour scheme

### Phase 9: Accessibility and Mobile

#### Step 9.1: Accessibility Features
- [ ] Add keyboard navigation for globe
- [ ] Implement screen reader descriptions
- [ ] Create high contrast overlay mode
- [ ] Add reduced motion options
- [ ] Implement focus indicators

#### Step 9.2: Mobile Optimisation
- [ ] Create mobile-specific layout
- [ ] Implement progressive quality reduction
- [ ] Add mobile-optimised controls
- [ ] Create compact pin representations
- [ ] Implement battery-saving mode

#### Step 9.3: Progressive Enhancement
- [ ] Create static fallback image
- [ ] Implement 2D map alternative
- [ ] Add feature detection
- [ ] Create graceful degradation path
- [ ] Implement offline capabilities

### Phase 10: Testing and Documentation

#### Step 10.1: Performance Testing
- [ ] Create FPS monitoring system
- [ ] Implement automated performance tests
- [ ] Add memory leak detection
- [ ] Create stress test scenarios
- [ ] Document performance baselines

#### Step 10.2: Integration Testing
- [ ] Test all terminal commands
- [ ] Verify data synchronisation
- [ ] Test responsive behaviours
- [ ] Validate touch interactions
- [ ] Create visual regression tests

#### Step 10.3: Documentation
- [ ] Create technical documentation
- [ ] Write user guide for globe features
- [ ] Document performance best practices
- [ ] Create troubleshooting guide
- [ ] Add inline code comments

## Technical Specifications

### Performance Requirements
- Target FPS: 60 on modern hardware, 30 on mobile
- Initial load time: < 2 seconds
- Memory usage: < 200MB
- GPU usage: < 50% on average hardware

### Browser Support
- Chrome 90+ (full features)
- Firefox 88+ (full features)
- Safari 14+ (with WebGL2 fallback)
- Edge 90+ (full features)
- Mobile browsers with WebGL support

### Dependencies
```json
{
  "three": "^0.160.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.92.0",
  "@react-three/postprocessing": "^2.15.0",
  "leva": "^0.9.35" // For debug controls
}
```

### Asset Requirements
- Earth day texture: 2048x1024px
- Earth night texture: 2048x1024px
- Earth normal map: 2048x1024px
- Cloud texture: 2048x1024px
- Star field: 4096x2048px

## Implementation Priority

1. **Core Globe** (Phase 1-2): Essential 3D earth rendering
2. **Basic Interactions** (Phase 3): User can rotate and zoom
3. **Terminal Integration** (Phase 6): Connect to chat system
4. **Location Pins** (Phase 4.1): Show mentioned places
5. **Living Features** (Phase 5): Add life to the globe
6. **Performance** (Phase 7): Optimise for all devices
7. **Polish** (Phase 8-9): Enhance visual quality
8. **Advanced Features**: Additional overlays and effects

## Success Metrics

- Smooth 60 FPS performance on target hardware
- < 3 second load time for globe
- Intuitive interaction without instruction
- Seamless integration with terminal commands
- Positive user feedback on visual appeal
- No WebGL crashes or memory leaks
- Accessible to users with disabilities
- Mobile-friendly experience

## Risk Mitigation

- **WebGL Support**: Provide 2D fallback map
- **Performance Issues**: Implement quality settings
- **Large Assets**: Use progressive loading
- **Memory Leaks**: Regular profiling and testing
- **Browser Compatibility**: Feature detection and polyfills