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
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect for current step
  useEffect(() => {
    if (currentStep >= BOOT_STEPS.length) {
      // Boot sequence complete
      setTimeout(() => {
        onComplete?.();
      }, 1000);
      return;
    }

    const step = BOOT_STEPS[currentStep];
    let charIndex = 0;
    setDisplayText("");
    setProgress(0);

    // Typewriter effect
    const typeInterval = setInterval(() => {
      if (charIndex < step.text.length) {
        setDisplayText(step.text.slice(0, charIndex + 1));
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
              // Add completed step with progress and move to next step simultaneously
              setCompletedSteps(prev => [...prev, step.text + " [████████████████████] 100%"]);
              setDisplayText("");
              setCurrentStep(prev => prev + 1);
            }
          }, 30);
        } else {
          // Add completed step and move to next step simultaneously
          setTimeout(() => {
            setCompletedSteps(prev => [...prev, step.text]);
            setDisplayText("");
            setCurrentStep(prev => prev + 1);
          }, step.isComplete ? 500 : 100);
        }
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [currentStep, onComplete]);

  // Render progress bar
  const renderProgressBar = () => {
    const safeProgress = Math.max(0, Math.min(100, progress || 0));
    const filled = Math.floor(safeProgress / 5);
    const empty = Math.max(0, 20 - filled);
    return ` [${"\u2588".repeat(filled)}${" ".repeat(empty)}] ${safeProgress}%`;
  };

  return (
    <div className="boot-sequence font-mono">
      {/* Display completed steps */}
      {completedSteps.map((step, index) => (
        <div key={index} className="mb-2 text-green-400">
          {step}
        </div>
      ))}
      
      {/* Display current step with typewriter effect */}
      {currentStep < BOOT_STEPS.length && displayText && (
        <div className="mb-2 text-green-400">
          <span>{displayText}</span>
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