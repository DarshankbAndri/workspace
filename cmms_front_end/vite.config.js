import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devServerPort = Number(env.VITE_DEV_SERVER_PORT || 3500);
  const proxyTimeout = Number(env.VITE_DEV_PROXY_TIMEOUT_MS || env.VITE_API_TIMEOUT_MS || 120000);

  return {
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
      port: devServerPort, 
      host: '0.0.0.0',
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:4200',
          changeOrigin: true,
          timeout: proxyTimeout,
          proxyTimeout,
        },
      },
    },
  };
});
