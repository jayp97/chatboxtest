/**
 * OnboardingFlow.tsx
 * Terminal-style onboarding component
 * Collects user preferences for favourite country, continent, and destination
 */

"use client";

import { useState } from "react";

interface OnboardingData {
  favouriteCountry?: string;
  favouriteContinent?: string;
  favouriteDestination?: string;
}

export function OnboardingFlow({
  onComplete,
}: {
  onComplete: (data: OnboardingData) => void;
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({});

  return (
    <div className="onboarding-flow">
      {/* Onboarding implementation will be enhanced here */}
      <div>Onboarding Step {step}</div>
    </div>
  );
}