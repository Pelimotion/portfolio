import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    glsl({
      include: [
        '**/*.glsl', '**/*.wgsl',
        '**/*.vert', '**/*.frag',
        '**/*.vs', '**/*.fs'
      ],
      defaultExtension: 'glsl',
      compress: false,
      watch: true
    }),
    {
      name: 'dev-html-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/gigantera/' || req.url === '/gigantera' || req.url === '/gigantera/index.html') {
            req.url = '/gigantera/index.source.html';
          }
          next();
        });
      }
    }
  ],
  base: '/gigantera/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, 'index.source.html')
      }
    }
  },
  server: {
    port: 5173,
    open: false
  }
});
