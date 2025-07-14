/**
 * StarField.tsx
 * Animated star field background for the globe
 * Creates a subtle space environment
 */

"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

export function StarField() {
  const starsRef = useRef<THREE.Points>(null);
  
  // Generate random star positions
  const starPositions = useMemo(() => {
    const positions = new Float32Array(2000 * 3); // 2000 stars
    
    for (let i = 0; i < 2000; i++) {
      // Create stars in a sphere around the globe
      const radius = 50 + Math.random() * 50; // Distance from center
      const theta = Math.random() * Math.PI * 2; // Horizontal angle
      const phi = Math.random() * Math.PI; // Vertical angle
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);     // x
      positions[i * 3 + 1] = radius * Math.cos(phi);                   // y
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta); // z
    }
    
    return positions;
  }, []);
  
  // Slowly rotate the star field
  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.001; // Very slow rotation
      starsRef.current.rotation.x += delta * 0.0005;
    }
  });
  
  return (
    <Points
      ref={starsRef}
      positions={starPositions}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
}