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
        () => {
          // Progress callback - no action needed
        },
        reject
      );
    });
    
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