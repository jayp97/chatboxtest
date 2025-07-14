/**
 * terminal-commands.ts
 * Terminal command parser and handlers
 * Processes special commands and easter eggs
 */

export interface Command {
  name: string;
  description: string;
  aliases?: string[];
  execute: (args: string[]) => Promise<string> | string;
}

export const commands: Record<string, Command> = {
  help: {
    name: "help",
    description: "Show available commands",
    execute: () => {
      const commandList = Object.values(commands)
        .map(cmd => `${cmd.name.padEnd(15)} - ${cmd.description}`)
        .join("\\n");
      return `Available commands:\\n${commandList}`;
    },
  },
  clear: {
    name: "clear",
    description: "Clear the terminal",
    aliases: ["cls"],
    execute: () => "CLEAR_TERMINAL",
  },
  about: {
    name: "about",
    description: "About GEOSYS Terminal",
    execute: () => {
      return `GEOSYS v4.2.1
Geographic Intelligence System
An extraordinary geography experience`;
    },
  },
  "sudo explore world": {
    name: "sudo explore world",
    description: "Unlock hidden features",
    execute: () => {
      return "ACCESS GRANTED: Advanced features unlocked!";
    },
  },
};

/**
 * Parse and execute a command
 */
export function parseCommand(input: string): string | null {
  const trimmedInput = input.trim().toLowerCase();
  
  // Check for exact match or alias
  for (const [key, command] of Object.entries(commands)) {
    if (
      trimmedInput === key || 
      trimmedInput.startsWith(key + " ") ||
      command.aliases?.some(alias => trimmedInput === alias || trimmedInput.startsWith(alias + " "))
    ) {
      const args = trimmedInput.split(" ").slice(1);
      const result = command.execute(args);
      return typeof result === "string" ? result : null;
    }
  }
  
  return null;
}