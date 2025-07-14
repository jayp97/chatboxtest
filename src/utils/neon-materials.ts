/**
 * neon-materials.ts
 * Neon wireframe material system for retro globe
 * Creates glowing green materials for cyberpunk aesthetic
 */

import * as THREE from "three";

// Neon colour palette
export const NEON_COLORS = {
  primary: "#00ff00",      // Bright neon green
  secondary: "#00cc00",    // Slightly darker green
  grid: "#00ff0040",       // Transparent green for grid
  base: "#001100",         // Dark green base
  glow: "#00ff0080",       // Semi-transparent glow
  background: "#000511",   // Very dark background
} as const;

// Material configuration interface
export interface NeonMaterialConfig {
  colour: string;
  opacity: number;
  linewidth: number;
  transparent: boolean;
  glow: boolean;
}

// Collection of all neon materials
export interface NeonMaterials {
  baseSphere: THREE.MeshBasicMaterial;
  continentLines: THREE.LineBasicMaterial;
  gridLines: THREE.LineBasicMaterial;
  pinMaterial: THREE.MeshBasicMaterial;
  atmosphereGlow: THREE.MeshBasicMaterial;
  isReady: boolean;
}

export class NeonMaterialManager {
  private materials: NeonMaterials;

  constructor() {
    this.materials = this.createAllMaterials();
  }

  private createAllMaterials(): NeonMaterials {
    return {
      // Dark base sphere with subtle transparency
      baseSphere: new THREE.MeshBasicMaterial({
        color: NEON_COLORS.base,
        transparent: true,
        opacity: 0.15,
        side: THREE.FrontSide,
      }),

      // Bright neon green lines for continent outlines
      continentLines: new THREE.LineBasicMaterial({
        color: NEON_COLORS.primary,
        transparent: true,
        opacity: 0.9,
        linewidth: 2,
        fog: false,
      }),

      // Subtle grid lines for latitude/longitude
      gridLines: new THREE.LineBasicMaterial({
        color: NEON_COLORS.secondary,
        transparent: true,
        opacity: 0.3,
        linewidth: 1,
        fog: false,
      }),

      // Location pins with neon green glow
      pinMaterial: new THREE.MeshBasicMaterial({
        color: NEON_COLORS.primary,
        transparent: true,
        opacity: 0.8,
      }),

      // Outer atmosphere glow effect
      atmosphereGlow: new THREE.MeshBasicMaterial({
        color: NEON_COLORS.glow,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      }),

      isReady: true,
    };
  }

  // Create a wireframe material with specific properties
  createWireframeMaterial(config: Partial<NeonMaterialConfig> = {}): THREE.LineBasicMaterial {
    const defaultConfig: NeonMaterialConfig = {
      colour: NEON_COLORS.primary,
      opacity: 0.8,
      linewidth: 1,
      transparent: true,
      glow: false,
    };

    const finalConfig = { ...defaultConfig, ...config };

    const material = new THREE.LineBasicMaterial({
      color: finalConfig.colour,
      transparent: finalConfig.transparent,
      opacity: finalConfig.opacity,
      linewidth: finalConfig.linewidth,
      fog: false,
    });

    // Add glow effect if requested
    if (finalConfig.glow) {
      material.blending = THREE.AdditiveBlending;
    }

    return material;
  }

