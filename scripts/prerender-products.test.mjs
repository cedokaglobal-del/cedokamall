import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeHtml,
  escapeJsonForScript,
  buildProductSchema,
  renderProductHtml,
} from './prerender-products.mjs';

const TEMPLATE = `<!doctype html>
<html><head><title>Home | Cedokamall</title>
<meta name="description" content="Home description" />
<meta property="og:title" content="Home" />
<link rel="canonical" href="https://cedokamall.com" />
</head><body><div id="root"></div></body></html>`;

const PRODUCT = {
  id: 'abc-123',
  name: 'LG 55" Smart TV',
  description: 'A great <TV> & more.',
  price: 289000,
  image: 'https://cdn.example.com/tv.jpg',
  category: 'Televisions',
  seller: 'Cedoka',
  stock: 4,
  rating: 4.5,
  reviews: 12,
  sku: 'LG55TV',
};

const REVIEWS = [
  {
    id: 'r1',
    product_id: 'abc-123',
    name: 'Ada',
    rating: 5,
    text: 'Excellent picture quality',
    created_at: '2026-01-05T10:00:00Z',
  },
];

test('escapeHtml escapes unsafe characters', () => {
  assert.equal(escapeHtml(`<a href="x">&'</a>`), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
});

test('escapeJsonForScript prevents script tag injection', () => {
  const json = escapeJsonForScript({ text: '</script><script>alert(1)</script>' });
  assert.ok(!json.includes('</script>'));
  assert.ok(json.includes('\\u003c/script\\u003e'));
});

test('buildProductSchema emits AggregateRating and Review', () => {
  const schema = buildProductSchema(PRODUCT, REVIEWS, 'https://cedokamall.com');
  assert.equal(schema['@type'], 'Product');
  assert.equal(schema.aggregateRating.ratingValue, '4.5');
  assert.equal(schema.aggregateRating.reviewCount, 12);
  assert.equal(schema.aggregateRating.bestRating, '5');
  assert.equal(schema.review.length, 1);
  assert.equal(schema.review[0].reviewBody, 'Excellent picture quality');
  assert.equal(schema.review[0].reviewRating.ratingValue, 5);
});

test('buildProductSchema omits AggregateRating when there are no ratings', () => {
  const schema = buildProductSchema({ ...PRODUCT, rating: 0, reviews: 0 }, [], 'https://cedokamall.com');
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(schema.review, undefined);
});

test('renderProductHtml produces crawlable, product-specific SEO markup', () => {
  const html = renderProductHtml(TEMPLATE, PRODUCT, REVIEWS, 'https://cedokamall.com');

  assert.ok(html.includes('<title>LG 55&quot; Smart TV - Buy Original Televisions in Nigeria | Cedokamall</title>'));
  assert.ok(html.includes('Rated 4.5/5 by 12 customers.'));
  assert.ok(html.includes('<link rel="canonical" href="https://cedokamall.com/product/abc-123" />'));
  assert.ok(html.includes('"@type":"AggregateRating"'));
  assert.ok(html.includes('data-managed-structured-data="true"'));
  assert.ok(html.includes('itemprop="ratingValue">4.5'));
  assert.ok(html.includes('Excellent picture quality'));
  assert.ok(!html.includes('content="Home description"'));
  assert.ok(!html.includes('href="https://cedokamall.com" />'));
  // The SPA root must still exist so React can mount on the client.
  assert.ok(html.includes('<div id="root">'));
});
