/**
 * weather-tool.ts
 * Open-Meteo API integration for weather information
 * Provides current weather conditions without requiring an API key
 */

import { z } from "zod";
import { createTool } from "@mastra/core";

// Weather code descriptions based on WMO codes
const weatherDescriptions: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

// Define the input schema
const weatherInputSchema = z.object({
  location: z.string().describe("City name or coordinates to get weather for"),
});

// Define the output schema
const weatherOutputSchema = z.object({
  location: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  temperature: z.number().describe("Temperature in Celsius"),
  feelsLike: z.number().describe("Feels like temperature in Celsius"),
  conditions: z.string().describe("Weather condition description"),
  weatherCode: z.number().describe("WMO weather code"),
  humidity: z.number().describe("Relative humidity percentage"),
  windSpeed: z.number().describe("Wind speed in km/h"),
  windDirection: z.number().describe("Wind direction in degrees"),
  pressure: z.number().describe("Atmospheric pressure in hPa"),
  cloudCover: z.number().describe("Cloud cover percentage"),
  visibility: z.number().describe("Visibility in metres"),
  uvIndex: z.number().describe("UV index"),
  precipitation: z.number().describe("Precipitation in mm"),
  isDay: z.boolean().describe("Whether it's daytime"),
  sunrise: z.string().describe("Sunrise time"),
  sunset: z.string().describe("Sunset time"),
});

// Create the weather tool
export const weatherTool = createTool({
  id: "weather-info",
  description: "Get current weather conditions for any location worldwide",
  inputSchema: weatherInputSchema,
  
  execute: async ({ context }) => {
    const { location } = context;
    try {
      // First, geocode the location to get coordinates
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          location
        )}&count=1&language=en&format=json`
      );
      
      if (!geoResponse.ok) {
        throw new Error("Failed to geocode location");
      }
      
      const geoData = await geoResponse.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`Location "${location}" not found`);
      }
      
      const place = geoData.results[0];
      const { latitude, longitude, name, country } = place;
      
      // Get current weather data
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,` +
        `precipitation,weather_code,cloud_cover,pressure_msl,` +
        `wind_speed_10m,wind_direction_10m,uv_index,visibility,is_day` +
        `&daily=sunrise,sunset` +
        `&timezone=auto`
      );
      
      if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather data");
      }
      
      const weatherData = await weatherResponse.json();
      const current = weatherData.current;
      const daily = weatherData.daily;
      
      // Get weather description from code
      const weatherCode = current.weather_code;
      const conditions = weatherDescriptions[weatherCode] || "Unknown conditions";
      
      return {
        location: `${name}, ${country}`,
        coordinates: {
          latitude,
          longitude,
        },
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        conditions,
        weatherCode,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        windDirection: current.wind_direction_10m,
        pressure: Math.round(current.pressure_msl),
        cloudCover: current.cloud_cover,
        visibility: current.visibility,
        uvIndex: current.uv_index,
        precipitation: current.precipitation,
        isDay: current.is_day === 1,
        sunrise: daily.sunrise[0],
        sunset: daily.sunset[0],
      };
    } catch (error) {
      console.error(`[WEATHER ERROR] ${error}`);
      throw new Error(
        `ATMOSPHERIC SENSOR ERROR: Unable to retrieve weather data for "${location}". ` +
        `Signal interference detected. Please verify location name.`
      );
    }
  },
});

// Helper function to convert weather data to terminal-style report
export function formatWeatherReport(weather: z.infer<typeof weatherOutputSchema>): string {
  const lines = [
    "ATMOSPHERIC DATA RETRIEVED",
    "═".repeat(40),
    `LOCATION: ${weather.location}`,
    `COORDINATES: ${weather.coordinates.latitude}°N, ${weather.coordinates.longitude}°E`,
    "",
    "CURRENT CONDITIONS:",
    `> Temperature: ${weather.temperature}°C (feels like ${weather.feelsLike}°C)`,
    `> Conditions: ${weather.conditions}`,
    `> Humidity: ${weather.humidity}%`,
    `> Wind: ${weather.windSpeed} km/h from ${getWindDirection(weather.windDirection)}`,
    `> Pressure: ${weather.pressure} hPa`,
    `> Visibility: ${(weather.visibility / 1000).toFixed(1)} km`,
    `> UV Index: ${weather.uvIndex}`,
    `> Cloud Cover: ${weather.cloudCover}%`,
    "",
    `DAYLIGHT: ${weather.isDay ? "Yes" : "No"}`,
    `SUNRISE: ${formatTime(weather.sunrise)}`,
    `SUNSET: ${formatTime(weather.sunset)}`,
    "═".repeat(40),
  ];
  
  return lines.join("\n");
}

// Convert degrees to compass direction
function getWindDirection(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                     "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(((degrees % 360) / 22.5));
  return directions[index % 16];
}

// Format ISO time to readable format
function formatTime(isoTime: string): string {
  const date = new Date(isoTime);
  return date.toLocaleTimeString("en-GB", { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: false 
  });
}

// Export type definitions
export type WeatherInput = z.infer<typeof weatherInputSchema>;
export type WeatherOutput = z.infer<typeof weatherOutputSchema>;