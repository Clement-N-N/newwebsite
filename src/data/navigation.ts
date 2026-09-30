export interface NavItem {
  label: string;
  href: string;
}

export const primaryNav: readonly NavItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Our Work', href: '/our-work' },
  { label: 'Work With Us', href: '/work-with-us' },
  { label: 'Insights & Stories', href: '/stories' },
  { label: 'Reports', href: '/reports' },
];

export const partnerCta: NavItem = {
  label: 'Partner with us',
  href: '/work-with-us',
};

/**
 * Width at which the header switches from the menu button to inline links.
 * Keep in sync with the `75rem` media queries in tokens.css and Header.astro
 * (CSS custom properties cannot be used inside media queries).
 */
export const DESKTOP_NAV_QUERY = '(min-width: 75rem)';

function normalise(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

/** `page` for an exact match, `true` for a descendant route, otherwise undefined. */
export function currentState(href: string, pathname: string): 'page' | 'true' | undefined {
  const here = normalise(pathname);
  const target = normalise(href);
  if (here === target) return 'page';
  if (target !== '/' && here.startsWith(`${target}/`)) return 'true';
  return undefined;
}
