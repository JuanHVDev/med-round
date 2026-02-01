import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Prisma generated files
    "prisma/generated/**",
    // Dependencies
    "node_modules/**",
  ]),
  {
    rules: {
      // Enforce double quotes for consistency across the codebase
      quotes: ["error", "double", { avoidEscape: true }],
    },
  },
]);

export default eslintConfig;
