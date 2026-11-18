import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Clock,
  Filter,
  Heart,
  Info,
  MessageSquare,
  RotateCcw,
  Send,
  Share2,
  Shield,
  ShoppingCart,
  ThumbsUp,
  Zap,
  Star,
  Tag,
  Truck,
  User,
  X,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getBreadcrumbSchema, getProductSchema, SEO_CONFIG } from '@/config/seo';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';
import {
  looksLikeReviewText,
  splitMisplacedReview,
  MAX_REVIEW_TEXT_LENGTH,
} from '@/lib/reviewText';
import { useCartStore } from '@/store/cartStore';
import { useProductStore } from '@/store/productStore';
import { useReviewStore, subscribeToProductReviews, type StoreReview } from '@/store/reviewStore';
import { toast } from 'sonner';
import { getOptimizedImageUrl, generateSrcSet, generateSizes } from '@/utils/performance';
import { RENEWABLE_ENERGY_CATEGORIES } from '@/data/catalog';
import { findProductByPath } from '@/utils/slug';
import type { Product } from '@/types/product';

const fallbackImage = '/image.png';
const formatPrice = (amount: number) => `\u20A6${amount.toLocaleString()}`;

const parseNumber = (value: string | undefined, unit: RegExp): number | null => {
  if (!value) return null;
  const match = value.match(unit);
  if (!match) return null;
  const parsed = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

interface PowerGuidance {
  wattage?: number;
  capacityWh?: number;
  voltage?: number;
  bullets: string[];
}

/** Build an honest, spec-derived "What can this power?" summary for energy products. */
const getPowerGuidance = (product: Product): PowerGuidance | null => {
  const isEnergy = RENEWABLE_ENERGY_CATEGORIES.includes(product.category);
  if (!isEnergy) return null;

  const specs = product.specs || {};
  const entries = Object.entries(specs).map(([k, v]) => [`${k} ${v}`, v] as const);

  let wattage: number | null = null;
  let wh: number | null = null;
  let voltage: number | null = null;
  let ah: number | null = null;

  for (const [combined] of entries) {
    if (wattage === null) wattage = parseNumber(combined, /(\d[\d,]*)\s*(?:w|watt|watts)\b/i);
    if (wh === null) wh = parseNumber(combined, /(\d[\d,]*)\s*(?:wh|watt[- ]?hours?)\b/i);
    if (voltage === null) voltage = parseNumber(combined, /(\d[\d,]*)\s*(?:v|volt|volts)\b/i);
    if (ah === null) ah = parseNumber(combined, /(\d[\d,]*)\s*(?:ah|amp[- ]?hours?)\b/i);
  }

  if (wh === null && ah !== null && voltage !== null) wh = ah * voltage;

  const bullets: string[] = [];
  if (wattage !== null) {
    bullets.push(`Rated around ${wattage.toLocaleString()} W — size connected loads below this figure.`);
  }
  if (wh !== null) {
    const lightLoad = Math.round(wh / 50);
    const heavyLoad = Math.round(wh / 200);
    bullets.push(
      `Stores about ${wh.toLocaleString()} Wh — roughly ${lightLoad} hrs for a light load (fan, router, lights) or ${heavyLoad} hrs for a heavier load (TV, decoder).`
    );
  }
  if (voltage !== null) {
    bullets.push(`System voltage: ${voltage} V.`);
  }

  if (bullets.length === 0) return null;
  return { wattage: wattage ?? undefined, capacityWh: wh ?? undefined, voltage: voltage ?? undefined, bullets };
};

type SortOption = 'newest' | 'highest' | 'lowest' | 'helpful';

const EMPTY_REVIEW_LIST: StoreReview[] = [];

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = (location.state as { from?: { pathname: string; search: string } })?.from;
  const products = useProductStore((s) => s.products);
  const isLoading = useProductStore((s) => s.isLoading);
  const hasLoaded = useProductStore((s) => s.hasLoaded);
  const rateProduct = useProductStore((s) => s.rateProduct);
  const addItem = useCartStore((state) => state.addItem);

  // Accepts either the readable slug or the raw id, so every old UUID link
  // keeps working while new links use the keyword version.
  const product = useMemo(() => findProductByPath(products, id), [products, id]);
  const productKey = product?.id ?? id;
  const powerInfo = useMemo(() => (product ? getPowerGuidance(product) : null), [product]);
  const [activeImage, setActiveImage] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRating, setIsRating] = useState(false);

  // Hooks for reviews/rating - must be before early returns
  const [userRating, setUserRating] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (!product?.id) return;
    try {
      setIsWishlisted(Boolean(localStorage.getItem(`cedoka_wishlist_${product.id}`)));
    } catch {
      setIsWishlisted(false);
    }
  }, [product?.id]);

  const toggleWishlist = () => {
    if (!product?.id) return;
    const next = !isWishlisted;
    setIsWishlisted(next);
    try {
      if (next) {
        localStorage.setItem(`cedoka_wishlist_${product.id}`, 'true');
        toast.success(`${product.name} saved to your wishlist!`);
      } else {
        localStorage.removeItem(`cedoka_wishlist_${product.id}`);
        toast.info(`${product.name} removed from your wishlist.`);
      }
    } catch {
      /* ignore */
    }
  };

  // The saved rating is keyed by product id, which is only known once the
  // product resolves, so it is read in an effect rather than at mount.
  useEffect(() => {
    if (!product?.id) return;
    try {
      setUserRating(Number(localStorage.getItem(`cedoka_rating_${product.id}`)) || 0);
    } catch {
      setUserRating(0);
    }
  }, [product?.id]);

  const [reviewSort, setReviewSort] = useState<SortOption>('newest');
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 0, text: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const reviewFormRef = useRef<HTMLDivElement | null>(null);

  // Live detection of the most common mistake: a full review typed into the
  // name box. Surfacing it before submission beats a silently broken form.
  const nameLooksLikeReview = useMemo(
    () => looksLikeReviewText(reviewForm.name),
    [reviewForm.name]
  );
  const isOnline = useOnlineStatus();
  const isOffline = !isOnline;

  // Server-persisted reviews — use ?? with a stable empty array to avoid re-render loops
  const storeReviews = useReviewStore((s) => s.reviewsByProduct[productKey || ''] ?? EMPTY_REVIEW_LIST);
  const isLoadingReviews = useReviewStore((s) => s.loadingByProduct[productKey || ''] ?? false);
  const reviewError = useReviewStore((s) => s.errorByProduct[productKey || ''] ?? null);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);
  const addReview = useReviewStore((s) => s.addReview);
  const markHelpful = useReviewStore((s) => s.markHelpful);

  useEffect(() => {
    setActiveImage(0);
  }, [product?.id]);

  // Fetch reviews from server + subscribe to realtime inserts
  useEffect(() => {
    if (!productKey) return;
    fetchReviews(productKey, true);
    const unsub = subscribeToProductReviews(productKey);
    return unsub;
  }, [productKey, fetchReviews]);

  // Compute rating breakdown from store reviews
  const ratingBreakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    storeReviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating - 1] += 1;
      }
    });
    return counts.reverse(); // 5 → 1
  }, [storeReviews]);

  const totalReviewCount = storeReviews.length;
  const avgRating = useMemo(() => {
    if (storeReviews.length === 0) return product?.rating || 0;
    const sum = storeReviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / storeReviews.length).toFixed(1));
  }, [storeReviews, product?.rating]);

  // Sort reviews
  const sortedReviews = useMemo(() => {
    const sorted = [...storeReviews];
    switch (reviewSort) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        sorted.sort((a, b) => b.helpful_count - a.helpful_count);
        break;
    }
    return sorted;
  }, [storeReviews, reviewSort]);

  const handleRate = async (rating: number) => {
    if (isRating || userRating > 0) return;
    setIsRating(true);
    try {
      await rateProduct(product.id, rating);
      localStorage.setItem(`cedoka_rating_${product.id}`, String(rating));
      setUserRating(rating);
      toast.success('Thank you for your rating!');
    } catch {
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setIsRating(false);
    }
  };

  const handleSubmitReview = async () => {
    if ((!reviewForm.text.trim() && !reviewForm.name.trim()) || reviewForm.rating === 0 || !productKey || !product) return;
    setIsSubmittingReview(true);
    try {
      // A review typed into the name box is moved into the review field rather
      // than discarded, so the customer never loses their words.
      const { name, text, migrated } = splitMisplacedReview(reviewForm.name, reviewForm.text);

      // Save review text to server
      await addReview(productKey, {
        name: name || 'Anonymous',
        rating: reviewForm.rating,
        text,
      });

      // Update aggregate rating on the product
      if (userRating === 0) {
        await rateProduct(product.id, reviewForm.rating);
        localStorage.setItem(`cedoka_rating_${product.id}`, String(reviewForm.rating));
        setUserRating(reviewForm.rating);
      }

      setReviewForm({ name: '', rating: 0, text: '' });
      setShowReviewForm(false);
      if (migrated) {
        toast.success('Review submitted — we moved it out of the name box for you.');
      } else {
        toast.success('Review submitted!');
      }
    } catch {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Bring the form into view when it opens. On a phone the soft keyboard can
  // otherwise cover the field the customer is trying to type into.
  useEffect(() => {
    if (!showReviewForm) return;
    const timer = window.setTimeout(() => {
      reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [showReviewForm]);

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return products
      .filter((entry) => entry.category === product.category && entry.id !== product.id)
      .slice(0, 5);
  }, [product, products]);

  const productMeta = product
    ? {
        title: `${product.name} - Buy Original ${product.category} in Nigeria | Cedokamall`,
        description: `${product.description.slice(0, 140)}${product.description.length > 140 ? '...' : ''}`,
        keywords: [
          product.name,
          product.category,
          `${product.category} Nigeria`,
          `${product.seller} Nigeria`,
          'original electrical equipment',
          'gadgets with warranty',
        ],
        image: product.image,
        url: `${SEO_CONFIG.siteUrl}/product/${product.id}`,
        type: 'product' as const,
      }
    : {
        title: 'Product Not Found - Cedokamall',
        description:
          'The requested product could not be found. Browse more electricals and gadgets on Cedokamall.',
        keywords: ['product not found', 'Cedokamall', 'electrical equipment Nigeria'],
        url: `${SEO_CONFIG.siteUrl}/shop`,
        type: 'website' as const,
        robots: 'noindex, follow',
      };

  useSEO(productMeta);

  useStructuredData(
    product
      ? [
          getBreadcrumbSchema([
            { name: 'Home', url: SEO_CONFIG.siteUrl },
            { name: 'Shop', url: `${SEO_CONFIG.siteUrl}/shop` },
            {
              name: product.category,
              url: `${SEO_CONFIG.siteUrl}/shop?category=${product.category
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')}`,
            },
            { name: product.name, url: `${SEO_CONFIG.siteUrl}/product/${product.id}` },
          ]),
          getProductSchema({
            ...product,
            // The live store is what the customer can see, so it is what the
            // structured data must agree with. Google penalises an aggregate
            // rating that does not match the reviews on the page.
            rating: storeReviews.length > 0 ? avgRating : product.rating,
            reviews: totalReviewCount > 0 ? totalReviewCount : product.reviews,
            // Every review the customer can see is emitted, not just the first
            // ten, so the page carries its full review content for search.
            reviewList: storeReviews.map((review) => ({
              author: review.name,
              rating: review.rating,
              text: review.text,
              date: review.created_at,
            })),
          }),
        ]
      : getBreadcrumbSchema([
          { name: 'Home', url: SEO_CONFIG.siteUrl },
          { name: 'Shop', url: `${SEO_CONFIG.siteUrl}/shop` },
        ])
  );

  if (isLoading || (!hasLoaded && !product)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 pb-32 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <h1 className="font-display text-2xl font-bold">Loading product</h1>
          <p className="mt-2 text-muted-foreground">Please wait while we load the latest product details.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 pb-32 text-center">
          <h1 className="font-display text-2xl font-bold">Product not found</h1>
          <Link to={backTo || "/shop"} className="mt-4 block text-primary underline">
            Back to shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const gallery = product.images && product.images.length > 0 ? product.images : [product.image];
  const currentImage = gallery[activeImage] || product.image || fallbackImage;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const productSpecs = Object.entries(product.specs || {}).filter(
    ([key, value]) =>
      key.toLowerCase() !== 'features' &&
      typeof value === 'string' &&
      value.trim().length > 0
  ) as [string, string][];
  const assuranceItems = [
    { icon: Truck, label: 'Delivery across Nigeria', description: 'Dispatched from our Lagos store to your address.' },
    {
      icon: Shield,
      label: 'Authenticity checked',
      description: 'Sourced from authorised suppliers and inspected before dispatch.',
    },
    ...(product.warranty
      ? [
          {
            icon: Shield,
            label: `Warranty: ${product.warranty}`,
            description: 'Covered as stated. Keep your receipt for any warranty claim.',
          },
        ]
      : []),
    {
      icon: RotateCcw,
      label: 'Returns & support',
      description: 'Reach our team on WhatsApp for eligible returns and after-sales help.',
    },
  ];

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      inStock: product.inStock,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-ivory">
      <Header />

        <div className="container py-6 pb-0 sm:pb-0">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy/40">
            <Link to="/" className="transition-colors hover:text-gold">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to={backTo || "/shop"} className="transition-colors hover:text-gold">
              Collections
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="max-w-[100px] sm:max-w-[200px] truncate text-navy">{product.name}</span>
          </nav>
          <Link
            to={backTo || `/shop?category=${product?.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || ''}`}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md border border-gold-antique/20 bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-navy shadow-sm transition-all hover:bg-navy hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Link>
        </div>
      </div>

      <div className="container pb-24 pt-2 sm:pb-32">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-square overflow-hidden rounded-[1.5rem] border border-gold-antique/10 bg-white shadow-premium group">
              <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
                {product.badge && (
                  <span className="rounded-full bg-navy px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold shadow-md">
                    {product.badge}
                  </span>
                )}
                {discount > 0 && (
                  <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-navy shadow-md">
                    Save {discount}%
                  </span>
                )}
              </div>
              <img
                src={getOptimizedImageUrl(currentImage, 1200)}
                srcSet={generateSrcSet(currentImage, [600, 1200, 1800])}
                sizes="(min-width: 1024px) 45vw, 100vw"
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.src = fallbackImage;
                }}
              />
            </div>

            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {gallery.map((image, index) => (
                  <button
                    key={`${product.id}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      'overflow-hidden rounded-2xl border-2 shadow-sm transition-all',
                      activeImage === index
                        ? 'scale-[1.02] border-gold'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    )}
                    aria-label={`Show product image ${index + 1}`}
                  >
                    <img
                      src={getOptimizedImageUrl(image, 300)}
                      alt={`${product.name} preview ${index + 1}`}
                      className="aspect-square h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <section className="overflow-hidden rounded-[1.75rem] border border-gold-antique/10 bg-white shadow-premium">
              <div className="border-b border-gold-antique/10 bg-white px-6 py-6 md:px-8">
                <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-navy/55">
                  <span className="break-words">{product.category}</span>
                  {product.sku && (
                    <>
                      <span className="h-1 w-1 shrink-0 rounded-full bg-gold" />
                      <span className="break-words">SKU {product.sku}</span>
                    </>
                  )}
                </div>

                <h1 className="max-w-3xl break-words font-serif text-3xl font-bold leading-tight text-navy md:text-5xl">
                  {product.name}
                </h1>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          'h-4 w-4',
                          index < Math.round(product.rating || 0) ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'
                        )}
                      />
                    ))}
                  </div>
                  <span className="break-words text-sm font-bold text-navy">{(product.rating || 0).toFixed(1)}</span>
                  <span className="break-words text-sm text-navy/45">{product.reviews || 0} verified reviews</span>
                </div>
              </div>

              <div className="space-y-6 px-6 py-6 md:px-8">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem] xl:items-start">
                  <div className="space-y-6 order-2 xl:order-1">
                    {product.features && product.features.length > 0 && (
                      <div className="overflow-hidden rounded-[1.5rem] border border-gold-antique/10 bg-white p-5 md:p-6">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-gold" aria-hidden="true" />
                          <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-navy">
                            Product Features
                          </h2>
                        </div>
                        <div className="mt-4 space-y-3">
                          {product.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 rounded-2xl bg-ivory/70 p-4"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                                <CheckCircle2 className="h-4 w-4 text-gold" aria-hidden="true" />
                              </div>
                              <p className="min-w-0 flex-1 break-words pt-2 text-[13px] leading-6 text-navy/70">
                                {feature}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {productSpecs.length > 0 && (
                      <div className="overflow-hidden rounded-[1.5rem] border border-gold-antique/10 bg-white p-5 md:p-6">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-gold" aria-hidden="true" />
                          <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-navy">
                            Product Details
                          </h2>
                        </div>
                        <div className="mt-4 space-y-3">
                          {productSpecs.map(([key, value]) => (
                            <div
                              key={key}
                              className="flex items-start gap-3 rounded-2xl bg-ivory/70 p-4"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                                <Tag className="h-4 w-4 text-gold" aria-hidden="true" />
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy/50">
                                  {key.replace(/_/g, ' ')}
                                </p>
                                <p className="mt-1 break-words text-[13px] leading-6 text-navy/70">
                                  {value}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {powerInfo && (
                      <div className="overflow-hidden rounded-[1.5rem] border border-gold-antique/10 bg-white p-5 md:p-6">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-gold" aria-hidden="true" />
                          <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-navy">
                            What can this power?
                          </h2>
                        </div>
                        <div className="mt-4 space-y-3">
                          {powerInfo.bullets.map((bullet, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 rounded-2xl bg-ivory/70 p-4"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                                <Zap className="h-4 w-4 text-gold" aria-hidden="true" />
                              </div>
                              <p className="min-w-0 flex-1 break-words pt-2 text-[13px] leading-6 text-navy/70">
                                {bullet}
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="mt-4 text-[12px] leading-5 text-navy/50">
                          Estimates are based on the listed specifications and typical appliance loads. For an exact
                          system size, use our{' '}
                          <Link to="/solar#solar-calculator" className="font-semibold text-gold hover:text-gold-antique">
                            energy calculator
                          </Link>{' '}
                          or message our team on WhatsApp.
                        </p>
                      </div>
                    )}

<div className="overflow-hidden rounded-[1.5rem] border border-gold-antique/10 bg-white p-5 md:p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gold" />
                      <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-navy">
                        Customer Reviews
                      </h2>
                      <span className="ml-auto text-xs text-navy/45">({totalReviewCount})</span>
                    </div>

                    {/* Offline / load-failure notice with retry */}
                    {(isOffline || reviewError) && (
                      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3">
                        <p className="min-w-0 flex-1 text-[12px] leading-5 text-amber-900">
                          {isOffline
                            ? "You're offline. Showing saved reviews; new ones will be kept on this device."
                            : reviewError}
                        </p>
                        <button
                          type="button"
                          onClick={() => productKey && fetchReviews(productKey, true)}
                          disabled={isOffline || isLoadingReviews}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <RotateCcw
                            className={cn('h-3.5 w-3.5', isLoadingReviews && 'animate-spin')}
                            aria-hidden="true"
                          />
                          {isLoadingReviews ? 'Retrying' : 'Retry'}
                        </button>
                      </div>
                    )}

                    {/* Rating Breakdown */}
                    {totalReviewCount > 0 ? (
                      <div className="mb-6 rounded-2xl border border-gold-antique/10 bg-ivory/50 p-4">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-navy">{avgRating}</p>
                            <div className="flex items-center gap-0.5 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    'h-3.5 w-3.5',
                                    star <= Math.round(avgRating)
                                      ? 'fill-gold text-gold'
                                      : 'fill-gray-200 text-gray-200'
                                  )}
                                />
                              ))}
                            </div>
                            <p className="mt-1 text-[11px] text-navy/50">
                              {totalReviewCount} {totalReviewCount === 1 ? 'review' : 'reviews'}
                            </p>
                          </div>
                          <div className="flex-1 space-y-1.5">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = ratingBreakdown[5 - star] || 0;
                              const pct = totalReviewCount > 0 ? Math.round((count / totalReviewCount) * 100) : 0;
                              return (
                                <div key={star} className="flex items-center gap-2">
                                  <span className="w-2 text-[10px] font-bold text-navy/55">{star}</span>
                                  <Star className="h-2.5 w-2.5 fill-gold text-gold" />
                                  <div className="flex-1 h-2 overflow-hidden rounded-full bg-navy/8">
                                    <div
                                      className="h-full rounded-full bg-gold transition-all duration-300"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="w-8 text-right text-[10px] text-navy/45 tabular-nums">{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : product.reviews ? (
                      <div className="mb-6 rounded-2xl border border-gold-antique/10 bg-ivory/50 p-4 text-center">
                        <div className="mb-2 flex items-center justify-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'h-4 w-4',
                                star <= Math.round(product.rating || 0)
                                  ? 'fill-gold text-gold'
                                  : 'fill-gray-200 text-gray-200'
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-[13px] font-bold text-navy">
                          {(product.rating || 0).toFixed(1)} from {product.reviews} verified ratings
                        </p>
                        <p className="mt-1 text-[12px] text-navy/50">
                          Share your experience to help other shoppers — your review appears here.
                        </p>
                      </div>
                    ) : null}

                    {/* Review List */}
                    {sortedReviews.length > 0 ? (
                      <>
                        {/* Sort Bar */}
                        <div className="mb-4 flex items-center justify-between border-b border-gold-antique/10 pb-3">
                          <div className="flex items-center gap-2">
                            <Filter className="h-3.5 w-3.5 text-navy/40" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-navy/45">
                              Sort by:
                            </span>
                          </div>
                          <select
                            value={reviewSort}
                            onChange={(e) => setReviewSort(e.target.value as SortOption)}
                            className="rounded-lg border border-gold-antique/10 bg-white px-2 py-1 text-[11px] font-bold text-navy focus:border-gold focus:outline-none"
                          >
                            <option value="newest">Newest first</option>
                            <option value="highest">Highest rated</option>
                            <option value="lowest">Lowest rated</option>
                            <option value="helpful">Most helpful</option>
                          </select>
                        </div>

                        {/* Reviews */}
                        <div className="mb-6 max-h-[400px] space-y-4 overflow-y-auto">
                          {sortedReviews.map((review) => (
                            <div
                              key={review.id}
                              className="overflow-hidden rounded-2xl border border-gold-antique/10 bg-ivory/50 p-4"
                            >
                              <div className="mb-2 flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10">
                                    <User className="h-4 w-4 text-gold" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="truncate text-[13px] font-bold text-navy">
                                        {review.name}
                                      </p>
                                      {review.is_verified && (
                                        <span className="flex items-center gap-0.5 rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gold">
                                          <BadgeCheck className="h-2.5 w-2.5" />
                                          Verified
                                        </span>
                                      )}
                                    </div>
                                    <p className="flex items-center gap-1 text-[10px] text-navy/40">
                                      <Clock className="h-2.5 w-2.5" />
                                      {new Date(review.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex shrink-0">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={cn(
                                        'h-3 w-3',
                                        star <= review.rating
                                          ? 'fill-gold text-gold'
                                          : 'fill-gray-200 text-gray-200'
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="break-words text-[13px] leading-6 text-navy/74">{review.text}</p>
                              <div className="mt-3 border-t border-gold-antique/10 pt-2">
                                <button
                                  type="button"
                                  onClick={() => productKey && markHelpful(productKey, review.id)}
                                  className="group flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-navy/35 transition-colors hover:text-gold"
                                >
                                  <ThumbsUp className="h-3 w-3 transition-transform group-hover:scale-110" />
                                  Helpful{review.helpful_count > 0 ? ` (${review.helpful_count})` : ''}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : totalReviewCount === 0 && !product.reviews ? (
                      <p className="mb-6 text-center text-[13px] text-navy/50">
                        No reviews yet. Be the first to review this product!
                      </p>
                    ) : null}

                    {/* Write a Review Toggle */}
                    {!showReviewForm ? (
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gold-antique/20 bg-ivory/30 py-3 text-xs font-bold uppercase tracking-widest text-navy/50 transition-all hover:border-gold hover:text-gold"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Write a Review
                      </button>
                    ) : (
                      <div ref={reviewFormRef} className="space-y-4 scroll-mt-28">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy/55">
                            Your Review
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowReviewForm(false)}
                            aria-label="Close review form"
                            className="text-navy/30 hover:text-navy transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Rating — required */}
                        <div>
                          <span
                            id="review-rating-label"
                            className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-navy/55"
                          >
                            Your rating <span className="text-gold">*</span>
                          </span>
                          <div
                            role="radiogroup"
                            aria-labelledby="review-rating-label"
                            className="flex flex-wrap items-center gap-1"
                          >
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                role="radio"
                                aria-checked={reviewForm.rating === star}
                                aria-label={`${star} star${star > 1 ? 's' : ''}`}
                                onClick={() =>
                                  setReviewForm((prev) => ({ ...prev, rating: star }))
                                }
                                className="press rounded-lg p-1"
                              >
                                <Star
                                  className={cn(
                                    'h-6 w-6',
                                    star <= reviewForm.rating
                                      ? 'fill-gold text-gold'
                                      : 'fill-gray-200 text-gray-200'
                                  )}
                                />
                              </button>
                            ))}
                            <span className="ml-1 text-[11px] text-navy/45">
                              {reviewForm.rating > 0
                                ? `${reviewForm.rating} of 5`
                                : 'Tap a star'}
                            </span>
                          </div>
                        </div>

                        {/* Review body — required, and the primary field.
                            It sits above the name box on purpose: the name is
                            optional, so the review must be the thing the eye
                            lands on first. */}
                        <div>
                          <label
                            htmlFor="review-body"
                            className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-navy/55"
                          >
                            Your review <span className="text-gold">*</span>
                          </label>
                          <textarea
                            id="review-body"
                            name="review-body"
                            placeholder="Share what you liked or what could be better..."
                            value={reviewForm.text}
                            onChange={(e) => {
                              if (e.target.value.length > MAX_REVIEW_TEXT_LENGTH) return;
                              setReviewForm((prev) => ({ ...prev, text: e.target.value }));
                            }}
                            rows={4}
                            maxLength={MAX_REVIEW_TEXT_LENGTH}
                            className="w-full resize-y rounded-2xl border border-gold-antique/10 bg-ivory/50 px-4 py-3 text-base leading-6 text-navy placeholder:text-navy/30 focus:border-gold focus:outline-none sm:text-sm"
                          />
                        </div>

                        {/* Name — optional, and deliberately last and secondary */}
                        <div>
                          <label
                            htmlFor="review-name"
                            className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-navy/55"
                          >
                            Your name <span className="normal-case tracking-normal text-navy/35">(optional)</span>
                          </label>
                          <input
                            id="review-name"
                            name="reviewer-name"
                            type="text"
                            autoComplete="name"
                            enterKeyHint="done"
                            placeholder="e.g. Ade Okafor"
                            value={reviewForm.name}
                            onChange={(e) =>
                              setReviewForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="w-full rounded-2xl border border-gold-antique/10 bg-ivory/50 px-4 py-3 text-base leading-6 text-navy placeholder:text-navy/30 focus:border-gold focus:outline-none sm:text-sm"
                          />
                          {nameLooksLikeReview && (
                            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-amber-700">
                              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              <span>
                                That reads like a review rather than a name. We will move it into
                                your review automatically.
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[10px] text-navy/40">
                            {reviewForm.text.length}/{MAX_REVIEW_TEXT_LENGTH}
                          </p>
                          {isOffline && (
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                              Offline — saved on this device
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleSubmitReview}
                          disabled={
                            isSubmittingReview ||
                            (!reviewForm.text.trim() && !reviewForm.name.trim()) ||
                            reviewForm.rating === 0
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gold py-3 text-xs font-bold uppercase tracking-widest text-navy transition-all hover:bg-gold-antique hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" />
                          {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </div>
                    )}
                  </div>
                  </div>

                  <aside className="space-y-3 order-1 xl:order-2">
                  <div className="overflow-hidden rounded-[1.5rem] border border-gold-antique/10 bg-navy p-3 text-champagne shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-champagne/70">
                      Today&apos;s Price
                    </p>
                    <div className="mt-2 flex flex-wrap items-end gap-2">
                      <span className="break-words text-2xl font-bold tracking-tight text-gold">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-base text-champagne/50 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    {product.originalPrice && discount > 0 && (
                      <p className="mt-1 break-words text-xs text-champagne/75">
                        You save {formatPrice(product.originalPrice - product.price)} today.
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5">
                      <div
                        className={cn(
                          'h-3 w-3 rounded-full shadow-inner',
                          product.inStock > 10 ? 'bg-gold' : 'bg-red-500 animate-pulse'
                        )}
                      />
                    <span className="break-words text-[11px] font-bold uppercase tracking-[0.18em] text-champagne/80 md:text-xs">
                      {product.inStock > 10 ? 'Available for Immediate Delivery' : `Only ${product.inStock} units left`}
                    </span>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {product.outOfStock ? (
                        <div className="flex items-center justify-center gap-2 rounded-2xl bg-red-50 border border-red-200 py-3 text-xs font-bold uppercase tracking-widest text-red-700">
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          Out of Stock
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleAddToCart}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-gold py-3 text-xs font-bold uppercase tracking-widest text-navy transition-all duration-300 hover:bg-gold-antique hover:text-white"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Add to cart
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleAddToCart();
                              navigate('/cart');
                            }}
                            className="flex items-center justify-center gap-2 rounded-2xl border border-gold/40 bg-transparent py-3 text-xs font-bold uppercase tracking-widest text-gold transition-all duration-300 hover:bg-gold hover:text-navy"
                          >
                            Buy now
                          </button>
                        </>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-5 text-[10px] font-bold uppercase tracking-[0.16em] text-champagne/60 md:text-[11px]">
                      <button
                        type="button"
                        onClick={toggleWishlist}
                        className={cn(
                          "group flex items-center gap-2 transition-colors",
                          isWishlisted ? "text-gold font-bold" : "hover:text-gold"
                        )}
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart className={cn("h-4 w-4 transition-transform group-hover:scale-110", isWishlisted && "fill-gold text-gold")} />
                        {isWishlisted ? 'Saved' : 'Wishlist'}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const shareData = {
                            title: product.name,
                            text: `Check out ${product.name} on Cedokamall - ₦${product.price.toLocaleString()}`,
                            url: `${window.location.origin}/product/${product.id}`,
                          };
                          try {
                            if (navigator.share) {
                              await navigator.share(shareData);
                            } else {
                              await navigator.clipboard.writeText(shareData.url);
                              toast.success('Product link copied to clipboard!');
                            }
                          } catch {
                            await navigator.clipboard.writeText(shareData.url);
                            toast.success('Product link copied to clipboard!');
                          }
                        }}
                        className="group flex items-center gap-2 transition-colors hover:text-gold"
                      >
                        <Share2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                        Share
                      </button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[1.5rem] border border-gold-antique/10 bg-white p-5 md:p-6">
                    <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-navy">
                      Delivery & Assurance
                    </h2>
                    <div className="mt-4 space-y-3">
                      {assuranceItems.map(({ icon: Icon, label, description }) => (
                        <div key={label} className="flex items-start gap-3 rounded-2xl bg-ivory/70 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                            <Icon className="h-4 w-4 text-gold" />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-navy md:text-sm">{label}</p>
                            <p className="mt-1 break-words text-[13px] leading-6 text-navy/60 md:text-sm">{description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[1.5rem] border border-gold-antique/10 bg-white p-5 md:p-6">
                    <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-navy">
                      Purchase Snapshot
                    </h2>
                    <dl className="mt-4 space-y-4 text-[13px] md:text-sm">
                      {product.warranty && (
                        <div className="flex items-center justify-between gap-4 border-b border-gold-antique/10 pb-3">
                          <dt className="text-navy/55">Warranty</dt>
                          <dd className="break-words font-semibold text-navy">{product.warranty}</dd>
                        </div>
                      )}
                      {product.color && (
                        <div className="flex items-center justify-between gap-4 border-b border-gold-antique/10 pb-3">
                          <dt className="text-navy/55">Color</dt>
                          <dd className="break-words font-semibold text-navy">{product.color}</dd>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-navy/55">Category</dt>
                        <dd className="break-words font-semibold text-navy">{product.category}</dd>
                      </div>
                    </dl>
                  </div>
                  </aside>
                </div>

                <div className="overflow-hidden rounded-[1.5rem] border border-gold/20 bg-gold/5 p-5 md:p-6">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    <div>
                      <p className="text-sm font-bold text-navy">
                        Original Product Guaranteed by {product.seller}
                      </p>
                      <p className="mt-1 text-[13px] leading-6 text-navy/60">
                        Distributed by Cedoka Global
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[1.5rem] border border-gold-antique/10 bg-ivory/70 p-5 md:p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-navy/55">
                    Product Overview
                  </p>
                  <div className="mt-4 rounded-2xl bg-white/80 p-4 md:p-5">
                    <div className="space-y-3">
                      {product.description.split('\n').filter(Boolean).map((paragraph, index) => (
                        <p key={index} className="break-words text-[13px] leading-6 text-navy/74 md:text-sm">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <div className="mb-12 flex items-center justify-between border-b border-gold-antique/10 pb-6">
              <h2 className="font-serif text-3xl font-bold text-navy">You may also like</h2>
              <Link to="/shop" className="text-xs font-bold uppercase tracking-widest text-gold hover:text-gold-antique">
                Discover More
              </Link>
            </div>
            <div className="fade-rise grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {relatedProducts.map((entry) => (
                <ProductCard key={entry.id} product={entry} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Mobile Add-to-Cart Bar */}
      {!product.outOfStock && (
        <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-gold-antique/20 bg-navy px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] kb-safe md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-champagne/60">
                {product.category}
              </p>
              <p className="truncate text-sm font-bold text-champagne">{product.name}</p>
              <p className="text-lg font-bold text-gold">{formatPrice(product.price)}</p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-gold px-5 py-3 text-xs font-bold uppercase tracking-widest text-navy transition-all hover:bg-gold-antique hover:text-white active:scale-95"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductPage;
