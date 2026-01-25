import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
  define: {
    // Basic compatibility for some RN libraries
    global: 'window',
  },
  server: {
    port: 5175,
  },
});
