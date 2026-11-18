/**
 * URL slugs for products.
 *
 * Product ids in the database are UUIDs, so every product URL used to look like
 * /product/973cc00f-449b-45f8-aef6-a070a7d11591. That carries no keywords, so
 * search engines had nothing to index and no way to tell two products apart.
 *
 * A slug puts the product name in the URL where it helps, while a short id
 * suffix guarantees that two products with the same name never collide.
 */

const MAX_SLUG_LENGTH = 60;

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '');

export interface SluggableProduct {
  id: string;
  name: string;
}

/**
 * Builds the public URL slug for a product, e.g.
 * "LG 55\" Smart TV" -> "lg-55-smart-tv-973cc00f".
 */
export const productSlug = (product: SluggableProduct): string => {
  const base = slugify(product.name) || 'product';
  const suffix = product.id.replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase();
  return suffix ? `${base}-${suffix}` : base;
};

/** The canonical public path for a product. */
export const productPath = (product: SluggableProduct): string =>
  `/product/${productSlug(product)}`;

/** The canonical absolute URL for a product. */
export const productUrl = (siteUrl: string, product: SluggableProduct): string =>
  `${siteUrl.replace(/\/$/, '')}${productPath(product)}`;

/**
 * Resolves a route parameter to a product, accepting either the slug or the
 * raw id. Old UUID links keep working, so no existing URL breaks.
 */
export const findProductByPath = <T extends SluggableProduct>(
  products: T[],
  param: string | undefined
): T | undefined => {
  if (!param) return undefined;

  const byId = products.find((product) => product.id === param);
  if (byId) return byId;

  const decoded = decodeURIComponent(param).toLowerCase();
  return products.find((product) => productSlug(product).toLowerCase() === decoded);
};
