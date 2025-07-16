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
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearFilter; // Simplified filtering to avoid mipmap issues
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false; // Disable mipmaps to avoid WebGL errors
        texture.flipY = false;
        
        // Fix mirror effect by flipping texture horizontally
        texture.repeat.x = -1;
        texture.offset.x = 1;
        
        // Special settings for alpha texture
        if (name === 'alpha') {
          // Keep default format for alpha textures to avoid WebGL errors
          // texture.format = THREE.RedFormat; // Commented out to avoid format issues
        }
        
        resolve(texture);
      },
      () => {
        // Progress callback - no action needed
      },
      (error) => {
        reject(new Error(`Failed to load ${name} texture: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    );
  });
}

// Load all bathymetry textures
export async function loadBathymetryTextures(): Promise<BathymetryTextures> {
  // Return cached textures if available
  if (bathymetryCache && bathymetryCache.isLoaded) {
    return bathymetryCache;
  }

  
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
      console.error('Failed to load diffuse texture:', diffuseResult.reason);
      textures.hasErrors = true;
    }
    
    // Process alpha texture result
    if (alphaResult.status === 'fulfilled') {
      textures.alpha = alphaResult.value;
    } else {
      console.error('Failed to load alpha texture:', alphaResult.reason);
      textures.hasErrors = true;
    }
    
    // Mark as loaded if at least one texture succeeded
    textures.isLoaded = !!(textures.diffuse || textures.alpha);
    
    // Cache the result
    bathymetryCache = textures;
    
    
    return textures;
    
  } catch (error) {
    console.error('Error loading bathymetry textures:', error);
    
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