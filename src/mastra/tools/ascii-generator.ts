/**
 * ascii-generator.ts
 * Dynamic ASCII art generator tool
 * Creates animated ASCII art for countries and weather conditions
 */

import { z } from "zod";
import { createTool } from "@mastra/core";

// Define the input schema
const asciiInputSchema = z.object({
  type: z.enum(["country", "weather"]).describe("Type of ASCII art to generate"),
  value: z.string().describe("Country name or weather condition"),
  animated: z.boolean().optional().default(false).describe("Whether to include animation frames"),
});

// Define the output schema
const asciiOutputSchema = z.object({
  type: z.enum(["country", "weather"]),
  name: z.string(),
  art: z.string().describe("Primary ASCII art"),
  frames: z.array(z.string()).optional().describe("Animation frames if animated"),
  animationSpeed: z.number().optional().describe("Milliseconds between frames"),
  width: z.number().describe("Width of the ASCII art"),
  height: z.number().describe("Height of the ASCII art"),
});

// Country ASCII art library
const countryAsciiArt: Record<string, { art: string; frames?: string[] }> = {
  japan: {
    art: `
       _____
      /     \\
     |   ●   |
     |       |
      \\_____/
       JAPAN
    `,
    frames: [
      `
       _____      ✿
      /     \\    
     |   ●   |  ✿
     |       |    
      \\_____/    
       JAPAN      
    `,
      `
       _____    ✿  
      /     \\  ✿  
     |   ●   |    
     |       | ✿  
      \\_____/     
       JAPAN       
    `,
      `
       _____   ✿   
      /     \\     
     |   ●   | ✿ ✿
     |       |     
      \\_____/  ✿  
       JAPAN       
    `,
    ],
  },
  
  brazil: {
    art: `
    ╭─────────╮
    │ BRASIL  │
    │  ◆◆◆◆   │
    │ ◆◆◆◆◆◆  │
    │  ◆◆◆◆   │
    ╰─────────╯
    `,
    frames: [
      `
    ╭─────────╮
    │ BRASIL  │    ♪
    │  ◆◆◆◆   │   ╱O╲
    │ ◆◆◆◆◆◆  │   ╱ ╲
    │  ◆◆◆◆   │
    ╰─────────╯
    `,
      `
    ╭─────────╮
    │ BRASIL  │   ♫
    │  ◆◆◆◆   │   \\O/
    │ ◆◆◆◆◆◆  │    │
    │  ◆◆◆◆   │   / \\
    ╰─────────╯
    `,
      `
    ╭─────────╮     ♪
    │ BRASIL  │    /O\\
    │  ◆◆◆◆   │     │
    │ ◆◆◆◆◆◆  │    / \\
    │  ◆◆◆◆   │
    ╰─────────╯
    `,
    ],
  },
  
  egypt: {
    art: `
         ▲
        ▲ ▲
       ▲   ▲
      ▲     ▲
     ▲       ▲
    ▲▲▲▲▲▲▲▲▲▲▲
       EGYPT
    `,
    frames: [
      `
         ▲
        ▲ ▲       ☀
       ▲   ▲
      ▲     ▲
     ▲       ▲
    ▲▲▲▲▲▲▲▲▲▲▲
       EGYPT
    `,
      `
         ▲          ☀
        ▲ ▲      
       ▲   ▲
      ▲     ▲
     ▲       ▲
    ▲▲▲▲▲▲▲▲▲▲▲
       EGYPT
    `,
      `
         ▲             
        ▲ ▲         ☀
       ▲   ▲
      ▲     ▲
     ▲       ▲
    ▲▲▲▲▲▲▲▲▲▲▲
       EGYPT
    `,
    ],
  },
  
  australia: {
    art: `
     ╭────────╮
    /  ·  ·   \\
   │ AUSTRALIA │
   │    <>     │
    \\   ╱╲    /
     ╰──╯ ╰───╯
    `,
    frames: [
      `
     ╭────────╮
    /  ·  ·   \\
   │ AUSTRALIA │
   │    <>     │  ◟
    \\   ╱╲    /   U
     ╰──╯ ╰───╯
    `,
      `
     ╭────────╮
    /  ·  ·   \\
   │ AUSTRALIA │     ◟
   │    <>     │    U U
    \\   ╱╲    /
     ╰──╯ ╰───╯
    `,
      `
     ╭────────╮
    /  ·  ·   \\          ◟
   │ AUSTRALIA │         U U
   │    <>     │
    \\   ╱╲    /
     ╰──╯ ╰───╯
    `,
    ],
  },
  
  france: {
    art: `
       /|\\
      / | \\
     /  |  \\
    /   |   \\
   /    |    \\
  /_____|_____\\
     FRANCE
    `,
    frames: [
      `
       /|\\        ✦
      / | \\
     /  |  \\
    /   |   \\
   /    |    \\
  /_____|_____\\
     FRANCE
    `,
      `
       /|\\     ✦ ✦ ✦
      / | \\       ✦
     /  |  \\    ✦
    /   |   \\
   /    |    \\
  /_____|_____\\
     FRANCE
    `,
      `
       /|\\   ✦ ✦ ✦ ✦ ✦
      / | \\    ✦ ✦ ✦
     /  |  \\     ✦
    /   |   \\
   /    |    \\
  /_____|_____\\
     FRANCE
    `,
    ],
  },
  
  "united kingdom": {
    art: `
    ┌─────────┐
    │ ╳     ╳ │
    │    UK   │
    │ ╳     ╳ │
    └─────────┘
     God Save
     The King
    `,
  },
  
  canada: {
    art: `
    ╭─────────╮
    │ CANADA  │
    │    🍁    │
    │  True   │
    │  North  │
    ╰─────────╯
    `,
  },
  
  india: {
    art: `
    ╔═════════╗
    ║ सत्यमेव ║
    ║   ☸️    ║
    ║  INDIA  ║
    ╚═════════╝
    `,
  },
};

