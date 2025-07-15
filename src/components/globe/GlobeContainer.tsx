/**
 * GlobeContainer.tsx
 * Container component for the retro neon wireframe globe
 * Manages WebGL context and performance optimizations for neon aesthetic
 */

"use client";

import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ErrorBoundary } from "react-error-boundary";
import { WorldGlobe } from "./WorldGlobe";
import { GlobeControls } from "./GlobeControls";
import { LocationPins } from "./LocationPins";
import {
  getUserLocationPins,
  type LocationCoordinate,
} from "@/utils/location-service";
import { preferenceEvents } from "@/utils/preference-events";
// import { Perf } from "@react-three/drei"; // Performance monitor (optional)

interface GlobeContainerProps {
  className?: string;
  showGrid?: boolean;
  animateWireframes?: boolean;
}

// Loading component with terminal style
function GlobeLoader() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="text-center">
        <div className="text-green-400 text-sm font-mono mb-2">
          INITIALIZING NEON GLOBE{dots}
        </div>
        <div className="text-green-400/50 text-xs">
          LOADING WIREFRAME GEOMETRY
        </div>
        <div className="mt-4 w-48 h-1 bg-green-900/50 rounded overflow-hidden">
          <div
            className="h-full bg-green-400 animate-pulse"
            style={{ width: "85%" }}
          />
        </div>
      </div>
    </div>
  );
}

// Error fallback component
function GlobeErrorFallback({ error }: { error: Error }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="text-center max-w-sm">
        <div className="text-red-400 text-sm font-mono mb-2">
          NEON GLOBE ERROR
        </div>
        <div className="text-red-400/70 text-xs mb-4">
          {error.message || "WebGL wireframe rendering failed"}
        </div>
        <div className="text-green-400/50 text-xs">
          The neon wireframe globe requires WebGL support.
          <br />
          Please try a different browser or update your graphics drivers.
        </div>
      </div>
    </div>
  );
}

export function GlobeContainer({
  className = "",
  showGrid = true,
  animateWireframes = true,
}: GlobeContainerProps) {
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocations, setUserLocations] = useState<LocationCoordinate[]>([]);

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setWebGLSupported(!!gl);
    } catch {
      setWebGLSupported(false);
    }

    // Reduced loading time for wireframe system (no textures to load)
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Fetch user location pins for favorite destinations
  useEffect(() => {
    const loadUserLocations = async () => {
      try {
        const locations = await getUserLocationPins();
        setUserLocations(locations);
      } catch (error) {
        console.error('Error loading user locations:', error);
        // Gracefully continue without pins
        setUserLocations([]);
      }
    };

    // Initial load after globe renders
    const initialTimer = setTimeout(loadUserLocations, 1000);

    // Listen for preference updates - NO POLLING!
    const unsubscribe = preferenceEvents.onPreferenceUpdate(() => {
      // Small delay to ensure localStorage is updated
      setTimeout(() => {
        loadUserLocations();
      }, 100);
    });

    return () => {
      clearTimeout(initialTimer);
      unsubscribe();
    };
  }, []);

  if (!webGLSupported) {
    return (
      <GlobeErrorFallback
        error={new Error("WebGL is not supported in your browser")}
      />
    );
  }

  if (isLoading) {
    return <GlobeLoader />;
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <ErrorBoundary FallbackComponent={GlobeErrorFallback}>
        <Suspense fallback={<GlobeLoader />}>
          <Canvas
            camera={{
              position: [0, 0, 12],
              fov: 50,
              near: 0.1,
              far: 1000,
            }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
              preserveDrawingBuffer: true,
              logarithmicDepthBuffer: true, // Better for wireframe rendering
            }}
            shadows
            dpr={[1, 2]}
          >
            {/* Ambient lighting */}
            <ambientLight intensity={0.3} />

            {/* Main directional light (sun) */}
            <directionalLight
              position={[5, 3, 5]}
              intensity={1.5}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />

            {/* Advanced globe with TopoJSON and DEM */}
            <WorldGlobe
              showGrid={showGrid}
              animateWireframes={animateWireframes}
              initialMode="wireframe"
              initialQuality="medium"
              showControls={false}
            />

            {/* Camera controls */}
            <GlobeControls />

            {/* Location pins - user's favorite destinations */}
            <LocationPins locations={userLocations} globeRadius={4} />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
