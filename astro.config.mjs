import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://example.netlify.app',
  adapter: netlify({ devFeatures: { edgeFunctions: false, images: false, environmentVariables: false } }),
  devToolbar: { enabled: false },
  integrations: [react(), markdoc(), keystatic()],
});
