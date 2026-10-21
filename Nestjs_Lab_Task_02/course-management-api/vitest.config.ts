import { defineConfig } from 'vitest/config';
import { nestTypescript } from './vitest.config.shared.js';

export default defineConfig({
  plugins: [nestTypescript()],
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`. Requires Vite 8, which ships this option.
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
  },
});
