'use client'
import { useState, useEffect } from 'react'
import { TerminalUI } from '@/components/terminal/TerminalUI'
import { RetroBackground } from '@/components/background/RetroBackground'
import { RetroBackgroundSimple } from '@/components/background/RetroBackgroundSimple'
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
      
      {/* Terminal UI with semi-transparent background */}
      <div className="relative z-10 h-full">
        <TerminalUI userId={userId} />
      </div>
      
      {/* Performance toggle button */}
      <button
        onClick={() => {
          const newMode = !useSimpleBackground
          setUseSimpleBackground(newMode)
          localStorage.setItem('geosys-performance-mode', newMode ? 'low' : 'high')
        }}
        className="absolute bottom-4 right-4 z-20 px-3 py-1 text-xs text-cyan-400 border border-cyan-400/30 rounded bg-black/50 backdrop-blur hover:bg-cyan-400/10 transition-colors"
        title={useSimpleBackground ? "Switch to high quality background" : "Switch to performance mode"}
      >
        {useSimpleBackground ? "🔋 Performance" : "✨ Quality"}
      </button>
    </div>
  )
}