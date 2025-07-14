/**
 * topojson-loader.ts
 * World Atlas TopoJSON data loading and processing
 * Fetches data from world-atlas@2 CDN with fallback systems
 */

import * as topojson from "topojson-client";

// CDN URLs for world atlas data
const WORLD_ATLAS_URLS = {
  land50m: "https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json",
  countries110m: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json", 
  coastlines50m: "https://cdn.jsdelivr.net/npm/world-atlas@2/coastlines-50m.json",
  land110m: "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json",
  countries50m: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json",
} as const;

// Type definitions for TopoJSON data
export interface TopoJSONFeature {
  type: "Feature";
  properties: Record<string, any>;
  geometry: {
    type: string;
    coordinates: any;
  };
}

export interface TopoJSONTopology {
  type: "Topology";
  objects: Record<string, any>;
  arcs: Array<Array<[number, number]>>;
  bbox?: [number, number, number, number];
  transform?: {
    scale: [number, number];
    translate: [number, number];
  };
}

export interface MeshData {
  type: "MultiLineString";
  coordinates: Array<Array<[number, number]>>;
}

export interface WorldAtlasData {
  land: MeshData;
  countries: MeshData;
  coastlines?: MeshData;
}

// Cache for loaded topologies
const topologyCache = new Map<string, TopoJSONTopology>();

