import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { ignores: ["dist/**", "src/graphql.schema.ts"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ["**/*.ts"],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
];
