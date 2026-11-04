import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string().max(60).optional(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    // Set when a post's content is meaningfully revised (not for link or title tweaks).
    updatedDate: z.coerce.date().optional(),
    author: z.string().optional(),
    featuredImage: z.string().optional(),
    oldUrl: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };
