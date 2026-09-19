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
          const url = req.url || '';
          const isAsset = /\.(jpg|jpeg|png|webp|svg|bin|glb|gltf|css|js|map|woff2?|ttf|mp4|mp3)$/i.test(url);
          if (!isAsset && (url.startsWith('/gigantera/ar') || url.startsWith('/ar'))) {
            req.url = '/gigantera/ar/index.source.html';
          } else if (url === '/gigantera/' || url === '/gigantera' || url === '/gigantera/index.html') {
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
        main: path.resolve(import.meta.dirname, 'index.source.html'),
        ar: path.resolve(import.meta.dirname, 'ar/index.source.html')
      }
    }
  },
  server: {
    port: 5173,
    open: false
  }
});
