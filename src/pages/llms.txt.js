// Generates /llms.txt (https://llmstxt.org): a plain-text summary of the site
// for AI assistants such as ChatGPT, Claude, Gemini, and Perplexity.
// Built from the same data as the site, so new posts and cities appear
// automatically. Keep the business facts here in line with the site copy.
import { getCollection } from 'astro:content';
import { SITE_URL } from '../data/seo.js';
import { cities } from '../data/cities.js';
import { blogClusters } from '../data/blogClusters.js';

const url = (path) => `${SITE_URL}${path}`;

const services = [
  ['/sell-your-house/', 'Sell Your House Fast in Arkansas', 'Direct cash home sale for Arkansas homeowners who need a faster, simpler sale with a flexible closing date.'],
  ['/get-a-cash-offer-today/', 'Get a Cash Offer', 'Request a fair, no-obligation cash offer for an Arkansas house in any condition.'],
  ['/sell-my-house-as-is/', 'Sell a House As-Is', 'Sell a property in its current condition, with no repairs, clean-out, or showings.'],
  ['/avoid-foreclosure/', 'Avoid Foreclosure', 'Options for Arkansas homeowners facing foreclosure, including a direct as-is sale.'],
  ['/probate-help/', 'Probate & Inherited Property Help', 'Help for families selling probate, estate, or inherited real estate in Arkansas.'],
  ['/senior-living-transition/', 'Senior Living Transition', 'Home sale help for older adults and families moving to senior living.'],
  ['/compare/', 'Compare Selling Options', 'A cash sale compared with listing with a real estate agent: speed, costs, and hassle.'],
  ['/how-we-buy-houses/', 'How We Buy Houses', 'The step-by-step process for selling a house to Arkansas Property Buyers.'],
];

const company = [
  ['/our-company/', 'About Arkansas Property Buyers', 'The family-owned team behind the company.'],
  ['/testimonials/', 'Reviews', 'Reviews from Arkansas homeowners who sold to us.'],
  ['/faq/', 'Frequently Asked Questions', 'Pricing, fees, timelines, and how a cash buyer differs from an agent.'],
  ['/contact-us/', 'Contact Us', 'Phone (501) 504-7109, or send a message.'],
];

const line = ([path, name, desc]) => `- [${name}](${url(path)}): ${desc}`;

export async function GET() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const bySlug = new Map(posts.map((post) => [post.id, post]));
  const postLine = (slug) => {
    const post = bySlug.get(slug);
    if (!post) return null;
    return `- [${post.data.title}](${url(`/blog/${slug}/`)})${post.data.description ? `: ${post.data.description}` : ''}`;
  };

  const pillars = blogClusters.map((cluster) => postLine(cluster.posts[0])).filter(Boolean);
  const otherPosts = blogClusters
    .flatMap((cluster) => cluster.posts.slice(1))
    .map(postLine)
    .filter(Boolean);
  // Any post not yet assigned to a cluster still gets listed.
  const clustered = new Set(blogClusters.flatMap((cluster) => cluster.posts));
  for (const post of posts) {
    if (!clustered.has(post.id)) otherPosts.push(postLine(post.id));
  }

  const body = [
    '# Arkansas Property Buyers',
    '',
    '> Arkansas Property Buyers is a family-owned cash home buyer based in Little Rock, Arkansas, serving Little Rock and Central Arkansas for over 30 years. We buy houses as-is, with no repairs, clean-outs, showings, or agent commissions, and close on the seller\'s timeline.',
    '',
    'Homeowners use us when they need to sell a house fast in Arkansas, including houses facing foreclosure, inherited or probate property, divorce, rental property with tenants, vacant homes, and homes that need major repairs. Offers are free and carry no obligation. Phone: (501) 504-7109.',
    '',
    `Homepage (sell your house fast in Little Rock): ${url('/')}`,
    '',
    '## Services',
    '',
    ...services.map(line),
    '',
    '## Areas We Serve',
    '',
    `- [Little Rock, AR](${url('/')}): Our home base; we buy houses throughout Little Rock and Pulaski County.`,
    ...cities.map((city) => `- [${city.name}, AR](${url(`/sell-my-house-fast-${city.slug}-ar/`)}): Sell your house fast in ${city.name}, ${city.county}.`),
    '',
    '## Key Guides',
    '',
    ...pillars,
    '',
    '## Company',
    '',
    ...company.map(line),
    '',
    '## Optional',
    '',
    ...otherPosts,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
