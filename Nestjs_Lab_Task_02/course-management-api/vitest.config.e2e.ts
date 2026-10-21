import { defineConfig } from 'vitest/config';
import { nestTypescript } from './vitest.config.shared.js';

export default defineConfig({
  plugins: [nestTypescript()],
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});
