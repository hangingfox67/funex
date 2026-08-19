import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    testTimeout: 60000,
    hookTimeout: 30000,
    fileParallelism: false,
    pool: 'forks',
    include: [
      'packages/*/src/**/*.test.ts',
      'packages/connectors/*/src/**/*.test.ts',
      'apps/*/src/**/*.test.ts',
    ],
  },
});
