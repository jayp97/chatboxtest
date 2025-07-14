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
      // Enable/disable specific controls
      enablePan={false} // No panning, only rotation
      enableZoom={true}
      enableRotate={true}
      
      // Zoom constraints
      minDistance={2.5} // 2.5x Earth radius minimum
      maxDistance={6}   // 6x Earth radius maximum
      
      // Rotation settings
      rotateSpeed={0.5}
      zoomSpeed={0.5}
      
      // Damping for smooth movement
      enableDamping={true}
      dampingFactor={0.05}
      
      // Auto-rotation (slow spin when idle)
      autoRotate={true}
      autoRotateSpeed={0.5}
      
      // Constraints
      minPolarAngle={Math.PI * 0.2} // Limit vertical rotation
      maxPolarAngle={Math.PI * 0.8}
    />
  );
}