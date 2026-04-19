/**
 * SEO Configuration
 * Optimized for Google and search engines
 */

export const SEO_CONFIG = {
  siteTitle: "Cedokamall - Nigeria's Premium Online Marketplace",
  siteDescription: "Shop 50,000+ products with fast Nationwide delivery. Electronics, Home Appliances, Accessories & more. Trusted sellers, secure payments, swift delivery across Nigeria.",
  siteUrl: import.meta.env.VITE_SITE_URL || "https://cedokamall.com",
  siteName: "Cedokamall",
  locale: "en_NG",
  language: "en",
  country: "NG",
  author: "Cedokamall Team",
  email: "support@cedokamall.com",
  phone: "09128817136",
  twitterHandle: "@cedokamall",
  facebookPage: "https://facebook.com/cedokamall"
};

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
  httpEquiv?: string;
}

export interface PageMeta {
  title: string;
  description: string;
  keywords: string[];
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
}

/**
 * Default Meta Tags for All Pages
 */
export const DEFAULT_META_TAGS: MetaTag[] = [
  { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
  { name: "theme-color", content: "#ff6b35" },
  { name: "msapplication-TileColor", content: "#ff6b35" },
  { name: "apple-mobile-web-app-capable", content: "yes" },
  { name: "apple-mobile-web-app-status-bar-style", content: "default" },
  { name: "format-detection", content: "telephone=no" },
  { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
  { name: "googlebot", content: "index, follow" },
  { name: "language", content: "en-US" },
  { name: "author", content: SEO_CONFIG.author },
  { name: "creator", content: SEO_CONFIG.author },
];

/**
 * Open Graph Meta Tags
 */
export const getOpenGraphTags = (meta: PageMeta): MetaTag[] => [
  { property: "og:title", content: meta.title },
  { property: "og:description", content: meta.description },
  { property: "og:type", content: meta.type || "website" },
  { property: "og:site_name", content: SEO_CONFIG.siteName },
  { property: "og:locale", content: SEO_CONFIG.locale },
  ...(meta.image ? [{ property: "og:image", content: meta.image }] : []),
  ...(meta.url ? [{ property: "og:url", content: meta.url }] : []),
];

/**
 * Twitter Card Meta Tags
 */
export const getTwitterCardTags = (meta: PageMeta): MetaTag[] => [
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: meta.title },
  { name: "twitter:description", content: meta.description },
  { name: "twitter:creator", content: SEO_CONFIG.twitterHandle },
  ...(meta.image ? [{ name: "twitter:image", content: meta.image }] : []),
];

/**
 * Structured Data (Schema.org JSON-LD)
 */
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SEO_CONFIG.siteName,
  url: SEO_CONFIG.siteUrl,
  logo: `${SEO_CONFIG.siteUrl}/logo.png`,
  description: SEO_CONFIG.siteDescription,
  sameAs: [
    SEO_CONFIG.facebookPage,
    `https://twitter.com/${SEO_CONFIG.twitterHandle.replace("@", "")}`,
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: SEO_CONFIG.phone,
    contactType: "Customer Service",
    email: SEO_CONFIG.email,
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: SEO_CONFIG.country,
    addressRegion: "Lagos",
    streetAddress: "35, Ailegun Road, Ejigbo"
  }
});

export const getWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SEO_CONFIG.siteName,
  url: SEO_CONFIG.siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SEO_CONFIG.siteUrl}/shop?search={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
});

interface ProductData {
  name: string;
  description: string;
  image: string;
  id: string;
  seller: string;
  [key: string]: unknown;
}

export const getProductSchema = (product: ProductData) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: product.description,
  image: product.image,
  url: `${SEO_CONFIG.siteUrl}/product/${product.id}`,
  brand: {
    "@type": "Brand",
    name: product.seller
  },
  offers: {
    "@type": "Offer",
    url: `${SEO_CONFIG.siteUrl}/product/${product.id}`,
    priceCurrency: "NGN",
    price: product.price,
    availability: product.inStock > 0 ? "InStock" : "OutOfStock",
    seller: {
      "@type": "Organization",
      name: product.seller
    }
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: product.rating,
    reviewCount: product.reviews,
    bestRating: "5",
    worstRating: "1"
  }
});

export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

/**
 * Page-Specific Meta Configurations
 */
export const PAGE_METAS: Record<string, PageMeta> = {
  home: {
    title: SEO_CONFIG.siteTitle,
    description: SEO_CONFIG.siteDescription,
    keywords: ["online shopping", "Nigeria", "electronics", "appliances", "fast delivery", "Nationwide"],
    type: "website"
  },
  shop: {
    title: "Shop All Products - Cedokamall",
    description: "Browse our extensive collection of electronics, appliances, and accessories. Trusted brands, great prices.",
    keywords: ["products", "electronics", "appliances", "shopping", "Nigeria", "Nationwide"],
    type: "website"
  },
  cart: {
    title: "Shopping Cart - Cedokamall",
    description: "Review your items and proceed to secure checkout.",
    keywords: ["cart", "checkout", "shopping"],
    type: "website"
  }
};

/**
 * Generate canonical URL
 */
export const getCanonicalUrl = (pathname: string): string => {
  return `${SEO_CONFIG.siteUrl}${pathname}`;
};

/**
 * Generate sitemap entry
 */
export const generateSitemapEntry = (loc: string, lastmod?: string, priority?: number) => ({
  loc,
  ...(lastmod && { lastmod }),
  ...(priority && { priority })
});
