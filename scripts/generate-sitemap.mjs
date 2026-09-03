#!/usr/bin/env node
// Generates sitemap.xml at build time with all product pages from Supabase
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, '..', '.env');
  const envLocalPath = join(__dirname, '..', '.env.local');
  const envProductionPath = join(__dirname, '..', '.env.production');
  const vars = {};

  [envPath, envLocalPath, envProductionPath].forEach((p) => {
    try {
      const content = readFileSync(p, 'utf8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) return;
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        vars[key] = val;
      });
    } catch {}
  });

  return vars;
}

async function generateSitemap() {
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase credentials not found. Generating static sitemap without products.');
    writeStaticSitemap([]);
    return;
  }

  try {
    const restUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/products?select=id,name,category,updated_at&order=created_at.desc`;
    const res = await fetch(restUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Supabase returned ${res.status}`);
    }

    const products = await res.json();
    writeDynamicSitemap(products);
    console.log(`✅ Sitemap generated with ${products.length} products`);
  } catch (err) {
    console.warn('⚠️  Failed to fetch products for sitemap:', err.message);
    writeStaticSitemap([]);
  }
}

function writeStaticSitemap(products) {
  const baseUrl = 'https://cedokamall.com';
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/shop</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>`;

  const publicRoutes = [
    { path: '/solar', priority: '0.9' },
    { path: '/farms', priority: '0.8' },
    { path: '/brands', priority: '0.8' },
    { path: '/calculator', priority: '0.8' },
  ];

  publicRoutes.forEach(({ path, priority }) => {
    xml += `
  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  products.forEach((p) => {
    const slug = p.id;
    const updated = p.updated_at ? p.updated_at.split('T')[0] : today;
    xml += `
  <url>
    <loc>${baseUrl}/product/${encodeURIComponent(slug)}</loc>
    <lastmod>${updated}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  xml += `\n</urlset>`;

  const distDir = join(__dirname, '..', 'dist');
  mkdirSync(distDir, { recursive: true });
  writeFileSync(join(distDir, 'sitemap.xml'), xml, 'utf8');
}

function writeDynamicSitemap(products) {
  writeStaticSitemap(products);
}

generateSitemap();
