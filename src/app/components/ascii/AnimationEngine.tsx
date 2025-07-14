/**
 * AnimationEngine.tsx
 * Engine for managing complex ASCII animations
 * Handles transitions, sequences, and special effects
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { ASCIIAnimation, ASCIIFrame, ASCII_TRANSITIONS } from "@/app/utils/ascii-library";

interface AnimationEngineProps {
  animation: ASCIIAnimation | null;
  onComplete?: () => void;
  loop?: boolean;
  className?: string;
  transitionIn?: "fadeIn" | "typewriter" | "glitch" | "none";
  transitionOut?: "fadeOut" | "dissolve" | "glitch" | "none";
}

export function AnimationEngine({
  animation,
  onComplete,
  loop = false,
  className = "",
  transitionIn = "none",
  transitionOut = "none"
}: AnimationEngineProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [displayContent, setDisplayContent] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const transitionRef = useRef<NodeJS.Timeout | null>(null);

  // Handle transitions
  const applyTransition = (
    type: string,
    content: string,
    callback: () => void
  ) => {
    if (type === "none") {
      setDisplayContent(content);
      callback();
      return;
    }

    setIsTransitioning(true);
    let transitionAnimation: ASCIIAnimation | null = null;

    switch (type) {
      case "fadeIn":
        transitionAnimation = ASCII_TRANSITIONS.fadeIn(content);
        break;
      case "typewriter":
        transitionAnimation = ASCII_TRANSITIONS.typewriter(content);
        break;
      case "glitch":
        transitionAnimation = ASCII_TRANSITIONS.glitch(content);
        break;
    }

    if (transitionAnimation) {
      let frameIndex = 0;
      const playTransition = () => {
        if (frameIndex >= transitionAnimation.frames.length) {
          setIsTransitioning(false);
          callback();
          return;
        }

        setDisplayContent(transitionAnimation.frames[frameIndex].content);
        const duration = transitionAnimation.frames[frameIndex].duration || 100;
        
        frameIndex++;
        transitionRef.current = setTimeout(playTransition, duration);
      };

      playTransition();
    }
  };

  // Main animation loop
  useEffect(() => {
    if (!animation || isTransitioning) return;

    const { frames } = animation;
    let frameIndex = currentFrame;

    const playAnimation = () => {
      if (frameIndex >= frames.length) {
        if (loop || animation.loop) {
          frameIndex = 0;
          setCurrentFrame(0);
        } else {
          // Animation complete
          if (transitionOut !== "none") {
            applyTransition(transitionOut, "", () => {
              onComplete?.();
            });
          } else {
            onComplete?.();
          }
          return;
        }
      }

      const frame = frames[frameIndex];
      
      if (frameIndex === 0 && transitionIn !== "none") {
        applyTransition(transitionIn, frame.content, () => {
          frameIndex++;
          animationRef.current = setTimeout(playAnimation, frame.duration || 500);
        });
      } else {
        setDisplayContent(frame.content);
        frameIndex++;
        setCurrentFrame(frameIndex);
        animationRef.current = setTimeout(playAnimation, frame.duration || 500);
      }
    };

    // Start animation
    playAnimation();

    // Cleanup
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      if (transitionRef.current) {
        clearTimeout(transitionRef.current);
      }
    };
  }, [animation, loop, currentFrame, transitionIn, transitionOut, onComplete, isTransitioning]);

  if (!animation) return null;

  return (
    <div className={`font-mono text-green-400 whitespace-pre ${className}`}>
      {displayContent}
    </div>
  );
}

// Utility component for creating custom animation sequences
interface AnimationSequenceProps {
  animations: (ASCIIAnimation | string)[];
  delays?: number[];
  onComplete?: () => void;
  className?: string;
}

export function AnimationSequence({
  animations,
  delays = [],
  onComplete,
  className = ""
}: AnimationSequenceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnimation, setCurrentAnimation] = useState<ASCIIAnimation | null>(null);

  useEffect(() => {
    if (currentIndex >= animations.length) {
      onComplete?.();
      return;
    }

    const item = animations[currentIndex];
    const delay = delays[currentIndex] || 0;

    // Handle delay before starting animation
    const startTimeout = setTimeout(() => {
      if (typeof item === "string") {
        // Static text - create a simple animation
        setCurrentAnimation({
          name: "static",
          frames: [{ content: item, duration: 1000 }],
          loop: false
        });
      } else {
        setCurrentAnimation(item);
      }
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [currentIndex, animations, delays, onComplete]);

  const handleAnimationComplete = () => {
    setCurrentIndex(prev => prev + 1);
  };

  if (!currentAnimation) return null;

  return (
    <AnimationEngine
      animation={currentAnimation}
      onComplete={handleAnimationComplete}
      className={className}
    />
  );
}

// Special effect overlays
interface EffectOverlayProps {
  effect: "matrix" | "static" | "glitch" | "scan";
  intensity?: number;
  className?: string;
}

export function EffectOverlay({
  effect,
  intensity = 0.5,
  className = ""
}: EffectOverlayProps) {
  const [effectFrame, setEffectFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setEffectFrame(prev => (prev + 1) % 10);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const renderEffect = () => {
    switch (effect) {
      case "matrix":
        return Array(5).fill(0).map((_, i) => 
          <div key={i} className="opacity-20">
            {Array(20).fill(0).map((_, j) => 
              Math.random() > 0.8 ? String.fromCharCode(0x30A0 + Math.random() * 96) : ' '
            ).join('')}
          </div>
        );
      
      case "static":
        return (
          <div className="absolute inset-0 pointer-events-none">
            {Array(10).fill(0).map((_, i) => 
              <div key={i} className="opacity-5">
                {Array(40).fill(0).map(() => 
                  Math.random() > 0.7 ? '█' : ' '
                ).join('')}
              </div>
            )}
          </div>
        );
      
      case "glitch":
        return effectFrame % 3 === 0 ? (
          <div className="absolute inset-0 text-red-500 opacity-50 mix-blend-screen">
            <div style={{ transform: `translateX(${Math.random() * 4 - 2}px)` }}>
              {Array(3).fill('▓').join('')}
            </div>
          </div>
        ) : null;
      
      case "scan":
        return (
          <div 
            className="absolute w-full h-0.5 bg-green-400 opacity-30"
            style={{ 
              top: `${(effectFrame * 10) % 100}%`,
              boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)'
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`relative ${className}`} style={{ opacity: intensity }}>
      {renderEffect()}
    </div>
  );
}