import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/case-studies' }),
  schema: z
    .object({
      title: z.string().min(1),
      dek: z.string().min(1),
      discipline: z.enum(['product-design', 'design-system']),
      order: z.number().int(),
      outcome: z.string().min(1),
      overview: z.string().default(''),
      role: z.string().default(''),
      timeline: z.string().default(''),
      team: z.string().default(''),
      platforms: z.string().default(''),
      context: z.string().default(''),
      cover: z.string().nullish(),
      coverAlt: z.string().default(''),
      hero: z.string().nullish(),
      heroAlt: z.string().default(''),
      // the finished work, as a carousel above My role (Ed, round 9)
      finals: z.array(z.object({ image: z.string().nullish(), alt: z.string().default(''), caption: z.string().default('') })).default([]),
      metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    })
    .refine((d) => !d.cover || d.coverAlt.trim().length > 0, {
      message: 'coverAlt is required when a cover image is set',
      path: ['coverAlt'],
    })
    .refine((d) => !d.hero || d.heroAlt.trim().length > 0, {
      message: 'heroAlt is required when a hero image is set',
      path: ['heroAlt'],
    }),
});

const workshop = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/workshop' }),
  schema: z
    .object({
      title: z.string().min(1),
      draft: z.boolean().default(true),
      date: z.coerce.date(),
      status: z.enum(['in-progress', 'shipped', 'experiment']),
      blurb: z.string().min(1),
      overview: z.string().default(''),
      role: z.string().default(''),
      timeline: z.string().default(''),
      skills: z.array(z.string().min(1)).default([]),
      image: z.string().nullish(),
      imageAlt: z.string().default(''),
      link: z.string().url().nullish(),
      linkLabel: z.string().default(''),
    })
    .refine((d) => !d.image || d.imageAlt.trim().length > 0, {
      message: 'imageAlt is required when an image is set',
      path: ['imageAlt'],
    }),
});

export const collections = { caseStudies, workshop };
