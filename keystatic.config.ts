import { collection, config, fields } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';

const text = (label: string, description?: string) => fields.text({ label, description });

// A wide image after a case study section (Problem, Outcomes, Process). Until an image is added, the site shows a
// placeholder frame in its place. Rendered by src/components/SectionImage.astro (see markdoc.config.mjs).
// Several images for one section (Outcomes, Process), shown as a carousel. Empty slots show placeholder frames.
// Rendered by src/components/Gallery.astro (see markdoc.config.mjs).
const gallery = block({
  label: 'Gallery (carousel)',
  description: 'Several images for one section, shown as a carousel.',
  schema: {
    label: fields.text({ label: 'What it shows', description: 'Names the carousel for screen readers, e.g. "Process"' }),
    items: fields.array(
      fields.object({
        image: fields.image({ label: 'Image', directory: 'public/images/case-studies', publicPath: '/images/case-studies/' }),
        alt: fields.text({ label: 'Alt text' }),
        caption: fields.text({ label: 'Caption (optional)' }),
      }),
      { label: 'Images', itemLabel: (p) => p.fields.caption.value || p.fields.alt.value || 'Image' },
    ),
  },
});

const sectionImage = block({
  label: 'Section image',
  description: 'A wide image with an optional caption. Shows a placeholder frame until an image is added.',
  schema: {
    image: fields.image({ label: 'Image', directory: 'public/images/case-studies', publicPath: '/images/case-studies/' }),
    alt: fields.text({ label: 'Alt text', description: 'What the image shows. Leave blank only if it is decorative.' }),
    caption: fields.text({ label: 'Caption (optional)' }),
  },
});

export default config({
  storage: { kind: 'local' },
  ui: { brand: { name: 'Edwyn Chen portfolio' } },
  collections: {
    caseStudies: collection({
      label: 'Case studies',
      slugField: 'title',
      path: 'src/content/case-studies/*',
      format: { contentField: 'body' },
      entryLayout: 'content',
      columns: ['title', 'order'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        dek: fields.text({ label: 'Dek', description: 'One line under the title', validation: { length: { min: 1 } } }),
        discipline: fields.select({
          label: 'Discipline',
          options: [
            { label: 'Product design', value: 'product-design' },
            { label: 'Design system', value: 'design-system' },
          ],
          defaultValue: 'product-design',
        }),
        order: fields.integer({ label: 'Order on home page', defaultValue: 1 }),
        outcome: fields.text({ label: 'Outcome (one line, numbers first)', validation: { length: { min: 1 } } }),
        overview: fields.text({
          label: 'Overview',
          description: 'Shown in the blue band at the top of the case study. Leave a blank line between paragraphs.',
          multiline: true,
        }),
        role: text('Role'),
        timeline: text('Timeline'),
        team: text('Team'),
        platforms: text('Platforms', 'Leave blank if not relevant'),
        context: text('Context', 'Leave blank if not relevant'),
        cover: fields.image({
          label: 'Cover art',
          directory: 'public/images/case-studies',
          publicPath: '/images/case-studies/',
        }),
        coverAlt: text('Cover alt text', 'Describe the image for screen readers. Required when a cover is set.'),
        hero: fields.image({
          label: 'Hero image',
          description: 'Full-width image at the top of the case study. Falls back to the cover art when empty.',
          directory: 'public/images/case-studies',
          publicPath: '/images/case-studies/',
        }),
        heroAlt: text('Hero alt text', 'Required when a hero image is set.'),
        metrics: fields.array(
          fields.object({
            value: fields.text({ label: 'Value', description: 'Whole numbers, e.g. 52%' }),
            label: fields.text({ label: 'Label' }),
          }),
          { label: 'Stat panels', itemLabel: (p) => `${p.fields.value.value}  ${p.fields.label.value}` },
        ),
        body: fields.markdoc({
          label: 'Body',
          options: {
            image: {
              directory: 'public/images/case-studies',
              publicPath: '/images/case-studies/',
              schema: { alt: fields.text({ label: 'Alt text', validation: { length: { min: 1 } } }) },
            },
          },
          components: { sectionImage, gallery },
        }),
      },
    }),
    workshop: collection({
      label: 'Workshop',
      slugField: 'title',
      path: 'src/content/workshop/*',
      format: { contentField: 'body' },
      entryLayout: 'content',
      columns: ['title', 'date', 'status'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Drafts show in dev and here, never on the live site. Untick to publish.',
          defaultValue: true,
        }),
        date: fields.date({ label: 'Date', description: 'When you started (or shipped) it. Newest shows first.', validation: { isRequired: true } }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'On the easel (in progress)', value: 'in-progress' },
            { label: 'Fired (shipped)', value: 'shipped' },
            { label: 'Sketch (experiment)', value: 'experiment' },
          ],
          defaultValue: 'in-progress',
        }),
        blurb: fields.text({ label: 'Blurb', description: 'One or two lines for the card', multiline: true, validation: { length: { min: 1 } } }),
        skills: fields.array(fields.text({ label: 'Skill or tool' }), {
          label: 'Skills and tools',
          description: 'e.g. Figma, React, GSAP. These build the skills filter on the Workshop page.',
          itemLabel: (p) => p.value,
        }),
        image: fields.image({ label: 'Image', directory: 'public/images/workshop', publicPath: '/images/workshop/' }),
        imageAlt: text('Image alt text', 'Describe the image for screen readers. Required when an image is set.'),
        link: fields.url({ label: 'Link', description: 'Live demo, GitHub, Figma, etc. Optional.' }),
        linkLabel: text('Link text', 'e.g. "Try it", "View on GitHub". Defaults to "Visit".'),
        body: fields.markdoc({
          label: 'Write-up (optional)',
          description: 'Leave empty for a card only. Anything here gets its own page.',
          options: {
            image: {
              directory: 'public/images/workshop',
              publicPath: '/images/workshop/',
              schema: { alt: fields.text({ label: 'Alt text', validation: { length: { min: 1 } } }) },
            },
          },
        }),
      },
    }),
  },
});
