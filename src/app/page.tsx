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

  console.log("🏠 Home Page Render:", {
    isOnboarding,
    userPreferences
  });

  // Check if user has completed onboarding
  useEffect(() => {
    console.log("💾 Checking localStorage for saved preferences...");
    const savedPreferences = localStorage.getItem('geosys-preferences')
    if (savedPreferences) {
      console.log("✅ Found saved preferences:", savedPreferences);
      const preferences = JSON.parse(savedPreferences)
      setUserPreferences(preferences)
      setIsOnboarding(false)
    } else {
      console.log("❌ No saved preferences found, staying in onboarding");
    }
  }, [])

  const handleOnboardingComplete = (preferences: typeof userPreferences) => {
    console.log("🎉 Onboarding completed with preferences:", preferences);
    setUserPreferences(preferences)
    localStorage.setItem('geosys-preferences', JSON.stringify(preferences))
    setIsOnboarding(false)
  }

  const handleResetPreferences = () => {
    console.log("🔄 Resetting preferences and returning to onboarding");
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