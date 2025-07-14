'use client'
import { useState, useEffect } from 'react'
import { TerminalUI } from '@/components/terminal/TerminalUI'

export default function Home() {
  const [userId, setUserId] = useState<string>('')

  // Get or create a persistent user ID
  useEffect(() => {
    let storedUserId = localStorage.getItem('geosys-user-id')
    if (!storedUserId) {
      storedUserId = `geosys-user-${Date.now()}`
      localStorage.setItem('geosys-user-id', storedUserId)
    }
    setUserId(storedUserId)
  }, [])

  return (
    <div className="h-screen bg-black overflow-hidden">
      <TerminalUI userId={userId} />
    </div>
  )
}