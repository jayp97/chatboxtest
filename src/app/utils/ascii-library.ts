/**
 * ascii-library.ts
 * ASCII art library and animations
 * Contains country-specific and weather ASCII art
 */

export const countryAsciiArt = {
  japan: {
    name: "Cherry Blossoms",
    frames: [
      `    ✿     ✿
   ╱┃╲   ╱┃╲`,
      `     ✿ ✿
   ╱┃╲ ╱┃╲`,
    ],
  },
  brazil: {
    name: "Carnival",
    frames: [
      `  ♪ ┌─┐ ♪
    │♫│
    └─┘`,
    ],
  },
  egypt: {
    name: "Pyramid",
    frames: [
      `    /\\
   /  \\
  /____\\`,
    ],
  },
  australia: {
    name: "Kangaroo",
    frames: [
      `  (\\_/)
  ( o.o)
  (> <)`,
    ],
  },
  france: {
    name: "Eiffel Tower",
    frames: [
      `    A
   /|\\
  / | \\
 /__|__\\`,
    ],
  },
};

export const weatherAsciiArt = {
  sunny: `    \\   /
     .-.
  ― (   ) ―
     \`-´
    /   \\`,
  rainy: `    ´ \` ´ \`
    ´ \` ´
    ´ \` ´`,
  snowy: `  * . * . *
  . * . * .
  * . * . *`,
};