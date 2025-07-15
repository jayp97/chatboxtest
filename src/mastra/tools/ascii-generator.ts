/**
 * ascii-generator.ts
 * Dynamic ASCII art generator tool
 * Creates animated ASCII art for countries and weather conditions
 */

import { z } from "zod";
import { createTool } from "@mastra/core";
import {
  getCountryArt,
  getWeatherArt,
  ASCII_SPECIAL,
} from "@/utils/ascii-library";

// Define the input schema
const asciiInputSchema = z.object({
  type: z
    .enum(["country", "weather", "special"])
    .describe("Type of ASCII art to generate"),
  value: z
    .string()
    .describe("Country name, weather condition, or special effect"),
  animated: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to include animation frames"),
  showLandmark: z
    .boolean()
    .optional()
    .default(false)
    .describe("Show landmark for countries"),
});

// Define the output schema
const asciiOutputSchema = z.object({
  type: z.enum(["country", "weather", "special"]),
  name: z.string(),
  art: z.string().describe("Primary ASCII art"),
  frames: z
    .array(z.string())
    .optional()
    .describe("Animation frames if animated"),
  animationSpeed: z.number().optional().describe("Milliseconds between frames"),
  width: z.number().describe("Width of the ASCII art"),
  height: z.number().describe("Height of the ASCII art"),
  landmark: z.string().optional().describe("Landmark ASCII art for countries"),
});

// Country ASCII art library
/*
const _countryAsciiArt: Record<string, { art: string; frames?: string[] }> = {
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
*/

// Weather ASCII art library
/*
const _weatherAsciiArt: Record<string, { art: string; frames?: string[] }> = {
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
*/

// Create the ASCII generator tool
export const asciiGeneratorTool = createTool({
  id: "ascii-generator",
  description:
    "Generate dynamic ASCII art for countries and weather conditions",
  inputSchema: asciiInputSchema,

  execute: async ({ context }) => {
    const { type, value, animated, showLandmark } = context;
    try {
      if (type === "country") {
        const countryData = getCountryArt(value);

        let artToUse = countryData.static;
        let frames: string[] | undefined;

        if (showLandmark && countryData.landmark) {
          artToUse = countryData.landmark;
        } else if (animated && countryData.animated) {
          frames = countryData.animated.frames.map((f) => f.content);
          artToUse = frames[0] || countryData.static;
        }

        const lines = artToUse.trim().split("\n");
        const width = Math.max(...lines.map((l) => l.length));
        const height = lines.length;

        return {
          type: "country",
          name: value,
          art: artToUse.trim(),
          frames,
          animationSpeed: animated && countryData.animated ? 500 : undefined,
          width,
          height,
          landmark: countryData.landmark,
        };
      } else if (type === "weather") {
        const weatherAnimation = getWeatherArt(value);

        if (!weatherAnimation) {
          // Return generic weather art
          return {
            type: "weather",
            name: value,
            art: `
    ???
   (   )
    ???
    Unknown weather condition`,
            width: 25,
            height: 4,
          };
        }

        const firstFrame = weatherAnimation.frames[0];
        const lines = firstFrame.content.trim().split("\n");
        const width = Math.max(...lines.map((l) => l.length));
        const height = lines.length;

        return {
          type: "weather",
          name: value,
          art: firstFrame.content.trim(),
          frames: animated
            ? weatherAnimation.frames.map((f) => f.content)
            : undefined,
          animationSpeed: animated ? 300 : undefined,
          width,
          height,
        };
      } else if (type === "special") {
        // Handle special ASCII art
        const specialArt = ASCII_SPECIAL[value as keyof typeof ASCII_SPECIAL];

        if (!specialArt) {
          return {
            type: "special",
            name: value,
            art: `Special effect "${value}" not found`,
            width: 30,
            height: 1,
          };
        }

        const lines = specialArt.trim().split("\n");
        const width = Math.max(...lines.map((l) => l.length));
        const height = lines.length;

        return {
          type: "special",
          name: value,
          art: specialArt.trim(),
          width,
          height,
        };
      }
    } catch (error) {
      console.error("Error generating ASCII art:", error);
      throw new Error(
        `ASCII RENDER ERROR: Unable to generate art for "${value}". ` +
          `Terminal graphics subsystem malfunction.`
      );
    }
  },
});

// Helper function to create ASCII box
export function createAsciiBox(content: string[], title?: string): string {
  const width =
    Math.max(...content.map((line) => line.length), title?.length || 0) + 4;
  const lines = [];

  // Top border
  if (title) {
    const titlePadding = Math.floor((width - title.length - 2) / 2);
    lines.push(
      "╭" +
        "─".repeat(titlePadding) +
        " " +
        title +
        " " +
        "─".repeat(width - titlePadding - title.length - 3) +
        "╮"
    );
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

  return lines.join("\n");
}

// Export type definitions
export type AsciiInput = z.infer<typeof asciiInputSchema>;
export type AsciiOutput = z.infer<typeof asciiOutputSchema>;

// Export schemas for external use
export { asciiInputSchema, asciiOutputSchema };
