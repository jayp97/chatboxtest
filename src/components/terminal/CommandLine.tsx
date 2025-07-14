/**
 * CommandLine.tsx
 * Command line input component
 * Handles user input with terminal-style interface
 */

"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface CommandLineProps {
  onCommand?: (command: string) => void;
}

export function CommandLine({ onCommand }: CommandLineProps) {
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Common commands for auto-complete
  const commonCommands = [
    "hello",
    "help",
    "weather",
    "info",
    "distance",
    "trivia",
    "map",
    "clear",
    "about",
    "preferences",
  ];

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Auto-complete suggestions
  useEffect(() => {
    if (input.length > 0) {
      const matches = commonCommands.filter(cmd => 
        cmd.toLowerCase().startsWith(input.toLowerCase())
      );
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0 && matches.length < commonCommands.length);
    } else {
      setShowSuggestions(false);
    }
  }, [input]);

  // Handle keyboard input
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter":
        handleSubmit();
        break;
      
      case "ArrowUp":
        e.preventDefault();
        navigateHistory(-1);
        break;
      
      case "ArrowDown":
        e.preventDefault();
        navigateHistory(1);
        break;
      
      case "Tab":
        e.preventDefault();
        handleAutoComplete();
        break;
      
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  // Submit command
  const handleSubmit = () => {
    if (input.trim()) {
      // Add to history
      setCommandHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      
      // Call parent handler
      onCommand?.(input);
      
      // Clear input
      setInput("");
      setShowSuggestions(false);
    }
  };

  // Navigate command history
  const navigateHistory = (direction: number) => {
    if (commandHistory.length === 0) return;
    
    let newIndex = historyIndex + direction;
    
    // Clamp to valid range
    if (newIndex < -1) newIndex = -1;
    if (newIndex >= commandHistory.length) newIndex = commandHistory.length - 1;
    
    setHistoryIndex(newIndex);
    
    // Set input to historical command or empty
    if (newIndex === -1) {
      setInput("");
    } else {
      setInput(commandHistory[commandHistory.length - 1 - newIndex]);
    }
  };

  // Handle auto-complete
  const handleAutoComplete = () => {
    if (suggestions.length === 1) {
      setInput(suggestions[0]);
      setShowSuggestions(false);
    } else if (suggestions.length > 1) {
      // Find common prefix
      const commonPrefix = findCommonPrefix(suggestions);
      if (commonPrefix.length > input.length) {
        setInput(commonPrefix);
      }
    }
  };

  // Find common prefix among suggestions
  const findCommonPrefix = (strings: string[]): string => {
    if (strings.length === 0) return "";
    
    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
      while (!strings[i].startsWith(prefix)) {
        prefix = prefix.slice(0, -1);
      }
    }
    return prefix;
  };

  // Play typing sound (optional enhancement)
  const playTypingSound = () => {
    // Could add sound effect here if sound-effects.ts is implemented
  };

  return (
    <div className="relative">
      {/* Auto-complete suggestions */}
      {showSuggestions && (
        <div className="absolute bottom-full left-0 mb-2 bg-black/90 border border-green-400/30 rounded p-2">
          <div className="text-green-400/70 text-xs mb-1">Suggestions:</div>
          <div className="flex gap-2 flex-wrap">
            {suggestions.map((suggestion, index) => (
              <span
                key={index}
                className="text-green-400 text-sm cursor-pointer hover:text-green-300"
                onClick={() => {
                  setInput(suggestion);
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
              >
                {suggestion}
              </span>
            ))}
          </div>
          <div className="text-green-400/50 text-xs mt-1">Press TAB to complete</div>
        </div>
      )}
      
      {/* Command line */}
      <div className="flex items-center">
        {/* Prompt */}
        <span className="text-green-400 mr-2 select-none">
          &gt; query:
        </span>
        
        {/* Input field */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              playTypingSound();
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-green-400 outline-none font-mono"
            spellCheck={false}
            autoComplete="off"
          />
          
          {/* Blinking cursor */}
          {cursorVisible && (
            <span 
              className="absolute text-green-400 pointer-events-none"
              style={{ left: `${input.length}ch` }}
            >
              █
            </span>
          )}
        </div>
      </div>
      
      {/* Command hints */}
      {input.length === 0 && (
        <div className="mt-2 text-green-400/40 text-xs">
          Type 'help' for commands • Use ↑/↓ for history • TAB for auto-complete
        </div>
      )}
    </div>
  );
}