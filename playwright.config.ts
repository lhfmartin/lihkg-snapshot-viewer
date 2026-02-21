import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Run your local dev server before starting the tests
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173/lihkg-snapshot-viewer',
    stdout: 'ignore',
    stderr: 'pipe',
  },
  testDir: './tests/playwright',
});
