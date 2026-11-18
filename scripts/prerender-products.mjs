#!/usr/bin/env node
/**
 * Product-page prerendering for SEO / AEO.
 *
 * The app is a Vite SPA, so without this step a crawler that does not execute
 * JavaScript only ever sees the generic homepage shell: no product title, no
 * price and — critically — no rating or reviews. This script runs after
 * `vite build` and writes a static HTML file for every product at
 * `dist/product/<id>/index.html`. Vercel serves real files before rewrites,
 * so those files are delivered to crawlers and shoppers at `/product/<id>`,
 * while the SPA still mounts and takes over in the browser.
 *
 * Each generated page contains:
 *   - product-specific <title>, meta description, Open Graph, canonical URL
 *   - Product JSON-LD with AggregateRating + Review (managed, so the React
 *     hook replaces it with live values once the app loads)
 *   - visible, crawlable rating/review text inside #root
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST_DIR = join(ROOT, 'dist');

/** Load the same env files the build uses (no dotenv dependency needed). */
export function loadEnv() {
  const vars = {};
  for (const name of ['.env', '.env.local', '.env.production']) {
    const path = join(ROOT, name);
    if (!existsSync(path)) continue;
    try {
      for (const line of readFileSync(path, 'utf8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        vars[key] = value;
      }
    } catch (error) {
      console.warn(`[prerender] Could not read ${name}: ${error.message}`);
    }
  }
  return vars;
}

export const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);

/** JSON that is safe to drop inside a <script type="application/ld+json">. */
export const escapeJsonForScript = (value) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Replace an existing <meta> tag (by name/property) or append it to <head>. */
export function setMetaTag(html, attribute, key, content) {
  const tag = `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(
    `<meta\\s+[^>]*\\b${attribute}=["']${escapeRegExp(key)}["'][^>]*\\/?>`,
    'gi'
  );
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

export function setTitle(html, title) {
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  }
  return html.replace('</head>', `    <title>${escapeHtml(title)}</title>\n  </head>`);
}

/** Replace canonical + hreflang links so prerendered pages never point home. */
export function setCanonical(html, url) {
  const safe = escapeHtml(url);
  let next = html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/gi, '');
  next = next.replace(
    /<link\s+[^>]*rel=["']alternate["'][^>]*hreflang=["'][^"']*["'][^>]*\/?>\s*/gi,
    ''
  );
  const links = [
    `    <link rel="canonical" href="${safe}" />`,
    `    <link rel="alternate" hreflang="en-NG" href="${safe}" />`,
    `    <link rel="alternate" hreflang="en" href="${safe}" />`,
    `    <link rel="alternate" hreflang="x-default" href="${safe}" />`,
  ].join('\n');
  return next.replace('</head>', `${links}\n  </head>`);
}

/** Build the schema.org Product node, including the rating signals. */
export function buildProductSchema(product, reviews, siteUrl) {
  const url = `${siteUrl}/product/${encodeURIComponent(product.id)}`;
  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.reviews || 0);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    category: product.category,
    url,
    ...(product.sku ? { sku: product.sku } : {}),
    brand: { '@type': 'Brand', name: product.seller },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'NGN',
      price: Number(product.price),
      availability:
        Number(product.stock) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: product.seller },
    },
  };

  // Both values are required before Google will show stars in the results.
  if (rating > 0 && reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(1),
      reviewCount,
      ratingCount: reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  const written = (reviews || []).filter((review) => String(review.text || '').trim());
  if (written.length > 0) {
    schema.review = written.map((review) => ({
      '@type': 'Review',
      ...(review.created_at ? { datePublished: review.created_at } : {}),
      reviewBody: review.text,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: Number(review.rating),
        bestRating: '5',
        worstRating: '1',
      },
      author: {
        '@type': 'Person',
        name: String(review.name || '').trim() || 'Anonymous customer',
      },
    }));
  }

  return schema;
}

/** Visible product/rating content for crawlers that never run JavaScript. */
export function buildCrawlableContent(product, reviews, siteUrl) {
  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.reviews || 0);
  const price = `₦${Number(product.price || 0).toLocaleString('en-NG')}`;
  const url = `${siteUrl}/product/${encodeURIComponent(product.id)}`;

  const ratingBlock =
    rating > 0 && reviewCount > 0
      ? `<p class="seo-rating" itemscope itemtype="https://schema.org/AggregateRating">
        Rated <strong itemprop="ratingValue">${rating.toFixed(1)}</strong> out of 5 based on
        <span itemprop="reviewCount">${reviewCount}</span> customer rating${reviewCount === 1 ? '' : 's'}.
      </p>`
      : '<p class="seo-rating">No customer ratings yet.</p>';

  const snippets = (reviews || [])
    .filter((review) => String(review.text || '').trim())
    .slice(0, 10)
    .map(
      (review) => `<article class="seo-review">
        <p><strong>${escapeHtml(review.name || 'Anonymous customer')}</strong> — ${Number(review.rating)}/5 stars</p>
        <p>${escapeHtml(review.text)}</p>
      </article>`
    )
    .join('\n');

  return `<div class="seo-product-summary" style="max-width:1100px;margin:48px auto;padding:0 24px;font-family:system-ui,sans-serif;color:#0d1b2a;line-height:1.6">
    <h1 style="font-size:2rem">${escapeHtml(product.name)}</h1>
    ${ratingBlock}
    <p class="seo-price"><strong>${escapeHtml(price)}</strong></p>
    <p>${escapeHtml(product.description)}</p>
    <p><a href="${escapeHtml(url)}">View ${escapeHtml(product.name)} on Cedokamall</a></p>
    ${snippets ? `<section class="seo-reviews"><h2>Customer Reviews</h2>${snippets}</section>` : ''}
  </div>`;
}

