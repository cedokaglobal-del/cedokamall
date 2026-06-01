import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Store } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useProductStore } from '@/store/productStore';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { getBreadcrumbSchema, SEO_CONFIG } from '@/config/seo';

const BrandsPage = () => {
  const products = useProductStore((s) => s.products);
  const isLoading = useProductStore((s) => s.isLoading);
  const hasLoaded = useProductStore((s) => s.hasLoaded);

  const brands = useMemo(() => {
    const brandMap = new Map<string, { name: string; count: number }>();
    products.forEach((p) => {
      const seller = p.seller?.trim();
      if (!seller) return;
      const key = seller.toLowerCase();
      const existing = brandMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        brandMap.set(key, { name: seller, count: 1 });
      }
    });
    return Array.from(brandMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  useSEO({
    title: 'All Brands - Shop Original Electrical & Gadget Brands | Cedokamall',
    description: 'Browse all original brands available at Cedokamall. Shop LG, Hisense, Samsung and more trusted brands with warranties and nationwide delivery.',
    keywords: ['electrical brands Nigeria', 'gadget brands', 'LG Nigeria', 'Hisense Nigeria', 'Cedokamall brands'],
    url: `${SEO_CONFIG.siteUrl}/brands`,
    type: 'website',
  });

  useStructuredData([
    getBreadcrumbSchema([
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Brands', url: `${SEO_CONFIG.siteUrl}/brands` },
    ]),
  ]);

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      <div className="container py-8 sm:py-12">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy/40 mb-8">
          <Link to="/" className="transition-colors hover:text-gold">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-navy">Brands</span>
        </nav>

        <div className="flex items-center gap-4 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
            <Store className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy">Shop by Brand</h1>
            <p className="text-sm text-navy/50 mt-1">Browse products from your favourite brands</p>
          </div>
        </div>

        <div className="mt-10">
          {isLoading && !hasLoaded ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gold-antique/10 bg-white p-6 text-center animate-pulse">
                  <div className="h-12 w-12 mx-auto rounded-full bg-ivory" />
                  <div className="h-4 w-24 mx-auto mt-4 bg-ivory rounded" />
                  <div className="h-3 w-16 mx-auto mt-2 bg-ivory rounded" />
                </div>
              ))}
            </div>
          ) : brands.length === 0 ? (
            <div className="rounded-xl border border-gold-antique/10 bg-white p-12 text-center">
              <Store className="mx-auto h-12 w-12 text-navy/20" />
              <p className="mt-4 font-serif text-xl font-bold text-navy">No Brands Available</p>
              <p className="mt-2 text-sm text-navy/50">Brands will appear once products are added to the catalog.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {brands.map((brand) => (
                <Link
                  key={brand.name}
                  to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                  className="group rounded-xl border border-gold-antique/10 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-ivory to-gold/10 transition-transform group-hover:scale-110">
                    <span className="text-2xl font-bold text-gold">{brand.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <h3 className="mt-4 font-serif text-base font-bold text-navy group-hover:text-gold transition-colors line-clamp-2">
                    {brand.name}
                  </h3>
                  <p className="mt-1 text-xs text-navy/40">{brand.count} product{brand.count !== 1 ? 's' : ''}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BrandsPage;
