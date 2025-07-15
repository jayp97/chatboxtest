'use client'

import { useState, useEffect } from 'react'
import { TerminalUI } from '@/components/terminal/TerminalUI'
import { RetroBackgroundSimple } from '@/components/background/RetroBackgroundSimple'
import { GlobeContainer } from '@/components/globe/GlobeContainer'
import '@/styles/retro-background.css'

/**
 * Home Page Component
 * Main entry point for the geography chatbot application
 * Features a terminal UI on the left and a 3D globe on the right
 */
export default function Home() {
  const [userId, setUserId] = useState<string>('')
  const [threadId, setThreadId] = useState<string>('')

  // Get or create a persistent user ID and thread ID
  useEffect(() => {
    // Include environment in storage keys to prevent conflicts
    const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
    const userKey = `geosys-user-id-${env}`
    const threadKey = `geosys-thread-id-${env}`
    
    // Get or create user ID
    let storedUserId = localStorage.getItem(userKey)
    if (!storedUserId) {
      storedUserId = `geosys-user-${Date.now()}`
      localStorage.setItem(userKey, storedUserId)
    }
    setUserId(storedUserId)
    
    // Get or create thread ID (environment-specific)
    let storedThreadId = localStorage.getItem(threadKey)
    if (!storedThreadId) {
      storedThreadId = `geosys-terminal-thread-${env}-${Date.now()}`
      localStorage.setItem(threadKey, storedThreadId)
    }
    setThreadId(storedThreadId)
  }, [])

  return (
    <div className="h-screen overflow-hidden relative">
      {/* Animated retro background */}
      <RetroBackgroundSimple />
      
      {/* Split-screen layout container */}
      <div className="relative z-10 h-full flex">
        {/* Left side: Terminal UI (60%) */}
        <div className="w-full lg:w-[60%] h-full relative">
          <TerminalUI userId={userId} threadId={threadId} />
        </div>
        
        {/* Right side: Globe (40%) - Hidden on mobile */}
        <div className="hidden lg:block lg:w-[40%] h-full relative">
          {/* Globe container */}
          <GlobeContainer className="w-full h-full" />
        </div>
      </div>
      
    </div>
  )
}