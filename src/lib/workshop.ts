export type WorkshopStatus = 'in-progress' | 'shipped' | 'experiment';

// in the workshop's own words: a piece is on the easel, fired (finished and out in the world), or a sketch
export const STATUS_LABEL: Record<WorkshopStatus, string> = {
  'in-progress': 'On the easel',
  shipped: 'Fired',
  experiment: 'Sketch',
};

type Entry = { id: string; body?: string; data: { title: string; date: Date; draft: boolean; skills: string[] } };

/** What the Workshop shows: drafts only in dev, newest first. */
export function publishedWorkshop<T extends Entry>(entries: T[], dev: boolean): T[] {
  return entries
    .filter((e) => dev || !e.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.data.title.localeCompare(b.data.title));
}

/** Every skill across the entries, most used first, then A to Z. Matching ignores case; the first spelling wins. */
export function skillsOf(entries: Entry[]): string[] {
  const seen = new Map<string, { name: string; n: number }>();
  for (const e of entries)
    for (const s of e.data.skills) {
      const k = s.trim().toLowerCase();
      if (!k) continue;
      const hit = seen.get(k);
      if (hit) hit.n++;
      else seen.set(k, { name: s.trim(), n: 1 });
    }
  return [...seen.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name)).map((s) => s.name);
}

/** A stable key for filtering by skill (lowercase, hyphenated). */
export const skillKey = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** An entry gets its own page only when it has a write-up. */
export const hasWriteup = (e: { body?: string }) => Boolean(e.body?.trim());
