/**
 * TopoJSONWireframes.tsx
 * TopoJSON-based wireframe rendering using Observable techniques
 * Creates accurate continent and country boundary wireframes
 */

"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { vertex } from "@/utils/coordinate-conversion";
import { loadWorldAtlasData, type WorldAtlasData, type MeshData } from "@/utils/topojson-loader";
import { loadDEMData, type DEMData } from "@/utils/dem-elevation";
import { getNeonMaterialManager } from "@/utils/neon-materials";

// Observable wireframe function (exact implementation)
function wireframe(multilinestring: MeshData, radius: number, material: THREE.Material): THREE.LineSegments {
  const vertices: number[] = [];
  
  for (const P of multilinestring.coordinates) {
    for (let p0: THREE.Vector3, p1 = vertex(P[0], radius), i = 1; i < P.length; ++i) {
      p0 = p1;
      p1 = vertex(P[i], radius);
      vertices.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
    }
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  
  return new THREE.LineSegments(geometry, material);
}

// Tube geometry function for 3D borders (Observable technique)
function createTubeGeometry(multilinestring: MeshData, radius: number): THREE.Group {
  const group = new THREE.Group();
  
  for (const coordinates of multilinestring.coordinates) {
    if (coordinates.length < 2) continue;
    
    // Convert coordinates to 3D vertices
    const pathVertices = coordinates.map(coord => vertex(coord, radius));
    
    try {
      // Create curve from vertices
      const curve = new THREE.CatmullRomCurve3(pathVertices);
      const segments = Math.ceil(coordinates.length * 1.5);
      
      // Create tube geometry
      const tubeGeometry = new THREE.TubeGeometry(
        curve,
        segments,
        0.21, // radius
        2,    // radialSegments
        false // closed
      );
      
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color('steelblue'),
        transparent: true,
        opacity: 0.6,
      });
      
      const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
      group.add(tubeMesh);
      
    } catch (error) {
      console.error('Error creating tube geometry:', error);
    }
  }
  
  return group;
}

interface TopoJSONWireframesProps {
  visible?: boolean;
  showLand?: boolean;
  showCountries?: boolean;
  showTubes?: boolean;
  enableElevation?: boolean;
  resolution?: 'high' | 'medium' | 'low';
  radius?: number;
  animated?: boolean;
}

