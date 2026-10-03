import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseCaseStudy, toMdoc } from '../src/lib/parse-case-study.mjs';

const SOURCE = '/Users/ed/Claude/Cowork/UI UX Design/Portfolio/final';
const OUT = 'src/content/case-studies';
const STUDIES = [
  { slug: 'form-guide-redesign', order: 1, discipline: 'product-design' },
  { slug: 'punters-design-system', order: 2, discipline: 'design-system' },
  { slug: 'eonx-design-system', order: 3, discipline: 'design-system' },
  { slug: 'pay-by-account', order: 4, discipline: 'product-design' },
];

mkdirSync(OUT, { recursive: true });
for (const s of STUDIES) {
  const md = readFileSync(`${SOURCE}/${s.slug}.md`, 'utf8');
  const { data, body } = parseCaseStudy(md, { order: s.order, discipline: s.discipline });
  writeFileSync(`${OUT}/${s.slug}.mdoc`, toMdoc(data, body));
  console.log(`✓ ${s.slug}: ${data.metrics.length} metrics`);
}
