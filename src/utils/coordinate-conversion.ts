/**
 * coordinate-conversion.ts
 * Observable Three.js coordinate conversion techniques
 * Based on @wolfiex implementation with DEM elevation mapping
 */

import * as THREE from "three";

// Primary coordinate conversion (Observable technique)
export function vertex([longitude, latitude]: [number, number], radius: number = 20): THREE.Vector3 {
  const lambda = (longitude * Math.PI) / 180;
  const phi = (latitude * Math.PI) / 180;
  
  return new THREE.Vector3(
    radius * Math.cos(phi) * Math.cos(lambda),
    radius * Math.sin(phi),
    -radius * Math.cos(phi) * Math.sin(lambda)
  );
}

// DEM-based elevation vertex positioning (Observable avertex function)
export function avertex(v: THREE.Vector3, demData: Uint8ClampedArray | null, radius: number = 20): THREE.Vector3 {
  if (!demData) {
    return v.clone();
  }

  // Convert 3D vertex back to lat/lng
  const lat = (Math.asin(v.y / radius) * 180) / Math.PI || 0;
  const lon = (Math.atan2(v.x, v.z) * 180) / Math.PI || 0;
  const adjustedLon = lon + 270;

  // Sample elevation from DEM data
  const elevation = getDEMHeight(adjustedLon, lat, demData);
  
  // Create new vertex with elevation
  return vertex([adjustedLon - 270, lat], radius - 1 + 6 * elevation ** 1.6);
}

// Sample height from DEM texture data
export function getDEMHeight(longitude: number, latitude: number, demData: Uint8ClampedArray): number {
  // Convert lat/lng to texture coordinates
  const p1 = 173 - Math.ceil(latitude + 90);
  const p0 = 170 + Math.floor(longitude);
  
  // Handle wrapping and bounds
  const x = Math.floor((p0 % 360) + 360 * (p1 % 180));
  
  if (p1 > 149) {
    // Eliminate Antarctica region
    return 0.2;
  }
  
  // Sample DEM data (red channel contains height)
  const index = x * 4; // RGBA format, we want red channel
  const heightValue = demData[index] || 102; // Default height if no data
  
  return heightValue / 255; // Normalize to 0-1 range
}

// Create range iterator (Observable utility)
export function* range(start: number, stop: number, step: number = 1) {
  for (let i = 0, v = start; v < stop; v = start + (++i * step)) {
    yield v;
  }
}

// Generate meridian line coordinates
export function meridian(x: number, y0: number, y1: number, dy: number = 2.5): Array<[number, number]> {
  return Array.from(range(y0, y1 + 1e-6, dy), y => [x, y]);
}

// Generate parallel line coordinates  
export function parallel(y: number, x0: number, x1: number, dx: number = 2.5): Array<[number, number]> {
  return Array.from(range(x0, x1 + 1e-6, dx), x => [x, y]);
}

// Create graticule (lat/lng grid) coordinates
export function graticule10(): { coordinates: Array<Array<[number, number]>> } {
  const lines: Array<Array<[number, number]>> = [];
  
  // Longitude lines (meridians)
  for (let x = -180; x <= 180; x += 10) {
    lines.push(meridian(x, -80, 80, 2.5));
  }
  
  // Latitude lines (parallels)
  for (let y = -80; y <= 80; y += 10) {
    lines.push(parallel(y, -180, 180, 2.5));
  }
  
  return { coordinates: lines };
}

// Convert geographic bounds to 3D bounding box
export function geoBoundsTo3D(bounds: [[number, number], [number, number]], radius: number = 20) {
  const [[west, south], [east, north]] = bounds;
  
  const corners = [
    vertex([west, south], radius),
    vertex([east, south], radius),
    vertex([east, north], radius),
    vertex([west, north], radius),
  ];
  
  const box = new THREE.Box3();
  corners.forEach(corner => box.expandByPoint(corner));
  
  return box;
}

// Calculate great circle distance between two geographic points
export function greatCircleDistance(
  [lon1, lat1]: [number, number], 
  [lon2, lat2]: [number, number]
): number {
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

// Generate great circle path between two points
export function greatCirclePath(
  start: [number, number], 
  end: [number, number], 
  segments: number = 50
): Array<[number, number]> {
  const [lon1, lat1] = start;
  const [lon2, lat2] = end;
  
  const path: Array<[number, number]> = [];
  
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    
    // Spherical interpolation
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const deltaLat = lat2Rad - lat1Rad;
    const deltaLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin((1-f) * deltaLat/2) * Math.sin((1-f) * deltaLat/2) + 
              Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
              Math.sin((1-f) * deltaLon/2) * Math.sin((1-f) * deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    const lat = lat1Rad + f * deltaLat;
    const lon = lon1 + f * (lon2 - lon1);
    
    path.push([lon, lat * 180 / Math.PI]);
  }
  
  return path;
}

// Validate geographic coordinates
export function isValidCoordinate([longitude, latitude]: [number, number]): boolean {
  return longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
}

// Normalize longitude to -180/180 range
export function normalizeLongitude(longitude: number): number {
  while (longitude > 180) longitude -= 360;
  while (longitude < -180) longitude += 360;
  return longitude;
}

// Convert 3D vertex back to geographic coordinates
export function vertexToGeo(vertex: THREE.Vector3, radius: number = 20): [number, number] {
  const lat = Math.asin(vertex.y / radius) * 180 / Math.PI;
  const lon = Math.atan2(vertex.x, -vertex.z) * 180 / Math.PI;
  
  return [normalizeLongitude(lon), lat];
}

// Create adaptive coordinate density based on curve
export function adaptiveCoordinates(
  coordinates: Array<[number, number]>, 
  maxDistance: number = 1.0
): Array<[number, number]> {
  if (coordinates.length <= 2) return coordinates;
  
  const result: Array<[number, number]> = [coordinates[0]];
  
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i-1];
    const curr = coordinates[i];
    const distance = greatCircleDistance(prev, curr);
    
    if (distance > maxDistance) {
      // Insert intermediate points
      const segments = Math.ceil(distance / maxDistance);
      const path = greatCirclePath(prev, curr, segments);
      result.push(...path.slice(1)); // Skip first point (already added)
    } else {
      result.push(curr);
    }
  }
  
  return result;
}