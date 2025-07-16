/**
 * coordinate-conversion.ts
 * Convert geographic coordinates to 3D positions
 */

import * as THREE from "three";

/**
 * Convert latitude/longitude to 3D vertex position on sphere
 * @param lon - Longitude in degrees
 * @param lat - Latitude in degrees  
 * @param radius - Sphere radius
 * @returns 3D position vector
 */
export function vertex(lon: number, lat: number, radius: number): THREE.Vector3 {
  const lambda = (lon * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  
  return new THREE.Vector3(
    radius * Math.cos(phi) * Math.cos(lambda),
    radius * Math.sin(phi),
    -radius * Math.cos(phi) * Math.sin(lambda)
  );
}