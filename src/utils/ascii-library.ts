/**
 * ascii-library.ts
 * Comprehensive ASCII art library with animations
 * Contains country-specific art, weather patterns, and transition effects
 */

// Type definitions for ASCII art
export interface ASCIIFrame {
  content: string;
  duration?: number; // Duration in milliseconds
}

export interface ASCIIAnimation {
  frames: ASCIIFrame[];
  loop?: boolean;
  name: string;
}

export interface CountryASCII {
  static: string;
  animated?: ASCIIAnimation;
  landmark?: string;
}

// ASCII Art Collections
export const ASCII_COUNTRIES: Record<string, CountryASCII> = {
  // Japan - Cherry Blossoms
  japan: {
    static: `
       ✿     ✿
      ╱┃╲   ╱┃╲
     ╱ ┃ ╲ ╱ ┃ ╲
    ───┸─────┸───
    `,
    animated: {
      name: "cherry_blossom_fall",
      frames: [
        {
          content: `
       ✿     ✿
      ╱┃╲   ╱┃╲
     ╱ ┃ ╲ ╱ ┃ ╲
    ───┸─────┸───`,
          duration: 500
        },
        {
          content: `
         ✿ ✿
      ╱┃╲ ╱┃╲
     ╱ ┃ ╲ ┃ ╲
    ───┸───┸───
         ✿`,
          duration: 500
        },
        {
          content: `
      ╱┃╲ ╱┃╲
     ╱ ┃ ╲ ┃ ╲
    ───┸───┸───
       ✿   ✿
         ✿`,
          duration: 500
        }
      ],
      loop: true
    },
    landmark: `
     /\\    富士山
    /  \\   Mount Fuji
   /    \\
  /      \\
 /________\\`
  },

  // Brazil - Carnival
  brazil: {
    static: `
     \\o/
      |
     / \\
    `,
    animated: {
      name: "carnival_dance",
      frames: [
        {
          content: `
     \\o/
      |
     / \\`,
          duration: 200
        },
        {
          content: `
      o
     /|\\
     / \\`,
          duration: 200
        },
        {
          content: `
     \\o
      |\\
     / \\`,
          duration: 200
        },
        {
          content: `
      o/
     /|
     / \\`,
          duration: 200
        }
      ],
      loop: true
    },
    landmark: `
       ___
      /   \\
     |  †  |  Cristo
     |_____|  Redentor
       | |
      /| |\\
     / | | \\`
  },

  // Egypt - Pyramids
  egypt: {
    static: `
       /\\
      /  \\
     /    \\
    /______\\
    `,
    animated: {
      name: "pyramid_build",
      frames: [
        {
          content: `
    ________`,
          duration: 300
        },
        {
          content: `
    /      \\
    ________`,
          duration: 300
        },
        {
          content: `
     /    \\
    /______\\`,
          duration: 300
        },
        {
          content: `
      /  \\
     /    \\
    /______\\`,
          duration: 300
        },
        {
          content: `
       /\\
      /  \\
     /    \\
    /______\\`,
          duration: 500
        }
      ],
      loop: false
    },
    landmark: `
      _______
     /       \\  Great
    / SPHINX  \\ Sphinx
   |  ◉   ◉  | of Giza
   |     <    |
   |   ___    |
   |__________|`
  },

  // Australia - Kangaroo
  australia: {
    static: `
       (\\
      ( \\)
      )))
     (  (
     /  /
    (__/
    `,
    animated: {
      name: "kangaroo_hop",
      frames: [
        {
          content: `
       (\\
      ( \\)
      )))
     (  (
     /  /
    (__/`,
          duration: 300
        },
        {
          content: `
        (\\
       ( \\)
       )))
      (  (
     /  /
    (__/`,
          duration: 150
        },
        {
          content: `
         (\\
        ( \\)
        )))
       (  (
      /  /
     (__/`,
          duration: 150
        },
        {
          content: `
          (\\
         ( \\)
         )))
        (  (
       /  /
      (__/`,
          duration: 300
        }
      ],
      loop: true
    },
    landmark: `
     ___________
    |     |     |  Sydney
    |  /\\ | /\\  |  Opera
    | /  \\|/  \\ |  House
    |/    |    \\|
    -------------`
  },

  // France - Eiffel Tower
  france: {
    static: `
       A
      /|\\
     / | \\
    /  |  \\
   /___|___\\
  /    |    \\
 /_____|_____\\
    `,
    animated: {
      name: "eiffel_sparkle",
      frames: [
        {
          content: `
       A
      /|\\
     / | \\
    /  |  \\
   /___|___\\
  /    |    \\
 /_____|_____\\`,
          duration: 1000
        },
        {
          content: `
       ✦
      /|\\
     / | \\
    /  |  \\
   /___|___\\
  /    |    \\
 /_____|_____\\`,
          duration: 200
        },
        {
          content: `
       A
      ✦|✦
     / | \\
    /  |  \\
   /___|___\\
  /    |    \\
 /_____|_____\\`,
          duration: 200
        },
        {
          content: `
       A
      /|\\
     ✦ | ✦
    /  |  \\
   /___|___\\
  /    |    \\
 /_____|_____\\`,
          duration: 200
        }
      ],
      loop: true
    },
    landmark: `
    Tour Eiffel`
  },

  // United Kingdom - Big Ben
  uk: {
    static: `
      |=|
      |=|
     /| |\\
    | | | |
    |_|_|_|
    `,
    landmark: `
      |=|
      |◉|  Big Ben
     /| |\\
    | | | |
    |_|_|_|
    [_____]`
  },

  // USA - Statue of Liberty
  usa: {
    static: `
      \\*/
       |
      /|\\
     / | \\
       |
      / \\
    `,
    landmark: `
      \\*/
       |   Liberty
      /|\\  
     / | \\
       |
      / \\
    [_____]`
  },

  // Canada - Maple Leaf
  canada: {
    static: `
       🍁
      / \\
     /   \\
    /_____\\
    `,
    landmark: `
      CN Tower
        |
        |
       /|\\
      / | \\
     /  |  \\
    [___|___]`
  },

  // Italy - Leaning Tower
  italy: {
    static: `
       /|
      / |
     /  |
    /   |
   /____|
    `,
    landmark: `
      //|   Torre
     // |   di Pisa
    //  |
   //   |
  //____| `
  },

  // India - Taj Mahal
  india: {
    static: `
      (*)
     /| |\\
    | | | |
    |_|_|_|
    `,
    landmark: `
      (*)
     /| |\\   Taj
    | | | |  Mahal
    |◉|◉|◉|
    [_____]`
  },

  // China - Great Wall
  china: {
    static: `
    ╱‾╲╱‾╲╱‾╲
    ▔▔▔▔▔▔▔▔▔
    `,
    animated: {
      name: "dragon_dance",
      frames: [
        {
          content: `
    ～～～～～
    龍龍龍龍龍`,
          duration: 300
        },
        {
          content: `
    ～～～～～
    龍龍龍龍龍`,
          duration: 300
        }
      ],
      loop: true
    },
    landmark: `
    ╱‾╲╱‾╲╱‾╲
    ▔▔▔▔▔▔▔▔▔
    Great Wall`
  },

  // Russia - Kremlin
  russia: {
    static: `
      ☆
     /|\\
    |⬛|
    |___|
    `,
    landmark: `
      ☆
     /|\\   Kremlin
    |⬛|
    |___|
    [___]`
  },

  // Mexico - Pyramid
  mexico: {
    static: `
     ___
    /   \\
   /_____\\
  /_______\\
    `,
    landmark: `
     ___
    /   \\   Chichen
   /_____\\  Itza
  /_______\\`
  },

  // Greece - Parthenon
  greece: {
    static: `
    ||||||||
    ||||||||
    ▔▔▔▔▔▔▔▔
    `,
    landmark: `
    ||||||||
    ||||||||  Parthenon
    ▔▔▔▔▔▔▔▔`
  },

  // Spain - Windmill
  spain: {
    static: `
      ><
     /||\\
      ||
    `,
    animated: {
      name: "windmill_spin",
      frames: [
        { content: `  ><\n /||\\\n  ||`, duration: 200 },
        { content: `  /\\\n \\||/\n  ||`, duration: 200 },
        { content: `  --\n  ||\n  ||`, duration: 200 },
        { content: `  \\/\n /||\\\n  ||`, duration: 200 }
      ],
      loop: true
    }
  },

  // Germany - Brandenburg Gate
  germany: {
    static: `
    ||  ||
    ||  ||
    ||==||
    `,
    landmark: `
    ||  ||
    ||  ||  Brandenburg
    ||==||  Gate`
  },

  // South Africa - Table Mountain
  "south africa": {
    static: `
    ▔▔▔▔▔▔▔
    /      \\
    `,
    landmark: `
    ▔▔▔▔▔▔▔
    /      \\  Table
              Mountain`
  },

  // Netherlands - Windmill
  netherlands: {
    static: `
      +
     +++
      |
    __|__
    `,
    animated: {
      name: "dutch_windmill",
      frames: [
        { content: `  +\n +++\n  |\n__|__`, duration: 300 },
        { content: `  x\n x+x\n  |\n__|__`, duration: 300 }
      ],
      loop: true
    }
  },

  // Peru - Machu Picchu
  peru: {
    static: `
    ╱╲╱╲╱╲
    ▔▔▔▔▔▔
    `,
    landmark: `
    ╱╲╱╲╱╲
    ▔▔▔▔▔▔
    Machu Picchu`
  },

  // Default for unknown countries
  default: {
    static: `
      🌍
     ╱ ╲
    ╱   ╲
    ▔▔▔▔▔
    `
  }
};

