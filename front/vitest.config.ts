/// <reference types="vitest" />
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    css: true,
    env: {
      NODE_ENV: 'test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/', '**/*.d.ts', '**/*.config.*', '.next/', 'out/'],
    },
    include: [
      '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
      '**/?(*.)(test|spec).(js|jsx|ts|tsx)',
    ],
    exclude: ['node_modules/', '.next/', 'out/', 'dist/'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@/components': resolve(__dirname, './components'),
      '@/lib': resolve(__dirname, './lib'),
      '@/app': resolve(__dirname, './app'),
      '@/ui': resolve(__dirname, './ui'),
      '@/features': resolve(__dirname, './features'),
    },
  },
});
