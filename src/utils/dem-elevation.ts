/**
 * dem-elevation.ts  
 * Digital Elevation Model (DEM) system for 3D terrain
 * Loads and processes elevation data from DEM texture
 */

import * as THREE from "three";

// DEM data interface
export interface DEMData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  isLoaded: boolean;
}

// Elevation system configuration
export interface ElevationConfig {
  demPath: string;
  maxElevation: number;  // Maximum elevation scaling factor
  elevationPower: number; // Power curve for elevation (1.6 in Observable)
  baseRadius: number;    // Base sphere radius
  enableAntarctica: boolean; // Whether to include Antarctica elevation
}

// Default configuration  
const DEFAULT_CONFIG: ElevationConfig = {
  demPath: "/world/dem.jpg",
  maxElevation: 0.6, // Scaled down 10x (6 -> 0.6)
  elevationPower: 1.6,
  baseRadius: 20, // Scaled down 10x (200 -> 20)
  enableAntarctica: false,
};

// Global DEM data cache
let demDataCache: DEMData | null = null;
let demTexture: THREE.Texture | null = null;

// Load DEM texture and extract height data
export async function loadDEMData(config: Partial<ElevationConfig> = {}): Promise<DEMData> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Return cached data if available
  if (demDataCache && demDataCache.isLoaded) {
    return demDataCache;
  }

  try {
    
    // Load texture
    const loader = new THREE.TextureLoader();
    const texture = await new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        finalConfig.demPath,
        resolve,
        (progress) => {
        },
        reject
      );
    });

    demTexture = texture;
    
    // Extract image data using canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context');
    }

    // Set canvas size to match DEM resolution (typically 360x180)
    canvas.width = 360;
    canvas.height = 180;
    
    // Draw texture to canvas
    const image = texture.image as HTMLImageElement;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    // Extract image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Extract elevation data (red channel contains height information)
    const elevationData = new Uint8ClampedArray(canvas.width * canvas.height);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const pixelIndex = i / 4;
      elevationData[pixelIndex] = imageData.data[i]; // Red channel
    }
    
    demDataCache = {
      data: elevationData,
      width: canvas.width,
      height: canvas.height,
      isLoaded: true,
    };
    
    return demDataCache;
    
  } catch (error) {
    console.error('Error loading DEM data:', error);
    
    // Return empty DEM data as fallback
    demDataCache = {
      data: new Uint8ClampedArray(360 * 180).fill(102), // Default elevation
      width: 360,
      height: 180,
      isLoaded: false,
    };
    
    return demDataCache;
  }
}

// Sample elevation at specific geographic coordinates
export function sampleElevation(
  longitude: number, 
  latitude: number, 
  demData: DEMData,
  config: Partial<ElevationConfig> = {}
): number {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (!demData.isLoaded) {
    return 0.2; // Default elevation for flat areas
  }

  // Convert lat/lng to texture coordinates (Observable technique)
  const p1 = 173 - Math.ceil(latitude + 90);
  const p0 = 170 + Math.floor(longitude);
  
  // Calculate texture index
  const x = Math.floor((p0 % 360) + 360 * (p1 % 180)) % (demData.width * demData.height);
  
  // Handle Antarctica (disable elevation in southern regions)
  if (!finalConfig.enableAntarctica && p1 > 149) {
    return 0.2;
  }
  
  // Sample height value
  const heightValue = demData.data[x] || 102; // Default if no data
  
  // Normalize to 0-1 range
  return heightValue / 255;
}

// Apply elevation to a 3D vertex (Observable avertex technique)
export function applyElevationToVertex(
  vertex: THREE.Vector3,
  demData: DEMData,
  config: Partial<ElevationConfig> = {}
): THREE.Vector3 {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (!demData.isLoaded) {
    return vertex.clone();
  }

  // Convert vertex to geographic coordinates
  const radius = vertex.length();
  const lat = (Math.asin(vertex.y / radius) * 180) / Math.PI || 0;
  const lon = (Math.atan2(vertex.x, vertex.z) * 180) / Math.PI || 0;
  const adjustedLon = lon + 270;

  // Sample elevation
  const elevation = sampleElevation(adjustedLon, lat, demData, finalConfig);
  
  // Calculate new radius with elevation
  const newRadius = finalConfig.baseRadius - 1 + finalConfig.maxElevation * (elevation ** finalConfig.elevationPower);
  
  // Create elevated vertex
  const normalizedVertex = vertex.clone().normalize();
  return normalizedVertex.multiplyScalar(newRadius);
}