// Weather ASCII Art
export const ASCII_WEATHER: Record<string, ASCIIAnimation> = {
  clear: {
    name: "sunny",
    frames: [
      {
        content: `
      \\   /
       .-.
    ― (   ) ―
       '-'
      /   \\`,
        duration: 2000
      },
      {
        content: `
      \\   /
       .-.
    ― (   ) ―
       '-'
      /   \\`,
        duration: 200
      }
    ],
    loop: true
  },

  rain: {
    name: "raining",
    frames: [
      {
        content: `
      .--.
     (    )
    (_    _)
     ' ' '
    ' ' ' '`,
        duration: 300
      },
      {
        content: `
      .--.
     (    )
    (_    _)
    ' ' ' '
     ' ' '`,
        duration: 300
      }
    ],
    loop: true
  },

  snow: {
    name: "snowing",
    frames: [
      {
        content: `
      .--.
     (    )
    (_    _)
     * * *
    * * * *`,
        duration: 400
      },
      {
        content: `
      .--.
     (    )
    (_    _)
    * * * *
     * * *`,
        duration: 400
      }
    ],
    loop: true
  },

  cloudy: {
    name: "clouds",
    frames: [
      {
        content: `
      .--.
     (    )
    (      )
     '----'`,
        duration: 1000
      }
    ],
    loop: false
  },

  storm: {
    name: "thunderstorm",
    frames: [
      {
        content: `
      .--.
     (    )
    (_    _)
     ⚡⚡⚡
    ' ' ' '`,
        duration: 200
      },
      {
        content: `
      .--.
     (    )
    (_    _)
     ' ' '
    ⚡ ' ⚡`,
        duration: 300
      },
      {
        content: `
      .--.
     (    )
    (_    _)
     ' ⚡ '
    ' ' ' '`,
        duration: 200
      }
    ],
    loop: true
  },

  fog: {
    name: "foggy",
    frames: [
      {
        content: `
    ≈≈≈≈≈≈≈
    ≈≈≈≈≈≈≈
    ≈≈≈≈≈≈≈`,
        duration: 1000
      }
    ],
    loop: false
  },

  wind: {
    name: "windy",
    frames: [
      {
        content: `
    ～～～～
    ～～～～
    ～～～～`,
        duration: 300
      },
      {
        content: `
    ～～～～
    ～～～～
    ～～～～`,
        duration: 300
      }
    ],
    loop: true
  }
};

