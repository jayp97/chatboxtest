/**
 * LocationPins.tsx
 * Location pin management component for the 3D globe
 * Displays interactive pins for mentioned locations
 */

"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Text } from "@react-three/drei";
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
  const pinRef = useRef<THREE.Mesh>(null);
  
  // Convert lat/lng to 3D coordinates using existing vertex function
  const globePosition = vertex([location.lng, location.lat], globeRadius);
  
  // Position pin slightly above globe surface
  const pinRadius = globeRadius + 0.1;
  const pinPosition = vertex([location.lng, location.lat], pinRadius);
  
  // Pin colors based on type
  const colors = {
    favourite: "#ffd700", // Gold
    recent: "#00ff00",    // Green
    current: "#ff00ff",   // Magenta
    historical: "#888888" // Gray
  };
  
  // Animate pulsing for current location
  useFrame((state) => {
    if (pinRef.current && location.type === "current") {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      pinRef.current.scale.setScalar(scale);
    }
  });
  
  // Scale pin size based on globe radius for consistency
  const pinSize = globeRadius * 0.01; // Relative to globe size
  const glowSize = pinSize * 2;
  const textSize = globeRadius * 0.02;
  const textOffset = globeRadius * 0.02;
  
  return (
    <group position={[pinPosition.x, pinPosition.y, pinPosition.z]}>
      {/* Pin sphere */}
      <Sphere
        ref={pinRef}
        args={[pinSize, 16, 16]}
      >
        <meshBasicMaterial
          color={colors[location.type]}
          emissive={colors[location.type]}
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      {/* Pin glow */}
      <Sphere
        args={[glowSize, 16, 16]}
      >
        <meshBasicMaterial
          color={colors[location.type]}
          transparent
          opacity={0.3}
        />
      </Sphere>
      
      {/* Location label (only for favourite locations) */}
      {location.type === "favourite" && (
        <Text
          position={[0, textOffset, 0]}
          fontSize={textSize}
          color={colors[location.type]}
          anchorX="center"
          anchorY="middle"
        >
          {location.name}
        </Text>
      )}
    </group>
  );
}

export function LocationPins({ locations, globeRadius = 3 }: LocationPinsProps) {
  return (
    <group name="location-pins">
      {locations.map((location) => (
        <LocationPin 
          key={location.id} 
          location={location} 
          globeRadius={globeRadius}
        />
      ))}
    </group>
  );
}