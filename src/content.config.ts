import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    author: z.string().optional(),
    featuredImage: z.string().optional(),
    oldUrl: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };
