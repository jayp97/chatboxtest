'use client'
import { useState, useEffect } from 'react'
import { TerminalUI } from '@/components/terminal/TerminalUI'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'

export default function Home() {
  const [isOnboarding, setIsOnboarding] = useState(true)
  const [userId, setUserId] = useState<string>('')
  const [userPreferences, setUserPreferences] = useState({
    favoriteCountry: '',
    favoriteContinent: '',
    favoriteDestination: ''
  })

  // Get or create a persistent user ID
  useEffect(() => {
    let storedUserId = localStorage.getItem('geosys-user-id')
    if (!storedUserId) {
      storedUserId = `geosys-user-${Date.now()}`
      localStorage.setItem('geosys-user-id', storedUserId)
    }
    setUserId(storedUserId)
    
    // For now, always show onboarding
    // In a production app, you'd check if this user has preferences in Mastra
    setIsOnboarding(true)
  }, [])

  const handleOnboardingComplete = async (preferences: typeof userPreferences) => {
    setUserPreferences(preferences)
    setIsOnboarding(false)
    
    // Send preferences to the agent to store in working memory
    try {
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `My favourite country is ${preferences.favoriteCountry}, my favourite continent is ${preferences.favoriteContinent}, and my favourite destination is ${preferences.favoriteDestination}. Please remember these preferences.`,
          userId: userId,
          threadId: 'geosys-terminal-thread',
          userPreferences: {
            favouriteCountry: preferences.favoriteCountry,
            favouriteContinent: preferences.favoriteContinent,
            favouriteDestination: preferences.favoriteDestination
          }
        })
      })
      
      if (response.body) {
        const reader = response.body.getReader()
        // Consume the stream but don't display it
        while (true) {
          const { done } = await reader.read()
          if (done) break
        }
      }
    } catch (error) {
      console.error('Error storing preferences:', error)
    }
  }

  const handleResetPreferences = () => {
    // Just reset to onboarding - Mastra memory will handle the rest
    setIsOnboarding(true)
    setUserPreferences({
      favoriteCountry: '',
      favoriteContinent: '',
      favoriteDestination: ''
    })
  }

  return (
    <div className="h-screen bg-black overflow-hidden">
      {isOnboarding ? (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
        />
      ) : (
        <TerminalUI
          userId={userId}
          onResetPreferences={handleResetPreferences}
        />
      )}
    </div>
  )
}