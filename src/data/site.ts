export const site = {
  name: 'Edwyn Chen',
  role: 'Product designer',
  location: 'Melbourne',
  email: 'edchen0203@gmail.com',
  summary: 'Product designer making the world more accessible and beautiful one screen at a time.',
  linkedin: 'https://www.linkedin.com/in/edwynchen/' as string,
  behance: 'https://www.behance.net/edwynchen' as string,
  // Not supplied yet. Components render this link only when non-empty.
  resume: '' as string,
  // the contact page's form posts here (Formspree form ID, e.g. 'xyzabcd' from https://formspree.io/f/xyzabcd).
  // Empty: the form opens the visitor's email app with the message filled in instead.
  formspree: '' as string,
  nav: [
    { label: 'Work', href: '/#work' },
    { label: 'About', href: '/#about' },
    { label: 'Contact', href: '/contact/' },
  ],
  // set apart from the page links, as its own button
  workshop: { label: 'Workshop', href: '/workshop/' },
} as const;
