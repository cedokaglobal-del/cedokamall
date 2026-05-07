import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getBreadcrumbSchema, getProductSchema, SEO_CONFIG } from '@/config/seo';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useProductStore } from '@/store/productStore';
import { toast } from 'sonner';
import { getOptimizedImageUrl, generateSrcSet, generateSizes } from '@/utils/performance';

const fallbackImage = '/image.png';
const formatPrice = (amount: number) => `\u20A6${amount.toLocaleString()}`;

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, products, isLoading, hasLoaded, rateProduct } = useProductStore();
  const addItem = useCartStore((state) => state.addItem);

  const product = useMemo(() => getProductById(id || ''), [getProductById, id]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setActiveImage(0);
  }, [product?.id]);

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
          getProductSchema(product),
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
        <div className="container py-20 text-center">
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
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Product not found</h1>
          <Link to="/shop" className="mt-4 block text-primary underline">
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
    { icon: Truck, label: 'Express Delivery', description: 'Fast dispatch across Nigeria.' },
    {
      icon: Shield,
      label: 'Authenticity Guaranteed',
      description: 'Original products from trusted retail sources.',
    },
    {
      icon: RotateCcw,
      label: '7-Day Return Service',
      description: 'Clear after-sales support for eligible orders.',
    },
  ];

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      inStock: product.inStock,
      quantity,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleRate = async (rating: number) => {
    if (isRating) return;
    setIsRating(true);
    try {
      await rateProduct(product.id, rating);
      toast.success('Thank you for your rating!');
    } catch {
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setIsRating(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory">
      <Header />

      <div className="container py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy/40">
            <Link to="/" className="transition-colors hover:text-gold">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/shop" className="transition-colors hover:text-gold">
              Collections
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="max-w-[200px] truncate text-navy">{product.name}</span>
          </nav>
          <Link
            to="/shop"
            className="flex items-center gap-2 rounded-md border border-gold-antique/20 bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-navy shadow-sm transition-all hover:bg-navy hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Link>
        </div>
      </div>

      <div className="container py-8">
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
                fetchpriority="high"
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
              <div className="border-b border-gold-antique/10 bg-gradient-to-r from-white via-white to-gold/10 px-6 py-6 md:px-8">
                <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-navy/55">
                  <span>{product.category}</span>
                  <span className="h-1 w-1 rounded-full bg-gold" />
                  <span>Sold by {product.seller}</span>
                  {product.sku && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-gold" />
                      <span>SKU {product.sku}</span>
                    </>
                  )}
                </div>

                <h1 className="max-w-3xl font-serif text-3xl font-bold leading-tight text-navy md:text-5xl">
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
                  <span className="text-sm font-bold text-navy">{(product.rating || 0).toFixed(1)}</span>
                  <span className="text-sm text-navy/45">{product.reviews || 0} verified reviews</span>
                </div>
              </div>

              <div className="space-y-6 px-6 py-6 md:px-8">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem] xl:items-start">
                  <div className="space-y-6">
                    {product.features && product.features.length > 0 && (
                      <div className="rounded-[1.5rem] border border-gold-antique/10 bg-white p-5 md:p-6">
                        <div className="mb-5 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-gold" />
                          <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-navy">
                            Product Features
                          </h2>
                        </div>
                        <ul className="grid gap-3">
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
                      <div className="rounded-[1.5rem] border border-gold-antique/10 bg-white p-5 md:p-6">
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

                    <div className="rounded-[1.5rem] border border-gold-antique/10 bg-white p-5 md:p-6">
                      <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-navy">
                        Rate This Product
                      </h2>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onMouseEnter={() => setHoverRating(rating)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => void handleRate(rating)}
                            disabled={isRating}
                            className="rounded-full border border-gold-antique/10 bg-ivory px-3 py-2 transition-colors hover:border-gold hover:bg-gold/10 disabled:cursor-not-allowed"
                            aria-label={`Rate ${product.name} ${rating} star${rating > 1 ? 's' : ''}`}
                          >
                            <Star
                              className={cn(
                                'h-5 w-5',
                                rating <= (hoverRating || Math.round(product.rating || 0))
                                  ? 'fill-gold text-gold'
                                  : 'fill-gray-200 text-gray-200'
                              )}
                            />
                          </button>
                        ))}
                        <span className="text-[13px] text-navy/55 md:text-sm">
                          {isRating ? 'Submitting your rating...' : 'Tap a star to share your feedback.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <aside className="space-y-4">
                  <div className="rounded-[1.5rem] border border-gold-antique/10 bg-navy p-5 text-champagne shadow-xl md:p-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-champagne/70">
                      Today&apos;s Price
                    </p>
                    <div className="mt-3 flex flex-wrap items-end gap-3">
                      <span className="text-4xl font-bold tracking-tight text-gold">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-base text-champagne/50 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    {product.originalPrice && discount > 0 && (
                      <p className="mt-2 text-sm text-champagne/75">
                        You save {formatPrice(product.originalPrice - product.price)} today.
                      </p>
                    )}

                    <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
                      <div
                        className={cn(
                          'h-3 w-3 rounded-full shadow-inner',
                          product.inStock > 10 ? 'bg-gold' : 'bg-red-500 animate-pulse'
                        )}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-champagne/80 md:text-xs">
                        {product.inStock > 10 ? 'Available for Immediate Delivery' : `Only ${product.inStock} units left`}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2">
                      <button
                        type="button"
                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-champagne transition-colors hover:bg-white/20"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-champagne/60">Quantity</p>
                        <p className="text-lg font-bold text-white">{quantity}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuantity((current) => Math.min(Math.max(product.inStock, 1), current + 1))}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-champagne transition-colors hover:bg-white/20"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-6 grid gap-3">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="flex items-center justify-center gap-3 rounded-2xl bg-gold py-4 text-sm font-bold uppercase tracking-widest text-navy transition-all duration-300 hover:bg-gold-antique hover:text-white"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Add to cart
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddToCart();
                          navigate('/cart');
                        }}
                        className="flex items-center justify-center gap-3 rounded-2xl border border-gold/40 bg-transparent py-4 text-sm font-bold uppercase tracking-widest text-gold transition-all duration-300 hover:bg-gold hover:text-navy"
                      >
                        Buy now
                      </button>
                    </div>

                    <div className="mt-5 flex items-center gap-5 text-[10px] font-bold uppercase tracking-[0.16em] text-champagne/60 md:text-[11px]">
                      <button type="button" className="group flex items-center gap-2 transition-colors hover:text-gold">
                        <Heart className="h-4 w-4 transition-transform group-hover:scale-110" />
                        Wishlist
                      </button>
                      <button type="button" className="group flex items-center gap-2 transition-colors hover:text-gold">
                        <Share2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                        Share
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-gold-antique/10 bg-white p-5 md:p-6">
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
                            <p className="mt-1 text-[13px] leading-6 text-navy/60 md:text-sm">{description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-gold-antique/10 bg-white p-5 md:p-6">
                    <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-navy">
                      Purchase Snapshot
                    </h2>
                    <dl className="mt-4 space-y-4 text-[13px] md:text-sm">
                      <div className="flex items-center justify-between gap-4 border-b border-gold-antique/10 pb-3">
                        <dt className="text-navy/55">Seller</dt>
                        <dd className="font-semibold text-navy">{product.seller}</dd>
                      </div>
                      {product.warranty && (
                        <div className="flex items-center justify-between gap-4 border-b border-gold-antique/10 pb-3">
                          <dt className="text-navy/55">Warranty</dt>
                          <dd className="font-semibold text-navy">{product.warranty}</dd>
                        </div>
                      )}
                      {product.color && (
                        <div className="flex items-center justify-between gap-4 border-b border-gold-antique/10 pb-3">
                          <dt className="text-navy/55">Color</dt>
                          <dd className="font-semibold text-navy">{product.color}</dd>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-navy/55">Category</dt>
                        <dd className="font-semibold text-navy">{product.category}</dd>
                      </div>
                    </dl>
                  </div>
                  </aside>
                </div>

                <div className="rounded-[1.5rem] border border-gold-antique/10 bg-ivory/70 p-5 md:p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-navy/55">
                    Product Overview
                  </p>
                  <div className="mt-4 rounded-2xl bg-white/80 p-4 md:p-5">
                    <p className="text-justify text-sm leading-7 text-navy/74 md:text-[15px]">
                      {product.description}
                    </p>
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
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {relatedProducts.map((entry) => (
                <ProductCard key={entry.id} product={entry} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductPage;
