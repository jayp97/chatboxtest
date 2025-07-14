/**
 * distance-calculator.ts
 * Haversine distance calculator tool
 * Calculates great circle distances between locations
 */

import { z } from "zod";
import { createTool } from "@mastra/core";

// Define the input schema
const distanceInputSchema = z.object({
  from: z.string().describe("Starting location (city name or coordinates)"),
  to: z.string().describe("Destination location (city name or coordinates)"),
  unit: z.enum(["km", "miles"]).optional().default("km").describe("Distance unit"),
});

// Define the output schema
const distanceOutputSchema = z.object({
  from: z.object({
    name: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  to: z.object({
    name: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  distance: z.number().describe("Distance between locations"),
  unit: z.enum(["km", "miles"]),
  bearing: z.number().describe("Initial bearing in degrees"),
  compassDirection: z.string().describe("Compass direction from start to destination"),
  flightTime: z.string().describe("Estimated flight time"),
  drivingTime: z.string().describe("Estimated driving time (very rough estimate)"),
});

// Create the distance calculator tool
export const distanceCalculatorTool = createTool({
  id: "distance-calculator",
  description: "Calculate the distance between any two locations on Earth",
  inputSchema: distanceInputSchema,
  
  execute: async ({ context }) => {
    const { from, to, unit = "km" } = context;
    try {
      // Geocode both locations
      const fromCoords = await geocodeLocation(from);
      const toCoords = await geocodeLocation(to);
      
      // Calculate distance using Haversine formula
      const distanceKm = calculateHaversineDistance(
        fromCoords.latitude,
        fromCoords.longitude,
        toCoords.latitude,
        toCoords.longitude
      );
      
      // Convert to miles if requested
      const distance = unit === "miles" ? distanceKm * 0.621371 : distanceKm;
      
      // Calculate bearing
      const bearing = calculateBearing(
        fromCoords.latitude,
        fromCoords.longitude,
        toCoords.latitude,
        toCoords.longitude
      );
      
      // Get compass direction
      const compassDirection = getCompassDirection(bearing);
      
      // Estimate travel times (rough estimates)
      const flightTime = estimateFlightTime(distanceKm);
      const drivingTime = estimateDrivingTime(distanceKm);
      
      return {
        from: fromCoords,
        to: toCoords,
        distance: Math.round(distance * 10) / 10,
        unit,
        bearing: Math.round(bearing),
        compassDirection,
        flightTime,
        drivingTime,
      };
    } catch (error) {
      console.error(`[DISTANCE CALCULATOR ERROR] ${error}`);
      throw new Error(
        `NAVIGATION SYSTEM ERROR: Unable to calculate distance. ` +
        `Please verify location names and try again.`
      );
    }
  },
});

// Geocode a location to get coordinates
async function geocodeLocation(location: string) {
  // Check if the input is already coordinates (format: "lat,lng")
  const coordMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    return {
      name: `${coordMatch[1]}, ${coordMatch[2]}`,
      latitude: parseFloat(coordMatch[1]),
      longitude: parseFloat(coordMatch[2]),
    };
  }
  
  // Otherwise, geocode the location name
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?` +
    `name=${encodeURIComponent(location)}&count=1&language=en&format=json`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to geocode location: ${location}`);
  }
  
  const data = await response.json();
  
  if (!data.results || data.results.length === 0) {
    throw new Error(`Location not found: ${location}`);
  }
  
  const result = data.results[0];
  return {
    name: result.country ? `${result.name}, ${result.country}` : result.name,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

// Calculate distance using Haversine formula
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometres
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate initial bearing from point A to point B
function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = toRadians(lon2 - lon1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  const bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

// Convert degrees to radians
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Convert radians to degrees
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

// Get compass direction from bearing
function getCompassDirection(bearing: number): string {
  const directions = [
    "North", "North-Northeast", "Northeast", "East-Northeast",
    "East", "East-Southeast", "Southeast", "South-Southeast",
    "South", "South-Southwest", "Southwest", "West-Southwest",
    "West", "West-Northwest", "Northwest", "North-Northwest"
  ];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
}

// Estimate flight time (very rough estimate)
function estimateFlightTime(distanceKm: number): string {
  // Assume average cruising speed of 900 km/h
  // Add 30 minutes for takeoff/landing
  const cruisingHours = distanceKm / 900;
  const totalHours = cruisingHours + 0.5;
  
  if (totalHours < 1) {
    return `${Math.round(totalHours * 60)} minutes`;
  }
  
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hours`;
}

// Estimate driving time (very rough estimate)
function estimateDrivingTime(distanceKm: number): string {
  // Assume average speed of 80 km/h for long distances
  // This is a very rough estimate and doesn't account for actual roads
  const hours = distanceKm / 80;
  
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  }
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days} days, ${remainingHours} hours`;
  }
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours} hours`;
}

// Helper function to format distance output for terminal display
export function formatDistanceReport(result: z.infer<typeof distanceOutputSchema>): string {
  const lines = [
    "DISTANCE CALCULATION COMPLETE",
    "═".repeat(40),
    `FROM: ${result.from.name}`,
    `      ${result.from.latitude}°N, ${result.from.longitude}°E`,
    "",
    `TO:   ${result.to.name}`,
    `      ${result.to.latitude}°N, ${result.to.longitude}°E`,
    "",
    "RESULTS:",
    `> Distance: ${result.distance} ${result.unit}`,
    `> Direction: ${result.bearing}° (${result.compassDirection})`,
    `> Est. Flight Time: ${result.flightTime}`,
    `> Est. Driving Time: ${result.drivingTime}`,
    "═".repeat(40),
  ];
  
  return lines.join("\n");
}

// Export type definitions
export type DistanceInput = z.infer<typeof distanceInputSchema>;
export type DistanceOutput = z.infer<typeof distanceOutputSchema>;