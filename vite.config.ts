import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (mode === 'production' && !env.VITE_SOCKET_URL?.trim()) {
    throw new Error('Missing VITE_SOCKET_URL for production build. Set it in Vercel or in a local .env.production.local file before deploying the frontend.')
  }

  return {
    plugins: [vue()],
    server: {
      port: 5173,
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia', '@vueuse/motion'],
            realtime: ['socket.io-client'],
            animation: ['gsap'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
      },
    },
  }
})
