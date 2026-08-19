import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    testTimeout: 30000,
    fileParallelism: false,
    include: [
      'packages/*/src/**/*.test.ts',
      'packages/connectors/*/src/**/*.test.ts',
      'apps/*/src/**/*.test.ts',
    ],
  },
});
