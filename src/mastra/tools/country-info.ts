/**
 * country-info.ts
 * REST Countries API integration tool
 * Provides detailed country information with fun facts
 */

import { z } from "zod";
import { createTool } from "@mastra/core";

// Define the input schema for the country info tool
const countryInfoInputSchema = z.object({
  country: z.string().describe("The country name to get information about"),
});

// Define the output schema
const countryInfoOutputSchema = z.object({
  name: z.string(),
  officialName: z.string(),
  capital: z.array(z.string()),
  population: z.number(),
  languages: z.array(z.string()),
  currencies: z.array(z.string()),
  continent: z.string(),
  region: z.string(),
  subregion: z.string().optional(),
  area: z.number().describe("Area in square kilometres"),
  borders: z.array(z.string()).describe("Bordering countries"),
  flag: z.string().describe("Flag emoji"),
  funFacts: z.array(z.string()),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

// Create the country information tool
export const countryInfoTool = createTool({
  id: "country-info",
  description: "Get detailed information about any country including fun facts",
  inputSchema: countryInfoInputSchema,
  
  execute: async ({ context }) => {
    const { country } = context;
    try {
      // REST Countries API (free, no key required)
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=false`
      );
      
      if (!response.ok) {
        throw new Error(`Country "${country}" not found in database`);
      }
      
      const data = await response.json();
      const countryData = data[0]; // Get first match
      
      // Extract language names
      const languages = Object.values(countryData.languages || {}) as string[];
      
      // Extract currency names
      const currencies = Object.values(countryData.currencies || {}).map(
        (curr: unknown) => (curr as { name: string }).name
      ) as string[];
      
      // Get continent name
      const continent = countryData.continents?.[0] || "Unknown";
      
      // Generate fun facts based on country data
      const funFacts = generateFunFacts(countryData);
      
      return {
        name: countryData.name.common,
        officialName: countryData.name.official,
        capital: countryData.capital || ["No capital"],
        population: countryData.population,
        languages,
        currencies,
        continent,
        region: countryData.region,
        subregion: countryData.subregion,
        area: countryData.area,
        borders: countryData.borders || [],
        flag: countryData.flag,
        funFacts,
        coordinates: {
          latitude: countryData.latlng?.[0] || 0,
          longitude: countryData.latlng?.[1] || 0,
        },
      };
    } catch (error) {
      console.error(`[COUNTRY INFO ERROR] ${error}`);
      throw new Error(
        `GEOGRAPHIC DATABASE ERROR: Unable to retrieve data for "${country}". Please check the country name and try again.`
      );
    }
  },
});

// Helper function to generate interesting facts about a country
function generateFunFacts(countryData: Record<string, unknown>): string[] {
  const facts: string[] = [];
  
  // Population density fact
  if (countryData.population && countryData.area) {
    const density = Math.round(Number(countryData.population) / Number(countryData.area));
    facts.push(
      `The population density is ${density} people per square kilometre`
    );
  }
  
  // Landlocked fact
  if (countryData.landlocked) {
    facts.push("This is a landlocked country with no direct access to the ocean");
  }
  
  // Border fact
  const borders = countryData.borders as string[] | undefined;
  if (borders && borders.length > 0) {
    facts.push(
      `Shares borders with ${borders.length} ${
        borders.length === 1 ? "country" : "countries"
      }`
    );
  } else {
    facts.push("This is an island nation with no land borders");
  }
  
  // Timezone fact
  const timezones = countryData.timezones as string[] | undefined;
  if (timezones && timezones.length > 1) {
    facts.push(
      `Spans ${timezones.length} different time zones`
    );
  }
  
  // Capital fact
  const capitals = countryData.capital as string[] | undefined;
  if (capitals && capitals.length > 1) {
    facts.push(
      `Has ${capitals.length} capital cities`
    );
  }
  
  // Area comparison
  const area = countryData.area as number | undefined;
  if (area) {
    const ukArea = 242495; // UK area in km²
    const comparison = (area / ukArea).toFixed(1);
    facts.push(
      `Approximately ${comparison}x the size of the United Kingdom`
    );
  }
  
  // Currency fact
  const currencies = countryData.currencies as Record<string, unknown> | undefined;
  if (currencies) {
    const currencyCount = Object.keys(currencies).length;
    if (currencyCount > 1) {
      facts.push(`Uses ${currencyCount} different currencies`);
    }
  }
  
  // Language diversity
  const languages = countryData.languages as Record<string, unknown> | undefined;
  if (languages) {
    const langCount = Object.keys(languages).length;
    if (langCount > 5) {
      facts.push(
        `Remarkably diverse with ${langCount} official languages`
      );
    }
  }
  
  // UN membership
  if (countryData.unMember) {
    facts.push("A member of the United Nations");
  }
  
  // Driving side
  const car = countryData.car as { side?: string } | undefined;
  if (car && car.side) {
    facts.push(
      `People drive on the ${car.side} side of the road`
    );
  }
  
  return facts;
}

// Export type definitions
export type CountryInfoInput = z.infer<typeof countryInfoInputSchema>;
export type CountryInfoOutput = z.infer<typeof countryInfoOutputSchema>;

// Export schemas for external use
export { countryInfoInputSchema, countryInfoOutputSchema };