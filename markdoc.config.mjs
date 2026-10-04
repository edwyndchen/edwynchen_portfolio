import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

// Keystatic's content components, rendered by Astro components
export default defineMarkdocConfig({
  tags: {
    gallery: {
      render: component('./src/components/Gallery.astro'),
      selfClosing: true,
      attributes: {
        label: { type: String },
        items: { type: Array },
      },
    },
    sectionImage: {
      render: component('./src/components/SectionImage.astro'),
      selfClosing: true,
      attributes: {
        image: { type: String },
        alt: { type: String },
        caption: { type: String },
      },
    },
  },
});
