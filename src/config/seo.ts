/**
 * SEO Configuration
 * Optimized for Google and search engines
 */

export const SEO_CONFIG = {
  siteTitle: "Cedokamall - Affordable, Reliable & Original Electricals in Nigeria",
  siteDescription:
    "The most Affordable, Reliable & Original Electrical Equipment and Gadgets with Warranties - LG, Hisense, MeWe, Maxi etc",
  siteUrl: import.meta.env.VITE_SITE_URL || "https://cedokamall.com",
  siteName: "Cedokamall",
  locale: "en_NG",
  language: "en-NG",
  country: "NG",
  author: "Cedoka Global Limited",
  email: "hello@cedokamall.com",
  phone: "09128817136",
  twitterHandle: "@cedokamall",
  facebookPage: "https://facebook.com/cedokamall",
  defaultCurrency: "NGN",
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
  robots?: string;
}

export interface StructuredDataNode {
  "@context"?: string;
  "@type"?: string;
  [key: string]: unknown;
}

/**
 * Default Meta Tags for All Pages
 */
export const DEFAULT_META_TAGS: MetaTag[] = [
  { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
  { name: "theme-color", content: "#ff6b35" },
  { name: "msapplication-TileColor", content: "#ff6b35" },
  { name: "apple-mobile-web-app-capable", content: "yes" },
  { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
  { name: "format-detection", content: "telephone=no" },
  {
    name: "robots",
    content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  },
  { name: "googlebot", content: "index, follow, max-image-preview:large" },
  { name: "language", content: SEO_CONFIG.language },
  { name: "author", content: SEO_CONFIG.author },
  { name: "creator", content: SEO_CONFIG.author },
];

const DEFAULT_SOCIAL_IMAGE = `${SEO_CONFIG.siteUrl}/logo.png`;

export const getOpenGraphTags = (meta: PageMeta): MetaTag[] => [
  { property: "og:title", content: meta.title },
  { property: "og:description", content: meta.description },
  { property: "og:type", content: meta.type || "website" },
  { property: "og:site_name", content: SEO_CONFIG.siteName },
  { property: "og:locale", content: SEO_CONFIG.locale },
  { property: "og:image", content: meta.image || DEFAULT_SOCIAL_IMAGE },
  { property: "og:image:secure_url", content: meta.image || DEFAULT_SOCIAL_IMAGE },
  { property: "og:image:type", content: "image/png" },
  ...(meta.url ? [{ property: "og:url", content: meta.url }] : []),
];

export const getTwitterCardTags = (meta: PageMeta): MetaTag[] => [
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: meta.title },
  { name: "twitter:description", content: meta.description },
  { name: "twitter:creator", content: SEO_CONFIG.twitterHandle },
  { name: "twitter:image", content: meta.image || DEFAULT_SOCIAL_IMAGE },
];

export const getOrganizationSchema = (): StructuredDataNode => ({
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
    contactType: "customer service",
    email: SEO_CONFIG.email,
    areaServed: "NG",
    availableLanguage: ["English"],
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: SEO_CONFIG.country,
    addressRegion: "Lagos",
    streetAddress: "35, Ailegun Road, Ejigbo",
  },
});

export const getWebsiteSchema = (): StructuredDataNode => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SEO_CONFIG.siteName,
  url: SEO_CONFIG.siteUrl,
  description: SEO_CONFIG.siteDescription,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SEO_CONFIG.siteUrl}/shop?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});

export const getStoreSchema = (): StructuredDataNode => ({
  "@context": "https://schema.org",
  "@type": "Store",
  name: SEO_CONFIG.siteName,
  image: `${SEO_CONFIG.siteUrl}/logo.png`,
  url: SEO_CONFIG.siteUrl,
  telephone: SEO_CONFIG.phone,
  priceRange: "₦₦",
  currenciesAccepted: SEO_CONFIG.defaultCurrency,
  paymentAccepted: "Cash, Bank Transfer, Card",
  address: {
    "@type": "PostalAddress",
    addressCountry: SEO_CONFIG.country,
    addressRegion: "Lagos",
    streetAddress: "35, Ailegun Road, Ejigbo",
  },
});

interface ProductData {
  name: string;
  description: string;
  image: string;
  id: string;
  seller: string;
  price: number;
  inStock: number;
  rating?: number;
  reviews?: number;
  category?: string;
}

