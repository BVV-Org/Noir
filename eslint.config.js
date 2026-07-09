const { FlatCompat } = require("@eslint/eslintrc");

/**
 * ESLint flat config (ESLint 9). Next.js does not yet ship a native flat-config
 * export, so `next/core-web-vitals` + `next/typescript` are bridged via
 * FlatCompat. `prettier` disables stylistic rules that Prettier owns.
 */
const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "public/**",
      // CJS tooling configs (not application source).
      "eslint.config.js",
      "postcss.config.js",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
