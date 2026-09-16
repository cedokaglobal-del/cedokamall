import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  ChevronUp,
  Clock,
  Filter,
  Heart,
  MessageSquare,
  RotateCcw,
  Send,
  Share2,
  Shield,
  ShoppingCart,
  ThumbsUp,
  Zap,
  Star,
  Truck,
  User,
  X,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getBreadcrumbSchema, getProductSchema, SEO_CONFIG } from '@/config/seo';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useProductStore } from '@/store/productStore';
import { useReviewStore, subscribeToProductReviews } from '@/store/reviewStore';
import { toast } from 'sonner';
import { getOptimizedImageUrl, generateSrcSet, generateSizes } from '@/utils/performance';
import { RENEWABLE_ENERGY_CATEGORIES } from '@/data/catalog';
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

  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);
  const powerInfo = useMemo(() => (product ? getPowerGuidance(product) : null), [product]);
  const [activeImage, setActiveImage] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRating, setIsRating] = useState(false);

  // Hooks for reviews/rating - must be before early returns
  const [userRating, setUserRating] = useState<number>(() => {
    if (!id) return 0;
    try {
      return Number(localStorage.getItem(`cedoka_rating_${id}`)) || 0;
    } catch { return 0; }
  });

  const [reviewSort, setReviewSort] = useState<SortOption>('newest');
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 0, text: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Server-persisted reviews
  const storeReviews = useReviewStore((s) => s.reviewsByProduct[id || ''] || []);
  const isLoadingReviews = useReviewStore((s) => s.loadingByProduct[id || ''] || false);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);
  const addReview = useReviewStore((s) => s.addReview);
  const markHelpful = useReviewStore((s) => s.markHelpful);

  useEffect(() => {
    setActiveImage(0);
  }, [product?.id]);

  // Fetch reviews from server + subscribe to realtime inserts
  useEffect(() => {
    if (!id) return;
    fetchReviews(id, true);
    const unsub = subscribeToProductReviews(id);
    return unsub;
  }, [id, fetchReviews]);

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
      localStorage.setItem(`cedoka_rating_${id}`, String(rating));
      setUserRating(rating);
      toast.success('Thank you for your rating!');
    } catch {
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setIsRating(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.text.trim() || reviewForm.rating === 0 || !id || !product) return;
    setIsSubmittingReview(true);
    try {
      // Save review text to server
      await addReview(id, {
        name: reviewForm.name.trim() || 'Anonymous',
        rating: reviewForm.rating,
        text: reviewForm.text.trim(),
      });

      // Update aggregate rating on the product
      if (userRating === 0) {
        await rateProduct(product.id, reviewForm.rating);
        localStorage.setItem(`cedoka_rating_${id}`, String(reviewForm.rating));
        setUserRating(reviewForm.rating);
      }

      setReviewForm({ name: '', rating: 0, text: '' });
      setShowReviewForm(false);
      toast.success('Review submitted!');
    } catch {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
            reviewList: storeReviews.slice(0, 10).map((review) => ({
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
  );
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
                        <div className="mb-5 flex items-center gap-2">
                          <Star className="h-4 w-4 text-gold" />
                          <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-navy">
                            Product Features
                          </h2>
                        </div>
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {product.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex min-w-0 items-start gap-3 rounded-2xl border border-gold-antique/10 bg-ivory/45 px-4 py-3.5 md:px-5"
                            >
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                              <span className="min-w-0 break-words text-[13px] leading-6 text-navy/76 md:text-sm">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {productSpecs.length > 0 && (
                      <div className="overflow-hidden rounded-[1.5rem] border border-gold-antique/10 bg-white p-5 md:p-6">
                        <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-navy">
                          Product Details
                        </h2>
                        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                          {productSpecs.map(([key, value]) => (
                            <div key={key} className="rounded-2xl border border-gold-antique/10 bg-ivory/50 p-4">
                              <dt className="text-[11px] font-bold uppercase tracking-[0.18em] text-navy/50">
                                {key.replace(/_/g, ' ')}
                              </dt>
                              <dd className="mt-2 break-words text-[13px] leading-6 text-navy/78 md:text-sm">
                                {value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}

                    {powerInfo && (
                      <div className="overflow-hidden rounded-[1.5rem] border border-gold-antique/10 bg-white p-5 md:p-6">
                        <div className="mb-5 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-gold" />
                          <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-navy">
                            What can this power?
                          </h2>
                        </div>
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {powerInfo.bullets.map((bullet, index) => (
                            <li
                              key={index}
                              className="flex min-w-0 items-start gap-3 rounded-2xl border border-gold-antique/10 bg-ivory/45 px-4 py-3.5 md:px-5"
                            >
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                              <span className="min-w-0 break-words text-[13px] leading-6 text-navy/76 md:text-sm">
                                {bullet}
                              </span>
                            </li>
                          ))}
                        </ul>
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
                                  onClick={() => id && markHelpful(id, review.id)}
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
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy/55">
                            Your Review
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowReviewForm(false)}
                            className="text-navy/30 hover:text-navy transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Your name (optional)"
                          value={reviewForm.name}
                          onChange={(e) =>
                            setReviewForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="w-full rounded-2xl border border-gold-antique/10 bg-ivory/50 px-4 py-3 text-sm text-navy placeholder:text-navy/30 focus:border-gold focus:outline-none"
                        />
                        <div className="flex items-center gap-1">
                          <span className="mr-2 text-xs font-bold uppercase tracking-[0.18em] text-navy/55">
                            Your rating:
                          </span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setReviewForm((prev) => ({ ...prev, rating: star }))
                              }
                              className="p-0.5"
                            >
                              <Star
                                className={cn(
                                  'h-5 w-5',
                                  star <= reviewForm.rating
                                    ? 'fill-gold text-gold'
                                    : 'fill-gray-200 text-gray-200'
                                )}
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          placeholder="Write your review..."
                          value={reviewForm.text}
                          onChange={(e) =>
                            setReviewForm((prev) => ({ ...prev, text: e.target.value }))
                          }
                          rows={3}
                          className="w-full resize-none rounded-2xl border border-gold-antique/10 bg-ivory/50 px-4 py-3 text-sm text-navy placeholder:text-navy/30 focus:border-gold focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSubmitReview}
                          disabled={
                            isSubmittingReview ||
                            !reviewForm.text.trim() ||
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
                      <button type="button" className="group flex items-center gap-2 transition-colors hover:text-gold">
                        <Heart className="h-4 w-4 transition-transform group-hover:scale-110" />
                        Wishlist
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
            <div className="grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {relatedProducts.map((entry) => (
                <ProductCard key={entry.id} product={entry} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Mobile Add-to-Cart Bar */}
      {!product.outOfStock && (
        <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-gold-antique/20 bg-navy px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] md:hidden">
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
