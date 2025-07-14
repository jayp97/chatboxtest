/**
 * GlobeControls.tsx
 * Globe interaction controls using React Three Drei
 * Handles rotation, zoom, and smooth camera movements
 */

"use client";

import { OrbitControls } from "@react-three/drei";

export function GlobeControls() {
  return (
    <OrbitControls
      // Enable zoom and rotation for interactive globe
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      
      // Zoom constraints
      minDistance={6}
      maxDistance={25}
      
      // Smooth damping
      enableDamping={true}
      dampingFactor={0.05}
      
      // No auto-rotation of camera
      autoRotate={false}
    />
  );
}