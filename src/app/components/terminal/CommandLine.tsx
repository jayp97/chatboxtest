/**
 * CommandLine.tsx
 * Command line input component
 * Handles user input with terminal-style interface
 */

export function CommandLine() {
  return (
    <div className="command-line">
      {/* Command line input will be implemented here */}
      <span className="prompt">&gt; </span>
      <input type="text" className="command-input" />
    </div>
  );
}