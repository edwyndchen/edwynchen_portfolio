import { describe, expect, test } from 'vitest';
import { neighbours, sortCaseStudies } from '../../src/lib/case-studies';

const e = (id: string, order: number, title = id) => ({ id, data: { order, title } });

describe('sortCaseStudies', () => {
  test('sorts by order, then title', () => {
    const sorted = sortCaseStudies([e('c', 2), e('b', 1, 'Zed'), e('a', 1, 'Alpha')]);
    expect(sorted.map((x) => x.id)).toEqual(['a', 'b', 'c']);
  });
  test('does not mutate input', () => {
    const input = [e('b', 2), e('a', 1)];
    sortCaseStudies(input);
    expect(input[0].id).toBe('b');
  });
});

describe('neighbours', () => {
  const list = [e('a', 1), e('b', 2), e('c', 3)];
  test('middle item', () => {
    const { prev, next } = neighbours(list, 'b');
    expect([prev.id, next.id]).toEqual(['a', 'c']);
  });
  test('wraps at both ends', () => {
    expect(neighbours(list, 'a').prev.id).toBe('c');
    expect(neighbours(list, 'c').next.id).toBe('a');
  });
});
