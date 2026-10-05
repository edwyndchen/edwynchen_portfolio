import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// Hosted on Vercel (Ed, 2026-10-06; it was set up for Netlify until then)
export default defineConfig({
  site: 'https://edwynchen-portfolio.vercel.app',
  adapter: vercel(),
  devToolbar: { enabled: false },
  integrations: [react(), markdoc(), keystatic()],
});
