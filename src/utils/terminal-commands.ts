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
  status: {
    name: "status",
    description: "Show system status",
    execute: () => {
      const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
      
      return `GEOSYS STATUS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▸ System Version:        v4.2.1
▸ Status:                ONLINE
▸ Time:                  ${timestamp}
▸ Memory:                MASTRA AI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type 'preferences' to view user preferences`;
    },
  },
  "sudo explore world": {
    name: "sudo explore world",
    description: "Unlock hidden features",
    execute: () => {
      return "ACCESS GRANTED: Advanced features unlocked!";
    },
  },
  preferences: {
    name: "preferences",
    description: "View or change your geographic preferences",
    aliases: ["prefs", "settings"],
    execute: (args) => {
      // If no arguments, show current preferences from agent
      if (args.length === 0) {
        return "SHOW_PREFERENCES";
      }
      
      // Handle subcommands
      const subcommand = args[0];
      
      if (subcommand === "reset") {
        return "RESET_PREFERENCES";
      }
      
      if (["country", "continent", "destination"].includes(subcommand)) {
        if (args.length < 2) {
          return `ERROR: Please provide a new value. Example: preferences ${subcommand} [value]`;
        }
        
        const newValue = args.slice(1).join(" ");
        return `UPDATE_PREFERENCE:${subcommand}:${newValue}`;
      }
      
      return "ERROR: Unknown subcommand. Type 'preferences' to see available options.";
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