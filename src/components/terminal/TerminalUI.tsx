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
import { usePreferenceUpdates } from "@/components/chat/usePreferenceUpdates";
import { notifyPreferenceUpdate } from "@/utils/preference-updater";

interface TerminalUIProps {
  onCommand?: (command: string) => void;
  className?: string;
  userId: string;
  threadId: string;
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

export function TerminalUI({ onCommand, className = "", userId, threadId }: TerminalUIProps) {
  const [isBooted, setIsBooted] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isOnboarding: false,
    currentStep: 'country',
    answers: {}
  });
  
  // Hook to detect preference updates in chat
  const { } = usePreferenceUpdates();
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
          threadId: threadId
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
          addResponse("Type '/help' for available commands");
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
        
        // Show loading indicator while storing preferences
        setIsLoading(true);
        
        try {
          // Send preferences to Mastra
          await storePreferencesInMemory(updatedAnswers);
          
          // Hide loading indicator
          setIsLoading(false);
          
          // Complete onboarding
          setOnboardingState({
            isOnboarding: false,
            currentStep: 'complete',
            answers: updatedAnswers
          });
          
          addResponse("> PREFERENCES STORED SUCCESSFULLY");
          addResponse("");
          addResponse("Welcome to GEOSYS v4.2.1 - Geographic Intelligence Terminal");
          addResponse("Type '/help' for available commands");
          
          // The preferences will be processed by the agent's preference tools
          // which will handle geocoding and store coordinates in localStorage
          // Globe will be notified automatically by the preference updater tool
        } catch (error) {
          // Hide loading indicator on error
          setIsLoading(false);
          
          addResponse("> ERROR: FAILED TO STORE PREFERENCES IN MEMORY CORE");
          addResponse(`> ${error instanceof Error ? error.message : 'Unknown error'}`);
          addResponse("");
          addResponse("Retrying preference storage...");
          
          // Retry after a brief delay
          setTimeout(() => handleOnboardingInput(cleanInput), 2000);
        }
        break;
    }
  };
  
  // Store preferences in Mastra memory
  const storePreferencesInMemory = async (answers: Record<string, string>) => {
    try {
      // Send each preference update separately to ensure coordinates are stored
      const updates = [
        { type: 'country', value: answers.country },
        { type: 'continent', value: answers.continent },
        { type: 'destination', value: answers.destination }
      ];
      
      for (const update of updates) {
        if (update.value) {
          const response = await fetch('/api/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: `Update my favourite ${update.type} to ${update.value}`,
              userId: userId,
              threadId: threadId
            })
          });
          
          if (response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';
            
            // Read the stream to get the agent's response
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value);
              aiResponse += chunk;
            }
            
            // Check if the response contains preference update confirmation with coordinates
            if (aiResponse.includes("PREFERENCE UPDATE CONFIRMED") && aiResponse.includes("COORDINATES:")) {
              // Extract the preference type and coordinates from the response
              const typeMatch = aiResponse.match(/>\s*(country|continent|destination)\s+successfully updated to\s+(.+?)(?:\n|$)/i);
              const coordMatch = aiResponse.match(/COORDINATES:\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
              
              if (typeMatch && coordMatch) {
                const [, prefType, prefValue] = typeMatch;
                const [, lat, lng] = coordMatch;
                
                // Store in localStorage
                const { storeUserPreferences } = await import('@/utils/preference-storage');
                const updates: Record<string, any> = {};
                
                if (prefType.toLowerCase() === 'country') {
                  updates.favouriteCountry = prefValue.trim();
                  updates.favouriteCountryCoords = [parseFloat(lat), parseFloat(lng)];
                } else if (prefType.toLowerCase() === 'continent') {
                  updates.favouriteContinent = prefValue.trim();
                  updates.favouriteContinentCoords = [parseFloat(lat), parseFloat(lng)];
                } else if (prefType.toLowerCase() === 'destination') {
                  updates.favouriteDestination = prefValue.trim();
                  updates.favouriteDestinationCoords = [parseFloat(lat), parseFloat(lng)];
                }
                
                storeUserPreferences(userId, updates);
                console.log("[ONBOARDING] Stored preferences from agent response:", updates);
                
                // ALWAYS notify globe to update pins after storing preferences
                notifyPreferenceUpdate();
              }
            }
          }
        }
      }
      
      // After all preferences are stored, notify globe to update
      setTimeout(() => {
        notifyPreferenceUpdate();
      }, 500);
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
    // Prevent commands while loading
    if (isLoading) {
      return;
    }
    
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
        
        // Map "city" to "destination" for consistency
        const mappedField = field === "city" ? "destination" : field;
        
        // Send update request to agent
        await processCommand(`Update my favourite ${mappedField} to ${value}`);
        
        // Globe will be notified by the preference tool itself
        // No need to notify here
        
        return;
      }
      
      // Display command result
      addResponse(commandResult);
      return;
    }
    
    // Check if user is trying to update city preference in natural language
    const lowerCommand = command.toLowerCase();
    if ((lowerCommand.includes("update") || lowerCommand.includes("change") || lowerCommand.includes("set")) && 
        lowerCommand.includes("city") && 
        (lowerCommand.includes("favourite") || lowerCommand.includes("favorite"))) {
      // Modify the command to say "destination" instead of "city"
      const modifiedCommand = command.replace(/\bcity\b/gi, "destination");
      await processCommand(modifiedCommand);
    } else {
      // Pass command to parent handler or process via API normally
      if (onCommand) {
        onCommand(command);
      } else {
        await processCommand(command);
      }
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
          threadId: threadId
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
      }
      
      // Check if the response contains preference update confirmation
      if (aiResponse.includes("PREFERENCE UPDATE CONFIRMED") && aiResponse.includes("COORDINATES:")) {
        // Extract the preference type and coordinates from the response
        const typeMatch = aiResponse.match(/>\s*(country|continent|destination)\s+successfully updated to\s+(.+?)(?:\n|$)/i);
        const coordMatch = aiResponse.match(/COORDINATES:\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        
        if (typeMatch && coordMatch) {
          const [, prefType, prefValue] = typeMatch;
          const [, lat, lng] = coordMatch;
          
          // Store in localStorage
          const { storeUserPreferences } = await import('@/utils/preference-storage');
          const updates: Record<string, any> = {};
          
          if (prefType.toLowerCase() === 'country') {
            updates.favouriteCountry = prefValue.trim();
            updates.favouriteCountryCoords = [parseFloat(lat), parseFloat(lng)];
          } else if (prefType.toLowerCase() === 'continent') {
            updates.favouriteContinent = prefValue.trim();
            updates.favouriteContinentCoords = [parseFloat(lat), parseFloat(lng)];
          } else if (prefType.toLowerCase() === 'destination') {
            updates.favouriteDestination = prefValue.trim();
            updates.favouriteDestinationCoords = [parseFloat(lat), parseFloat(lng)];
          }
          
          storeUserPreferences(userId, updates);
          console.log("[TERMINAL-UI] Stored preferences in localStorage:", updates);
          
          // ALWAYS notify globe to update pins after storing preferences
          notifyPreferenceUpdate();
        }
      }
      
      // Additional safeguard: notify globe after any response that might contain preference updates
      if (aiResponse.includes("PREFERENCE UPDATE CONFIRMED") || 
          aiResponse.includes("successfully updated") ||
          aiResponse.includes("COORDINATES:")) {
        // Small delay to ensure localStorage is updated
        setTimeout(() => {
          notifyPreferenceUpdate();
        }, 100);
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
    <div className={`relative w-full h-full font-mono overflow-hidden ${className}`}>
      {/* CRT Effects overlay */}
      <CRTEffects />
      
      {/* Terminal container */}
      <div className="relative w-full h-full p-5 flex items-center justify-center">
        {/* Terminal frame with semi-transparent background */}
        <div className="w-full max-w-[900px] h-[600px] bg-black/80 backdrop-blur-sm border-2 border-cyan-500/30 rounded-lg overflow-hidden terminal-glow shadow-2xl shadow-cyan-500/20">
          {/* Title bar */}
          <div className="h-8 bg-black/60 backdrop-blur border-b border-cyan-500/20 flex items-center justify-between px-3 py-2 select-none">
            <div className="flex gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(255,0,0,0.8)]"></span>
              <span className="w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(255,255,0,0.8)]"></span>
              <span className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(0,255,0,0.8)]"></span>
            </div>
            <div className="text-green-400 text-sm font-bold tracking-wider phosphor-glow neon-text">
              GEOSYS v4.2.1 - Geographic Intelligence Terminal
            </div>
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(0,255,0,1)]"></span>
              ONLINE
            </div>
          </div>
          
          {/* Terminal screen */}
          <div 
            ref={terminalRef}
            className="terminal-screen h-[calc(100%-32px)] bg-black/40 text-green-400 px-5 py-6 overflow-y-auto text-sm leading-relaxed phosphor-glow"
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