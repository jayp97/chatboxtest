/**
 * TerminalUI.tsx
 * Main terminal container component
 * Provides the retro terminal interface with CRT effects
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { CRTEffects } from "./CRTEffects";
import { BootSequence } from "./BootSequence";
import { CommandLine } from "./CommandLine";
import { LoadingIndicator } from "./LoadingIndicator";
import { parseCommand } from "@/utils/terminal-commands";

interface TerminalUIProps {
  onCommand?: (command: string) => void;
  className?: string;
  userId: string;
}

interface OnboardingState {
  isOnboarding: boolean;
  currentStep: 'country' | 'continent' | 'destination' | 'complete';
  answers: {
    country?: string;
    continent?: string;
    destination?: string;
  };
}

export function TerminalUI({ onCommand, className = "", userId }: TerminalUIProps) {
  const [isBooted, setIsBooted] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isOnboarding: false,
    currentStep: 'country',
    answers: {}
  });
  const terminalRef = useRef<HTMLDivElement>(null);


  // Handle boot completion
  const handleBootComplete = async () => {
    setIsBooted(true);
    
    // Check if user has preferences by querying the agent
    await checkUserPreferences();
  };
  
  // Check if user has preferences in Mastra memory
  const checkUserPreferences = async () => {
    addResponse("CHECKING USER PROFILE...");
    
    try {
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: "Do I have geographic preferences set? Just answer yes or no.",
          userId: userId,
          threadId: 'geosys-terminal-thread'
        })
      });
      
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiResponse = '';
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          aiResponse += chunk;
        }
        
        // Check if preferences exist based on response
        const hasPreferences = aiResponse.toLowerCase().includes('yes');
        
        if (!hasPreferences) {
          addResponse("> ERROR: NO GEOGRAPHIC PREFERENCES FOUND");
          addResponse("");
          addResponse("INITIATING FIRST-TIME SETUP PROTOCOL...");
          addResponse("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          addResponse("");
          addResponse("GEOGRAPHIC PREFERENCE CONFIGURATION");
          addResponse("Please answer the following questions:");
          addResponse("");
          addResponse("[1/3] What is your favourite country?");
          
          setOnboardingState({
            isOnboarding: true,
            currentStep: 'country',
            answers: {}
          });
        } else {
          addResponse("> PROFILE LOADED SUCCESSFULLY");
          addResponse("");
          addResponse("Welcome back to GEOSYS v4.2.1");
          addResponse("Type 'help' for available commands");
        }
      }
    } catch (error) {
      console.error('Error checking preferences:', error);
      addResponse("> ERROR: UNABLE TO ACCESS MEMORY CORE");
      addResponse("Proceeding without preferences...");
    }
  };
  
  // Handle onboarding input
  const handleOnboardingInput = async (input: string) => {
    const cleanInput = input.trim().toLowerCase();
    
    if (!cleanInput) {
      addResponse("ERROR: Please enter a valid response");
      return;
    }
    
    // Store the answer
    const updatedAnswers = { ...onboardingState.answers };
    
    switch (onboardingState.currentStep) {
      case 'country':
        updatedAnswers.country = cleanInput;
        addResponse(`✓ STORED: Favourite country = ${capitalize(cleanInput)}`);
        addResponse("");
        addResponse("[2/3] What is your favourite continent?");
        
        setOnboardingState({
          ...onboardingState,
          currentStep: 'continent',
          answers: updatedAnswers
        });
        break;
        
      case 'continent':
        updatedAnswers.continent = cleanInput;
        addResponse(`✓ STORED: Favourite continent = ${capitalize(cleanInput)}`);
        addResponse("");
        addResponse("[3/3] What is your dream destination?");
        
        setOnboardingState({
          ...onboardingState,
          currentStep: 'destination',
          answers: updatedAnswers
        });
        break;
        
      case 'destination':
        updatedAnswers.destination = cleanInput;
        addResponse(`✓ STORED: Favourite destination = ${capitalize(cleanInput)}`);
        addResponse("");
        addResponse("PREFERENCE INITIALIZATION COMPLETE");
        addResponse("STORING PREFERENCES IN MEMORY CORE...");
        
        // Send preferences to Mastra
        await storePreferencesInMemory(updatedAnswers);
        
        // Complete onboarding
        setOnboardingState({
          isOnboarding: false,
          currentStep: 'complete',
          answers: updatedAnswers
        });
        
        addResponse("> PREFERENCES STORED SUCCESSFULLY");
        addResponse("");
        addResponse("Welcome to GEOSYS v4.2.1 - Geographic Intelligence Terminal");
        addResponse("Type 'help' for available commands");
        break;
    }
  };
  
  // Store preferences in Mastra memory
  const storePreferencesInMemory = async (answers: any) => {
    try {
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `My favourite country is ${answers.country}, my favourite continent is ${answers.continent}, and my favourite destination is ${answers.destination}. Please remember these preferences.`,
          userId: userId,
          threadId: 'geosys-terminal-thread'
        })
      });
      
      if (response.body) {
        const reader = response.body.getReader();
        // Consume the stream but don't display it
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      }
    } catch (error) {
      console.error('Error storing preferences:', error);
      addResponse("> WARNING: MEMORY STORAGE PARTIAL FAILURE");
    }
  };
  
  // Helper function to capitalize words
  const capitalize = (str: string): string => {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Handle command submission
  const handleCommand = async (command: string) => {
    // Add command to history
    setTerminalHistory(prev => {
      const newHistory = [...prev, `> ${command}`];
      return newHistory;
    });
    
    // Handle onboarding input
    if (onboardingState.isOnboarding) {
      await handleOnboardingInput(command);
      return;
    }
    
    // Check for terminal commands (without preferences context)
    const commandResult = parseCommand(command);
    
    if (commandResult) {
      // Handle special command results
      if (commandResult === "CLEAR_TERMINAL") {
        setTerminalHistory([]);
        return;
      }
      
      if (commandResult === "RESET_PREFERENCES") {
        addResponse("SYSTEM: Resetting preferences...");
        addResponse("CLEARING MEMORY CORE...");
        
        // Reset to onboarding state
        setOnboardingState({
          isOnboarding: true,
          currentStep: 'country',
          answers: {}
        });
        
        // Clear terminal and start onboarding
        setTerminalHistory([]);
        addResponse("GEOGRAPHIC PREFERENCE CONFIGURATION");
        addResponse("Please answer the following questions:");
        addResponse("");
        addResponse("[1/3] What is your favourite country?");
        return;
      }
      
      if (commandResult === "SHOW_PREFERENCES") {
        // Query the agent for current preferences
        await processCommand("What are my current geographic preferences? Please list my favourite country, continent, and destination.", true);
        return;
      }
      
      if (commandResult.startsWith("UPDATE_PREFERENCE:")) {
        const [, field, ...valueParts] = commandResult.split(":");
        const value = valueParts.join(":");
        
        // Send update request to agent
        await processCommand(`Update my favourite ${field} to ${value}`);
        return;
      }
      
      // Display command result
      addResponse(commandResult);
      return;
    }
    
    // Pass command to parent handler or process via API
    if (onCommand) {
      onCommand(command);
    } else {
      await processCommand(command);
    }
  };

  // Process command via streaming API
  const processCommand = async (command: string, isPreferencesQuery = false) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: command,
          userId: userId,
          threadId: 'geosys-terminal-thread'
        })
      });

      if (!response.body) {
        addResponse("Error: No response from server");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      
      // Hide loading indicator once streaming starts
      setIsLoading(false);
      
      // Add empty response to history for streaming
      setTerminalHistory(prev => [...prev, '']);
      
      for (;;) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value);
        aiResponse += chunk;
        
        // Update the last (empty) response with streamed content
        setTerminalHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = aiResponse;
          return newHistory;
        });
      }
      
      // If this was a preferences query, parse the response to show formatted preferences
      if (isPreferencesQuery) {
        // The agent's response will contain the preferences
        // We'll display the raw response from the agent
        console.log("Preferences query response:", aiResponse);
      }
      
    } catch (error) {
      setIsLoading(false);
      addResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle new response
  const addResponse = (response: string) => {
    setTerminalHistory(prev => {
      const newHistory = [...prev, response];
      return newHistory;
    });
  };

  // Auto-scroll to bottom when history updates
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  return (
    <div className={`relative w-full h-full bg-black font-mono overflow-hidden ${className}`}>
      {/* CRT Effects overlay */}
      <CRTEffects />
      
      {/* Terminal container */}
      <div className="relative w-full h-full p-5 flex items-center justify-center">
        {/* Terminal frame */}
        <div className="w-full max-w-[900px] h-[600px] bg-[#0a0a0a] border-2 border-gray-800 rounded-lg overflow-hidden terminal-glow">
          {/* Title bar */}
          <div className="h-8 bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-between px-3 py-2 select-none">
            <div className="flex gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            </div>
            <div className="text-green-400 text-sm font-bold tracking-wider phosphor-glow">
              GEOSYS v4.2.1 - Geographic Intelligence Terminal
            </div>
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,0,0.8)]"></span>
              ONLINE
            </div>
          </div>
          
          {/* Terminal screen */}
          <div 
            ref={terminalRef}
            className="terminal-screen h-[calc(100%-32px)] bg-black text-green-400 px-5 py-6 overflow-y-auto text-sm leading-relaxed phosphor-glow"
          >
            {/* Boot sequence or main content */}
            {!isBooted ? (
              <BootSequence onComplete={handleBootComplete} />
            ) : (
              <div className="min-h-full flex flex-col">
                {/* Display terminal history */}
                <div className="flex-1 mb-5">
                  {terminalHistory.map((line, index) => (
                    <div 
                      key={index} 
                      className={`mb-2 break-words whitespace-pre-wrap ${
                        line.startsWith('>') ? 'text-green-400/80' : 'text-green-400'
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                  {isLoading && <LoadingIndicator />}
                </div>
                
                {/* Command line input */}
                <CommandLine onCommand={handleCommand} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}