export const getProductSchema = (product: ProductData): StructuredDataNode => {
  const schema: StructuredDataNode = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    category: product.category,
    url: `${SEO_CONFIG.siteUrl}/product/${product.id}`,
    brand: {
      "@type": "Brand",
      name: product.seller,
    },
    offers: {
      "@type": "Offer",
      url: `${SEO_CONFIG.siteUrl}/product/${product.id}`,
      priceCurrency: SEO_CONFIG.defaultCurrency,
      price: product.price,
      availability:
        product.inStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: product.seller,
      },
    },
  };

  if ((product.rating || 0) > 0 && (product.reviews || 0) > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return schema;
};

export const getBreadcrumbSchema = (
  items: Array<{ name: string; url: string }>
): StructuredDataNode => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const getCollectionPageSchema = (input: {
  name: string;
  description: string;
  url: string;
  itemCount: number;
}): StructuredDataNode => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: input.name,
  description: input.description,
  url: input.url,
  isPartOf: {
    "@type": "WebSite",
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: input.itemCount,
  },
});

export const getItemListSchema = (
  items: Array<{
    name: string;
    url: string;
    image?: string;
    position: number;
  }>
): StructuredDataNode => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: items.map((item) => ({
    "@type": "ListItem",
    position: item.position,
    url: item.url,
    name: item.name,
    ...(item.image ? { image: item.image } : {}),
  })),
});

export const PAGE_METAS: Record<string, PageMeta> = {
  home: {
    title: SEO_CONFIG.siteTitle,
    description: SEO_CONFIG.siteDescription,
    keywords: [
      "online shopping Nigeria",
      "electrical equipment Nigeria",
      "gadgets with warranty",
      "LG Nigeria",
      "Hisense Nigeria",
      "MeWe Nigeria",
      "Maxi Nigeria",
      "home appliances Lagos",
    ],
    type: "website",
  },
  shop: {
    title: 'Shop Electrical Equipment, Gadgets and Appliances - Cedokamall',
    description:
      'Browse original electrical equipment, gadgets, TVs, refrigerators, air conditioners, kitchen appliances and more with warranties and nationwide delivery.',
    keywords: [
      'shop electronics Nigeria',
      'electrical appliances Lagos',
      'original gadgets Nigeria',
      'TVs and refrigerators Nigeria',
      'kitchen appliances',
      'home appliances with warranty',
      'buy electronics online Nigeria',
      'best electronics store Nigeria',
      'electronics deals Nigeria',
      'discount appliances Nigeria',
    ],
    type: 'website',
  },
  cart: {
    title: "Shopping Cart - Cedokamall",
    description: "Review your selected Cedokamall items and proceed to checkout securely.",
    keywords: ["shopping cart", "checkout", "Cedokamall"],
    type: "website",
    robots: "noindex, nofollow",
  },
  admin: {
    title: "Admin Dashboard - Cedokamall",
    description: "Admin dashboard for Cedokamall management.",
    keywords: [],
    type: "website",
    robots: "noindex, nofollow",
  },
  solar: {
    title: 'Solar Energy Solutions - Solar Panels, Inverters, Batteries & Power Tanks | Cedokamall',
    description: 'Shop premium solar panels, inverters, batteries, charge controllers, power tanks, solar lights, pumps & accessories in Nigeria. Use our Energy Calculator to find the right solar system for your home or office.',
    keywords: [
      'solar panels Nigeria',
      'solar inverters Nigeria',
      'solar batteries Nigeria',
      'power tank solar',
      'solar energy Nigeria',
      'off-grid solar Nigeria',
      'solar installation Nigeria',
      'solar charge controllers',
      'solar lights Nigeria',
      'solar water pumps',
      'solar cables wiring',
      'solar mounting frames',
      'solar accessories',
      'solar energy storage',
      'renewable energy Nigeria',
      'solar power systems Nigeria',
    ],
    type: 'website',
  },
  brands: {
    title: "All Brands - Shop Original Electrical & Gadget Brands | Cedokamall",
    description: "Browse all original brands available at Cedokamall. Shop LG, Hisense, Samsung and more trusted brands with warranties and nationwide delivery.",
    keywords: ['electrical brands Nigeria', 'gadget brands', 'LG Nigeria', 'Hisense Nigeria', 'Cedokamall brands'],
    type: "website",
  },
};

export const getCanonicalUrl = (pathname: string): string => `${SEO_CONFIG.siteUrl}${pathname}`;

export const getAbsoluteUrl = (pathname: string): string => getCanonicalUrl(pathname);
