/**
 * CountryArt.tsx
 * Component for displaying animated country-specific ASCII art
 * Handles frame transitions and animation timing
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { getCountryArt, CountryASCII } from "@/app/utils/ascii-library";

interface CountryArtProps {
  country: string;
  showLandmark?: boolean;
  animate?: boolean;
  onAnimationComplete?: () => void;
  className?: string;
}

export function CountryArt({ 
  country, 
  showLandmark = false,
  animate = true,
  onAnimationComplete,
  className = ""
}: CountryArtProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [artData, setArtData] = useState<CountryASCII | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Load country art data
  useEffect(() => {
    const data = getCountryArt(country);
    setArtData(data);
    setCurrentFrame(0);
  }, [country]);

  // Handle animation
  useEffect(() => {
    if (!artData?.animated || !animate) return;

    const { frames, loop } = artData.animated;
    let frameIndex = 0;

    const animateFrames = () => {
      if (frameIndex >= frames.length) {
        if (loop) {
          frameIndex = 0;
        } else {
          onAnimationComplete?.();
          return;
        }
      }

      setCurrentFrame(frameIndex);
      const duration = frames[frameIndex].duration || 500;
      
      frameIndex++;
      animationRef.current = setTimeout(animateFrames, duration);
    };

    // Start animation
    animateFrames();

    // Cleanup
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [artData, animate, onAnimationComplete]);

  if (!artData) return null;

  // Determine what to display
  let displayContent: string;
  
  if (showLandmark && artData.landmark) {
    displayContent = artData.landmark;
  } else if (animate && artData.animated && artData.animated.frames[currentFrame]) {
    displayContent = artData.animated.frames[currentFrame].content;
  } else {
    displayContent = artData.static;
  }

  return (
    <div className={`font-mono text-green-400 whitespace-pre ${className}`}>
      {displayContent}
    </div>
  );
}