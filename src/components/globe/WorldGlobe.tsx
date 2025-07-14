/**
 * WorldGlobe.tsx
 * 3D interactive globe component using React Three Fiber
 * Shows a breathing, rotating Earth with atmospheric effects
 */

"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

export function WorldGlobe() {
  const globeRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  
  // Animate rotation and breathing effect
  useFrame((state, delta) => {
    if (globeRef.current) {
      // Slow rotation
      globeRef.current.rotation.y += delta * 0.1;
      
      // Subtle breathing effect
      const breathScale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
      globeRef.current.scale.setScalar(breathScale);
    }
    
    if (atmosphereRef.current) {
      // Counter-rotate atmosphere for effect
      atmosphereRef.current.rotation.y -= delta * 0.05;
    }
  });
  
  return (
    <group>
      {/* Main Earth sphere */}
      <Sphere
        ref={globeRef}
        args={[1, 64, 64]}
        position={[0, 0, 0]}
      >
        <meshPhongMaterial
          color="#004488"
          emissive="#001122"
          emissiveIntensity={0.1}
          shininess={10}
          specular="#0088ff"
        />
      </Sphere>
      
      {/* Atmosphere layer */}
      <Sphere
        ref={atmosphereRef}
        args={[1.02, 64, 64]}
        position={[0, 0, 0]}
      >
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Outer glow */}
      <Sphere
        args={[1.15, 32, 32]}
        position={[0, 0, 0]}
      >
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
}