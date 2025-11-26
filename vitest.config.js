import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom', // Provides DOM environment for web components
    globals: true,
    setupFiles: ['./tests/test-setup.js'],
    include: ['tests/**/*.test.js'],
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 1
      }
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      exclude: ['src/**/*.test.js'],
      reporter: ['text', 'html', 'lcov']
    }
  },
});