// Transition effects between ASCII states
export const ASCII_TRANSITIONS = {
  fadeIn: (art: string): ASCIIAnimation => ({
    name: "fade_in",
    frames: [
      { content: art.replace(/./g, ' '), duration: 100 },
      { content: art.replace(/[^ ]/g, '·'), duration: 100 },
      { content: art.replace(/[^ ]/g, '▪'), duration: 100 },
      { content: art, duration: 500 }
    ],
    loop: false
  }),

  typewriter: (art: string): ASCIIAnimation => {
    const lines = art.trim().split('\n');
    const frames: ASCIIFrame[] = [];
    
    for (let i = 0; i <= lines.length; i++) {
      frames.push({
        content: lines.slice(0, i).join('\n'),
        duration: 150
      });
    }
    
    return {
      name: "typewriter",
      frames,
      loop: false
    };
  },

  glitch: (art: string): ASCIIAnimation => ({
    name: "glitch",
    frames: [
      { content: art, duration: 100 },
      { content: art.replace(/[^ ]/g, () => Math.random() > 0.8 ? '█' : '▓'), duration: 50 },
      { content: art.replace(/[^ ]/g, () => Math.random() > 0.9 ? '▒' : '░'), duration: 50 },
      { content: art, duration: 200 }
    ],
    loop: false
  }),

  dissolve: (fromArt: string, toArt: string): ASCIIAnimation => {
    const frames: ASCIIFrame[] = [
      { content: fromArt, duration: 300 }
    ];
    
    // Create intermediate frames
    for (let i = 1; i <= 3; i++) {
      const ratio = i / 4;
      const mixed = fromArt.split('').map((char, index) => {
        if (char === ' ' || char === '\n') return char;
        return Math.random() < ratio ? (toArt[index] || ' ') : char;
      }).join('');
      
      frames.push({ content: mixed, duration: 100 });
    }
    
    frames.push({ content: toArt, duration: 300 });
    
    return {
      name: "dissolve",
      frames,
      loop: false
    };
  }
};

