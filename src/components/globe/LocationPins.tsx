/**
 * LocationPins.tsx
 * Location pin management component for the 3D globe
 * Displays interactive pins for mentioned locations
 */

"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { vertex } from "@/utils/coordinate-conversion";

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "favourite" | "recent" | "current" | "historical";
}

interface LocationPinsProps {
  locations: Location[];
  globeRadius?: number; // Allow passing globe radius for proper scaling
}

function LocationPin({ location, globeRadius = 3 }: { location: Location; globeRadius?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // Convert lat/lng to 3D coordinates using existing vertex function
  const pinRadius = globeRadius + 0.1; // Slightly above globe surface
  const pinPosition = vertex([location.lng, location.lat], pinRadius);
  
  // Debug log the position
  console.log(`📍 Pin "${location.name}" at lat:${location.lat} lng:${location.lng} -> pos:`, {
    x: pinPosition.x.toFixed(2), 
    y: pinPosition.y.toFixed(2), 
    z: pinPosition.z.toFixed(2)
  });
  
  // Pin colors based on type
  const colors = {
    favourite: "#ffd700", // Gold
    recent: "#00ff00",    // Green
    current: "#ff00ff",   // Magenta
    historical: "#888888" // Gray
  };
  
  // Animate pulsing for favourite locations
  useFrame((state) => {
    if (meshRef.current && location.type === "favourite") {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
  });
  
  // Scale pin size based on globe radius
  const pinSize = globeRadius * 0.03; // Visible size
  const glowSize = pinSize * 2;
  
  return (
    <group 
      ref={groupRef}
      position={[pinPosition.x, pinPosition.y, pinPosition.z]}
    >
      {/* Pin sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[pinSize, 16, 16]} />
        <meshBasicMaterial color={colors[location.type]} />
      </mesh>
      
      {/* Pin glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[glowSize, 16, 16]} />
        <meshBasicMaterial 
          color={colors[location.type]} 
          transparent 
          opacity={0.3} 
        />
      </mesh>
    </group>
  );
}

export function LocationPins({ locations, globeRadius = 3 }: LocationPinsProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Rotate pins WITH the globe to keep them over their geographic locations
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Globe rotates at delta * 0.05 around Y axis
      // Reverse direction to match globe rotation
      groupRef.current.rotation.y -= delta * 0.05;
    }
  });
  
  // Debug log locations
  console.log('📍 [DEBUG] LocationPins rendering with:', {
    locationCount: locations.length,
    globeRadius,
    locations: locations.map(loc => ({
      name: loc.name,
      lat: loc.lat,
      lng: loc.lng,
      type: loc.type
    }))
  });
  
  return (
    <group 
      ref={groupRef} 
      name="location-pins"
      // No rotation - pins use world coordinates directly
    >
      {locations.map((location) => {
        return (
          <LocationPin 
            key={location.id} 
            location={location} 
            globeRadius={globeRadius}
          />
        );
      })}
    </group>
  );
}