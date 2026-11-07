import { describe, expect, it } from 'vitest';
import { ENERGY, FRAMES, stateFor, frameFor, drained, topped , irisFor, EYES } from '../../src/scripts/coffee';
import { mailtoFor } from '../../src/scripts/contact-form';

describe('coffee game', () => {
  it('starts on the sleepiest face, so the first thing to do is give Ed a coffee', () => {
    expect(stateFor(ENERGY.start)).toBe('tired');
    expect(frameFor(ENERGY.start)).toBe(0);
  });
  it('has three stages, and the face walks through every frame from empty to full', () => {
    expect([10, 50, 90].map(stateFor)).toEqual(['tired', 'okay', 'buzzing']);
    expect(frameFor(0)).toBe(0);
    expect(frameFor(ENERGY.max)).toBe(FRAMES - 1);
    const seen = new Set(Array.from({ length: 101 }, (_, e) => frameFor(e)));
    expect(seen.size).toBe(FRAMES);
  });
  it('drains over time but never below empty, and tops up but never past full', () => {
    expect(drained(10, 100)).toBe(0);
    expect(drained(50, 2)).toBe(50 - ENERGY.drain * 2);
    expect(topped(95)).toBe(ENERGY.max);
    expect(topped(ENERGY.start)).toBe(ENERGY.start + ENERGY.cup);
  });
});

describe('contact form email fallback', () => {
  it('puts the topic in the subject and the details in the body', () => {
    const url = mailtoFor('ed@example.com', { name: 'Sam', email: 'sam@example.com', phone: '0400 000 000', topic: 'A project', message: 'Hi' });
    expect(url.startsWith('mailto:ed@example.com?subject=A%20project%2C%20from%20Sam')).toBe(true);
    expect(decodeURIComponent(url.split('body=')[1])).toBe('Hi\n\nSam\nsam@example.com\n0400 000 000');
  });
});

describe('irisFor (round 12: out of energy, his eyes follow the mouse, smoothly)', () => {
  it('looks straight out with the pointer on his eyes', () => expect(irisFor(0, 0)).toEqual({ x: 0, y: 0 }));
  it('turns towards the pointer, never past the reach', () => {
    const left = irisFor(-1000, 0), up = irisFor(0, -1000), near = irisFor(EYES.far / 2, 0);
    expect(left.x).toBeCloseTo(-EYES.reach.x); expect(left.y).toBeCloseTo(0);
    expect(up.y).toBeCloseTo(-EYES.reach.y);
    expect(near.x).toBeCloseTo(EYES.reach.x / 2);
  });
});