/** Assemble a complete prerendered product page from the built SPA shell. */
export function renderProductHtml(template, product, reviews, siteUrl) {
  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.reviews || 0);
  const description = String(product.description || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140);
  const ratingSuffix =
    reviewCount > 0
      ? ` Rated ${rating.toFixed(1)}/5 by ${reviewCount} customer${reviewCount === 1 ? '' : 's'}.`
      : '';
  const fullDescription = `${description}${ratingSuffix}`;

  const title = `${product.name} - Buy Original ${product.category} in Nigeria | Cedokamall`;
  const url = `${siteUrl}/product/${encodeURIComponent(product.id)}`;
  const keywords = [
    product.name,
    product.category,
    `${product.category} Nigeria`,
    `${product.seller} Nigeria`,
    'electrical equipment Nigeria',
    'gadgets with warranty',
    'customer reviews',
  ].join(', ');

  let html = setTitle(template, title);
  html = setMetaTag(html, 'name', 'description', fullDescription);
  html = setMetaTag(html, 'name', 'keywords', keywords);
  html = setMetaTag(html, 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  html = setMetaTag(html, 'name', 'googlebot', 'index, follow, max-image-preview:large');
  html = setMetaTag(html, 'property', 'og:title', title);
  html = setMetaTag(html, 'property', 'og:description', fullDescription);
  html = setMetaTag(html, 'property', 'og:type', 'product');
  html = setMetaTag(html, 'property', 'og:site_name', 'Cedokamall');
  html = setMetaTag(html, 'property', 'og:locale', 'en_NG');
  html = setMetaTag(html, 'property', 'og:url', url);
  html = setMetaTag(html, 'property', 'og:image', product.image);
  html = setMetaTag(html, 'name', 'twitter:card', 'summary_large_image');
  html = setMetaTag(html, 'name', 'twitter:title', title);
  html = setMetaTag(html, 'name', 'twitter:description', fullDescription);
  html = setMetaTag(html, 'name', 'twitter:image', product.image);
  html = setCanonical(html, url);

  // Marked as managed so useStructuredData() swaps in fresh live ratings once React mounts.
  const schemaScript = `<script type="application/ld+json" data-managed-structured-data="true">${escapeJsonForScript(
    buildProductSchema(product, reviews, siteUrl)
  )}</script>`;
  html = html.replace('</head>', `    ${schemaScript}\n  </head>`);

  const content = buildCrawlableContent(product, reviews, siteUrl);
  html = html.replace('<div id="root"></div>', `<div id="root">\n  ${content}\n  </div>`);

  return html;
}

async function fetchJson(url, headers) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

export async function main() {
  const env = loadEnv();
  const siteUrl = (env.VITE_SITE_URL || process.env.VITE_SITE_URL || 'https://cedokamall.com').replace(/\/$/, '');
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    env.VITE_SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  const templatePath = join(DIST_DIR, 'index.html');
  if (!existsSync(templatePath)) {
    throw new Error('[prerender] dist/index.html is missing — run vite build first.');
  }
  const template = readFileSync(templatePath, 'utf8');

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[prerender] Supabase credentials missing; skipping product prerender.');
    return;
  }

  const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };
  const base = supabaseUrl.replace(/\/$/, '');

  let products = [];
  let reviews = [];
  try {
    products = await fetchJson(
      `${base}/rest/v1/products?select=id,name,description,price,image,category,seller,stock,rating,reviews,sku,updated_at&order=created_at.desc`,
      headers
    );
    reviews = await fetchJson(
      `${base}/rest/v1/reviews?select=id,product_id,name,rating,text,created_at&order=created_at.desc`,
      headers
    );
  } catch (error) {
    console.warn(`[prerender] Could not fetch products/reviews: ${error.message}`);
    return;
  }

  const reviewsByProduct = new Map();
  for (const review of reviews || []) {
    if (!review.product_id) continue;
    if (!reviewsByProduct.has(review.product_id)) reviewsByProduct.set(review.product_id, []);
    reviewsByProduct.get(review.product_id).push(review);
  }

  let written = 0;
  for (const product of products || []) {
    if (!product?.id) continue;
    const safeId = encodeURIComponent(product.id);
    const outputDir = join(DIST_DIR, 'product', safeId);
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(
      join(outputDir, 'index.html'),
      renderProductHtml(template, product, reviewsByProduct.get(product.id) || [], siteUrl),
      'utf8'
    );
    written += 1;
  }

  console.log(`[prerender] Generated ${written} crawlable product pages with rating structured data.`);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath && pathToFileURL(invokedPath).href === import.meta.url) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
