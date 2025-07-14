/**
 * bathymetry-textures.ts
 * Bathymetry texture system for realistic ocean appearance
 * Manages diffuse and alpha textures for underwater terrain
 */

import * as THREE from "three";

// Bathymetry texture paths
const BATHYMETRY_PATHS = {
  diffuse: "/world/bathymetry_diffuse_4k.jpg",
  alpha: "/world/bathymetry_bw_composite_4k.jpg",
} as const;

// Bathymetry texture collection
export interface BathymetryTextures {
  diffuse: THREE.Texture | null;
  alpha: THREE.Texture | null;
  isLoaded: boolean;
  hasErrors: boolean;
}

// Bathymetry material configuration
export interface BathymetryConfig {
  enableWireframe: boolean;
  transparency: number;
  color: string;
  emissive: string;
  emissiveIntensity: number;
  combine: THREE.Combine;
  wrapMode: THREE.Wrapping;
  flipY: boolean;
}

// Default configuration
const DEFAULT_CONFIG: BathymetryConfig = {
  enableWireframe: false,
  transparency: 0.8,
  color: "#004488",
  emissive: "#001122",
  emissiveIntensity: 0.1,
  combine: THREE.MultiplyOperation,
  wrapMode: THREE.RepeatWrapping,
  flipY: false,
};

// Global texture cache
let bathymetryCache: BathymetryTextures | null = null;
let textureLoader: THREE.TextureLoader | null = null;

// Initialize texture loader
function getTextureLoader(): THREE.TextureLoader {
  if (!textureLoader) {
    textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
  }
  return textureLoader;
}

// Load individual texture with proper configuration
async function loadTexture(path: string, name: string): Promise<THREE.Texture> {
  const loader = getTextureLoader();
  
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (texture) => {
        // Configure texture settings
        texture.wrapS = DEFAULT_CONFIG.wrapMode;
        texture.wrapT = DEFAULT_CONFIG.wrapMode;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.flipY = DEFAULT_CONFIG.flipY;
        
        // Special settings for alpha texture
        if (name === 'alpha') {
          texture.format = THREE.LuminanceFormat;
        }
        
        console.log(`Loaded ${name} bathymetry texture: ${path}`);
        resolve(texture);
      },
      (progress) => {
        const percent = (progress.loaded / progress.total * 100).toFixed(1);
        console.log(`Loading ${name} bathymetry texture: ${percent}%`);
      },
      (error) => {
        console.error(`Failed to load ${name} bathymetry texture:`, error);
        reject(new Error(`Failed to load ${name} texture: ${error.message}`));
      }
    );
  });
}

// Load all bathymetry textures
export async function loadBathymetryTextures(): Promise<BathymetryTextures> {
  // Return cached textures if available
  if (bathymetryCache && bathymetryCache.isLoaded) {
    console.log('Using cached bathymetry textures');
    return bathymetryCache;
  }

  console.log('Loading bathymetry textures...');
  
  try {
    // Load textures in parallel
    const [diffuseResult, alphaResult] = await Promise.allSettled([
      loadTexture(BATHYMETRY_PATHS.diffuse, 'diffuse'),
      loadTexture(BATHYMETRY_PATHS.alpha, 'alpha'),
    ]);
    
    const textures: BathymetryTextures = {
      diffuse: null,
      alpha: null,
      isLoaded: false,
      hasErrors: false,
    };
    
    // Process diffuse texture result
    if (diffuseResult.status === 'fulfilled') {
      textures.diffuse = diffuseResult.value;
    } else {
      console.warn('Failed to load diffuse bathymetry texture:', diffuseResult.reason);
      textures.hasErrors = true;
    }
    
    // Process alpha texture result
    if (alphaResult.status === 'fulfilled') {
      textures.alpha = alphaResult.value;
    } else {
      console.warn('Failed to load alpha bathymetry texture:', alphaResult.reason);
      textures.hasErrors = true;
    }
    
    // Mark as loaded if at least one texture succeeded
    textures.isLoaded = !!(textures.diffuse || textures.alpha);
    
    // Cache the result
    bathymetryCache = textures;
    
    console.log('Bathymetry textures loaded:', {
      diffuse: !!textures.diffuse,
      alpha: !!textures.alpha,
      hasErrors: textures.hasErrors
    });
    
    return textures;
    
  } catch (error) {
    console.error('Failed to load bathymetry textures:', error);
    
    // Return empty textures as fallback
    const fallbackTextures: BathymetryTextures = {
      diffuse: null,
      alpha: null,
      isLoaded: false,
      hasErrors: true,
    };
    
    bathymetryCache = fallbackTextures;
    return fallbackTextures;
  }
}

// Create bathymetry material
export function createBathymetryMaterial(
  textures: BathymetryTextures,
  config: Partial<BathymetryConfig> = {}
): THREE.MeshBasicMaterial {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const materialOptions: THREE.MeshBasicMaterialParameters = {
    color: new THREE.Color(finalConfig.color),
    transparent: true,
    opacity: finalConfig.transparency,
    wireframe: finalConfig.enableWireframe,
  };
  
  // Add diffuse texture if available
  if (textures.diffuse) {
    materialOptions.map = textures.diffuse;
  }
  
  // Add alpha texture if available
  if (textures.alpha) {
    materialOptions.alphaMap = textures.alpha;
  }
  
  // Add emissive properties
  if (finalConfig.emissive && finalConfig.emissiveIntensity > 0) {
    materialOptions.emissive = new THREE.Color(finalConfig.emissive);
    // Note: emissiveIntensity is not available in MeshBasicMaterial
  }
  
  const material = new THREE.MeshBasicMaterial(materialOptions);
  
  return material;
}

