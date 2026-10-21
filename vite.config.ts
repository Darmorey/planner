import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  const base = process.env.VITE_BASE_PATH || '/';

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['icons/apple-touch-icon.jpg'],
        manifest: {
          name: 'Планер',
          short_name: 'Планер',
          description: 'Ежедневник задач с календарём, заметками и списками',
          theme_color: '#0C3B2E',
          background_color: '#F4F0EB',
          display: 'standalone',
          orientation: 'portrait',
          start_url: base,
          scope: base,
          lang: 'ru',
          icons: [
            {
              src: `${base}icons/apple-touch-icon.jpg`,
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'any',
            },
            {
              src: `${base}icons/apple-touch-icon.jpg`,
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,jpg,woff,woff2}'],
          navigateFallback: 'index.html',
          clientsClaim: true,
          skipWaiting: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
