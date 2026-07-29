// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://arkansaspropertybuyers.com',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/preview-homepage-x9k2/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});