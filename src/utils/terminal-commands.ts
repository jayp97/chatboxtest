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
  "/help": {
    name: "/help",
    description: "Show available commands",
    execute: () => {
      const commandList = Object.values(commands)
        .filter(cmd => !cmd.name.includes("sudo")) // Hide easter eggs from help
        .map((cmd, index) => `  ${index + 1}. ${cmd.name.padEnd(20)} - ${cmd.description}`)
        .join("\n");
      return `GEOSYS COMMAND REFERENCE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${commandList}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTip: Commands must start with /`;
    },
  },
  "/clear": {
    name: "/clear",
    description: "Clear the terminal",
    aliases: ["/cls"],
    execute: () => "CLEAR_TERMINAL",
  },
  "/about": {
    name: "/about",
    description: "About GEOSYS Terminal",
    execute: () => {
      return `GEOSYS v4.2.1\nGeographic Intelligence System\nAn extraordinary geography experience`;
    },
  },
  "/status": {
    name: "/status",
    description: "Show system status",
    execute: () => {
      const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
      
      return `GEOSYS STATUS REPORT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n▸ System Version:        v4.2.1\n▸ Status:                ONLINE\n▸ Time:                  ${timestamp}\n▸ Memory:                MASTRA AI\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nType '/preferences' to view user preferences`;
    },
  },
  "/sudo explore world": {
    name: "/sudo explore world",
    description: "Unlock hidden features",
    execute: () => {
      return "ACCESS GRANTED: Advanced features unlocked!";
    },
  },
  "/preferences": {
    name: "/preferences",
    description: "View or change your geographic preferences",
    aliases: ["/prefs", "/settings"],
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
          return `ERROR: Please provide a new value. Example: /preferences ${subcommand} [value]`;
        }
        
        const newValue = args.slice(1).join(" ");
        return `UPDATE_PREFERENCE:${subcommand}:${newValue}`;
      }
      
      return "ERROR: Unknown subcommand. Type '/preferences' to see available options.";
    },
  },
};

/**
 * Parse and execute a command
 */
export function parseCommand(input: string): string | null {
  let trimmedInput = input.trim().toLowerCase();
  
  // Add / prefix if not present (for backward compatibility)
  if (!trimmedInput.startsWith("/") && !trimmedInput.startsWith("sudo")) {
    trimmedInput = "/" + trimmedInput;
  }
  
  // Check for exact match or alias
  for (const [key, command] of Object.entries(commands)) {
    const normalizedKey = key.toLowerCase();
    if (
      trimmedInput === normalizedKey || 
      trimmedInput.startsWith(normalizedKey + " ") ||
      command.aliases?.some(alias => trimmedInput === alias.toLowerCase() || trimmedInput.startsWith(alias.toLowerCase() + " "))
    ) {
      const args = trimmedInput.split(" ").slice(1);
      const result = command.execute(args);
      return typeof result === "string" ? result : null;
    }
  }
  
  return null;
}