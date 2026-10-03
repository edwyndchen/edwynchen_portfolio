import { describe, expect, test } from 'vitest';
import { parseCaseStudy, toMdoc } from '../../src/lib/parse-case-study.mjs';

const sample = `# Form Guide Redesign

_Portfolio-ready rewrite. Editor note to drop._

**Dek:** Rebuilding the data tables punters use.

## At a glance

**Role:** Product designer (UI lead)
**Timeline:** Aug 2023 – Oct 2024
**Team:** 2 designers, devs, PM
**Platforms:** Web, iOS, Android
**Outcome:** Bounce rate down 52%, time on page up 79%

## Overview

I rebuilt the most-visited pages.

## Outcomes

Within a year of launch:

- Bounce rate down **52%** year on year
- **3.5/5** satisfaction from 500+ users surveyed
- Passed WAVE accessibility checks

## Process

Body text.
`;

describe('parseCaseStudy', () => {
  const { data, body } = parseCaseStudy(sample, { order: 1, discipline: 'product-design' });

  test('reads title and dek', () => {
    expect(data.title).toBe('Form Guide Redesign');
    expect(data.dek).toBe('Rebuilding the data tables punters use.');
  });

  test('reads at-a-glance fields, leaving missing ones empty', () => {
    expect(data.role).toBe('Product designer (UI lead)');
    expect(data.timeline).toBe('Aug 2023 – Oct 2024');
    expect(data.team).toBe('2 designers, devs, PM');
    expect(data.platforms).toBe('Web, iOS, Android');
    expect(data.context).toBe('');
    expect(data.outcome).toBe('Bounce rate down 52%, time on page up 79%');
  });

  test('extracts metrics only from bold outcome bullets', () => {
    expect(data.metrics).toEqual([
      { value: '52%', label: 'Bounce rate down year on year' },
      { value: '3.5/5', label: 'Satisfaction from 500+ users surveyed' },
    ]);
  });

  test('skips metrics with bold spans exceeding 12 characters', () => {
    const md = `# Test
## Outcomes
- **Prototyping productivity up 500%.** Pre-prototyped components...
`;
    const { data: testData } = parseCaseStudy(md, { order: 1, discipline: 'product-design' });
    expect(testData.metrics).toEqual([]);
  });

  test('skips metrics with bold spans without digits', () => {
    const md = `# Test
## Outcomes
- **Full WCAG AA compliance** across the colour system
`;
    const { data: testData } = parseCaseStudy(md, { order: 1, discipline: 'product-design' });
    expect(testData.metrics).toEqual([]);
  });

  test('accepts metrics with 12 chars or fewer and at least one digit', () => {
    const md = `# Test
## Outcomes
- **52% faster** delivery times
- **3.5/5** satisfaction
`;
    const { data: testData } = parseCaseStudy(md, { order: 1, discipline: 'product-design' });
    expect(testData.metrics).toEqual([
      { value: '52% faster', label: 'Delivery times' },
      { value: '3.5/5', label: 'Satisfaction' },
    ]);
  });

  test('passes meta through and leaves cover empty', () => {
    expect(data.order).toBe(1);
    expect(data.discipline).toBe('product-design');
    expect(data.cover).toBe('');
    expect(data.coverAlt).toBe('');
  });

  test('body starts at Overview and drops the editor note', () => {
    expect(body.startsWith('## Overview')).toBe(true);
    expect(body).not.toContain('Editor note');
    expect(body).toContain('## Process');
  });
});

describe('toMdoc', () => {
  test('writes YAML frontmatter then body', () => {
    const out = toMdoc(
      { title: 'A "quoted" title', order: 2, metrics: [{ value: '30%', label: 'Faster' }] },
      '## Overview\n\nHi',
    );
    expect(out).toBe(
      '---\ntitle: "A \\"quoted\\" title"\norder: 2\nmetrics:\n  - value: "30%"\n    label: "Faster"\n---\n\n## Overview\n\nHi\n',
    );
  });

  test('writes empty metrics array as metrics: []', () => {
    const out = toMdoc(
      { title: 'T', metrics: [] },
      'body',
    );
    expect(out).toContain('metrics: []');
  });
});
