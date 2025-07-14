/**
 * ESLint Configuration
 * Extends Next.js recommended linting rules with TypeScript support
 */
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// Resolve directory paths for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create compatibility layer for flat config
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Export ESLint configuration with Next.js and TypeScript rules
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
