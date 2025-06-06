// vitest.config.js

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.test.js'],
    setupFiles: ['./vitest.setup.js'],
  },
  resolve: {
    alias: {
      '@platform': path.resolve(__dirname, 'platform'),
    },
  },
});
