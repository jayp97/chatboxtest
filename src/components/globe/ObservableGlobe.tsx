/**
 * ObservableGlobe.tsx
 * Simplified globe with realistic rendering using bathymetry textures
 * Based on Observable implementation
 */

"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { loadBathymetryTextures, type BathymetryTextures } from "@/utils/bathymetry-textures";

interface ObservableGlobeProps {
  radius?: number;
  animated?: boolean;
}

export function ObservableGlobe({
  radius = 5,
  animated = true,
}: ObservableGlobeProps) {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  const [bathymetryTextures, setBathymetryTextures] = useState<BathymetryTextures | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bathymetry textures
  useEffect(() => {
    const loadGlobeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const textures = await loadBathymetryTextures();
        setBathymetryTextures(textures);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    loadGlobeData();
  }, []);

  // Create sphere geometry
  const sphereGeometry = useMemo(() => {
    if (loading) return null;
    
    // Create smooth sphere with high segment count for perfect smoothness
    const segments = 128; // High quality smooth sphere
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    
    // Ensure perfect smooth normals for the sphere
    geometry.computeVertexNormals();
    
    return geometry;
  }, [radius, loading]);

  // Create realistic material with bathymetry textures
  const sphereMaterial = useMemo(() => {
    if (!bathymetryTextures || !bathymetryTextures.isLoaded) {
      // Fallback material
      return new THREE.MeshBasicMaterial({
        color: 0x4488aa,
        transparent: false,
        opacity: 1.0,
        side: THREE.FrontSide,
      });
    }
    
    // Realistic material with bathymetry textures
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
  }, [bathymetryTextures]);
  
  // Animation frame handler
  useFrame((_, delta) => {
    if (!animated) return;

    // Slow rotation like Observable - rotate around Y axis for proper Earth rotation
    const rotationSpeed = delta * 0.05;
    
    if (sphereRef.current) {
      sphereRef.current.rotation.y += rotationSpeed;
    }
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
      {/* Main sphere with bathymetry textures */}
      <mesh
        ref={sphereRef}
        geometry={sphereGeometry}
        material={sphereMaterial}
        position={[0, 0, 0]}
        rotation={[Math.PI, 0, 0]} // Flip X-axis so Northern Hemisphere is at top
        castShadow
        receiveShadow
      />
      
      {/* Atmosphere glow */}
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
    </group>
  );
}