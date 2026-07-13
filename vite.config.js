import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const plugins = [];

  // Vercel already compresses responses (gzip/brotli) — disable plugin in production
  if (mode !== 'production') {
    const { default: viteCompression } = await import('vite-plugin-compression');
    plugins.push(
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024
      }),
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024
      })
    );
  }

  if (mode === 'analyze') {
    const { visualizer } = await import('rollup-plugin-visualizer');
    plugins.push(
      visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true
      })
    );
  }

  return {
    build: {
      outDir: 'dist',
      cssMinify: 'lightningcss',
      rollupOptions: {
        input: {
          root: resolve(__dirname, 'index.html'),
          main: resolve(__dirname, 'html-css/contenido basico de la pagina/index.html'),
          formulario: resolve(__dirname, 'html-css/formulario/formulario.html')
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) return 'vendor';
          }
        }
      },
      sourcemap: mode === 'development'
    },

    plugins,

    server: {
      port: 3000,
      open: false
    },

    test: {
      environment: 'jsdom',
      globals: true
    }
  };
});
