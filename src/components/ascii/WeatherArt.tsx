/**
 * WeatherArt.tsx
 * Component for displaying animated weather ASCII art
 * Displays weather conditions with appropriate animations
 */

"use client";

import { useState, useEffect } from "react";
import { getWeatherArt, ASCIIAnimation } from "@/utils/ascii-library";
import { AnimationEngine } from "./AnimationEngine";

interface WeatherArtProps {
  condition: string;
  temperature?: number;
  location?: string;
  className?: string;
  showLabels?: boolean;
}

export function WeatherArt({
  condition,
  temperature,
  location,
  className = "",
  showLabels = true
}: WeatherArtProps) {
  const [animation, setAnimation] = useState<ASCIIAnimation | null>(null);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const weatherAnimation = getWeatherArt(condition);
    setAnimation(weatherAnimation);
    
    // Create display text with labels
    if (showLabels) {
      let text = "";
      if (location) text += `Location: ${location}\n`;
      if (temperature !== undefined) text += `Temperature: ${temperature}°C\n`;
      text += `Condition: ${condition}\n`;
      setDisplayText(text);
    }
  }, [condition, temperature, location, showLabels]);

  if (!animation) {
    // Fallback for unknown weather conditions
    return (
      <div className={`font-mono text-green-400 ${className}`}>
        {displayText}
        <div className="mt-2">
          <pre>{`
    ??? 
   (   )
    ???
          `}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className={`font-mono text-green-400 ${className}`}>
      {showLabels && displayText && (
        <div className="mb-2 text-green-400/80">
          {displayText.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
      <AnimationEngine
        animation={animation}
        loop={true}
        className="text-center"
      />
    </div>
  );
}

// Combined weather and location component
interface WeatherLocationProps {
  country: string;
  city: string;
  weather: {
    condition: string;
    temperature: number;
    description?: string;
  };
  className?: string;
}

export function WeatherLocation({
  country,
  city,
  weather,
  className = ""
}: WeatherLocationProps) {
  return (
    <div className={`font-mono text-green-400 ${className}`}>
      <div className="border border-green-400/30 p-4 rounded">
        <div className="text-center mb-4">
          <div className="text-lg font-bold">{city}</div>
          <div className="text-sm text-green-400/70">{country}</div>
        </div>
        
        <div className="flex justify-center mb-4">
          <WeatherArt
            condition={weather.condition}
            temperature={weather.temperature}
            showLabels={false}
          />
        </div>
        
        <div className="text-center">
          <div className="text-xl font-bold">{weather.temperature}°C</div>
          <div className="text-sm text-green-400/70 capitalize">
            {weather.description || weather.condition}
          </div>
        </div>
      </div>
    </div>
  );
}

// Weather comparison component
interface WeatherComparisonProps {
  locations: Array<{
    name: string;
    weather: {
      condition: string;
      temperature: number;
    };
  }>;
  className?: string;
}

export function WeatherComparison({
  locations,
  className = ""
}: WeatherComparisonProps) {
  return (
    <div className={`font-mono text-green-400 ${className}`}>
      <div className="border border-green-400/30 p-4 rounded">
        <div className="text-center mb-4 text-lg font-bold">
          Weather Comparison
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((location, index) => (
            <div key={index} className="border border-green-400/20 p-3 rounded">
              <div className="text-center mb-2 font-bold">
                {location.name}
              </div>
              
              <div className="flex justify-center mb-2">
                <WeatherArt
                  condition={location.weather.condition}
                  temperature={location.weather.temperature}
                  showLabels={false}
                />
              </div>
              
              <div className="text-center">
                <div className="text-lg">{location.weather.temperature}°C</div>
                <div className="text-xs text-green-400/70 capitalize">
                  {location.weather.condition}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}