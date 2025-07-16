/**
 * WorldGlobe.tsx
 * 3D globe with realistic rendering using bathymetry textures
 */

"use client";

import { ObservableGlobe } from "./ObservableGlobe";

interface WorldGlobeProps {
  animated?: boolean;
}

export function WorldGlobe({
  animated = true,
}: WorldGlobeProps = {}) {
  return (
    <ObservableGlobe
      radius={4} // Smaller default size for better UX
      animated={animated}
    />
  );
}