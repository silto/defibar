import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  prettier,
  globalIgnores(['.next/**', 'src/.next/**', 'out/**', 'next-env.d.ts', 'src/types/schema.ts']),
]);
