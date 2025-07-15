/**
 * GraticuleGrid.tsx
 * Latitude and longitude grid lines for the globe
 */

"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface GraticuleGridProps {
  visible?: boolean;
  opacity?: number;
  radius?: number;
  spacing?: number;
}

export function GraticuleGrid({
  visible = true,
  opacity = 0.2,
  radius = 20,
  spacing = 10
}: GraticuleGridProps) {
  const gridGeometry = useMemo(() => {
    const group = new THREE.Group();
    
    const material = new THREE.LineBasicMaterial({
      color: "#0088ff",
      transparent: true,
      opacity: opacity,
      linewidth: 1,
      fog: false,
    });
    
    // Latitude lines
    for (let lat = -80; lat <= 80; lat += spacing) {
      const curve = new THREE.EllipseCurve(
        0, 0,
        radius * Math.cos(lat * Math.PI / 180),
        radius * Math.cos(lat * Math.PI / 180),
        0, 2 * Math.PI,
        false,
        0
      );
      
      const points = curve.getPoints(64);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      line.position.y = radius * Math.sin(lat * Math.PI / 180);
      line.rotation.x = Math.PI / 2;
      group.add(line);
    }
    
    // Longitude lines
    for (let lng = 0; lng < 180; lng += spacing) {
      const curve = new THREE.EllipseCurve(
        0, 0,
        radius, radius,
        0, Math.PI,
        false,
        0
      );
      
      const points = curve.getPoints(32);
      const path = points.map(p => new THREE.Vector3(p.x, p.y, 0));
      const geometry = new THREE.BufferGeometry().setFromPoints(path);
      const line = new THREE.Line(geometry, material);
      line.rotation.y = lng * Math.PI / 180;
      group.add(line);
      
      // Add the opposite side
      const line2 = line.clone();
      line2.rotation.x = Math.PI;
      group.add(line2);
    }
    
    return group;
  }, [radius, spacing, opacity]);
  
  if (!visible) return null;
  
  return <primitive object={gridGeometry} />;
}