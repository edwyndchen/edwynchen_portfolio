type Sortable = { id: string; data: { order: number; title: string } };

export function sortCaseStudies<T extends Sortable>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

export function neighbours<T extends { id: string }>(sorted: T[], id: string): { prev: T; next: T } {
  const i = sorted.findIndex((x) => x.id === id);
  const n = sorted.length;
  return { prev: sorted[(i - 1 + n) % n], next: sorted[(i + 1) % n] };
}
