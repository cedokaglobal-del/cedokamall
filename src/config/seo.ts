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

interface ReviewSchema {
  author: string;
  rating: number;
  text: string;
  date?: string;
}

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
  reviewList?: ReviewSchema[];
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

  // Google requires both ratingValue and a count on an AggregateRating before
  // it will show a star rating in the results. ratingCount is the number of
  // ratings, reviewCount the number of written reviews.
  const ratingValue = Number(product.rating || 0);
  const reviewCount = Number(product.reviews || 0);
  if (ratingValue > 0 && reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingValue.toFixed(1),
      reviewCount,
      ratingCount: reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  // A Review without reviewBody is ignored by Google, which used to be the
  // case here: the body was rendered on the page but never emitted.
  if (product.reviewList && product.reviewList.length > 0) {
    schema.review = product.reviewList
      .filter((review) => review.text && review.text.trim().length > 0)
      .map((review) => ({
        "@type": "Review",
        ...(review.date ? { datePublished: review.date } : {}),
        reviewBody: review.text,
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: "5",
          worstRating: "1",
        },
        author: {
          "@type": "Person",
          name: review.author?.trim() || "Anonymous customer",
        },
      }));
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

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FAQ Schema for Answer Engine Optimization (AEO).
 * Enables rich FAQ snippets on Google Search and direct citations
 * on AI search engines (Perplexity, ChatGPT Search, Gemini, Claude).
 */
export const getFaqSchema = (faqs: FaqItem[]): StructuredDataNode => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

export const COMMON_AEO_FAQS: FaqItem[] = [
  {
    question: "Where is Cedokamall located in Nigeria?",
    answer:
      "Cedokamall is operated by Cedoka Global Limited with physical showroom headquarters at 35 Ailegun Road, Ejigbo, Lagos, Nigeria. We offer nationwide delivery across all 36 Nigerian states and Abuja.",
  },
  {
    question: "Are all electricals, appliances, and solar systems on Cedokamall original with warranty?",
    answer:
      "Yes. Every product on Cedokamall is 100% genuine and sourced directly from verified manufacturer distributors (including LG, Hisense, Maxi, MeWe, and tier-1 solar manufacturers) with valid manufacturer warranty support.",
  },
  {
    question: "How does nationwide delivery work across Nigeria?",
    answer:
      "Orders within Lagos are dispatched same-day or next-day. Nationwide orders to other states are dispatched via secure logistics partners within 2-4 business days. Real-time delivery updates are provided via WhatsApp and SMS.",
  },
  {
    question: "How do I calculate what solar system or inverter size I need for my home or business?",
    answer:
      "Cedokamall provides a free interactive Energy Calculator at cedokamall.com/calculator. Simply select your daily appliances (fans, TVs, refrigerators, lighting, ACs) and hours of use to receive instant solar panel, inverter, and battery bank recommendations.",
  },
  {
    question: "What payment methods are supported on Cedokamall?",
    answer:
      "Cedokamall supports secure online card payments, instant bank transfers, and direct WhatsApp assisted checkout with verified invoices.",
  },
];

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
    rating?: number;
    reviews?: number;
  }>
): StructuredDataNode => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: items.map((item) => {
    const hasRating = Number(item.rating || 0) > 0 && Number(item.reviews || 0) > 0;

    return {
      "@type": "ListItem",
      position: item.position,
      url: item.url,
      name: item.name,
      ...(item.image ? { image: item.image } : {}),
      // Carry the rating onto the list entry so a category page can earn a
      // star rating for its products, not just the product page itself.
      ...(hasRating
        ? {
            item: {
              "@type": "Product",
              name: item.name,
              url: item.url,
              ...(item.image ? { image: item.image } : {}),
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: Number(item.rating).toFixed(1),
                reviewCount: Number(item.reviews),
                ratingCount: Number(item.reviews),
                bestRating: "5",
                worstRating: "1",
              },
            },
          }
        : {}),
    };
  }),
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
  farms: {
    title: 'Farms - Fresh Produce, Agricultural Products & Equipment | Cedokamall',
    description: 'Shop farm produce, agricultural products, equipment and supplies on Cedokamall. Bulk and seasonal availability with nationwide delivery across Nigeria.',
    keywords: ['farm produce Nigeria', 'agricultural products Nigeria', 'farm equipment Nigeria', 'farm supplies Nigeria', 'buy farm products online Nigeria'],
    type: 'website',
  },
  calculator: {
    title: 'Solar Calculator - Size Your Solar System | Cedokamall',
    description: 'Calculate the right solar panels, inverter and battery bank for your home or office from your daily appliance usage. Free solar sizing tool for Nigeria.',
    keywords: ['solar calculator Nigeria', 'solar system sizing', 'how many solar panels do I need', 'inverter size calculator', 'battery bank calculator Nigeria'],
    type: 'website',
  },
  product: {
    title: 'Original Product with Warranty | Cedokamall',
    description: 'Buy original products with warranty support and nationwide delivery across Nigeria from Cedokamall.',
    keywords: ['original products Nigeria', 'products with warranty Nigeria', 'Cedokamall'],
    type: 'website',
  },
};

export const getCanonicalUrl = (pathname: string): string => `${SEO_CONFIG.siteUrl}${pathname}`;

export const getAbsoluteUrl = (pathname: string): string => getCanonicalUrl(pathname);
