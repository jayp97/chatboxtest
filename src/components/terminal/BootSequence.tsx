/**
 * BootSequence.tsx
 * Animated boot sequence component
 * Shows GEOSYS initialisation when chat opens
 */

"use client";

import { useState, useEffect } from "react";

interface BootSequenceProps {
  onComplete?: () => void;
}

interface BootStep {
  text: string;
  duration: number;
  showProgress?: boolean;
  isComplete?: boolean;
}

const BOOT_STEPS: BootStep[] = [
  { text: "GEOSYS v4.2.1 INITIALISING...", duration: 2000 },
  { text: "CHECKING SYSTEM INTEGRITY... ", duration: 1500 },
  { text: "CHECKING SYSTEM INTEGRITY... OK", duration: 500, isComplete: true },
  { text: "LOADING WORLD DATABASE... ", duration: 2500, showProgress: true },
  { text: "ESTABLISHING SATELLITE UPLINK... ", duration: 2000 },
  { text: "CONNECTION ESTABLISHED", duration: 1000, isComplete: true },
  { text: "READY. TYPE 'HELLO' TO BEGIN", duration: 1000, isComplete: true },
];

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  console.log("🚀 BootSequence Render:", {
    currentStep,
    progress,
    displayText: displayText ? displayText.substring(0, 20) + "..." : "empty",
    cursorVisible
  });

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect for current step
  useEffect(() => {
    console.log("📝 Boot step effect triggered:", { currentStep, totalSteps: BOOT_STEPS.length });
    
    if (currentStep >= BOOT_STEPS.length) {
      // Boot sequence complete
      console.log("🎉 Boot sequence complete, calling onComplete");
      setTimeout(() => {
        onComplete?.();
      }, 1000);
      return;
    }

    const step = BOOT_STEPS[currentStep];
    console.log("⚡ Starting step:", step.text);
    let charIndex = 0;
    setDisplayText("");
    setProgress(0);

    // Typewriter effect
    const typeInterval = setInterval(() => {
      if (charIndex < step.text.length) {
        setDisplayText(prev => prev + step.text[charIndex]);
        charIndex++;
      } else {
        clearInterval(typeInterval);
        
        // If this step shows progress, animate progress bar
        if (step.showProgress) {
          let currentProgress = 0;
          const progressInterval = setInterval(() => {
            if (currentProgress <= 100) {
              setProgress(currentProgress);
              currentProgress += 2;
            } else {
              clearInterval(progressInterval);
              // Move to next step after progress completes
              setTimeout(() => {
                setCurrentStep(prev => prev + 1);
              }, 500);
            }
          }, 30);
        } else {
          // Move to next step after duration
          setTimeout(() => {
            setCurrentStep(prev => prev + 1);
          }, step.isComplete ? 500 : 100);
        }
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [currentStep, onComplete]);

  // Render progress bar
  const renderProgressBar = () => {
    const safeProgress = progress || 0;
    const filled = Math.floor(safeProgress / 5);
    const empty = 20 - filled;
    return `[${"\u2588".repeat(filled)}${" ".repeat(empty)}] ${safeProgress}%`;
  };

  // Get all previous steps for display
  const previousSteps = BOOT_STEPS.slice(0, currentStep).map((step, index) => (
    <div key={index} className="mb-2 text-green-400">
      {step.text || ""}
      {step.showProgress && " [████████████████████] 100%"}
    </div>
  ));

  return (
    <div className="boot-sequence font-mono">
      {/* Display previous steps */}
      {previousSteps}
      
      {/* Display current step with typewriter effect */}
      {currentStep < BOOT_STEPS.length && (
        <div className="mb-2 text-green-400">
          <span>{displayText || ""}</span>
          {BOOT_STEPS[currentStep].showProgress && progress > 0 && (
            <span>{renderProgressBar()}</span>
          )}
          {!BOOT_STEPS[currentStep].isComplete && cursorVisible && (
            <span className="animate-pulse">█</span>
          )}
        </div>
      )}
      
      {/* Boot sequence ASCII art */}
      {currentStep === 0 && (
        <div className="mt-8 text-green-400/50 text-xs whitespace-pre">
{`     _____ ______ ____   _______     _______ 
    / ____|  ____/ __ \\ / ____\\ \\   / / ____|
   | |  __| |__ | |  | | (___  \\ \\_/ / (___  
   | | |_ |  __|| |  | |\\___ \\  \\   / \\___ \\ 
   | |__| | |___| |__| |____) |  | |  ____) |
    \\_____|______\\____/|_____/   |_| |_____/ 
                                             
    G E O G R A P H I C   I N T E L L I G E N C E`}
        </div>
      )}
      
      {/* Add some visual flair with dots animation */}
      {currentStep === 4 && (
        <div className="mt-4 text-green-400/70">
          <span className="inline-block animate-pulse">Connecting</span>
          <span className="inline-block animate-pulse delay-100">.</span>
          <span className="inline-block animate-pulse delay-200">.</span>
          <span className="inline-block animate-pulse delay-300">.</span>
        </div>
      )}
    </div>
  );
}