// Weather ASCII art library
const weatherAsciiArt: Record<string, { art: string; frames?: string[] }> = {
  "clear sky": {
    art: `
       \\   /
        .-.
      ― (   ) ―
        \`-'
       /   \\
    `,
  },
  
  "partly cloudy": {
    art: `
       \\  /
     _ /"\`.
      \\_(   ).
      /(___))
    `,
  },
  
  rain: {
    art: `
        .--.
       (    ).
      (___(__)
       ‚'‚'‚'
      ‚'‚'‚'‚'
    `,
    frames: [
      `
        .--.
       (    ).
      (___(__)
       ‚'‚'‚'
      ‚'‚'‚'‚'
    `,
      `
        .--.
       (    ).
      (___(__)
      ‚'‚'‚'‚'
       ‚'‚'‚'
    `,
      `
        .--.
       (    ).
      (___(__)
       '‚'‚'
      ‚'‚'‚'‚'
    `,
    ],
  },
  
  snow: {
    art: `
        .--.
       (    ).
      (___(__)
       * * * *
      * * * * *
    `,
    frames: [
      `
        .--.
       (    ).
      (___(__)
       * * * *
      * * * * *
    `,
      `
        .--.
       (    ).
      (___(__)
      * * * * *
       * * * *
    `,
      `
        .--.
       (    ).
      (___(__)
       * * * *
       * * * *
    `,
    ],
  },
  
  thunderstorm: {
    art: `
        .--.
       (    ).
      (___(__)
       ⚡ ‚' ⚡
      ‚' ⚡ ‚'
    `,
    frames: [
      `
        .--.
       (    ).
      (___(__)
       ⚡ ‚' ⚡
      ‚' ⚡ ‚'
    `,
      `
        .--.
       (    ).
      (___(__)
       ‚' ⚡ ‚'
      ⚡ ‚' ⚡
    `,
      `
        .--.
       (    ).
      (___(__)
       ⚡⚡ ‚'
      ‚' ‚' ⚡
    `,
    ],
  },
  
  foggy: {
    art: `
      _ - _ - _
    _ - _ - _ -
      - _ - _ -
    - _ - _ - _
      FOG
    `,
  },
};

