import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'happy-dom',
    include: ['./tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    exclude: ['./tests/playwright/**', './tests/test-assets/**'],
  },
});
