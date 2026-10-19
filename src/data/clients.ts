/**
 * The brands in the social-proof window (Clients.astro), one per pane, left to right (Ed, rounds 11 and 12: six panes,
 * six brands). Drop a logo file in public/logos/ and set `logo` to its path (already cobalt: see
 * art/round11/logos/build.mjs, which makes them); until then the name shows as a plain wordmark.
 * Punters, Racenet and Mastercard are Ed's own files (round 12).
 */
export interface Client { name: string; logo?: string }

export const clients: Client[] = [
  { name: 'Mastercard', logo: '/logos/mastercard.webp' },
  { name: 'Crown', logo: '/logos/crown.webp' },
  { name: 'EonX', logo: '/logos/eonx.webp' },
  { name: 'New Aim', logo: '/logos/newaim.webp' },
  { name: 'Punters', logo: '/logos/punters.webp' },
  { name: 'Racenet', logo: '/logos/racenet.webp' },
];