// Special ASCII art for different moods/states
export const ASCII_SPECIAL = {
  thinking: `
    .oO
   (   )
    ‾‾‾`,
  
  loading: `
    ⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏`,
  
  success: `
    ✓ ✓ ✓
    ▔▔▔▔▔`,
  
  error: `
    ✗ ✗ ✗
    ▔▔▔▔▔`,
  
  celebration: `
    \\o/ \\o/ \\o/
     |   |   |
    / \\ / \\ / \\`,
  
  compass: `
         N
         |
    W ―――+――― E
         |
         S`,
  
  globe: `
      _____
     /     \\
    | ◉   ◉ |
    |   ―   |
     \\_____/`
};

// Utility function to get country ASCII art
export function getCountryArt(country: string): CountryASCII {
  const normalized = country.toLowerCase().trim();
  return ASCII_COUNTRIES[normalized] || ASCII_COUNTRIES.default;
}

// Utility function to get weather ASCII art
export function getWeatherArt(condition: string): ASCIIAnimation | null {
  const normalized = condition.toLowerCase().trim();
  
  // Map common weather conditions to our ASCII art
  if (normalized.includes('clear') || normalized.includes('sun')) return ASCII_WEATHER.clear;
  if (normalized.includes('rain')) return ASCII_WEATHER.rain;
  if (normalized.includes('snow')) return ASCII_WEATHER.snow;
  if (normalized.includes('cloud')) return ASCII_WEATHER.cloudy;
  if (normalized.includes('storm') || normalized.includes('thunder')) return ASCII_WEATHER.storm;
  if (normalized.includes('fog') || normalized.includes('mist')) return ASCII_WEATHER.fog;
  if (normalized.includes('wind')) return ASCII_WEATHER.wind;
  
  return null;
}

// Function to combine multiple ASCII arts
export function combineAsciiArt(arts: string[], separator: string = '  '): string {
  const artLines = arts.map(art => art.trim().split('\n'));
  const maxLines = Math.max(...artLines.map(lines => lines.length));
  
  const combined: string[] = [];
  
  for (let i = 0; i < maxLines; i++) {
    const line = artLines
      .map(lines => (lines[i] || '').padEnd(Math.max(...lines.map(l => l.length))))
      .join(separator);
    combined.push(line);
  }
  
  return combined.join('\n');
}

// Function to create bordered ASCII art
export function createBorder(art: string, borderChar: string = '═'): string {
  const lines = art.trim().split('\n');
  const maxLength = Math.max(...lines.map(line => line.length));
  
  const border = borderChar.repeat(maxLength + 4);
  const bordered = [
    `╔${border}╗`,
    ...lines.map(line => `║ ${line.padEnd(maxLength)} ║`),
    `╚${border}╝`
  ];
  
  return bordered.join('\n');
}

// Create ASCII progress bar
export function createProgressBar(progress: number, width: number = 20): string {
  const filled = Math.floor((progress / 100) * width);
  const empty = width - filled;
  return `[${'\u2588'.repeat(filled)}${' '.repeat(empty)}] ${progress}%`;
}

// Create ASCII table for data display
export function createAsciiTable(headers: string[], rows: string[][]): string {
  const colWidths = headers.map((header, i) => 
    Math.max(header.length, ...rows.map(row => (row[i] || '').length))
  );
  
  const separator = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';
  const headerRow = '|' + headers.map((h, i) => ` ${h.padEnd(colWidths[i])} `).join('|') + '|';
  const dataRows = rows.map(row => 
    '|' + row.map((cell, i) => ` ${(cell || '').padEnd(colWidths[i])} `).join('|') + '|'
  );
  
  return [separator, headerRow, separator, ...dataRows, separator].join('\n');
}