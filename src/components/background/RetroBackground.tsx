/**
 * RetroBackground.tsx
 * Animated cyberpunk-style background with grid, particles, and geometric shapes
 * Creates an immersive retro-futuristic atmosphere
 */

"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface GeometricShape {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  type: "triangle" | "hexagon" | "diamond";
  trail: { x: number; y: number; opacity: number }[];
}

export function RetroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const frameCount = useRef(0);
  const lastFrameTime = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles (reduced count for performance)
    const particles: Particle[] = [];
    const particleCount = 20; // Reduced from 50
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3, // Slower movement
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5, // Slightly smaller
        opacity: Math.random() * 0.3 + 0.1, // Less bright
        color: Math.random() > 0.5 ? "#00ffff" : "#ff00ff",
      });
    }

    // Initialize geometric shapes (reduced count)
    const shapes: GeometricShape[] = [];
    const shapeTypes: GeometricShape["type"][] = ["triangle", "hexagon", "diamond"];
    const shapeColors = ["#00ffff", "#ff00ff", "#ffff00"];
    
    for (let i = 0; i < 3; i++) { // Reduced from 5
      shapes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 25 + 15, // Slightly smaller
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01, // Slower rotation
        color: shapeColors[Math.floor(Math.random() * shapeColors.length)],
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        trail: [],
      });
    }

    // Draw perspective grid (optimized)
    const drawGrid = (time: number) => {
      const gridSize = 80; // Increased size = fewer lines
      const horizonY = canvas.height * 0.4;
      const vanishingPointX = canvas.width / 2;
      
      // Animated offset for movement effect
      const offset = (time * 0.01) % gridSize; // Slower animation

      // Set up for batch drawing
      ctx.strokeStyle = "#00ffff15"; // Lower opacity
      ctx.lineWidth = 1;
      ctx.beginPath();

      // Horizontal lines (fewer lines)
      for (let y = horizonY; y < canvas.height; y += gridSize) {
        const lineY = y + offset * ((y - horizonY) / (canvas.height - horizonY));
        ctx.moveTo(0, lineY);
        ctx.lineTo(canvas.width, lineY);
      }

      // Vertical lines (fewer lines)
      const verticalLines = 12; // Reduced from 20
      for (let i = 0; i <= verticalLines; i++) {
        const x = (i / verticalLines) * canvas.width;
        ctx.moveTo(x, canvas.height);
        const convergenceX = vanishingPointX + (x - vanishingPointX) * 0.3;
        ctx.lineTo(convergenceX, horizonY);
      }
      
      // Draw all lines at once
      ctx.stroke();
    };

    // Draw geometric shape
    const drawShape = (shape: GeometricShape) => {
      ctx.save();
      ctx.translate(shape.x, shape.y);
      ctx.rotate(shape.rotation);
      
      // Skip trail drawing for performance
      // Trail effects are too expensive for smooth animation
      
      // Draw main shape without glow (glow is expensive)
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      switch (shape.type) {
        case "triangle":
          ctx.moveTo(0, -shape.size);
          ctx.lineTo(-shape.size * 0.866, shape.size * 0.5);
          ctx.lineTo(shape.size * 0.866, shape.size * 0.5);
          ctx.closePath();
          break;
          
        case "hexagon":
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = Math.cos(angle) * shape.size;
            const y = Math.sin(angle) * shape.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          break;
          
        case "diamond":
          ctx.moveTo(0, -shape.size);
          ctx.lineTo(shape.size * 0.7, 0);
          ctx.lineTo(0, shape.size);
          ctx.lineTo(-shape.size * 0.7, 0);
          ctx.closePath();
          break;
      }
      
      ctx.stroke();
      ctx.restore();
    };

    // Animation loop (optimized)
    const animate = (currentTime: number) => {
      // Frame rate limiting (30 FPS)
      const deltaTime = currentTime - lastFrameTime.current;
      if (deltaTime < 33) { // ~30 FPS
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime.current = currentTime;
      
      frameCount.current++;
      timeRef.current = frameCount.current * 2; // Consistent time progression
      
      // Clear canvas completely (faster than fade)
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      drawGrid(timeRef.current);
      
      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle without glow (much faster)
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
      });
      
      // Update and draw shapes
      shapes.forEach((shape) => {
        // Simplified position update
        shape.x += Math.sin(timeRef.current * 0.0005 + shape.size) * 0.3;
        shape.y += Math.cos(timeRef.current * 0.0005 + shape.size) * 0.2;
        
        // Wrap around
        if (shape.x < -50) shape.x = canvas.width + 50;
        if (shape.x > canvas.width + 50) shape.x = -50;
        if (shape.y < -50) shape.y = canvas.height + 50;
        if (shape.y > canvas.height + 50) shape.y = -50;
        
        // Update rotation
        shape.rotation += shape.rotationSpeed;
        
        // Skip trail updates for performance
        
        drawShape(shape);
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Canvas for animated elements */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: "#000" }}
      />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/10 to-purple-900/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-900/10 via-transparent to-blue-900/10 pointer-events-none" />
      
      {/* Radial gradient for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)",
        }}
      />
      
      {/* Scanline effect removed for performance */}
    </div>
  );
}