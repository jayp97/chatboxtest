/**
 * AdvancedWorldGlobe.tsx
 * Advanced 3D globe using Observable techniques with DEM elevation
 * Combines TopoJSON wireframes, bathymetry textures, and realistic terrain
 */

"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import { TopoJSONWireframes, GraticuleGrid } from "./TopoJSONWireframes";
import {
  loadDEMData,
  applySphereElevation,
  type DEMData,
} from "@/utils/dem-elevation";
import {
  loadBathymetryTextures,
  createBathymetryMaterial,
  createFallbackBathymetryMaterial,
  type BathymetryTextures,
} from "@/utils/bathymetry-textures";
import { getNeonMaterialManager } from "@/utils/neon-materials";

// Globe visual modes
export type GlobeMode = "realistic" | "wireframe" | "hybrid";

// Globe quality settings
export type GlobeQuality = "high" | "medium" | "low";

interface AdvancedWorldGlobeProps {
  mode?: GlobeMode;
  quality?: GlobeQuality;
  radius?: number;
  enableElevation?: boolean;
  showGrid?: boolean;
  animated?: boolean;
}

export function AdvancedWorldGlobe({
  mode = "hybrid",
  quality = "medium",
  radius = 5, // Larger sphere for better visibility
  enableElevation = true,
  showGrid = true,
  animated = true,
}: AdvancedWorldGlobeProps) {
  const globeRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  const [demData, setDEMData] = useState<DEMData | null>(null);
  const [bathymetryTextures, setBathymetryTextures] =
    useState<BathymetryTextures | null>(null);
  const [sphereGeometry, setSphereGeometry] =
    useState<THREE.SphereGeometry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const materialManager = getNeonMaterialManager();

  // Quality-based sphere segments
  const segments = useMemo(() => {
    switch (quality) {
      case "high":
        return Math.floor(radius * 2.6);
      case "medium":
        return Math.floor(radius * 1.8);
      case "low":
        return Math.floor(radius * 1.2);
      default:
        return Math.floor(radius * 1.8);
    }
  }, [quality, radius]);

  // Load DEM and texture data
  useEffect(() => {
    const loadGlobeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load data in parallel
        const [demResult, bathymetryResult] = await Promise.allSettled([
          enableElevation
            ? loadDEMData({ baseRadius: radius })
            : Promise.resolve(null),
          loadBathymetryTextures(),
        ]);

        // Process DEM data
        if (demResult.status === "fulfilled") {
          setDEMData(demResult.value);
        } else if (enableElevation) {
          console.error("Failed to load DEM data:", demResult.reason);
        }

        // Process bathymetry textures
        if (bathymetryResult.status === "fulfilled") {
          setBathymetryTextures(bathymetryResult.value);
        } else {
          console.error(
            "Failed to load bathymetry textures:",
            bathymetryResult.reason
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error("Failed to load globe data:", err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadGlobeData();
  }, [enableElevation, radius]);

  // Create sphere geometry with elevation
  useEffect(() => {
    if (loading) return;

    // Create base sphere geometry
    const geometry = new THREE.SphereGeometry(radius, segments, segments);

    // Apply elevation if DEM data is available and enabled
    if (enableElevation && demData?.isLoaded) {
      applySphereElevation(geometry, demData, { baseRadius: radius });
    }

    setSphereGeometry(geometry);
  }, [demData, enableElevation, radius, segments, loading]);

  // Create sphere material based on mode
  const sphereMaterial = useMemo(() => {
    if (!bathymetryTextures) {
      // Fallback material
      return createFallbackBathymetryMaterial(
        mode === "wireframe" ? "wireframe" : "realistic"
      );
    }

    switch (mode) {
      case "realistic":
        return createBathymetryMaterial(bathymetryTextures, {
          enableWireframe: false,
          transparency: 0.9,
        });

      case "wireframe":
        return materialManager.getBaseSphere();

      case "hybrid":
        return createBathymetryMaterial(bathymetryTextures, {
          enableWireframe: false,
          transparency: 0.7,
        });

      default:
        return createBathymetryMaterial(bathymetryTextures);
    }
  }, [bathymetryTextures, mode, materialManager]);

  // Animation frame handler
  useFrame((state, delta) => {
    if (!animated) return;

    const time = state.clock.elapsedTime;

    // Globe rotation only (like Earth spinning on its axis)
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.1; // Slow steady rotation
    }

    // Atmosphere counter-rotation for subtle effect
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= delta * 0.05;
    }

    // Update material animations
    if (sphereMaterial instanceof THREE.ShaderMaterial) {
      sphereMaterial.uniforms.time.value = time;
    }
  });

  // Determine what wireframes to show based on mode
  const showWireframes = mode === "wireframe" || mode === "hybrid";
  const showTubes = mode === "hybrid" && quality !== "low";

  if (loading) {
    return (
      <group name="loading-globe">
        {/* Simple sphere while loading */}
        <Sphere args={[radius, 32, 32]} position={[0, 0, 0]}>
          <meshBasicMaterial
            color="#001122"
            transparent
            opacity={0.3}
            wireframe
          />
        </Sphere>
      </group>
    );
  }

  if (error) {
    console.error("Advanced Globe Error:", error);
    return (
      <group name="error-globe">
        <Sphere args={[radius, 32, 32]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#ff0000" transparent opacity={0.5} />
        </Sphere>
      </group>
    );
  }

  return (
    <group name="advanced-world-globe" position={[0, 0, 0]}>
      {/* Main globe sphere with elevation and textures */}
      {sphereGeometry && (
        <mesh
          ref={globeRef}
          geometry={sphereGeometry}
          material={sphereMaterial}
          position={[0, 0, 0]}
          castShadow
          receiveShadow
        />
      )}

      {/* TopoJSON wireframes (land and country boundaries) */}
      {showWireframes && (
        <TopoJSONWireframes
          visible={true}
          showLand={true}
          showCountries={mode !== "wireframe"}
          showTubes={showTubes}
          enableElevation={enableElevation}
          resolution={quality}
          radius={radius + 0.05}
          animated={animated}
        />
      )}

      {/* Latitude/longitude grid */}
      {showGrid && (
        <GraticuleGrid
          visible={true}
          opacity={mode === "wireframe" ? 0.4 : 0.2}
          radius={radius + 0.1}
          spacing={15}
        />
      )}

      {/* Atmospheric glow */}
      <Sphere
        ref={atmosphereRef}
        args={[radius + 0.5, 32, 32]}
        position={[0, 0, 0]}
      >
        <meshBasicMaterial
          color={mode === "wireframe" ? "#00ff00" : "#004488"}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Outer glow ring */}
      <Sphere args={[radius + 0.8, 24, 24]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color={mode === "wireframe" ? "#00ff00" : "#0066aa"}
          transparent
          opacity={0.02}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </group>
  );
}

// Globe controls component for mode switching
export function GlobeControls({
  mode,
  quality,
  onModeChange,
  onQualityChange,
}: {
  mode: GlobeMode;
  quality: GlobeQuality;
  onModeChange: (mode: GlobeMode) => void;
  onQualityChange: (quality: GlobeQuality) => void;
}) {
  return (
    <div className="absolute top-4 right-4 bg-black/80 p-4 rounded border border-green-500 text-green-400 font-mono text-sm">
      <div className="mb-2">
        <span className="text-green-300">MODE:</span>
        <div className="flex gap-2 mt-1">
          {(["realistic", "wireframe", "hybrid"] as const).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-2 py-1 border ${
                mode === m
                  ? "border-green-400 bg-green-400/20"
                  : "border-green-600 hover:border-green-400"
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-green-300">QUALITY:</span>
        <div className="flex gap-2 mt-1">
          {(["low", "medium", "high"] as const).map((q) => (
            <button
              key={q}
              onClick={() => onQualityChange(q)}
              className={`px-2 py-1 border ${
                quality === q
                  ? "border-green-400 bg-green-400/20"
                  : "border-green-600 hover:border-green-400"
              }`}
            >
              {q.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
