/**
 * Site-wide metadata and the per-page title/description registry.
 *
 * Descriptions are taken verbatim from the introduction copy for each page in
 * the supplied Website Content document. Pages without copy there fall back
 * to the organisation's positioning line.
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
  home: {
    description:
      'Impact Axis is a Cameroon-based nonprofit helping young people build the practical skills, experience and networks they need to access meaningful and dignified work.',
  },
  about: {
    title: 'About',
    description:
      'Impact Axis is a Cameroon-based nonprofit youth workforce development organisation. We help young people build the capabilities, experience and connections they need to navigate the transition from education into meaningful and dignified work.',
  },
  ourWork: {
    title: 'Our Work',
    description:
      'Impact Axis designs and delivers youth workforce development programmes in Cameroon that help young people build practical skills, gain real-world experience and develop the connections needed to navigate a changing world of work.',
  },
  workWithUs: {
    title: 'Work With Us',
    description:
      'Impact Axis partners with funders, employers, education institutions and professionals to expand young people’s access to practical skills, experience, networks and meaningful opportunities in Cameroon.',
  },
  stories: {
    title: 'Insights & Stories',
    description:
      'Explore perspectives, lessons and real stories from our work helping young people in Cameroon build the skills, experience and connections needed to navigate education, work and opportunity.',
  },
  reports: {
    title: 'Reports',
    description:
      'As a nonprofit youth workforce development organisation in Cameroon, Impact Axis is committed to being transparent about our programmes, progress, finances and the outcomes we are working to achieve with young people.',
  },
  // No Contact page copy in the Website Content document yet.
  contact: { title: 'Contact' },
  notFound: { title: 'Page not found' },
} as const satisfies Record<string, PageMeta>;

export function formatTitle(title?: string): string {
  return title ? `${title} | ${site.name}` : site.name;
}
