import { describe, it, expect } from 'vitest';
import { publishedWorkshop, skillsOf, skillKey, hasWriteup } from '../../src/lib/workshop';

const e = (id: string, date: string, draft: boolean, skills: string[], body = '') => ({ id, body, data: { title: id, date: new Date(date), draft, skills } });
const entries = [e('a', '2026-01-01', false, ['React', 'Figma']), e('b', '2026-06-01', true, ['react', 'GSAP'], 'Write-up'), e('c', '2026-03-01', false, ['Figma'])];

describe('workshop', () => {
  it('hides drafts on the live site, shows them in dev, newest first', () => {
    expect(publishedWorkshop(entries, false).map((x) => x.id)).toEqual(['c', 'a']);
    expect(publishedWorkshop(entries, true).map((x) => x.id)).toEqual(['b', 'c', 'a']);
  });
  it('lists skills most used first, merging case, keeping the first spelling', () => {
    expect(skillsOf(entries)).toEqual(['Figma', 'React', 'GSAP']);
  });
  it('makes filter keys from skill names', () => {
    expect(skillKey(' Design systems ')).toBe('design-systems');
    expect(skillKey('C#/.NET')).toBe('c-net');
  });
  it('gives an entry its own page only when it has a write-up', () => {
    expect(hasWriteup(entries[0])).toBe(false);
    expect(hasWriteup(entries[1])).toBe(true);
    expect(hasWriteup({ body: '  \n ' })).toBe(false);
  });
});
