/**
 * WorldGlobe.tsx
 * Advanced 3D globe using Observable techniques with DEM elevation
 * Integrates TopoJSON wireframes, bathymetry textures, and realistic terrain
 */

"use client";

import { useState } from "react";
import {
  AdvancedWorldGlobe,
  type GlobeQuality,
} from "./AdvancedWorldGlobe";
import {
  ObservableGlobe,
  ObservableGlobeControls,
  type ObservableGlobeMode,
} from "./ObservableGlobe";

interface WorldGlobeProps {
  showGrid?: boolean;
  animateWireframes?: boolean;
  initialQuality?: GlobeQuality;
  showControls?: boolean;
  useObservable?: boolean; // Use Observable-style globe with textures
}

export function WorldGlobe({
  showGrid = true,
  animateWireframes = true,
  initialQuality = "medium",
  showControls = false,
  useObservable = true, // Default to Observable globe with textures
}: WorldGlobeProps = {}) {
  const [quality] = useState<GlobeQuality>(initialQuality);
  const [observableMode, setObservableMode] =
    useState<ObservableGlobeMode>("realistic");

  return (
    <>
      {useObservable ? (
        /* Observable globe with DEM elevation and bathymetry textures */
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
      ) : (
        /* Advanced globe with wireframes */
        <>
          <AdvancedWorldGlobe
            quality={quality}
            radius={4} // Smaller default size for better UX
            enableElevation={true}
            showGrid={showGrid}
            animated={animateWireframes}
          />

          {/* Advanced globe controls removed - component no longer exists */}
        </>
      )}
    </>
  );
}
