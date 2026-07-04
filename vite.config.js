import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'html-css/contenido basico de la pagina/index.html'),
          formulario: resolve(__dirname, 'html-css/formulario/formulario.html')
        }
      }
    },

    server: {
      port: 3000,
      open: false
    }
  };
});
