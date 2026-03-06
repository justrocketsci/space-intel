// @ts-check

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/coverage/**",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    rules: {
      // Prevent shipping console statements accidentally
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // Enforce === over ==
      eqeqeq: ["error", "always", { null: "ignore" }],
      // Disallow unused variables (TypeScript also catches these, but belt-and-suspenders)
      "no-unused-vars": "off", // Handled by @typescript-eslint/no-unused-vars
      // Prefer const
      "prefer-const": "error",
      // No var
      "no-var": "error",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Disallow explicit `any` — enforces TypeScript strict practices
      "@typescript-eslint/no-explicit-any": "error",
      // Unused vars (TypeScript-aware version)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Consistent type imports
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // No non-null assertion operator — use proper guards
      "@typescript-eslint/no-non-null-assertion": "error",
    },
  },
];

module.exports = config;
