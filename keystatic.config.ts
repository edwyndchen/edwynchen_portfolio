import { collection, config, fields } from '@keystatic/core';

const text = (label: string, description?: string) => fields.text({ label, description });

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
        }),
      },
    }),
  },
});
