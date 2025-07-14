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

interface TerminalUIProps {
  onCommand?: (command: string) => void;
  className?: string;
  userPreferences?: {
    favoriteCountry: string;
    favoriteContinent: string;
    favoriteDestination: string;
  };
  onResetPreferences?: () => void;
}

export function TerminalUI({ onCommand, className = "", userPreferences }: TerminalUIProps) {
  const [isBooted, setIsBooted] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);


  // Handle boot completion
  const handleBootComplete = () => {
    setIsBooted(true);
  };

  // Handle command submission
  const handleCommand = async (command: string) => {
    // Add command to history
    setTerminalHistory(prev => {
      const newHistory = [...prev, `> ${command}`];
      return newHistory;
    });
    
    // Pass command to parent handler
    onCommand?.(command);
    
    // If no parent handler, process the command directly
    if (!onCommand) {
      await processCommand(command);
    }
  };

  // Process command via streaming API
  const processCommand = async (command: string) => {
    try {
      // Convert userPreferences to the API format
      const apiPreferences = userPreferences ? {
        favouriteCountry: userPreferences.favoriteCountry,
        favouriteContinent: userPreferences.favoriteContinent,
        favouriteDestination: userPreferences.favoriteDestination
      } : undefined;

      // Get or create a persistent user ID for memory
      let userId = localStorage.getItem('geosys-user-id');
      if (!userId) {
        userId = `geosys-user-${Date.now()}`;
        localStorage.setItem('geosys-user-id', userId);
      }

      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: command,
          userPreferences: apiPreferences,
          userId: userId,
          threadId: 'geosys-terminal-session'
        })
      });

      if (!response.body) {
        addResponse("Error: No response from server");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      
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
      
    } catch (error) {
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