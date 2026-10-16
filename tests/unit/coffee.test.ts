import GAZE_DATA from '../../src/data/gaze.json';
import { describe, expect, it } from 'vitest';
import { ENERGY, FRAMES, stateFor, frameFor, drained, topped , gazeFor, GAZE_FOLLOW } from '../../src/scripts/coffee';
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

describe('gazeFor (round 12: out of energy, his eyes follow the mouse)', () => {
  it('looks straight out when the pointer is on his eyes', () => expect(gazeFor(GAZE_FOLLOW.near - 1, 0)).toBe(0));
  it('picks the frame whose pupils point closest to the pointer', () => {
    const pick = (dx: number, dy: number) => GAZE_DATA[gazeFor(dx, dy)];
    expect(Math.sign(pick(-400, 0).x)).toBe(-1);
    expect(Math.sign(pick(400, 0).x)).toBe(1);
    expect(Math.sign(pick(0, -400).y)).toBe(-1);
    expect(Math.sign(pick(0, 400).y)).toBe(1);
  });
});
