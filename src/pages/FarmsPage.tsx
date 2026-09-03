import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sprout, MessageSquare, Leaf } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProductStore } from '@/store/productStore';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { getBreadcrumbSchema, getCollectionPageSchema, SEO_CONFIG } from '@/config/seo';
import { MAJOR_CATEGORY_MAP, FARM_CATEGORIES } from '@/data/catalog';

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const FarmsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const products = useProductStore((s) => s.products);
  const isLoading = useProductStore((s) => s.isLoading);
  const hasLoaded = useProductStore((s) => s.hasLoaded);

  const farms = MAJOR_CATEGORY_MAP['farms'];
  const urlCategory = searchParams.get('category') || 'all';

  const activeCategory = useMemo(() => {
    if (urlCategory === 'all') return null;
    return farms.subcategories.find((sub) => sub.slug === urlCategory)?.name ?? null;
  }, [urlCategory, farms.subcategories]);

  const farmProducts = useMemo(() => {
    return products.filter((p) => FARM_CATEGORIES.includes(p.category));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return farmProducts;
    return farmProducts.filter((p) => slugify(p.category) === slugify(activeCategory));
  }, [farmProducts, activeCategory]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') params.delete('category');
    else params.set('category', value);
    setSearchParams(params, { replace: true });
  };

  useSEO({
    title: 'Farms - Fresh Produce, Agricultural Products & Equipment | Cedokamall',
    description:
      'Shop farm produce, agricultural products, equipment and supplies on Cedokamall. Browse by category and contact us for seasonal and bulk availability across Nigeria.',
    keywords: [
      'farm produce Nigeria',
      'agricultural products Nigeria',
      'farm equipment Nigeria',
      'farm supplies Nigeria',
      'buy farm products online Nigeria',
    ],
    url: `${SEO_CONFIG.siteUrl}/farms`,
    type: 'website',
  });

  useStructuredData([
    getBreadcrumbSchema([
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Farms', url: `${SEO_CONFIG.siteUrl}/farms` },
    ]),
    getCollectionPageSchema({
      name: 'Farms - Cedokamall',
      description: 'Farm produce, agricultural products, equipment and supplies.',
      url: `${SEO_CONFIG.siteUrl}/farms`,
      itemCount: filteredProducts.length,
    }),
  ]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-ivory">
      <Header />

      <div className="container min-w-0 py-6 pb-28 sm:py-12">
        {/* Title + Subcategory Tabs */}
        <div className="mb-8 flex min-w-0 flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
          <div className="shrink-0">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-navy">Farms</h1>
            <div className="mt-2 h-1 w-16 bg-gold" />
          </div>
          <div className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-2 no-scrollbar md:max-w-[70%]">
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className={`flex-shrink-0 whitespace-nowrap rounded-md px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all touch-manipulation ${
                urlCategory === 'all' ? 'bg-gold text-navy' : 'bg-white text-navy/60 hover:text-navy'
              }`}
            >
              All
            </button>
            {farms.subcategories.map((sub) => (
              <button
                key={sub.slug}
                type="button"
                onClick={() => handleTabChange(sub.slug)}
                className={`flex-shrink-0 whitespace-nowrap rounded-md px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all touch-manipulation ${
                  urlCategory === sub.slug ? 'bg-gold text-navy' : 'bg-white text-navy/60 hover:text-navy'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory info cards */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {farms.subcategories.map((sub) => (
            <button
              key={sub.slug}
              type="button"
              onClick={() => handleTabChange(sub.slug)}
              className={`group flex flex-col items-center text-center gap-3 rounded-lg border p-4 sm:p-5 text-left transition-all touch-manipulation ${
                urlCategory === sub.slug
                  ? 'border-gold bg-gold/5'
                  : 'border-gold-antique/10 bg-white hover:border-gold/30'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory">
                <Leaf className="h-5 w-5 text-gold" />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-bold text-navy">{sub.name}</p>
                <p className="mt-0.5 text-[11px] sm:text-xs leading-4 text-navy/50">
                  Browse {sub.name.toLowerCase()} on Cedokamall.
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy">
            {activeCategory ? activeCategory : 'Farm Products'}
          </h2>
        </div>

        {isLoading && products.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gold/10 border-t-gold" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gold-antique/10 bg-white py-12 sm:py-16 text-center px-4">
            <Sprout className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gold/30" />
            <p className="mt-3 font-serif text-xl sm:text-2xl font-bold text-navy">Farm listings are being prepared</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-navy/55">
              We are adding farm produce, equipment and supplies to this section. In the meantime, tell us
              what you need and our team will help with seasonal and bulk availability.
            </p>
            <a
              href="https://wa.me/2349128817136"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-navy transition-all hover:bg-gold-antique hover:text-white touch-manipulation"
            >
              <MessageSquare className="h-4 w-4" />
              Ask about farm products
            </a>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default FarmsPage;
