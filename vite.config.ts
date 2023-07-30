import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'process';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/bing-wallpaper/',
  plugins: [react()],
  build: {
    rollupOptions: {
      plugins: [
        process.env.VISUALIZER === 'show' &&
          visualizer({
            open: true,
            gzipSize: true,
          }),
      ],
    },
  },
});
