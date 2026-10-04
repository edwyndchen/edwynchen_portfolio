/**
 * The visitor's Pause motion switch (WCAG 2.2.2): one class on <html> (set before first paint by an inline script
 * in BaseLayout, from localStorage) and a 'motion:change' event. Every endless animation registers here, so the nav
 * button stops and starts them all. Things the visitor drives (scrolling, the costume change) are not affected.
 */
export const MOTION_KEY = 'motion';

export const isMotionPaused = () => document.documentElement.classList.contains('motion-paused');

export function setMotionPaused(paused: boolean): void {
  document.documentElement.classList.toggle('motion-paused', paused);
  try { localStorage.setItem(MOTION_KEY, paused ? 'paused' : 'playing'); } catch { /* private mode: this page only */ }
  window.dispatchEvent(new Event('motion:change'));
}

/** Runs start() or stop() now and whenever the switch flips. Returns the unsubscribe. */
export function whilePlaying(start: () => void, stop: () => void): () => void {
  const apply = () => (isMotionPaused() ? stop() : start());
  apply();
  window.addEventListener('motion:change', apply);
  return () => window.removeEventListener('motion:change', apply);
}
