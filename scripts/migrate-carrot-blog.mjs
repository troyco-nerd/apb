#!/usr/bin/env node
/**
 * Carrot Blog Migration Script
 * Scrapes https://www.arkansaspropertybuyers.com/blog/ using Playwright
 * (real Chromium browser) to bypass Carrot's server-request blocking.
 *
 * IMPORTANT: Run this script on your LOCAL machine, not on a remote server.
 *
 * Prerequisites (run once):
 *   npm install
 *   npx playwright install chromium
 *
 * Usage:
 *   npm run migrate:blog:dry    -- inspect only, no files written
 *   npm run migrate:blog:write  -- write markdown + download images
 */

import { chromium } from 'playwright';
import TurndownService from 'turndown';
import fs from 'fs-extra';
import pLimit from 'p-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DRY_RUN = process.argv.includes('--dry-run');
const WRITE   = process.argv.includes('--write');

if (!DRY_RUN && !WRITE) {
  console.error('❌  Pass --dry-run or --write');
  process.exit(1);
}

const BASE_URL    = 'https://www.arkansaspropertybuyers.com';
const BLOG_START  = `${BASE_URL}/blog/`;
const CONTENT_DIR = path.join(ROOT, 'src/content/blog');
const IMAGES_DIR  = path.join(ROOT, 'public/images/blog');
const REPORTS_DIR = path.join(ROOT, 'migration-reports');

const limit = pLimit(1); // sequential — polite scraping
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Turndown: HTML → Markdown
// ---------------------------------------------------------------------------
const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});

turndown.addRule('removeUnwanted', {
  filter: ['script', 'style', 'nav', 'header', 'footer', 'aside', 'form', 'noscript'],
  replacement: () => '',
});

