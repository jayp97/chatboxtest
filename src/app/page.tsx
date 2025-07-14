'use client'
import { useState, useEffect } from 'react'
import { TerminalUI } from '@/components/terminal/TerminalUI'
import { RetroBackground } from '@/components/background/RetroBackground'
import { RetroBackgroundSimple } from '@/components/background/RetroBackgroundSimple'
import { GlobeContainer } from '@/components/globe/GlobeContainer'
import '@/styles/retro-background.css'

export default function Home() {
  const [userId, setUserId] = useState<string>('')
  const [useSimpleBackground, setUseSimpleBackground] = useState(true)

  // Get or create a persistent user ID
  useEffect(() => {
    let storedUserId = localStorage.getItem('geosys-user-id')
    if (!storedUserId) {
      storedUserId = `geosys-user-${Date.now()}`
      localStorage.setItem('geosys-user-id', storedUserId)
    }
    setUserId(storedUserId)
    
    // Check for performance preference
    const performanceMode = localStorage.getItem('geosys-performance-mode')
    setUseSimpleBackground(performanceMode !== 'high')
  }, [])

  return (
    <div className="h-screen overflow-hidden relative">
      {/* Animated retro background - use simple by default for performance */}
      {useSimpleBackground ? <RetroBackgroundSimple /> : <RetroBackground />}
      
      {/* Split-screen layout container */}
      <div className="relative z-10 h-full flex">
        {/* Left side: Terminal UI (60%) */}
        <div className="w-full lg:w-[60%] h-full relative">
          <TerminalUI userId={userId} />
        </div>
        
        {/* Right side: Globe (40%) - Hidden on mobile */}
        <div className="hidden lg:block lg:w-[40%] h-full relative">
          {/* Globe container */}
          <GlobeContainer className="w-full h-full" />
        </div>
      </div>
      
      {/* Performance toggle button */}
      <button
        onClick={() => {
          const newMode = !useSimpleBackground
          setUseSimpleBackground(newMode)
          localStorage.setItem('geosys-performance-mode', newMode ? 'low' : 'high')
        }}
        className="absolute bottom-4 left-4 z-20 px-3 py-1 text-xs text-cyan-400 border border-cyan-400/30 rounded bg-black/50 backdrop-blur hover:bg-cyan-400/10 transition-colors"
        title={useSimpleBackground ? "Switch to high quality background" : "Switch to performance mode"}
      >
        {useSimpleBackground ? "🔋 Performance" : "✨ Quality"}
      </button>
    </div>
  )
}