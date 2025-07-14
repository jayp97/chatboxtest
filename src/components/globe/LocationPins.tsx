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

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "favourite" | "recent" | "current" | "historical";
}

interface LocationPinsProps {
  locations: Location[];
}

function LocationPin({ location }: { location: Location }) {
  const pinRef = useRef<THREE.Mesh>(null);
  
  // Convert lat/lng to 3D coordinates on sphere
  const phi = (90 - location.lat) * (Math.PI / 180);
  const theta = (location.lng + 180) * (Math.PI / 180);
  
  const x = Math.sin(phi) * Math.cos(theta) * 1.05; // Slightly above sphere surface
  const y = Math.cos(phi) * 1.05;
  const z = Math.sin(phi) * Math.sin(theta) * 1.05;
  
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
  
  return (
    <group position={[x, y, z]}>
      {/* Pin sphere */}
      <Sphere
        ref={pinRef}
        args={[0.02, 16, 16]}
      >
        <meshBasicMaterial
          color={colors[location.type]}
          emissive={colors[location.type]}
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      {/* Pin glow */}
      <Sphere
        args={[0.04, 16, 16]}
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
          position={[0, 0.05, 0]}
          fontSize={0.05}
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

export function LocationPins({ locations }: LocationPinsProps) {
  return (
    <group name="location-pins">
      {locations.map((location) => (
        <LocationPin key={location.id} location={location} />
      ))}
    </group>
  );
}