// ---------------------------------------------------------------------------
// Archive: collect all page URLs
// ---------------------------------------------------------------------------
async function collectArchivePages(page) {
  console.log('\n🔍 Scanning blog archive for pagination...');
  const pages = [BLOG_START];

  await page.goto(BLOG_START, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await delay(1500);

  const links = await page.$$eval('a[href]', (els) => els.map((el) => el.href));
  const pageNums = [];
  links.forEach((href) => {
    const m = href.match(/\/blog\/page\/(\d+)\/?$/);
    if (m) pageNums.push(parseInt(m[1], 10));
  });

  const maxPage = pageNums.length ? Math.max(...pageNums) : 1;
  for (let i = 2; i <= maxPage; i++) {
    pages.push(`${BASE_URL}/blog/page/${i}/`);
  }

  console.log(`  Found ${pages.length} archive page(s)`);
  return pages;
}

// ---------------------------------------------------------------------------
// Archive: collect post URLs from one page
// ---------------------------------------------------------------------------
function isPostURL(href) {
  try {
    const url = new URL(href);
    if (url.hostname !== 'www.arkansaspropertybuyers.com') return false;
    const p = url.pathname;
    return (
      p.startsWith('/blog/') &&
      !/\/blog\/(page|category|tag|author)\//i.test(p) &&
      p !== '/blog/' &&
      p.replace(/\/$/, '') !== '/blog'
    );
  } catch {
    return false;
  }
}

async function collectPostURLs(page, archiveURL) {
  await page.goto(archiveURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await delay(1500);

  const links = await page.$$eval('a[href]', (els) => els.map((el) => el.href));
  const urls = [...new Set(links.filter(isPostURL).map((u) => u.replace(/\/?$/, '/')))];
  return urls;
}

// ---------------------------------------------------------------------------
// Post: extract content
// ---------------------------------------------------------------------------
async function extractPost(page, url) {
  const result = {
    url,
    slug: slugFromURL(url),
    title: null,
    pubDate: null,
    author: null,
    description: null,
    featuredImage: null,
    contentImages: [],
    markdown: null,
    warnings: [],
    error: null,
  };

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(1200);

    // Title
    result.title = await page.$eval(
      'h1.entry-title, h1.post-title, article h1, h1',
      (el) => el.textContent?.trim() || null
    ).catch(() => null);

    if (!result.title) {
      result.title = await page.title().then((t) => t.split('|')[0].trim());
    }

    // Date
    const dateMeta = await page.$eval(
      'time.entry-date, time.published, meta[property="article:published_time"]',
      (el) => el.getAttribute('datetime') || el.getAttribute('content') || null
    ).catch(() => null);
    result.pubDate = parseDateStr(dateMeta);

    // Author
    result.author = await page.$eval(
      'span.author a, [rel="author"], .post-author',
      (el) => el.textContent?.trim() || null
    ).catch(() => null);

    // Meta description
    result.description = await page.$eval(
      'meta[name="description"], meta[property="og:description"]',
      (el) => el.getAttribute('content') || null
    ).catch(() => null);

    // Featured image
    result.featuredImage = await page.$eval(
      'meta[property="og:image"]',
      (el) => el.getAttribute('content') || null
    ).catch(() => null);

    // Content
    const REMOVE_SELECTORS = [
      '.sharedaddy', '.jp-relatedposts', '.wpcnt', '.widget',
      '.sidebar', '#sidebar', '.navigation', '.nav-links',
      '[class*="cta"]', '[class*="contact-form"]', '[class*="recent-posts"]',
      'form', '.share-buttons', '.post-tags', '.categories',
      '.author-box', '.breadcrumb', '[class*="subscribe"]',
      '.phone-cta', '#comments', '.comments-area',
    ];

    // Get content HTML, stripping unwanted elements
    const contentHTML = await page.evaluate((selectors) => {
      const article =
        document.querySelector('article .entry-content') ||
        document.querySelector('.entry-content') ||
        document.querySelector('article .post-content') ||
        document.querySelector('article');

      if (!article) return '';

      const clone = article.cloneNode(true);
      selectors.forEach((sel) => {
        clone.querySelectorAll(sel).forEach((el) => el.remove());
      });

      return clone.innerHTML;
    }, REMOVE_SELECTORS);

    if (!contentHTML) {
      result.warnings.push('Could not find article content element');
    }

    result.markdown = turndown.turndown(contentHTML || '').trim();

    if (result.markdown.length < 150) {
      result.warnings.push(
        `Short content (${result.markdown.length} chars) — may have failed to extract`
      );
    }

    // In-content images
    const imgURLs = await page.$$eval(
      'article img, .entry-content img',
      (els) => els.map((el) => el.src || el.getAttribute('data-src')).filter(Boolean)
    ).catch(() => []);
    result.contentImages = [...new Set(imgURLs)];

  } catch (err) {
    result.error = err.message;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slugFromURL(url) {
  return url
    .replace(/https?:\/\/[^/]+/, '')
    .replace(/^\/blog\//, '')
    .replace(/\/$/, '')
    .replace(/\//g, '-') || 'untitled';
}

function parseDateStr(str) {
  if (!str) return null;
  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function buildFrontmatter(post) {
  const lines = ['---'];
  lines.push(`title: ${JSON.stringify(post.title || 'Untitled')}`);
  if (post.description) lines.push(`description: ${JSON.stringify(post.description)}`);
  lines.push(`pubDate: ${post.pubDate || '2024-01-01'}`);
  if (post.author) lines.push(`author: ${JSON.stringify(post.author)}`);
  if (post.featuredImage) lines.push(`featuredImage: ${JSON.stringify(post.featuredImage)}`);
  lines.push(`oldUrl: ${JSON.stringify(post.url)}`);
  lines.push(`draft: false`);
  lines.push('---');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Write mode: download image
// ---------------------------------------------------------------------------
async function downloadImage(imgURL, destDir) {
  try {
    const filename = path.basename(new URL(imgURL).pathname);
    const dest = path.join(destDir, filename);
    if (await fs.pathExists(dest)) return filename;
    const res = await fetch(imgURL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await fs.outputFile(dest, Buffer.from(await res.arrayBuffer()));
    return filename;
  } catch (err) {
    console.warn(`    ⚠ Image download failed: ${imgURL} — ${err.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  await fs.ensureDir(REPORTS_DIR);

  console.log(`\n🚀 Arkansas Property Buyers Blog Migration`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN (no files written)' : 'WRITE'}`);
  console.log(`   Source: ${BLOG_START}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  try {
    // 1. Archive pages
    const archivePages = await collectArchivePages(page);

    // 2. Post URLs
    console.log('\n🔍 Collecting post URLs...');
    const allPostURLs = new Set();
    for (const archivePage of archivePages) {
      console.log(`  Scanning: ${archivePage}`);
      const urls = await collectPostURLs(page, archivePage);
      console.log(`    → ${urls.length} post(s)`);
      urls.forEach((u) => allPostURLs.add(u));
    }

    const postURLs = [...allPostURLs];
    console.log(`\n  Total unique post URLs: ${postURLs.length}`);

    // 3. Extract each post
    console.log('\n📄 Extracting post content...');
    const posts = [];
    const failed = [];

    for (const url of postURLs) {
      process.stdout.write(`  → ${url} ... `);
      const post = await extractPost(page, url);
      if (post.error) {
        console.log(`✖ ${post.error}`);
        failed.push({ url, error: post.error });
      } else {
        console.log(`✔ "${post.title}" (${post.markdown?.length || 0} chars)`);
        posts.push(post);
      }
    }

    // 4. Detect duplicates & short posts
    const slugCounts = {};
    posts.forEach((p) => { slugCounts[p.slug] = (slugCounts[p.slug] || 0) + 1; });
    const duplicateSlugs = Object.entries(slugCounts)
      .filter(([, c]) => c > 1).map(([s]) => s);
    const shortPosts = posts.filter((p) => (p.markdown?.length || 0) < 150);

    // 5. Report
    const report = {
      mode: DRY_RUN ? 'dry-run' : 'write',
      timestamp: new Date().toISOString(),
      totalArchivePages: archivePages.length,
      totalPostsFound: postURLs.length,
      totalExtracted: posts.length,
      totalFailed: failed.length,
      duplicateSlugs,
      suspiciouslyShortPosts: shortPosts.map((p) => ({
        slug: p.slug, url: p.url, chars: p.markdown?.length,
      })),
      posts: posts.map((p) => ({
        url: p.url,
        slug: p.slug,
        title: p.title,
        pubDate: p.pubDate,
        author: p.author,
        featuredImage: !!p.featuredImage,
        contentImages: p.contentImages.length,
        contentChars: p.markdown?.length || 0,
        warnings: p.warnings,
      })),
      failed,
    };

    const reportPath = path.join(
      REPORTS_DIR,
      DRY_RUN ? 'carrot-blog-dry-run.json' : 'carrot-blog-write-report.json'
    );
    await fs.writeJSON(reportPath, report, { spaces: 2 });
    console.log(`\n📊 Report saved: ${reportPath}`);

    // ── DRY RUN ENDS HERE ───────────────────────────────────────────────────
    if (DRY_RUN) {
      console.log('\n✅ Dry run complete. Review the report, then run --write.');
      console.log(`   Posts found:         ${posts.length}`);
      console.log(`   Duplicate slugs:     ${duplicateSlugs.length}`);
      console.log(`   Short/suspect posts: ${shortPosts.length}`);
      console.log(`   Failed:              ${failed.length}`);
      return;
    }

    // ── WRITE MODE ──────────────────────────────────────────────────────────
    await fs.ensureDir(CONTENT_DIR);
    console.log(`\n✍  Writing posts to ${CONTENT_DIR}...`);
    let written = 0, skipped = 0;

    for (const post of posts) {
      const slug = post.slug;
      const postImagesDir = path.join(IMAGES_DIR, slug);
      let markdown = post.markdown || '';

      // Download featured image
      let localFeaturedImage = post.featuredImage;
      if (post.featuredImage) {
        await fs.ensureDir(postImagesDir);
        const filename = await downloadImage(post.featuredImage, postImagesDir);
        if (filename) localFeaturedImage = `/images/blog/${slug}/${filename}`;
      }

      // Download and rewrite in-content images
      for (const imgURL of post.contentImages) {
        await fs.ensureDir(postImagesDir);
        const filename = await downloadImage(imgURL, postImagesDir);
        if (filename) {
          markdown = markdown.split(imgURL).join(`/images/blog/${slug}/${filename}`);
        }
      }

      post.featuredImage = localFeaturedImage;
      const fileContent = `${buildFrontmatter(post)}\n\n${markdown}\n`;
      const filePath = path.join(CONTENT_DIR, `${slug}.md`);

      if (await fs.pathExists(filePath)) {
        console.log(`  ⏭  Skipping (exists): ${slug}.md`);
        skipped++;
      } else {
        await fs.outputFile(filePath, fileContent);
        console.log(`  ✔ Written: ${slug}.md`);
        written++;
      }
    }

    report.written = written;
    report.skipped = skipped;
    await fs.writeJSON(reportPath, report, { spaces: 2 });

    console.log(`\n✅ Write complete.`);
    console.log(`   Written: ${written} | Skipped: ${skipped} | Failed: ${failed.length}`);

  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
