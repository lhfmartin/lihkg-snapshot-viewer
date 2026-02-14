import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Run your local dev server before starting the tests
  webServer: {
    command: 'pnpm dev --host',
    url: 'http://localhost:5173/lihkg-snapshot-viewer',
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS: 'host.docker.internal',
    },
  },
  testDir: './tests/playwright',
});
