/**
 * ObservableGlobe.tsx
 * Direct implementation of Observable-style globe with DEM elevation and bathymetry textures
 * Based on @wolfiex implementation with exact avertex() and vertex() functions
 */

"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { avertex } from "@/utils/coordinate-conversion";
import { loadDEMData, type DEMData } from "@/utils/dem-elevation";
import { loadBathymetryTextures, type BathymetryTextures } from "@/utils/bathymetry-textures";

export type ObservableGlobeMode = 'realistic' | 'wireframe' | 'hybrid';

interface ObservableGlobeProps {
  mode?: ObservableGlobeMode;
  radius?: number;
  animated?: boolean;
  threedee?: boolean; // Enable 3D elevation mapping
  debugMode?: boolean; // Force simple colored material for debugging
}

export function ObservableGlobe({
  mode = 'realistic',
  radius = 5,
  animated = true,
  threedee = false, // Disable 3D elevation for smooth sphere
  debugMode = false,
}: ObservableGlobeProps) {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  const [, setDEMData] = useState<DEMData | null>(null);
  const [bathymetryTextures, setBathymetryTextures] = useState<BathymetryTextures | null>(null);
  const [heightData, setHeightData] = useState<Uint8ClampedArray | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load DEM and bathymetry data
  useEffect(() => {
    const loadGlobeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        
        // Load data in parallel
        const [demResult, bathymetryResult] = await Promise.allSettled([
          threedee ? loadDEMData({ baseRadius: radius }) : Promise.resolve(null),
          loadBathymetryTextures(),
        ]);
        
        // Process DEM data
        if (demResult.status === 'fulfilled' && demResult.value) {
          setDEMData(demResult.value);
          setHeightData(demResult.value.data);
        } else if (threedee) {
          console.error('Failed to load DEM data:', demResult.status === 'rejected' ? demResult.reason : 'Unknown error');
        }
        
        // Process bathymetry textures
        if (bathymetryResult.status === 'fulfilled') {
          setBathymetryTextures(bathymetryResult.value);
        } else {
          console.error('Failed to load bathymetry textures:', bathymetryResult.status === 'rejected' ? bathymetryResult.reason : 'Unknown error');
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    loadGlobeData();
  }, [threedee, radius]);

  // Create Observable-style sphere geometry
  const sphereGeometry = useMemo(() => {
    if (loading) return null;
    
    
    // Create smooth sphere with high segment count for perfect smoothness
    const segments = 128; // High quality smooth sphere regardless of radius
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    
    // Ensure perfect smooth normals for the sphere
    geometry.computeVertexNormals();
    
    // Apply Observable avertex() function to all vertices if 3D is enabled
    if (threedee && heightData) {
      
      const positions = geometry.attributes.position;
      const vertexCount = positions.count;
      
      // Apply avertex to each vertex
      for (let i = 0; i < vertexCount; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        const originalVertex = new THREE.Vector3(x, y, z);
        const elevatedVertex = avertex(originalVertex, heightData, radius);
        
        positions.setXYZ(i, elevatedVertex.x, elevatedVertex.y, elevatedVertex.z);
      }
      
      // Update geometry
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
      
    }
    
    return geometry;
  }, [radius, heightData, threedee, loading]);

  // Create Observable-style material
  const sphereMaterial = useMemo(() => {
    // Debug mode - force simple colored material
    if (debugMode) {
      return new THREE.MeshBasicMaterial({
        color: mode === 'wireframe' ? 0x00ff00 : 0xff6600, // Orange for debug
        wireframe: mode === 'wireframe',
        transparent: false,
        opacity: 1.0,
        side: THREE.FrontSide,
      });
    }
    
    if (!bathymetryTextures || !bathymetryTextures.isLoaded) {
      // Fallback material - make it clearly visible
      return new THREE.MeshBasicMaterial({
        color: mode === 'wireframe' ? 0x00ff00 : 0x4488aa,
        wireframe: mode === 'wireframe',
        transparent: false, // Make solid for fallback
        opacity: 1.0,
        side: THREE.FrontSide,
      });
    }
    
    switch (mode) {
      case 'realistic':
        // Observable-style realistic material with bathymetry textures
        const material = new THREE.MeshBasicMaterial({
          map: bathymetryTextures.diffuse,
          transparent: false,
          opacity: 1.0,
          side: THREE.FrontSide,
        });
        
        // Add alpha map for transparency if available
        if (bathymetryTextures.alpha) {
          material.alphaMap = bathymetryTextures.alpha;
          material.transparent = true;
          material.opacity = 1.0; // Keep full opacity, let alpha map control transparency
        }
        
        return material;
      
      case 'wireframe':
        // Observable-style wireframe material
        return new THREE.MeshBasicMaterial({
          color: 0x4488aa, // Steel blue like Observable
          wireframe: true,
          transparent: false,
          opacity: 1.0,
          side: THREE.FrontSide,
        });
      
      case 'hybrid':
        // Hybrid mode with texture but more visible
        const hybridMaterial = new THREE.MeshBasicMaterial({
          map: bathymetryTextures.diffuse,
          transparent: false,
          opacity: 1.0,
          side: THREE.FrontSide,
        });
        
        if (bathymetryTextures.alpha) {
          hybridMaterial.alphaMap = bathymetryTextures.alpha;
          hybridMaterial.transparent = true;
          hybridMaterial.opacity = 0.8;
        }
        
        return hybridMaterial;
      
      default:
        return new THREE.MeshBasicMaterial({
          map: bathymetryTextures.diffuse,
          transparent: false,
          opacity: 1.0,
          side: THREE.FrontSide,
        });
    }
  }, [bathymetryTextures, mode, debugMode]);
  
  // Debug logging for material state
  useEffect(() => {
  }, [mode, debugMode, bathymetryTextures, sphereMaterial]);

  // Animation frame handler
  useFrame((_, delta) => {
    if (!animated || !sphereRef.current) return;

    // Slow rotation like Observable - rotate around Y axis for proper Earth rotation
    sphereRef.current.rotation.y += delta * 0.05;
  });

  if (loading) {
    return (
      <group name="loading-observable-globe">
        {/* Simple sphere while loading */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial 
            color="#001122" 
            transparent 
            opacity={0.3}
            wireframe 
          />
        </mesh>
      </group>
    );
  }

  if (error) {
    return (
      <group name="error-observable-globe">
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.5} />
        </mesh>
      </group>
    );
  }

  if (!sphereGeometry) {
    return null;
  }

  return (
    <group name="observable-world-globe" position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {/* Main Observable sphere with bathymetry textures */}
      <mesh
        ref={sphereRef}
        geometry={sphereGeometry}
        material={sphereMaterial}
        position={[0, 0, 0]}
        rotation={[Math.PI, 0, 0]} // Flip X-axis so Northern Hemisphere is at top
        castShadow
        receiveShadow
      />
      
      
      {/* Atmosphere glow - only show in realistic mode */}
      {mode !== 'wireframe' && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[radius + 0.3, 32, 32]} />
          <meshBasicMaterial
            color="#004488"
            transparent
            opacity={0.05}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

// Observable Globe Controls component
export function ObservableGlobeControls({
  mode,
  onModeChange,
}: {
  mode: ObservableGlobeMode;
  onModeChange: (mode: ObservableGlobeMode) => void;
}) {
  return (
    <div className="absolute top-4 right-4 bg-black/80 p-4 rounded border border-blue-500 text-blue-400 font-mono text-sm">
      <div className="mb-2">
        <span className="text-blue-300">OBSERVABLE MODE:</span>
        <div className="flex gap-2 mt-1">
          {(['realistic', 'wireframe', 'hybrid'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-2 py-1 border ${
                mode === m 
                  ? 'border-blue-400 bg-blue-400/20' 
                  : 'border-blue-600 hover:border-blue-400'
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}