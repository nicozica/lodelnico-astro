import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://lodelnico.com',
  base: '/',
  
  // Build configuration for deployment
  build: {
    format: 'file', // Generate .html files instead of directories
    assets: '_assets', // Custom assets directory
  },

  // Vite configuration for development
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: '_assets/[name].[hash][extname]'
        }
      }
    }
  },

  // Integrations
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // Custom sitemap entries for photo galleries
      customPages: [
        'https://lodelnico.com/gallery',
        'https://lodelnico.com/about'
      ]
    })
  ],

  // Development server configuration
  server: {
    port: 3000,
    host: true
  }
});
