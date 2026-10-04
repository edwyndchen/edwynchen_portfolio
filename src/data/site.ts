export const site = {
  name: 'Edwyn Chen',
  role: 'Product designer',
  location: 'Melbourne',
  email: 'edchen0203@gmail.com',
  // Not supplied yet. Components render these links only when non-empty.
  linkedin: '' as string,
  resume: '' as string,
  nav: [
    { label: 'Work', href: '/#work' },
    { label: 'About', href: '/#about' },
    { label: 'Workshop', href: '/workshop/' },
    { label: 'Contact', href: '/#contact' },
  ],
} as const;
