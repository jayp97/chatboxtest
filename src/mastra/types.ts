/**
 * types.ts
 * Shared type definitions for Mastra integration
 */

// User preferences collected during onboarding
export interface UserPreferences {
  favouriteCountry?: string;
  favouriteContinent?: string;
  favouriteDestination?: string;
}

// Geography query context
export interface GeographyContext {
  userPreferences: UserPreferences;
  threadId: string;
  userId: string;
}

// Tool response types
export interface CountryInfo {
  name: string;
  capital: string;
  population: number;
  languages: string[];
  currency: string;
  continent: string;
  funFacts: string[];
}

export interface WeatherInfo {
  location: string;
  temperature: number;
  conditions: string;
  humidity: number;
  windSpeed: number;
}

export interface DistanceInfo {
  from: string;
  to: string;
  distance: number;
  unit: "km" | "miles";
}

// ASCII art types
export interface AsciiArt {
  type: "country" | "weather";
  name: string;
  frames: string[];
  animationSpeed?: number;
}

// Terminal command types
export interface TerminalCommand {
  command: string;
  args: string[];
  timestamp: Date;
}