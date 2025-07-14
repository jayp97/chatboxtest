'use client'
import { useState, useEffect } from 'react'
import { TerminalUI } from '@/components/terminal/TerminalUI'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'

export default function Home() {
  const [isOnboarding, setIsOnboarding] = useState(true)
  const [userPreferences, setUserPreferences] = useState({
    favoriteCountry: '',
    favoriteContinent: '',
    favoriteDestination: ''
  })

  // Check if user has completed onboarding
  useEffect(() => {
    const savedPreferences = localStorage.getItem('geosys-preferences')
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences)
      setUserPreferences(preferences)
      setIsOnboarding(false)
    }
  }, [])

  const handleOnboardingComplete = (preferences: typeof userPreferences) => {
    setUserPreferences(preferences)
    localStorage.setItem('geosys-preferences', JSON.stringify(preferences))
    setIsOnboarding(false)
  }

  const handleResetPreferences = () => {
    localStorage.removeItem('geosys-preferences')
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
          userPreferences={userPreferences}
          onResetPreferences={handleResetPreferences}
        />
      )}
    </div>
  )
}