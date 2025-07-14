/**
 * CRTEffects.tsx
 * CRT monitor visual effects overlay
 * Provides scanlines, flicker, and phosphor glow
 */

"use client";

import { useEffect, useState } from "react";

export function CRTEffects() {
  const [flickerOpacity, setFlickerOpacity] = useState(1);

  // Random flicker effect
  useEffect(() => {
    const flickerInterval = setInterval(() => {
      // Random chance of flicker
      if (Math.random() > 0.95) {
        setFlickerOpacity(0.95 + Math.random() * 0.05);
        setTimeout(() => setFlickerOpacity(1), 50);
      }
    }, 3000);

    return () => clearInterval(flickerInterval);
  }, []);

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10"
      style={{ opacity: flickerOpacity }}
    >
      {/* Scanlines */}
      <div className="absolute inset-0 crt-scanlines opacity-40" />
      
      {/* Screen curvature */}
      <div className="absolute -inset-[2%] crt-curve" />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 crt-vignette" />
      
      {/* Chromatic aberration */}
      <div className="absolute inset-0 crt-chromatic" />
      
      {/* Noise/static overlay */}
      <div className="absolute inset-0 opacity-[0.02] z-[1] pointer-events-none crt-noise" />
      
      {/* Additional glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-radial from-green-500/5 to-transparent" />
      </div>
    </div>
  );
}