/**
 * continent-coordinates.ts
 * Accurate continent coordinate system using real GeoJSON data
 * Converts geographic coordinates to 3D sphere positions
 */

import * as THREE from "three";

// Coordinate conversion function from Observable example
function coordinateToVertex(longitude: number, latitude: number, radius: number = 1.005): THREE.Vector3 {
  const lambda = (longitude * Math.PI) / 180;
  const phi = (latitude * Math.PI) / 180;
  
  return new THREE.Vector3(
    radius * Math.cos(phi) * Math.cos(lambda),
    radius * Math.sin(phi),
    -radius * Math.cos(phi) * Math.sin(lambda)
  );
}

// Interface for GeoJSON continent data
export interface ContinentGeoData {
  name: string;
  color: string;
  multiPolygon: number[][][]; // Array of polygons, each containing coordinate pairs
}

// Function to load and parse continent data from the JSON file
export async function loadContinentData(): Promise<ContinentGeoData[]> {
  try {
    const response = await fetch('/data/continents.json');
    const geoData = await response.json();
    
    const continents: ContinentGeoData[] = [];
    const continentGroups: { [key: string]: number[][][] } = {};
    
    // Group features by continent
    geoData.features.forEach((feature: { properties: { CONTINENT: string }; geometry: { type: string; coordinates: number[][][] | number[][][][] } }) => {
      const continentName = feature.properties.CONTINENT;
      if (!continentGroups[continentName]) {
        continentGroups[continentName] = [];
      }
      
      // Handle both Polygon and MultiPolygon geometries
      if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach((polygon: number[][][]) => {
          continentGroups[continentName].push(polygon[0]); // Take outer ring only
        });
      } else if (feature.geometry.type === 'Polygon') {
        continentGroups[continentName].push(feature.geometry.coordinates[0]); // Take outer ring only
      }
    });
    
    // Convert to our format
    Object.entries(continentGroups).forEach(([name, polygons]) => {
      continents.push({
        name,
        color: "#00ff00",
        multiPolygon: polygons
      });
    });
    
    return continents;
  } catch (error) {
    console.error('Failed to load continent data:', error);
    return getFallbackContinentData();
  }
}

// Fallback data in case file loading fails
function getFallbackContinentData(): ContinentGeoData[] {
  return [
    {
      name: "North America",
      color: "#00ff00",
      multiPolygon: [
        [
          [-168.0, 65.0], [-140.0, 69.0], [-110.0, 49.0], [-81.0, 25.0], 
          [-97.0, 25.0], [-125.0, 49.0], [-168.0, 65.0]
        ]
      ]
    },
    {
      name: "South America", 
      color: "#00ff00",
      multiPolygon: [
        [
          [-35.0, 5.0], [-81.0, 12.0], [-81.0, -55.0], [-35.0, -35.0], [-35.0, 5.0]
        ]
      ]
    },
    {
      name: "Africa",
      color: "#00ff00", 
      multiPolygon: [
        [
          [-18.0, 38.0], [52.0, 32.0], [52.0, -35.0], [-18.0, -35.0], [-18.0, 38.0]
        ]
      ]
    },
    {
      name: "Europe",
      color: "#00ff00",
      multiPolygon: [
        [
          [-25.0, 72.0], [45.0, 72.0], [45.0, 35.0], [-10.0, 35.0], [-25.0, 72.0]
        ]
      ]
    },
    {
      name: "Asia",
      color: "#00ff00",
      multiPolygon: [
        [
          [45.0, 72.0], [180.0, 72.0], [180.0, 5.0], [95.0, 5.0], [45.0, 35.0], [45.0, 72.0]
        ]
      ]
    },
    {
      name: "Australia",
      color: "#00ff00",
      multiPolygon: [
        [
          [112.0, -10.0], [154.0, -10.0], [154.0, -44.0], [112.0, -44.0], [112.0, -10.0]
        ]
      ]
    }
  ];
}

// Create wireframe geometry from continent polygon data
export function createContinentWireframe(continent: ContinentGeoData, radius: number = 1.005): THREE.BufferGeometry[] {
  const geometries: THREE.BufferGeometry[] = [];
  
  continent.multiPolygon.forEach((polygon) => {
    if (polygon.length < 3) return; // Skip invalid polygons
    
    const points: THREE.Vector3[] = [];
    
    // Convert each coordinate pair to 3D vertex
    for (let i = 0; i < polygon.length; i++) {
      const [longitude, latitude] = polygon[i];
      const vertex = coordinateToVertex(longitude, latitude, radius);
      points.push(vertex);
    }
    
    // Close the loop by connecting back to first point
    if (points.length > 0) {
      points.push(points[0].clone());
    }
    
    // Create line geometry
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometries.push(geometry);
  });
  
  return geometries;
}

// Simplify polygon for better performance (Douglas-Peucker-like algorithm)
export function simplifyPolygon(coordinates: number[][], tolerance: number = 0.5): number[][] {
  if (coordinates.length <= 2) return coordinates;
  
  // Simple decimation - take every nth point based on tolerance
  const step = Math.max(1, Math.floor(tolerance));
  const simplified: number[][] = [];
  
  for (let i = 0; i < coordinates.length; i += step) {
    simplified.push(coordinates[i]);
  }
  
  // Always include the last point if it wasn't included
  const lastIndex = coordinates.length - 1;
  if ((lastIndex % step) !== 0) {
    simplified.push(coordinates[lastIndex]);
  }
  
  return simplified;
}

// Create latitude/longitude grid lines
export function createLatitudeLineGeometry(latitude: number, radius: number = 1.002): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  
  for (let lng = -180; lng <= 180; lng += 2) {
    const vertex = coordinateToVertex(lng, latitude, radius);
    points.push(vertex);
  }
  
  return new THREE.BufferGeometry().setFromPoints(points);
}

export function createLongitudeLineGeometry(longitude: number, radius: number = 1.002): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  
  for (let lat = -85; lat <= 85; lat += 2) {
    const vertex = coordinateToVertex(longitude, lat, radius);
    points.push(vertex);
  }
  
  return new THREE.BufferGeometry().setFromPoints(points);
}

// Helper function to calculate distance between two geographic points
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}