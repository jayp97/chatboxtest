/**
 * RetroBackgroundSimple.tsx
 * Ultra-lightweight animated background using CSS only
 * No canvas, minimal CPU usage
 */

"use client";

export function RetroBackgroundSimple() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Static grid with CSS animation */}
      <div className="absolute inset-0 retro-grid" />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/5 to-purple-900/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-900/5 via-transparent to-blue-900/5 pointer-events-none" />
      
      {/* Radial gradient for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.5) 100%)",
        }}
      />
      
      {/* Animated orbs (CSS only) */}
      <div className="absolute w-32 h-32 rounded-full bg-cyan-500/10 blur-3xl animate-float-slow top-1/4 left-1/4" />
      <div className="absolute w-48 h-48 rounded-full bg-purple-500/10 blur-3xl animate-float-medium top-3/4 right-1/3" />
      <div className="absolute w-40 h-40 rounded-full bg-pink-500/10 blur-3xl animate-float-fast bottom-1/4 left-2/3" />
    </div>
  );
}