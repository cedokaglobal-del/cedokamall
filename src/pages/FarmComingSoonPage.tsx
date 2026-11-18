import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Sprout } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { getBreadcrumbSchema, SEO_CONFIG } from '@/config/seo';

/**
 * Temporary public state for the Farm section.
 *
 * The original catalogue (FarmsPage.tsx) is intentionally left untouched so
 * this page can be removed and the /farms route restored when the section is
 * ready to launch.
 */
const FarmComingSoonPage = () => {
  const [imageFailed, setImageFailed] = useState(false);

  useSEO({
    title: 'Farm Solutions Coming Soon | Cedokamall',
    description:
      'We are working on bringing you innovative agricultural solutions and opportunities. Our Farm section is currently under development. Please check back soon for updates.',
    keywords: ['farm solutions Nigeria', 'agricultural solutions', 'Cedoka Farms', 'coming soon'],
    url: `${SEO_CONFIG.siteUrl}/farms`,
    type: 'website',
  });

  useStructuredData([
    getBreadcrumbSchema([
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Farm Solutions', url: `${SEO_CONFIG.siteUrl}/farms` },
    ]),
  ]);

  return (
    <main className="min-h-screen bg-ivory">
      <Header />

      <div className="container py-12 sm:py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Visual */}
          <div className="order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-md border border-gold-antique/15 bg-white shadow-premium">
              {imageFailed ? (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-b from-[#eef3e8] to-[#dfe9d4]">
                  <Sprout className="h-24 w-24 text-[#7b9b5a]/50" aria-hidden="true" />
                </div>
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80"
                  alt="Green agricultural farmland at sunrise"
                  className="aspect-[4/3] w-full object-cover"
                  loading="eager"
                  decoding="async"
                  onError={() => setImageFailed(true)}
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-navy/90 px-5 py-4 sm:px-6">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
                  <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
                  Cultivating what comes next
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-navy">
              <Sprout className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              Under development
            </span>

            <h1 className="mt-5 font-serif text-3xl font-bold leading-tight text-navy sm:text-4xl lg:text-5xl">
              Farm Solutions Coming Soon
            </h1>
            <div className="mt-4 h-1 w-16 bg-gold" />

            <p className="mt-5 max-w-xl text-sm leading-7 text-navy/70 sm:text-base">
              We are working on bringing you innovative agricultural solutions and opportunities. Our Farm section is
              currently under development. Please check back soon for updates.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/solar"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-navy px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-gold shadow-md transition-colors hover:bg-gold hover:text-navy"
              >
                Explore Our Other Services
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gold-antique/30 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-navy transition-colors hover:border-gold hover:bg-gold/5"
              >
                Contact Cedoka
              </Link>
            </div>

            <p className="mt-8 border-t border-gold-antique/15 pt-5 text-xs text-navy/50">
              In the meantime, our solar, electronics and general marketplace sections remain fully available.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default FarmComingSoonPage;
