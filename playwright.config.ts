import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'experience.spec.ts',
  fullyParallel: true,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4278',
    colorScheme: 'dark',
    locale: 'en-US',
    reducedMotion: 'no-preference',
  },
  webServer: {
    command: 'vite preview --host 127.0.0.1 --port 4278',
    url: 'http://127.0.0.1:4278',
    reuseExistingServer: true,
  },
});
