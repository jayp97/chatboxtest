/**
 * OnboardingFlow.tsx
 * Terminal-style onboarding component
 * Collects user preferences for favourite country, continent, and destination
 */

"use client";

import { useState } from "react";

interface OnboardingData {
  favoriteCountry: string;
  favoriteContinent: string;
  favoriteDestination: string;
}

export function OnboardingFlow({
  onComplete,
}: {
  onComplete: (data: OnboardingData) => void;
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const questions = [
    {
      key: "favoriteCountry" as keyof OnboardingData,
      prompt: "SYSTEM: ENTER YOUR FAVOURITE COUNTRY:",
      placeholder: "e.g., Japan, Brazil, United Kingdom..."
    },
    {
      key: "favoriteContinent" as keyof OnboardingData,
      prompt: "SYSTEM: ENTER YOUR FAVOURITE CONTINENT:",
      placeholder: "e.g., Asia, Europe, North America..."
    },
    {
      key: "favoriteDestination" as keyof OnboardingData,
      prompt: "SYSTEM: ENTER YOUR DREAM DESTINATION:",
      placeholder: "e.g., Tokyo, Paris, New York..."
    }
  ];

  const handleSubmit = () => {
    if (!input.trim()) return;
    
    const currentQuestion = questions[step - 1];
    const newData = { ...data, [currentQuestion.key]: input.trim() };
    setData(newData);
    setInput("");
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      if (step < questions.length) {
        setStep(step + 1);
      } else {
        // All questions answered, complete onboarding
        onComplete(newData as OnboardingData);
      }
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-4xl p-8">
        <div className="terminal-container">
          <div className="terminal-header">
            <div className="terminal-title">GEOSYS v4.2.1 - Initial Configuration</div>
            <div className="terminal-status">
              <div className="status-indicator"></div>
              <span>SETUP</span>
            </div>
          </div>
          
          <div className="terminal-screen p-8">
            <div className="mb-8">
              <div className="text-green-400 mb-4 glow">
                ╔════════════════════════════════════════════════════════════════╗
              </div>
              <div className="text-green-400 mb-4 glow text-center">
                ║  WELCOME TO GEOSYS - GEOGRAPHIC INTELLIGENCE TERMINAL  ║
              </div>
              <div className="text-green-400 mb-8 glow">
                ╚════════════════════════════════════════════════════════════════╝
              </div>
            </div>

            <div className="mb-6">
              <div className="text-green-400/80 mb-4">
                INITIALISING GEOGRAPHIC PREFERENCES...
              </div>
              <div className="text-green-400/80 mb-4">
                STEP {step} OF {questions.length}
              </div>
              <div className="loading-bar mb-6">
                <div 
                  className="loading-bar-fill" 
                  style={{ width: `${(step / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-green-400 mb-2 glow">
                {questions[step - 1].prompt}
              </div>
              <div className="text-green-400/60 text-sm mb-4">
                {questions[step - 1].placeholder}
              </div>
            </div>

            <div className="command-line">
              <span className="command-prompt">USER@GEOSYS:~$</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="command-input"
                placeholder="Type your answer here..."
                disabled={isTyping}
                autoFocus
              />
              <span className="cursor"></span>
            </div>

            {isTyping && (
              <div className="mt-4 text-green-400/80">
                PROCESSING... <span className="animate-pulse">█</span>
              </div>
            )}

            <div className="mt-8 text-green-400/60 text-sm">
              Press ENTER to continue
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}