// Load TopoJSON from CDN with retry and fallback
async function loadTopoJSON(url: string, maxRetries: number = 3): Promise<TopoJSONTopology> {
  // Check cache first
  if (topologyCache.has(url)) {
    return topologyCache.get(url)!;
  }

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Loading TopoJSON from ${url} (attempt ${attempt + 1})`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'force-cache', // Use browser cache when available
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const topology = await response.json() as TopoJSONTopology;
      
      // Validate topology structure
      if (!topology.objects || !topology.arcs) {
        throw new Error('Invalid TopoJSON structure');
      }
      
      // Cache successful load
      topologyCache.set(url, topology);
      console.log(`Successfully loaded TopoJSON from ${url}`);
      
      return topology;
      
    } catch (error) {
      lastError = error as Error;
      console.warn(`Failed to load ${url} (attempt ${attempt + 1}):`, error);
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw new Error(`Failed to load TopoJSON after ${maxRetries} attempts: ${lastError?.message}`);
}

// Generate mesh from topology using topojson.mesh
export function generateMesh(
  topology: TopoJSONTopology, 
  object: any, 
  filter?: (a: any, b: any) => boolean
): MeshData {
  try {
    const mesh = topojson.mesh(topology, object, filter);
    
    // Ensure we have a MultiLineString
    if (mesh.type !== "MultiLineString") {
      throw new Error(`Expected MultiLineString, got ${mesh.type}`);
    }
    
    return mesh as MeshData;
  } catch (error) {
    console.error('Error generating mesh:', error);
    throw error;
  }
}

// Load and process land boundaries
export async function loadLandBoundaries(resolution: 'high' | 'medium' | 'low' = 'medium'): Promise<MeshData> {
  const url = resolution === 'high' ? WORLD_ATLAS_URLS.land50m : WORLD_ATLAS_URLS.land110m;
  
  try {
    const topology = await loadTopoJSON(url);
    return generateMesh(topology, topology.objects.land);
  } catch (error) {
    console.error('Failed to load land boundaries:', error);
    return getFallbackLandMesh();
  }
}

// Load and process country boundaries  
export async function loadCountryBoundaries(resolution: 'high' | 'medium' | 'low' = 'medium'): Promise<MeshData> {
  const url = resolution === 'high' ? WORLD_ATLAS_URLS.countries50m : WORLD_ATLAS_URLS.countries110m;
  
  try {
    const topology = await loadTopoJSON(url);
    return generateMesh(topology, topology.objects.countries, (a, b) => a !== b);
  } catch (error) {
    console.error('Failed to load country boundaries:', error);
    return getFallbackCountryMesh();
  }
}

// Load coastlines (external boundaries only)
export async function loadCoastlines(): Promise<MeshData> {
  try {
    const topology = await loadTopoJSON(WORLD_ATLAS_URLS.coastlines50m);
    return generateMesh(topology, topology.objects.coastlines);
  } catch (error) {
    console.error('Failed to load coastlines:', error);
    // Fall back to land boundaries
    return loadLandBoundaries('medium');
  }
}

// Load all world atlas data
export async function loadWorldAtlasData(resolution: 'high' | 'medium' | 'low' = 'medium'): Promise<WorldAtlasData> {
  try {
    console.log('Loading world atlas data...');
    
    const [land, countries, coastlines] = await Promise.allSettled([
      loadLandBoundaries(resolution),
      loadCountryBoundaries(resolution),
      loadCoastlines(),
    ]);
    
    const result: WorldAtlasData = {
      land: land.status === 'fulfilled' ? land.value : getFallbackLandMesh(),
      countries: countries.status === 'fulfilled' ? countries.value : getFallbackCountryMesh(),
    };
    
    if (coastlines.status === 'fulfilled') {
      result.coastlines = coastlines.value;
    }
    
    console.log('World atlas data loaded successfully');
    return result;
    
  } catch (error) {
    console.error('Failed to load world atlas data:', error);
    return getFallbackWorldData();
  }
}

// Get topology for custom processing
export async function getTopology(type: keyof typeof WORLD_ATLAS_URLS): Promise<TopoJSONTopology> {
  return loadTopoJSON(WORLD_ATLAS_URLS[type]);
}

// Generate features from topology (for individual country access)
export function generateFeatures(topology: TopoJSONTopology, objectName: string): TopoJSONFeature[] {
  try {
    const object = topology.objects[objectName];
    if (!object) {
      throw new Error(`Object '${objectName}' not found in topology`);
    }
    
    const featureCollection = topojson.feature(topology, object) as any;
    
    if (featureCollection.type === 'FeatureCollection') {
      return featureCollection.features || [];
    } else {
      return [featureCollection];
    }
  } catch (error) {
    console.error('Error generating features:', error);
    return [];
  }
}

// Fallback data for when CDN loading fails
function getFallbackLandMesh(): MeshData {
  return {
    type: "MultiLineString",
    coordinates: [
      // Simplified continent outlines
      [[-180, -60], [180, -60]], // Antarctica boundary
      [[-170, 65], [-30, 70], [40, 70], [180, 70]], // Northern coastlines
      [[-120, 50], [-60, 20], [-80, 10], [-35, -30], [-70, -55]], // Americas
      [[-10, 35], [50, 35], [50, -35], [-10, -35], [-10, 35]], // Africa outline
      [[50, 70], [180, 70], [180, -10], [95, -10], [50, 35]], // Asia outline
      [[110, -10], [155, -10], [155, -45], [110, -45], [110, -10]], // Australia outline
    ]
  };
}

function getFallbackCountryMesh(): MeshData {
  return {
    type: "MultiLineString", 
    coordinates: [
      // Major country boundaries (simplified)
      [[-141, 60], [-60, 60]], // Canada-US border area
      [[-125, 49], [-95, 49]], // US-Canada border
      [[20, 55], [30, 55]], // European borders sample
      [[35, 30], [45, 30]], // Middle East borders sample
    ]
  };
}

function getFallbackWorldData(): WorldAtlasData {
  return {
    land: getFallbackLandMesh(),
    countries: getFallbackCountryMesh(),
  };
}

// Utility to simplify mesh data for performance
export function simplifyMesh(mesh: MeshData, tolerance: number = 0.1): MeshData {
  // Simple decimation - take every nth coordinate based on tolerance
  const step = Math.max(1, Math.floor(1 / tolerance));
  
  const simplifiedCoordinates = mesh.coordinates.map(lineString => {
    if (lineString.length <= 2) return lineString;
    
    const simplified: Array<[number, number]> = [lineString[0]];
    
    for (let i = step; i < lineString.length; i += step) {
      simplified.push(lineString[i]);
    }
    
    // Always include the last point
    const lastIndex = lineString.length - 1;
    if ((lastIndex % step) !== 0) {
      simplified.push(lineString[lastIndex]);
    }
    
    return simplified;
  });
  
  return {
    type: "MultiLineString",
    coordinates: simplifiedCoordinates
  };
}

// Clear cache (useful for memory management)
export function clearCache(): void {
  topologyCache.clear();
  console.log('TopoJSON cache cleared');
}

// Get cache statistics
export function getCacheStats() {
  return {
    size: topologyCache.size,
    keys: Array.from(topologyCache.keys()),
  };
}