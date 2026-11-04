// Topic clusters for internal linking on blog posts.
// Each cluster has a service ("money") page and an ordered list of posts.
// The first post in each list is the cluster's pillar (its most complete guide).
// The blog post template uses this to show a "Related Articles" block and a
// cluster-specific call to action, so every post links to (and is linked from)
// other posts on the same topic.

export const blogClusters = [
  {
    id: 'sell-fast',
    label: 'Selling Your House Fast',
    cta: {
      lead: 'Need to sell on a tight timeline?',
      text: 'Sell your house fast in Arkansas, as-is and on your schedule',
      href: '/sell-your-house/',
    },
    posts: [
      'need-to-sell-a-house-quickly-in-arkansas-here-are-your-options',
      'tips-to-sell-a-house-fast-in-arkansas',
      'how-fast-will-my-house-sell-in-the-arkansas-market',
      'how-to-sell-a-house-quickly-in-arkansas-with-arkansas-property-buyers',
      'we-buy-houses-for-cash-in-arkansas-what-sellers-should-expect',
      'cash-buyers-in-arkansas-why-homeowners-choose-quick-reliable-sales',
      'why-cash-offers-are-better-for-arkansas-home-sellers',
      'should-i-accept-a-cash-offer-for-my-house-in-arkansas',
      'pros-and-cons-of-a-cash-offer-on-a-house-in-arkansas-explained',
    ],
  },
  {
    id: 'as-is',
    label: 'Selling a House As-Is',
    cta: {
      lead: 'House needs work you don’t want to do?',
      text: 'Sell your house as-is in Arkansas, with no repairs',
      href: '/sell-my-house-as-is/',
    },
    posts: [
      'sell-my-ugly-house-in-arkansas-without-repairs',
      'sell-a-vacant-or-abandoned-home-in-little-rock',
      'sell-an-unwanted-house-in-little-rock',
      'design-elements-that-can-make-it-difficult-to-sell-your-house-little-rock',
      'how-to-ready-your-house-for-sale-in-arkansas',
    ],
  },
  {
    id: 'foreclosure',
    label: 'Foreclosure',
    cta: {
      lead: 'Behind on mortgage payments?',
      text: 'See your options to avoid foreclosure in Arkansas',
      href: '/avoid-foreclosure/',
    },
    posts: [
      'foreclosures-in-arkansas-what-homeowners-should-know',
      'how-can-i-save-my-home-from-foreclosure-in-arkansas',
      'sell-my-house-fast-before-foreclosure-in-arkansas',
      'how-to-see-if-there-is-a-lien-on-property-in-arkansas',
    ],
  },
  {
    id: 'probate',
    label: 'Probate & Inherited Property',
    cta: {
      lead: 'Handling an inherited house?',
      text: 'Get help selling a probate or inherited house in Arkansas',
      href: '/probate-help/',
    },
    posts: [
      'probate-sale-in-arkansas-what-families-need-to-know-about-selling-property',
      'arkansas-probate-timeline-what-homeowners-should-expect',
      'how-the-arkansas-probate-court-impacts-the-sale-of-property',
      'probate-court-in-little-rock-arkansas-and-how-it-affects-real-estate-sales',
      'arkansas-intestate-probate-what-happens-when-there-is-no-will',
      'navigating-probate-in-arkansas-without-a-will-and-options-for-selling-property',
      'transfer-of-property-after-death-without-a-will-in-arkansas',
      'what-happens-to-a-house-when-the-owner-dies-in-arkansas',
      'how-long-do-you-have-to-transfer-property-after-death-in-arkansas',
      'how-long-does-an-heir-have-to-claim-their-inheritance-in-arkansas',
      'capital-gains-on-inherited-property-in-arkansas-what-sellers-need-to-know',
      'who-pays-capital-gains-tax-on-a-deceased-estate-in-arkansas',
    ],
  },
  {
    id: 'trusts',
    label: 'Trusts & Estate Property',
    cta: {
      lead: 'Selling a house held in a trust or estate?',
      text: 'Get help with inherited and estate property',
      href: '/probate-help/',
    },
    posts: [
      'how-to-put-property-in-a-trust-in-arkansas-step-by-step',
      'who-owns-the-property-in-a-revocable-trust-in-arkansas',
      'can-you-take-a-property-out-of-a-trust-in-arkansas',
      'how-long-can-a-beneficiary-live-in-a-trust-property-in-arkansas',
    ],
  },
  {
    id: 'divorce',
    label: 'Divorce & the Family Home',
    cta: {
      lead: 'Need to sell the house during a divorce?',
      text: 'Get a fast, simple sale of the marital home on a timeline that works for both of you',
      href: '/sell-your-house/',
    },
    posts: [
      'selling-a-house-during-divorce-in-arkansas',
      'divorce-and-selling-a-house-in-arkansas-what-to-expect',
      'sell-house-before-or-after-divorce-in-arkansas',
      'uncontested-divorce-in-arkansas-and-selling-the-marital-home',
      'divorce-in-arkansas-and-marital-property-rules',
      'assuming-a-mortgage-in-a-divorce-in-arkansas',
      'how-to-get-a-divorce-in-arkansas-and-handle-property',
      'how-to-file-for-divorce-in-arkansas-without-a-lawyer',
      'how-to-get-a-free-divorce-in-arkansas',
    ],
  },
  {
    id: 'landlord',
    label: 'Landlords & Rental Property',
    cta: {
      lead: 'Tired of being a landlord?',
      text: 'Sell your rental property as-is, even with tenants in place',
      href: '/sell-my-house-as-is/',
    },
    posts: [
      'landlord-selling-property-in-arkansas-what-to-know',
      'eviction-notice-rules-in-arkansas-explained',
      'how-to-get-tenants-out-of-a-property-in-arkansas',
      'can-i-get-a-tenant-to-leave-voluntarily-in-arkansas',
      'what-a-landlord-cannot-do-in-arkansas-under-state-law',
      'little-rock-arkansas-rent-trends-and-what-they-mean-for-owners',
    ],
  },
  {
    id: 'costs',
    label: 'Selling Costs & Process',
    cta: {
      lead: 'Weighing your selling options?',
      text: 'Compare a cash offer vs. listing with an agent',
      href: '/compare/',
    },
    posts: [
      'the-cheapest-way-to-sell-a-house-in-arkansas',
      'closing-costs-for-sellers-in-arkansas-what-youll-actually-pay',
      'average-closing-costs-for-sellers-in-arkansas-explained',
      'steps-in-selling-a-home-in-arkansas-explained',
      'free-paperwork-for-selling-a-house-by-owner-what-arkansas-sellers-need',
      'how-can-i-sell-my-house-online-for-free-in-arkansas',
      'how-soon-can-you-sell-a-house-after-buying-it-in-arkansas',
      'arkansas-property-tax-basics-for-homeowners-considering-a-sale',
      'understanding-arkansas-personal-property-tax-before-selling-your-home',
    ],
  },
];

// Number of related posts to show (in addition to the cluster pillar).
const NEIGHBORS = 3;

export function getClusterForPost(slug) {
  return blogClusters.find((cluster) => cluster.posts.includes(slug));
}

// Returns the slugs to show as related articles for a post:
// the cluster pillar (unless this post is the pillar), then the next posts
// in the cluster list, wrapping around. Rotating through the list this way
// guarantees every post in a cluster gets links from its siblings.
export function getRelatedSlugs(slug) {
  const cluster = getClusterForPost(slug);
  if (!cluster) return [];
  const { posts } = cluster;
  const pillar = posts[0];
  const index = posts.indexOf(slug);
  const related = [];
  if (slug !== pillar) related.push(pillar);
  for (let step = 1; step < posts.length && related.length < NEIGHBORS + 1; step++) {
    const candidate = posts[(index + step) % posts.length];
    if (candidate !== slug && !related.includes(candidate)) related.push(candidate);
  }
  return related;
}
