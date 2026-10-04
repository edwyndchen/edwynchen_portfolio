export const site = {
  name: 'Edwyn Chen',
  role: 'Product designer',
  location: 'Melbourne',
  email: 'edchen0203@gmail.com',
  summary: 'Product designer with a passion for accessibility and design systems.',
  // Not supplied yet. Components render these links only when non-empty.
  linkedin: '' as string,
  behance: '' as string,
  resume: '' as string,
  nav: [
    { label: 'Work', href: '/#work' },
    { label: 'About', href: '/#about' },
    { label: 'Contact', href: '/#contact' },
  ],
  // set apart from the page links, as its own button
  workshop: { label: 'Workshop', href: '/workshop/' },
} as const;
