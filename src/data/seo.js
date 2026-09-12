export const SITE_URL = 'https://arkansaspropertybuyers.com';

const pageLabels = {
  '/avoid-foreclosure': 'Avoid Foreclosure',
  '/compare': 'Compare Selling Options',
  '/contact-us': 'Contact Us',
  '/faq': 'Frequently Asked Questions',
  '/get-a-cash-offer-today': 'Get a Cash Offer',
  '/how-we-buy-houses': 'How We Buy Houses',
  '/making-the-transition-easier': 'Senior Care Resources',
  '/our-company': 'About Arkansas Property Buyers',
  '/probate-help': 'Probate & Inherited Property Help',
  '/sell-my-house-as-is': 'Sell a House As-Is',
  '/sell-your-house': 'Sell Your House',
  '/senior-living-transition': 'Senior Living Transition',
  '/testimonials': 'Reviews',
  '/blog': 'Blog',
};

const serviceDefinitions = {
  '/get-a-cash-offer-today': {
    name: 'Cash Home Buying',
    serviceType: 'Cash Home Buying',
    description: 'Direct cash offers for homes sold as-is, without repairs, clean-outs, showings, or agent commissions.',
  },
  '/sell-my-house-as-is': {
    name: 'As-Is Home Buying',
    serviceType: 'As-Is Home Buying',
    description: 'A direct home sale option for owners who want to sell a property in its current condition without making repairs or completing a clean-out.',
  },
  '/sell-your-house': {
    name: 'Fast Home Sale',
    serviceType: 'Fast Home Sale',
    description: 'A direct home buying option for Arkansas homeowners who need a simpler or faster sale with a flexible closing timeline.',
  },
  '/avoid-foreclosure': {
    name: 'Foreclosure Property Solutions',
    serviceType: 'Foreclosure Property Solutions',
    description: 'Help for homeowners facing foreclosure who want to understand their property-sale options, including a direct as-is sale when appropriate.',
  },
  '/probate-help': {
    name: 'Probate & Inherited Property Help',
    serviceType: 'Probate and Inherited Property Home Sale Help',
    description: 'Help for families and property owners handling probate or inherited real estate who are considering an as-is property sale.',
  },
  '/senior-living-transition': {
    name: 'Senior Living Transition Home Sale Help',
    serviceType: 'Senior Living Transition Home Sale Help',
    description: 'Home sale help for older adults and families navigating a move to senior living or another housing transition.',
  },
};

export function normalizePath(pathname = '/') {
  const clean = pathname.split('?')[0].split('#')[0] || '/';
  if (clean === '/') return '/';
  return clean.replace(/\/+$/, '');
}

function titleCaseSlug(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function cleanPageTitle(title = '') {
  return title
    .replace(/\s*\|\s*Arkansas Property Buyers\s*$/i, '')
    .replace(/\s*—\s*Arkansas Property Buyers\s*$/i, '')
    .trim();
}

export function getBreadcrumbs(pathname, currentLabel = '') {
  const path = normalizePath(pathname);

  if (
    path === '/' ||
    path === '/review' ||
    path.startsWith('/thank-you') ||
    path.startsWith('/preview-homepage')
  ) {
    return [];
  }

  if (path.startsWith('/blog/')) {
    const slug = path.replace('/blog/', '');
    return [
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog/' },
      { name: currentLabel || titleCaseSlug(slug), path: `${path}/` },
    ];
  }

  const cityMatch = path.match(/^\/sell-my-house-fast-(.+)-ar$/);
  if (cityMatch) {
    const cityName = titleCaseSlug(cityMatch[1]);
    return [
      { name: 'Home', path: '/' },
      { name: 'Sell Your House', path: '/sell-your-house/' },
      { name: `Sell My House Fast in ${cityName}, AR`, path: `${path}/` },
    ];
  }

  const label = pageLabels[path] || currentLabel;
  if (!label) return [];

  return [
    { name: 'Home', path: '/' },
    { name: label, path: `${path}/` },
  ];
}

export function getServiceDefinition(pathname) {
  return serviceDefinitions[normalizePath(pathname)] || null;
}

export function getPageType(pathname) {
  const path = normalizePath(pathname);
  if (path === '/our-company') return 'AboutPage';
  if (path === '/contact-us') return 'ContactPage';
  if (path === '/blog') return 'CollectionPage';
  return 'WebPage';
}
