import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Base configuration
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "dist/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
    ],
  },
  
  // JS config
  js.configs.recommended,
  
  // Next.js config
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // Custom rules
  {
    rules: {
      // Disable specific TypeScript ESLint rules
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "react/no-unescaped-entities": "warn",
      
      // Disable specific React rules
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  
  // File-specific rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
];

export default eslintConfig;