// Create realistic material with PBR properties
export function createRealisticBathymetryMaterial(
  textures: BathymetryTextures,
  config: Partial<BathymetryConfig> = {}
): THREE.MeshStandardMaterial {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const materialOptions: THREE.MeshStandardMaterialParameters = {
    color: new THREE.Color(finalConfig.color),
    transparent: true,
    opacity: finalConfig.transparency,
    wireframe: finalConfig.enableWireframe,
    metalness: 0.0,
    roughness: 0.8,
    emissive: new THREE.Color(finalConfig.emissive),
    emissiveIntensity: finalConfig.emissiveIntensity,
  };
  
  // Add diffuse texture if available
  if (textures.diffuse) {
    materialOptions.map = textures.diffuse;
  }
  
  // Add alpha texture if available
  if (textures.alpha) {
    materialOptions.alphaMap = textures.alpha;
  }
  
  return new THREE.MeshStandardMaterial(materialOptions);
}

// Create wireframe bathymetry material (for neon mode)
export function createWireframeBathymetryMaterial(
  textures: BathymetryTextures,
  color: string = "#00ff00",
  opacity: number = 0.3
): THREE.MeshBasicMaterial {
  const materialOptions: THREE.MeshBasicMaterialParameters = {
    color: new THREE.Color(color),
    transparent: true,
    opacity: opacity,
    wireframe: true,
  };
  
  // Use alpha texture for wireframe density if available
  if (textures.alpha) {
    materialOptions.alphaMap = textures.alpha;
  }
  
  return new THREE.MeshBasicMaterial(materialOptions);
}

// Create fallback material when textures fail to load
export function createFallbackBathymetryMaterial(
  mode: 'realistic' | 'wireframe' = 'realistic'
): THREE.Material {
  if (mode === 'wireframe') {
    return new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
    });
  }
  
  // Create simple gradient material
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  // Create ocean gradient
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, '#004488');
  gradient.addColorStop(1, '#001122');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return new THREE.MeshBasicMaterial({
    map: texture,
    color: 0x004488,
    transparent: true,
    opacity: 0.8,
  });
}

// Preload bathymetry textures for better performance
export async function preloadBathymetryTextures(): Promise<void> {
  try {
    await loadBathymetryTextures();
    console.log('Bathymetry textures preloaded successfully');
  } catch (error) {
    console.error('Failed to preload bathymetry textures:', error);
  }
}

// Get cached bathymetry textures
export function getCachedBathymetryTextures(): BathymetryTextures | null {
  return bathymetryCache;
}

// Check if bathymetry textures are loaded
export function areBathymetryTexturesLoaded(): boolean {
  return !!(bathymetryCache && bathymetryCache.isLoaded);
}

// Clear bathymetry texture cache
export function clearBathymetryCache(): void {
  if (bathymetryCache) {
    // Dispose of textures
    if (bathymetryCache.diffuse) {
      bathymetryCache.diffuse.dispose();
    }
    if (bathymetryCache.alpha) {
      bathymetryCache.alpha.dispose();
    }
  }
  
  bathymetryCache = null;
  console.log('Bathymetry texture cache cleared');
}

// Update material properties dynamically
export function updateBathymetryMaterial(
  material: THREE.Material,
  config: Partial<BathymetryConfig>
): void {
  if (material instanceof THREE.MeshBasicMaterial || material instanceof THREE.MeshStandardMaterial) {
    if (config.color) {
      material.color.setStyle(config.color);
    }
    if (config.transparency !== undefined) {
      material.opacity = config.transparency;
    }
    if (config.enableWireframe !== undefined) {
      material.wireframe = config.enableWireframe;
    }
    
    material.needsUpdate = true;
  }
}

// Get texture memory usage estimation
export function getBathymetryMemoryUsage(): number {
  if (!bathymetryCache) return 0;
  
  let usage = 0;
  
  if (bathymetryCache.diffuse) {
    const image = bathymetryCache.diffuse.image as HTMLImageElement;
    if (image) {
      usage += image.width * image.height * 4; // RGBA
    }
  }
  
  if (bathymetryCache.alpha) {
    const image = bathymetryCache.alpha.image as HTMLImageElement;
    if (image) {
      usage += image.width * image.height; // Grayscale
    }
  }
  
  return usage; // bytes
}

// Create animated water material
export function createAnimatedWaterMaterial(
  textures: BathymetryTextures
): THREE.ShaderMaterial {
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  const fragmentShader = `
    uniform float time;
    uniform sampler2D diffuseTexture;
    uniform sampler2D alphaTexture;
    uniform vec3 color;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    
    void main() {
      vec2 animatedUv = vUv + vec2(sin(time * 0.1) * 0.01, cos(time * 0.15) * 0.01);
      
      vec4 diffuseColor = texture2D(diffuseTexture, animatedUv);
      float alpha = texture2D(alphaTexture, vUv).r;
      
      vec3 finalColor = diffuseColor.rgb * color;
      
      gl_FragColor = vec4(finalColor, alpha * 0.8);
    }
  `;
  
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      diffuseTexture: { value: textures.diffuse },
      alphaTexture: { value: textures.alpha },
      color: { value: new THREE.Color(0x004488) },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
  });
}