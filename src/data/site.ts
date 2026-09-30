/**
 * Site-wide metadata and the per-page title/description registry.
 *
 * Page descriptions fall back to the organisation's positioning line until
 * page-specific copy is supplied in the Website Content document.
 */
export const site = {
  name: 'Impact Axis Foundation',
  positioning: 'Building the bridge from education to meaningful work.',
  locale: 'en-GB',
} as const;

export interface PageMeta {
  /** Page title without the site name suffix. Omit for the homepage. */
  title?: string;
  /** Meta description. Defaults to the site positioning line. */
  description?: string;
}

export const pages = {
  home: {},
  about: { title: 'About' },
  ourWork: { title: 'Our Work' },
  workWithUs: { title: 'Work With Us' },
  stories: { title: 'Insights & Stories' },
  reports: { title: 'Reports' },
  contact: { title: 'Contact' },
  notFound: { title: 'Page not found' },
} as const satisfies Record<string, PageMeta>;

export function formatTitle(title?: string): string {
  return title ? `${title} | ${site.name}` : site.name;
}