// Create the ASCII generator tool
export const asciiGeneratorTool = createTool({
  id: "ascii-generator",
  description: "Generate dynamic ASCII art for countries and weather conditions",
  inputSchema: asciiInputSchema,
  
  execute: async ({ context }) => {
    const { type, value, animated } = context;
    try {
      if (type === "country") {
        // Normalise country name
        const normalised = value.toLowerCase().trim();
        const countryArt = countryAsciiArt[normalised];
        
        if (!countryArt) {
          // Generate generic country art if not found
          return generateGenericCountryArt(value);
        }
        
        const lines = countryArt.art.trim().split('\n');
        const width = Math.max(...lines.map(l => l.length));
        const height = lines.length;
        
        return {
          type: "country",
          name: value,
          art: countryArt.art.trim(),
          frames: animated && countryArt.frames ? countryArt.frames.map(f => f.trim()) : undefined,
          animationSpeed: animated && countryArt.frames ? 500 : undefined,
          width,
          height,
        };
      } else {
        // Weather type
        const normalised = value.toLowerCase();
        let weatherArt = null;
        
        // Find matching weather pattern
        for (const [key, art] of Object.entries(weatherAsciiArt)) {
          if (normalised.includes(key) || key.includes(normalised)) {
            weatherArt = art;
            break;
          }
        }
        
        // Default weather patterns
        if (!weatherArt) {
          if (normalised.includes("clear")) weatherArt = weatherAsciiArt["clear sky"];
          else if (normalised.includes("cloud")) weatherArt = weatherAsciiArt["partly cloudy"];
          else if (normalised.includes("rain")) weatherArt = weatherAsciiArt.rain;
          else if (normalised.includes("snow")) weatherArt = weatherAsciiArt.snow;
          else if (normalised.includes("storm")) weatherArt = weatherAsciiArt.thunderstorm;
          else if (normalised.includes("fog")) weatherArt = weatherAsciiArt.foggy;
          else weatherArt = weatherAsciiArt["partly cloudy"]; // Default
        }
        
        const lines = weatherArt.art.trim().split('\n');
        const width = Math.max(...lines.map(l => l.length));
        const height = lines.length;
        
        return {
          type: "weather",
          name: value,
          art: weatherArt.art.trim(),
          frames: animated && weatherArt.frames ? weatherArt.frames.map(f => f.trim()) : undefined,
          animationSpeed: animated && weatherArt.frames ? 300 : undefined,
          width,
          height,
        };
      }
    } catch (error) {
      console.error(`[ASCII GENERATOR ERROR] ${error}`);
      throw new Error(
        `ASCII RENDER ERROR: Unable to generate art for "${value}". ` +
        `Terminal graphics subsystem malfunction.`
      );
    }
  },
});

// Generate generic country art with name
function generateGenericCountryArt(countryName: string) {
  const nameUpper = countryName.toUpperCase();
  const nameLength = nameUpper.length;
  const boxWidth = Math.max(nameLength + 4, 12);
  const padding = Math.floor((boxWidth - nameLength - 2) / 2);
  const paddingRight = boxWidth - nameLength - 2 - padding;
  
  const art = [
    "╭" + "─".repeat(boxWidth - 2) + "╮",
    "│" + " ".repeat(padding) + nameUpper + " ".repeat(paddingRight) + "│",
    "│" + " ".repeat(Math.floor((boxWidth - 2) / 2 - 1)) + "◆◆" + " ".repeat(Math.ceil((boxWidth - 2) / 2 - 1)) + "│",
    "│" + " ".repeat(Math.floor((boxWidth - 4) / 2)) + "◆◆◆◆" + " ".repeat(Math.ceil((boxWidth - 4) / 2)) + "│",
    "│" + " ".repeat(Math.floor((boxWidth - 2) / 2 - 1)) + "◆◆" + " ".repeat(Math.ceil((boxWidth - 2) / 2 - 1)) + "│",
    "╰" + "─".repeat(boxWidth - 2) + "╯",
  ].join('\n');
  
  return {
    type: "country" as const,
    name: countryName,
    art,
    width: boxWidth,
    height: 6,
  };
}

// Helper function to create ASCII box
export function createAsciiBox(content: string[], title?: string): string {
  const width = Math.max(...content.map(line => line.length), title?.length || 0) + 4;
  const lines = [];
  
  // Top border
  if (title) {
    const titlePadding = Math.floor((width - title.length - 2) / 2);
    lines.push("╭" + "─".repeat(titlePadding) + " " + title + " " + "─".repeat(width - titlePadding - title.length - 3) + "╮");
  } else {
    lines.push("╭" + "─".repeat(width - 2) + "╮");
  }
  
  // Content
  for (const line of content) {
    const padding = width - line.length - 2;
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    lines.push("│" + " ".repeat(leftPad) + line + " ".repeat(rightPad) + "│");
  }
  
  // Bottom border
  lines.push("╰" + "─".repeat(width - 2) + "╯");
  
  return lines.join('\n');
}

// Export type definitions
export type AsciiInput = z.infer<typeof asciiInputSchema>;
export type AsciiOutput = z.infer<typeof asciiOutputSchema>;