export function TopoJSONWireframes({
  visible = true,
  showLand = true,
  showCountries = true,
  showTubes = false,
  enableElevation = false,
  resolution = 'medium',
  radius = 20, // Made 10x smaller (200 -> 20)
  animated = true
}: TopoJSONWireframesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [worldData, setWorldData] = useState<WorldAtlasData | null>(null);
  const [, setDEMData] = useState<DEMData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const materialManager = getNeonMaterialManager();

  // Load world atlas and DEM data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        
        // Load world atlas data
        const atlasData = await loadWorldAtlasData(resolution);
        setWorldData(atlasData);
        
        // Load DEM data if elevation is enabled
        if (enableElevation) {
          const elevationData = await loadDEMData({ baseRadius: radius });
          setDEMData(elevationData);
        }
        
        
      } catch (err) {
        console.error('Error loading TopoJSON data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [resolution, enableElevation, radius]);

  // Create wireframe geometries from world data
  const wireframes = useMemo(() => {
    if (!worldData) return null;
    
    const group = new THREE.Group();
    
    try {
      // Land boundaries
      if (showLand && worldData.land) {
        const landMaterial = materialManager.createWireframeMaterial({
          colour: "#00ff00",
          opacity: 0.8,
          linewidth: 2,
        });
        
        const landWireframe = wireframe(worldData.land, radius, landMaterial);
        landWireframe.name = "land-boundaries";
        group.add(landWireframe);
      }
      
      // Country boundaries
      if (showCountries && worldData.countries) {
        const countryMaterial = materialManager.createWireframeMaterial({
          colour: "#00cc00",
          opacity: 0.6,
          linewidth: 1,
        });
        
        const countryWireframe = wireframe(worldData.countries, radius + 0.1, countryMaterial);
        countryWireframe.name = "country-boundaries";
        group.add(countryWireframe);
      }
      
      // 3D tube geometries for borders
      if (showTubes && worldData.countries) {
        const tubeGroup = createTubeGeometry(worldData.countries, radius + 0.2);
        tubeGroup.name = "tube-borders";
        group.add(tubeGroup);
      }
      
      // Coastlines (if available)
      if (worldData.coastlines) {
        const coastlineMaterial = materialManager.createWireframeMaterial({
          colour: "#00ffff",
          opacity: 0.4,
          linewidth: 1,
        });
        
        const coastlineWireframe = wireframe(worldData.coastlines, radius + 0.05, coastlineMaterial);
        coastlineWireframe.name = "coastlines";
        group.add(coastlineWireframe);
      }
      
    } catch (err) {
      console.error('Error creating wireframes:', err);
      setError('Failed to create wireframes');
    }
    
    return group;
    
  }, [worldData, showLand, showCountries, showTubes, radius, materialManager]);

  // Animation frame handler
  useFrame((state) => {
    if (!animated || !groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Update pulsing materials
    materialManager.updatePulsingMaterials(time);

    // Subtle rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0002;
    }

    // Animate tube materials if present
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
        if (child.parent?.name === "tube-borders") {
          const opacity = 0.6 + Math.sin(time * 2) * 0.2;
          child.material.opacity = opacity;
        }
      }
    });
  });

  if (!visible || loading) return null;

  if (error) {
    return null;
  }

  return (
    <group ref={groupRef} name="topojson-wireframes">
      {wireframes && <primitive object={wireframes} />}
    </group>
  );
}

// Graticule component (lat/lng grid using Observable technique)
export function GraticuleGrid({
  visible = true,
  opacity = 0.3,
  radius = 20, // Made 10x smaller (200 -> 20)
  spacing = 10
}: {
  visible?: boolean;
  opacity?: number;
  radius?: number;
  spacing?: number;
}) {
  const gridRef = useRef<THREE.Group>(null);
  const materialManager = getNeonMaterialManager();

  // Create graticule using Observable technique
  const graticule = useMemo(() => {
    const lines: Array<Array<[number, number]>> = [];
    
    // Generate meridians (longitude lines)
    for (let x = -180; x <= 180; x += spacing) {
      const meridian: Array<[number, number]> = [];
      for (let y = -80; y <= 80; y += 2.5) {
        meridian.push([x, y]);
      }
      lines.push(meridian);
    }
    
    // Generate parallels (latitude lines)
    for (let y = -80; y <= 80; y += spacing) {
      const parallel: Array<[number, number]> = [];
      for (let x = -180; x <= 180; x += 2.5) {
        parallel.push([x, y]);
      }
      lines.push(parallel);
    }
    
    return { 
      type: "MultiLineString" as const,
      coordinates: lines 
    };
  }, [spacing]);

  const graticuleWireframe = useMemo(() => {
    const material = materialManager.createWireframeMaterial({
      colour: "#00ff0030",
      opacity: opacity,
      linewidth: 1,
    });
    
    return wireframe(graticule, radius, material);
  }, [graticule, radius, opacity, materialManager]);

  if (!visible) return null;

  return (
    <group ref={gridRef} name="graticule-grid">
      <primitive object={graticuleWireframe} />
    </group>
  );
}

// Loading indicator for TopoJSON data
export function TopoJSONLoader({ visible }: { visible: boolean }) {
  const [, setProgress] = useState(0);
  
  useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      setProgress(prev => (prev + 10) % 100);
    }, 200);
    
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <mesh position={[0, 0, 220]}>
      <ringGeometry args={[10, 12, 32]} />
      <meshBasicMaterial 
        color="#00ff00" 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );
}