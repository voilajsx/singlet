// vitest.config.js

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.test.js'],
    // Add this line to include your global setup file
    setupFiles: ['./platform/tests/vitest.setup.js'], //
    // If you prefer, or if your setup needs to run after the test environment is fully loaded, use setupFilesAfterEnv:
    // setupFilesAfterEnv: ['./platform/tests/vitest.setup.js'],
  },
  resolve: {
    alias: {
      '@platform': path.resolve(__dirname, 'platform'),
    },
  },
});
