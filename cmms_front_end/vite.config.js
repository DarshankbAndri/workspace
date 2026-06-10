import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      include: ['**/*.jsx', '**/*.js', '**/*.tsx', '**/*.ts'],
      jsxRuntime: 'automatic',
    }),
  ],
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: 'react',
      refresh: true,
    },
  },
  server: {
    port: 3000,
  },
});
