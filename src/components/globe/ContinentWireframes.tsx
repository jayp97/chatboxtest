/**
 * ContinentWireframes.tsx
 * Renders continent outlines as glowing neon green wireframes
 * Uses simplified continent data to create cyberpunk-style geography
 */

"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { continentOutlines, type ContinentOutline } from "@/utils/continent-data";
import { getNeonMaterialManager } from "@/utils/neon-materials";

interface ContinentWireframesProps {
  visible?: boolean;
  animated?: boolean;
  highlightedContinent?: string | null;
}

interface WireframeRef {
  continent: ContinentOutline;
  lines: THREE.Line[];
  group: THREE.Group;
}

export function ContinentWireframes({ 
  visible = true, 
  animated = true, 
  highlightedContinent = null 
}: ContinentWireframesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wireframeRefs = useRef<WireframeRef[]>([]);
  const [hoveredContinent, setHoveredContinent] = useState<string | null>(null);
  
  const materialManager = getNeonMaterialManager();

  // Create wireframe geometries and materials
  const wireframes = useMemo(() => {
    const manager = getNeonMaterialManager();
    const wireframeObjects: WireframeRef[] = [];

    continentOutlines.forEach(continent => {
      const group = new THREE.Group();
      group.name = continent.name;
      const lines: THREE.Line[] = [];

      continent.paths.forEach((path, pathIndex) => {
        // Create line geometry from lat/lng coordinates
        const geometry = manager.createLineGeometry(path);
        
        // Determine material based on state
        let material: THREE.LineBasicMaterial;
        
        if (continent.name === highlightedContinent || continent.name === hoveredContinent) {
          material = manager.createHighlightMaterial();
        } else {
          material = animated 
            ? manager.createPulsingMaterial() 
            : manager.getContinentLines();
        }

        const line = new THREE.Line(geometry, material);
        line.name = `${continent.name}-path-${pathIndex}`;
        
        // Add slight offset to prevent z-fighting
        line.position.setLength(0.001 * pathIndex);
        
        lines.push(line);
        group.add(line);
      });

      wireframeObjects.push({
        continent,
        lines,
        group
      });
    });

    wireframeRefs.current = wireframeObjects;
    return wireframeObjects;
  }, [highlightedContinent, hoveredContinent, animated]);

  // Animation frame handler
  useFrame((state) => {
    if (!animated || !groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Update pulsing materials
    materialManager.updatePulsingMaterials(time);

    // Subtle rotation for dynamic effect
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001; // Very slow rotation
    }

    // Update individual continent animations
    wireframeRefs.current.forEach((wireframe, index) => {
      const phase = (index * Math.PI * 0.3) + time * 0.5;
      const scale = 1 + Math.sin(phase) * 0.002; // Very subtle breathing
      wireframe.group.scale.setScalar(scale);
    });
  });

  // Handle mouse interactions
  const handlePointerOver = (continentName: string) => {
    setHoveredContinent(continentName);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    setHoveredContinent(null);
    document.body.style.cursor = "default";
  };

  const handleClick = (continentName: string) => {
    // Could emit event for terminal integration
    console.log(`Clicked continent: ${continentName}`);
  };

  if (!visible) return null;

  return (
    <group ref={groupRef} name="continent-wireframes">
      {wireframes.map((wireframe) => (
        <primitive 
          key={wireframe.continent.name}
          object={wireframe.group}
          onPointerOver={() => handlePointerOver(wireframe.continent.name)}
          onPointerOut={handlePointerOut}
          onClick={() => handleClick(wireframe.continent.name)}
        />
      ))}
    </group>
  );
}

// Globe grid component for latitude/longitude lines
export function GlobeGrid({ 
  visible = true, 
  opacity = 0.3 
}: { 
  visible?: boolean; 
  opacity?: number; 
}) {
  const gridRef = useRef<THREE.Group>(null);

  // Create grid line geometries
  const gridLines = useMemo(() => {
    const manager = getNeonMaterialManager();
    const lines: THREE.Line[] = [];

    // Latitude lines (horizontal)
    const latitudes = [-60, -30, 0, 30, 60];
    latitudes.forEach(lat => {
      const geometry = manager.createLatitudeLineGeometry(lat);
      const material = manager.createWireframeMaterial({
        colour: "#00ff0030",
        opacity: opacity,
        linewidth: 1,
      });
      const line = new THREE.Line(geometry, material);
      line.name = `latitude-${lat}`;
      lines.push(line);
    });

    // Longitude lines (vertical)
    const longitudes = [-120, -60, 0, 60, 120];
    longitudes.forEach(lng => {
      const geometry = manager.createLongitudeLineGeometry(lng);
      const material = manager.createWireframeMaterial({
        colour: "#00ff0030",
        opacity: opacity,
        linewidth: 1,
      });
      const line = new THREE.Line(geometry, material);
      line.name = `longitude-${lng}`;
      lines.push(line);
    });

    return lines;
  }, [opacity]);

  if (!visible) return null;

  return (
    <group ref={gridRef} name="globe-grid">
      {gridLines.map((line, index) => (
        <primitive key={index} object={line} />
      ))}
    </group>
  );
}