  // Create a pulsing material for animations
  createPulsingMaterial(baseColor: string = NEON_COLORS.primary): THREE.LineBasicMaterial {
    const material = new THREE.LineBasicMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0.8,
      linewidth: 2,
      fog: false,
    });

    // Store original opacity for pulsing animation
    Object.assign(material, { originalOpacity: 0.8, pulseSpeed: 2.0 });

    return material;
  }

  // Create highlighted material for hover states
  createHighlightMaterial(): THREE.LineBasicMaterial {
    return new THREE.LineBasicMaterial({
      color: "#00ffff", // Cyan for highlights
      transparent: true,
      opacity: 1.0,
      linewidth: 3,
      fog: false,
      blending: THREE.AdditiveBlending,
    });
  }

  // Get all materials
  getMaterials(): NeonMaterials {
    return this.materials;
  }

  // Get specific material by type
  getBaseSphere(): THREE.MeshBasicMaterial {
    return this.materials.baseSphere;
  }

  getContinentLines(): THREE.LineBasicMaterial {
    return this.materials.continentLines;
  }

  getGridLines(): THREE.LineBasicMaterial {
    return this.materials.gridLines;
  }

  getPinMaterial(): THREE.MeshBasicMaterial {
    return this.materials.pinMaterial;
  }

  getAtmosphereGlow(): THREE.MeshBasicMaterial {
    return this.materials.atmosphereGlow;
  }

  // Update material properties dynamically
  updateOpacity(materialType: keyof NeonMaterials, opacity: number): void {
    if (materialType === "isReady") return;
    
    const material = this.materials[materialType];
    if (material && "opacity" in material) {
      material.opacity = opacity;
      material.needsUpdate = true;
    }
  }

  // Update colour dynamically
  updateColor(materialType: keyof NeonMaterials, color: string): void {
    if (materialType === "isReady") return;
    
    const material = this.materials[materialType];
    if (material && "color" in material) {
      material.color.setStyle(color);
      material.needsUpdate = true;
    }
  }

  // Create line geometry from coordinate arrays
  createLineGeometry(coordinates: Array<{ lat: number; lng: number }>): THREE.BufferGeometry {
    const points: THREE.Vector3[] = [];

    coordinates.forEach(coord => {
      const spherePos = this.latLngToSphere(coord.lat, coord.lng, 1.005);
      points.push(new THREE.Vector3(spherePos.x, spherePos.y, spherePos.z));
    });

    // Close the loop by connecting back to first point
    if (points.length > 0) {
      points.push(points[0].clone());
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }

  // Convert lat/lng to 3D sphere coordinates
  private latLngToSphere(lat: number, lng: number, radius: number = 1.005): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),   // x
      radius * Math.cos(phi),                     // y
      radius * Math.sin(phi) * Math.sin(theta)    // z
    );
  }

  // Create latitude grid line geometry
  createLatitudeLineGeometry(latitude: number): THREE.BufferGeometry {
    const points: THREE.Vector3[] = [];
    
    for (let lng = -180; lng <= 180; lng += 5) {
      const spherePos = this.latLngToSphere(latitude, lng, 1.002);
      points.push(new THREE.Vector3(spherePos.x, spherePos.y, spherePos.z));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }

  // Create longitude grid line geometry
  createLongitudeLineGeometry(longitude: number): THREE.BufferGeometry {
    const points: THREE.Vector3[] = [];
    
    for (let lat = -80; lat <= 80; lat += 5) {
      const spherePos = this.latLngToSphere(lat, longitude, 1.002);
      points.push(new THREE.Vector3(spherePos.x, spherePos.y, spherePos.z));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }

  // Animate pulsing materials
  updatePulsingMaterials(time: number): void {
    Object.values(this.materials).forEach(material => {
      if (material && typeof material === "object" && "originalOpacity" in material) {
        const pulsingMaterial = material as THREE.LineBasicMaterial & { 
          originalOpacity: number; 
          pulseSpeed: number; 
        };
        
        const pulse = Math.sin(time * pulsingMaterial.pulseSpeed) * 0.3 + 0.7;
        pulsingMaterial.opacity = pulsingMaterial.originalOpacity * pulse;
        pulsingMaterial.needsUpdate = true;
      }
    });
  }

  // Dispose of all materials
  dispose(): void {
    Object.values(this.materials).forEach(material => {
      if (material && typeof material === "object" && "dispose" in material) {
        material.dispose();
      }
    });
  }
}

// Global instance
let materialManager: NeonMaterialManager | null = null;

export function getNeonMaterialManager(): NeonMaterialManager {
  if (!materialManager) {
    materialManager = new NeonMaterialManager();
  }
  return materialManager;
}

// Helper function to create a complete neon wireframe setup
export function createNeonWireframeSetup() {
  const manager = getNeonMaterialManager();
  return {
    manager,
    materials: manager.getMaterials(),
    colors: NEON_COLORS,
  };
}