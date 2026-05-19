import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        test: {
          name: 'backend',
          environment: 'node',
          include: ['backend/src/**/*.test.ts'],
          pool: 'forks',
          fileParallelism: false,
          env: {
            NODE_ENV: 'test',
            LOG_LEVEL: 'silent',
          },
        },
      },
      {
        plugins: [react()],
        test: {
          name: 'frontend',
          environment: 'jsdom',
          include: ['frontend/src/**/*.test.{ts,tsx}'],
          env: {
            NODE_ENV: 'test',
          },
        },
      },
    ],
  },
});
