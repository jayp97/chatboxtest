/**
 * LoadingIndicator.tsx
 * Retro terminal-style loading animation
 * Displays while waiting for AI responses
 */

"use client";

import { useEffect, useState } from "react";

const LOADING_FRAMES = [
  "◐",
  "◓",
  "◑",
  "◒"
];

const MATRIX_CHARS = "01";
const SCAN_LINES = [
  "████████████████████",
  "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
  "▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒",
  "░░░░░░░░░░░░░░░░░░░░"
];

export function LoadingIndicator() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [glitchText, setGlitchText] = useState("");
  const [scanLineIndex, setScanLineIndex] = useState(0);
  const [matrixRain, setMatrixRain] = useState("");

  useEffect(() => {
    // Main spinner animation
    const spinnerInterval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % LOADING_FRAMES.length);
    }, 100);

    // Glitch effect
    const glitchInterval = setInterval(() => {
      const chars = "PROCESSING REQUEST";
      const glitched = chars
        .split("")
        .map((char) => (Math.random() > 0.9 ? MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] : char))
        .join("");
      setGlitchText(glitched);
    }, 80);

    // Scan line animation
    const scanInterval = setInterval(() => {
      setScanLineIndex((prev) => (prev + 1) % SCAN_LINES.length);
    }, 150);

    // Matrix rain effect
    const matrixInterval = setInterval(() => {
      const rain = Array.from({ length: 20 }, () => 
        Math.random() > 0.5 ? "1" : "0"
      ).join("");
      setMatrixRain(rain);
    }, 50);

    return () => {
      clearInterval(spinnerInterval);
      clearInterval(glitchInterval);
      clearInterval(scanInterval);
      clearInterval(matrixInterval);
    };
  }, []);

  return (
    <div className="loading-indicator my-4">
      <div className="flex items-center gap-3">
        {/* Main spinner */}
        <div className="text-green-400 text-2xl animate-pulse phosphor-glow">
          {LOADING_FRAMES[frameIndex]}
        </div>
        
        {/* Processing text with glitch */}
        <div className="text-green-400 font-mono">
          <span className="glitch-text">{glitchText}</span>
        </div>
      </div>
      
      {/* Scan line effect */}
      <div className="mt-2 text-green-400/30 text-xs overflow-hidden">
        <div className="scan-line">{SCAN_LINES[scanLineIndex]}</div>
      </div>
      
      {/* Matrix rain decoration */}
      <div className="text-green-400/20 text-xs font-mono mt-1">
        {matrixRain}
      </div>
      
      {/* Additional effects */}
      <div className="flex gap-1 mt-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,0,0.8)]"></div>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-100 shadow-[0_0_10px_rgba(0,255,0,0.8)]"></div>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200 shadow-[0_0_10px_rgba(0,255,0,0.8)]"></div>
      </div>
    </div>
  );
}

// Alternative compact loading indicator for inline use
export function InlineLoadingIndicator() {
  const [dots, setDots] = useState("");
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <span className="text-green-400 animate-pulse">
      AWAITING RESPONSE{dots} <span className="inline-block w-2 h-4 bg-green-400 animate-pulse"></span>
    </span>
  );
}