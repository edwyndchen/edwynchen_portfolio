/**
 * The brands in the social-proof window (Clients.astro), one per pane, left to right (Ed, rounds 11 and 12: six panes,
 * six brands). Drop a logo file in public/logos/ and set `logo` to its path (already cobalt: see
 * art/round11/logos/build.mjs, which makes them); until then the name shows as a plain wordmark. Punters and Racenet
 * still need files from Ed (their sites can't be fetched).
 */
export interface Client { name: string; logo?: string }

export const clients: Client[] = [
  { name: 'Punters' },
  { name: 'Racenet' },
  { name: 'EonX', logo: '/logos/eonx.webp' },
  { name: 'Mastercard', logo: '/logos/mastercard.webp' },
  { name: 'Crown', logo: '/logos/crown.webp' },
  { name: 'New Aim', logo: '/logos/newaim.webp' },
];
