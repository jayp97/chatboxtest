/**
 * WorldGlobe.tsx
 * Advanced 3D globe using Observable techniques with DEM elevation
 * Integrates TopoJSON wireframes, bathymetry textures, and realistic terrain
 */

"use client";

import { useState } from "react";
import { AdvancedWorldGlobe, GlobeControls as GlobeModeControls, type GlobeMode, type GlobeQuality } from "./AdvancedWorldGlobe";

interface WorldGlobeProps {
  showGrid?: boolean;
  animateWireframes?: boolean;
  highlightedContinent?: string | null;
  initialMode?: GlobeMode;
  initialQuality?: GlobeQuality;
  showControls?: boolean;
}

export function WorldGlobe({ 
  showGrid = true, 
  animateWireframes = true, 
  highlightedContinent = null,
  initialMode = 'wireframe',
  initialQuality = 'medium',
  showControls = false
}: WorldGlobeProps = {}) {
  const [mode, setMode] = useState<GlobeMode>(initialMode);
  const [quality, setQuality] = useState<GlobeQuality>(initialQuality);
  
  
  
  return (
    <>
      {/* Advanced globe with Observable techniques */}
      <AdvancedWorldGlobe
        mode={mode}
        quality={quality}
        radius={3} // Much smaller sphere
        enableElevation={mode !== 'wireframe'}
        showGrid={showGrid}
        animated={animateWireframes}
        highlightedCountry={highlightedContinent}
      />
      
      {/* Globe controls (if enabled) */}
      {showControls && (
        <GlobeModeControls
          mode={mode}
          quality={quality}
          onModeChange={setMode}
          onQualityChange={setQuality}
        />
      )}
    </>
  );
}