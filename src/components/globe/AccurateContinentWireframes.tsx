/**
 * AccurateContinentWireframes.tsx
 * Renders accurate continent wireframes using real GeoJSON data
 * Based on Observable Three.js techniques for geographic coordinate conversion
 */

"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { 
  loadContinentData, 
  createContinentWireframe, 
  createLatitudeLineGeometry,
  createLongitudeLineGeometry,
  simplifyPolygon,
  type ContinentGeoData 
} from "@/utils/continent-coordinates";
import { getNeonMaterialManager } from "@/utils/neon-materials";

interface AccurateContinentWireframesProps {
  visible?: boolean;
  animated?: boolean;
  highlightedContinent?: string | null;
  simplificationLevel?: number; // 0 = full detail, higher = more simplified
}

interface WireframeGroup {
  continent: ContinentGeoData;
  lines: THREE.Line[];
  group: THREE.Group;
}

export function AccurateContinentWireframes({ 
  visible = true, 
  animated = true, 
  highlightedContinent = null,
  simplificationLevel = 1
}: AccurateContinentWireframesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wireframeRefs = useRef<WireframeGroup[]>([]);
  const [continentData, setContinentData] = useState<ContinentGeoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredContinent, setHoveredContinent] = useState<string | null>(null);
  
  const materialManager = getNeonMaterialManager();

  // Load real continent data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await loadContinentData();
        setContinentData(data);
      } catch (error) {
        console.error('Failed to load continent data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Create wireframe geometries from real geographic data
  const wireframes = useMemo(() => {
    if (loading || continentData.length === 0) return [];
    
    const wireframeObjects: WireframeGroup[] = [];

    continentData.forEach(continent => {
      const group = new THREE.Group();
      group.name = continent.name;
      const lines: THREE.Line[] = [];

      // Simplify coordinates if requested
      const processedPolygons = continent.multiPolygon.map(polygon => 
        simplificationLevel > 0 ? simplifyPolygon(polygon, simplificationLevel) : polygon
      );

      // Create wireframe geometries for each polygon
      const geometries = createContinentWireframe({
        ...continent,
        multiPolygon: processedPolygons
      });

      geometries.forEach((geometry, index) => {
        // Determine material based on state
        let material: THREE.LineBasicMaterial;
        
        if (continent.name === highlightedContinent || continent.name === hoveredContinent) {
          material = materialManager.createHighlightMaterial();
        } else {
          material = animated 
            ? materialManager.createPulsingMaterial() 
            : materialManager.getContinentLines();
        }

        const line = new THREE.Line(geometry, material);
        line.name = `${continent.name}-polygon-${index}`;
        
        // Add slight offset to prevent z-fighting
        line.position.setLength(0.001 * index);
        
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
  }, [continentData, loading, highlightedContinent, hoveredContinent, animated, simplificationLevel, materialManager]);

  // Animation frame handler
  useFrame((state) => {
    if (!animated || !groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Update pulsing materials
    materialManager.updatePulsingMaterials(time);

    // Subtle rotation for dynamic effect
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005; // Very slow rotation
    }

    // Update individual continent animations
    wireframeRefs.current.forEach((wireframe, index) => {
      const phase = (index * Math.PI * 0.2) + time * 0.3;
      const scale = 1 + Math.sin(phase) * 0.001; // Very subtle breathing
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
    console.log(`Clicked continent: ${continentName}`);
    // Could emit event for terminal integration
  };

  if (!visible || loading) return null;

  return (
    <group ref={groupRef} name="accurate-continent-wireframes">
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

// Enhanced globe grid with more accurate spacing
export function AccurateGlobeGrid({ 
  visible = true, 
  opacity = 0.15,
  latitudeSpacing = 15,
  longitudeSpacing = 15
}: { 
  visible?: boolean; 
  opacity?: number;
  latitudeSpacing?: number;
  longitudeSpacing?: number;
}) {
  const gridRef = useRef<THREE.Group>(null);

  // Create grid line geometries with accurate geographic spacing
  const gridLines = useMemo(() => {
    const lines: THREE.Line[] = [];
    const materialManager = getNeonMaterialManager();

    // Latitude lines (horizontal circles)
    for (let lat = -75; lat <= 75; lat += latitudeSpacing) {
      const geometry = createLatitudeLineGeometry(lat, 1.001);
      const material = materialManager.createWireframeMaterial({
        colour: "#00ff0020",
        opacity: opacity * (lat === 0 ? 1.5 : 1), // Emphasize equator
        linewidth: lat === 0 ? 2 : 1,
      });
      const line = new THREE.Line(geometry, material);
      line.name = `latitude-${lat}`;
      lines.push(line);
    }

    // Longitude lines (vertical meridians)
    for (let lng = -180; lng < 180; lng += longitudeSpacing) {
      const geometry = createLongitudeLineGeometry(lng, 1.001);
      const material = materialManager.createWireframeMaterial({
        colour: "#00ff0020",
        opacity: opacity * (lng === 0 ? 1.5 : 1), // Emphasize prime meridian
        linewidth: lng === 0 ? 2 : 1,
      });
      const line = new THREE.Line(geometry, material);
      line.name = `longitude-${lng}`;
      lines.push(line);
    }

    return lines;
  }, [opacity, latitudeSpacing, longitudeSpacing]);

  if (!visible) return null;

  return (
    <group ref={gridRef} name="accurate-globe-grid">
      {gridLines.map((line, index) => (
        <primitive key={index} object={line} />
      ))}
    </group>
  );
}

// Loading indicator for continent data
export function ContinentLoadingIndicator({ visible }: { visible: boolean }) {
  const [dots, setDots] = useState("");
  
  useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <mesh position={[0, 0, 2]}>
      <planeGeometry args={[3, 0.5]} />
      <meshBasicMaterial 
        color="#00ff00" 
        transparent 
        opacity={0.8}
      />
      {/* Loading text: {dots} - would need text geometry in real implementation */}
    </mesh>
  );
}