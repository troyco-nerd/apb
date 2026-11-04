// Blog authors. Posts match an author by the `author` field in their frontmatter.
// Each author gets a page at /author/{slug}/ and Person structured data.

export const authors = [
  {
    slug: 'randy-thomason',
    name: 'Randy Thomason',
    headline: 'Real Estate Investor, Educator & Entrepreneur',
    jobTitle: 'CEO, Arkansas Property Buyers',
    image: '/images/randy-thomason.jpg',
    shortBio:
      'Randy Thomason is the CEO of Arkansas Property Buyers and the Arkansas Real Estate Investors Association (ArkREIA). With more than 30 years of experience in real estate investing, he has purchased, sold, and managed more than $85 million in real estate and helps Arkansas homeowners facing probate, foreclosure, divorce, and senior care transitions.',
    bio: [
      'Randy Thomason is the CEO of Arkansas Property Buyers and the Arkansas Real Estate Investors Association (ArkREIA). With more than 30 years of experience in real estate investing, Randy has developed a unique set of skills and strategies that have enabled him to successfully purchase, sell, and manage more than $85 million in real estate.',
      'Randy is also a two-time Past President of the Arkansas Landlord Association, adding years of leadership and industry experience to his extensive background in real estate.',
      'At the heart of Randy’s business philosophy is a simple mission: helping people.',
      'Through Arkansas Property Buyers, Randy specializes in creating creative real estate solutions for homeowners facing challenging circumstances. His experience includes working with sellers dealing with probate, foreclosure, divorce, and transitions into senior care communities, including situations involving Medicaid qualification.',
      'In 2015, Randy expanded his mission of helping others by founding ArkREIA, a statewide real estate investment education organization. Through teaching and mentoring, he shares the knowledge, strategies, and real-world experience he has gained over decades in the industry—helping other investors build their skills, create financial opportunities, and change their financial futures.',
      'Outside of real estate, Randy is a devoted father and grandfather. He has six children and three grandchildren and enjoys spending time with his family and traveling internationally to experience different cultures and ways of life.',
      'His philosophy is simple: create win-win solutions, help people through difficult situations, and teach others how to build a better financial future through real estate.',
    ],
    highlights: [
      '30+ years in real estate investing',
      '$85M+ in real estate purchased, sold, and managed',
      'CEO of Arkansas Property Buyers and ArkREIA',
      'Two-time Past President, Arkansas Landlord Association',
    ],
    knowsAbout: [
      'Real estate investing',
      'Selling a house fast in Arkansas',
      'Probate and inherited property',
      'Foreclosure',
      'Divorce and the marital home',
      'Senior care transitions and Medicaid qualification',
      'Landlord and rental property',
    ],
    memberOf: [
      'Arkansas Real Estate Investors Association (ArkREIA)',
      'Arkansas Landlord Association',
    ],
  },
];

// Posts without a matching author fall back to this author.
export const defaultAuthorSlug = 'randy-thomason';

export function getAuthor(nameOrSlug) {
  return (
    authors.find((a) => a.name === nameOrSlug || a.slug === nameOrSlug) ??
    authors.find((a) => a.slug === defaultAuthorSlug)
  );
}

export const authorPath = (author) => `/author/${author.slug}/`;

// Person structured data (JSON-LD) for an author.
export function authorSchema(author, siteUrl, businessId) {
  const url = `${siteUrl}${authorPath(author)}`;
  return {
    '@type': 'Person',
    '@id': `${url}#person`,
    name: author.name,
    url,
    image: `${siteUrl}${author.image}`,
    jobTitle: author.jobTitle,
    description: author.shortBio,
    worksFor: { '@id': businessId },
    knowsAbout: author.knowsAbout,
    memberOf: author.memberOf.map((name) => ({ '@type': 'Organization', name })),
  };
}