// Apply elevation to entire sphere geometry
export function applySphereElevation(
  geometry: THREE.SphereGeometry,
  demData: DEMData,
  config: Partial<ElevationConfig> = {}
): THREE.SphereGeometry {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (!demData.isLoaded) {
    return geometry;
  }

  
  // Get vertex positions
  const positions = geometry.attributes.position;
  const vertexCount = positions.count;
  
  // Apply elevation to each vertex
  for (let i = 0; i < vertexCount; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    const vertex = new THREE.Vector3(x, y, z);
    const elevatedVertex = applyElevationToVertex(vertex, demData, finalConfig);
    
    positions.setXYZ(i, elevatedVertex.x, elevatedVertex.y, elevatedVertex.z);
  }
  
  // Mark positions as needing update
  positions.needsUpdate = true;
  
  // Recompute normals for proper lighting
  geometry.computeVertexNormals();
  
  return geometry;
}

// Generate elevation-aware wireframe
export function generateElevatedWireframe(
  coordinates: Array<[number, number]>,
  demData: DEMData,
  config: Partial<ElevationConfig> = {}
): THREE.Vector3[] {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const points: THREE.Vector3[] = [];
  
  coordinates.forEach(([longitude, latitude]) => {
    // Sample elevation
    const elevation = sampleElevation(longitude, latitude, demData, finalConfig);
    
    // Calculate radius with elevation
    const radius = finalConfig.baseRadius - 1 + finalConfig.maxElevation * (elevation ** finalConfig.elevationPower);
    
    // Convert to 3D coordinates
    const lambda = (longitude * Math.PI) / 180;
    const phi = (latitude * Math.PI) / 180;
    
    const vertex = new THREE.Vector3(
      radius * Math.cos(phi) * Math.cos(lambda),
      radius * Math.sin(phi),
      -radius * Math.cos(phi) * Math.sin(lambda)
    );
    
    points.push(vertex);
  });
  
  return points;
}

// Create elevation color map (for visualization)
export function getElevationColor(elevation: number): THREE.Color {
  // Color gradient from deep ocean to high mountains
  if (elevation < 0.3) {
    // Deep ocean - dark blue
    return new THREE.Color(0x001122);
  } else if (elevation < 0.4) {
    // Shallow water - blue
    return new THREE.Color(0x0066aa);
  } else if (elevation < 0.5) {
    // Coastline - green
    return new THREE.Color(0x228844);
  } else if (elevation < 0.7) {
    // Plains - yellow-green
    return new THREE.Color(0x88aa44);
  } else if (elevation < 0.9) {
    // Hills - brown
    return new THREE.Color(0xaa6644);
  } else {
    // Mountains - white
    return new THREE.Color(0xdddddd);
  }
}

// Create elevation-based vertex colors
export function generateElevationColors(
  geometry: THREE.SphereGeometry,
  demData: DEMData,
  config: Partial<ElevationConfig> = {}
): Float32Array {
  const positions = geometry.attributes.position;
  const vertexCount = positions.count;
  const colors = new Float32Array(vertexCount * 3);
  
  for (let i = 0; i < vertexCount; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    const vertex = new THREE.Vector3(x, y, z);
    const radius = vertex.length();
    const lat = (Math.asin(y / radius) * 180) / Math.PI || 0;
    const lon = (Math.atan2(x, z) * 180) / Math.PI || 0;
    
    const elevation = sampleElevation(lon + 270, lat, demData, config);
    const color = getElevationColor(elevation);
    
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  
  return colors;
}

// Get DEM texture for material use
export function getDEMTexture(): THREE.Texture | null {
  return demTexture;
}

// Preload DEM data
export async function preloadDEMData(config: Partial<ElevationConfig> = {}): Promise<void> {
  try {
    await loadDEMData(config);
  } catch (error) {
    console.error('Error preloading DEM data:', error);
  }
}

// Clear DEM cache
export function clearDEMCache(): void {
  demDataCache = null;
  if (demTexture) {
    demTexture.dispose();
    demTexture = null;
  }
}

// Get DEM statistics
export function getDEMStats(demData: DEMData): {
  min: number;
  max: number;
  average: number;
  isLoaded: boolean;
} {
  if (!demData.isLoaded) {
    return { min: 0, max: 0, average: 0, isLoaded: false };
  }
  
  let min = 255;
  let max = 0;
  let sum = 0;
  
  for (let i = 0; i < demData.data.length; i++) {
    const value = demData.data[i];
    min = Math.min(min, value);
    max = Math.max(max, value);
    sum += value;
  }
  
  return {
    min: min / 255,
    max: max / 255,
    average: (sum / demData.data.length) / 255,
    isLoaded: true,
  };
}