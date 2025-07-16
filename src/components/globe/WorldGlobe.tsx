/**
 * WorldGlobe.tsx
 * 3D globe using Observable techniques with DEM elevation
 * Integrates TopoJSON wireframes, bathymetry textures, and realistic terrain
 */

"use client";

import { useState } from "react";
import {
  ObservableGlobe,
  ObservableGlobeControls,
  type ObservableGlobeMode,
} from "./ObservableGlobe";

interface WorldGlobeProps {
  animateWireframes?: boolean;
  showControls?: boolean;
}

export function WorldGlobe({
  animateWireframes = true,
  showControls = false,
}: WorldGlobeProps = {}) {
  const [observableMode, setObservableMode] =
    useState<ObservableGlobeMode>("realistic");

  return (
    <>
      <ObservableGlobe
        mode={observableMode}
        radius={4} // Smaller default size for better UX
        animated={animateWireframes}
        threedee={false} // Always disable DEM elevation for smooth sphere
        debugMode={false} // Set to true to test basic sphere rendering
      />

      {/* Observable globe controls (if enabled) */}
      {showControls && (
        <ObservableGlobeControls
          mode={observableMode}
          onModeChange={setObservableMode}
        />
      )}
    </>
  );
}
