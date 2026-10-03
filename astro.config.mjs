import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://example.netlify.app',
  adapter: netlify(),
  integrations: [react(), markdoc(), keystatic()],
});
