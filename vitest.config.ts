import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['server/developer-tests/**/*.test.ts'],
    sequence: {
      concurrent: false,
    },
  },
});
