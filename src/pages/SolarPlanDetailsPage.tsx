import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  Shield,
  Sun,
  Wrench,
  Zap,
  Battery,
  Cpu,
  Package,
  AlertTriangle,
  Share2,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SolarPlanProductCard from '@/components/SolarPlanProductCard';
import { useSolarPlanStore } from '@/store/solarPlanStore';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { getBreadcrumbSchema, SEO_CONFIG } from '@/config/seo';
import { toast } from 'sonner';

const SolarPlanDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const plans = useSolarPlanStore((s) => s.plans);
  const fetchPlans = useSolarPlanStore((s) => s.fetchPlans);
  const isLoading = useSolarPlanStore((s) => s.isLoading);

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    // A direct visit must always see the latest published version of the plan.
    void fetchPlans(true);
  }, [fetchPlans]);

  // Unpublished plans are removed from every public surface, including details.
  const plan = useMemo(() => {
    return plans.find((p) => p.id === id && p.isActive);
  }, [plans, id]);

  const relatedPlans = useMemo(() => {
    if (!plan) return [];
    return plans
      .filter((p) => p.id !== plan.id && p.isActive)
      .slice(0, 4);
  }, [plans, plan]);

  useSEO({
    title: plan ? `${plan.name} (${plan.capacity || plan.category}) | Cedokamall Solar` : 'Solar System Plan | Cedokamall',
    description: plan ? plan.description || `Complete ${plan.name} solar package in Nigeria. Includes inverter, lithium battery, solar panels and installation.` : 'Explore engineered solar power plans designed for homes and offices in Nigeria.',
    keywords: [plan?.name || 'Cedoka solar plan', 'solar system plan Nigeria', plan?.category || 'solar plans', 'solar installation Nigeria'],
    url: `${SEO_CONFIG.siteUrl}/solar-plans/${id || ''}`,
    type: 'product',
  });

  useStructuredData([
    getBreadcrumbSchema([
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Solar Energy', url: `${SEO_CONFIG.siteUrl}/solar` },
      { name: 'Solar Plans', url: `${SEO_CONFIG.siteUrl}/solar#solar-plans` },
      { name: plan?.name || 'Solar Plan', url: `${SEO_CONFIG.siteUrl}/solar-plans/${id || ''}` },
    ]),
    ...(plan ? [{
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: plan.name,
      description: plan.description,
      image: plan.image || `${SEO_CONFIG.siteUrl}/image.png`,
      category: plan.category,
      brand: { '@type': 'Brand', name: 'Cedoka Solar' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'NGN',
        price: plan.price > 0 ? plan.price : 0,
        availability: 'https://schema.org/InStock',
        url: `${SEO_CONFIG.siteUrl}/solar-plans/${plan.id}`,
      },
    }] : []),
  ]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: plan?.name || 'Cedoka Solar Plan',
          text: `Check out the ${plan?.name} on Cedokamall:`,
          url: window.location.href,
        });
      } catch {
        // User dismissed share
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Plan link copied to clipboard!');
      } catch {
        toast.error('Sharing is unavailable. Please copy the link from your browser.');
      }
    }
  };

  if (!plan && !isLoading) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="container py-24 text-center">
          <Sun className="mx-auto h-16 w-16 text-gold/40" />
          <h1 className="mt-4 font-serif text-3xl font-bold text-navy">Solar Plan Not Found</h1>
          <p className="mt-2 text-sm text-navy/60">
            The requested solar system plan may have been updated, relocated or unpublished.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              to="/solar#solar-plans"
              className="inline-flex items-center gap-2 rounded-md bg-navy px-6 py-3 text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold hover:text-navy transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Browse All Solar Plans
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!plan) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="container py-24 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          <p className="mt-4 text-sm font-semibold text-navy">Loading solar plan specifications…</p>
        </div>
        <Footer />
      </main>
    );
  }

  const quoteHref = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2349128817136'}?text=${encodeURIComponent(
    `Hello Cedokamall! I am interested in the ${plan.name} (${plan.category}${plan.capacity ? ` - ${plan.capacity}` : ''}).\nPrice: ${plan.price > 0 ? `₦${plan.price.toLocaleString()}` : 'Custom Quote'}\nPlease provide an official quotation and installation schedule.`
  )}`;

  return (
    <main className="min-h-screen bg-ivory">
      <Header />

      <div className="container py-6 pb-24 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-navy/60">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <Link to="/solar" className="hover:text-gold transition-colors">Solar Energy</Link>
          <span>/</span>
          <Link to="/solar#solar-plans" className="hover:text-gold transition-colors">Solar Plans</Link>
          <span>/</span>
          <span className="text-gold font-semibold">{plan.category}</span>
          <span>/</span>
          <span className="min-w-0 max-w-[160px] truncate text-navy font-bold sm:max-w-none">{plan.name}</span>
        </nav>

        {/* Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy/70 hover:text-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to listings
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-md border border-gold-antique/20 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-gold/10 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" /> Share Plan
          </button>
        </div>

        {/* Hero Section */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Plan Visual / Media */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 overflow-hidden rounded-2xl border border-gold-antique/20 bg-white shadow-premium">
              {plan.image && !imageFailed ? (
                <img
                  src={plan.image}
                  alt={plan.name}
                  className="aspect-[4/3] w-full object-cover"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-navy/5 text-navy/30">
                  <Sun className="h-20 w-20 text-gold/40" />
                </div>
              )}

              {/* Quick Specs Under Image */}
              <div className="grid grid-cols-2 divide-x divide-gold-antique/15 border-t border-gold-antique/15 bg-white p-4 text-center">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">System Class</p>
                  <p className="mt-0.5 text-sm font-bold text-navy">{plan.capacity || 'Engineered'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">Est. Backup Time</p>
                  <p className="mt-0.5 text-sm font-bold text-gold">{plan.backupTime || '8-16 Hours'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Plan Details & Actions */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-gold-antique/20 bg-white p-6 sm:p-8 shadow-premium">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy border border-gold/30">
                  {plan.category}
                </span>
                {plan.capacity && (
                  <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold">
                    {plan.capacity}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 ml-auto">
                  <CheckCircle2 className="h-4 w-4" /> Available for Immediate Dispatch
                </span>
              </div>

              <h1 className="mt-3 font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-navy">
                {plan.name}
              </h1>

              {/* Price Row */}
              <div className="mt-5 flex flex-wrap items-baseline gap-3 border-b border-gold-antique/15 pb-5">
                {plan.price > 0 ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-bold text-gold">
                      ₦{plan.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-navy/50 font-medium">(Standard turnkey package)</span>
                  </>
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-gold">
                    Request an Official Quotation
                  </span>
                )}
              </div>

              {/* Short Description */}
              {plan.description && (
                <div className="mt-5">
                  <p className="text-sm leading-7 text-navy/75 whitespace-pre-line">
                    {plan.description}
                  </p>
                </div>
              )}

              {/* Best For Tag */}
              {plan.bestFor && (
                <div className="mt-5 rounded-xl border border-gold/20 bg-gold/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-navy/60">Recommended For</p>
                  <p className="mt-1 text-sm font-semibold text-navy">{plan.bestFor}</p>
                </div>
              )}

              {/* Call to Actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={quoteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-6 py-4 text-xs font-bold uppercase tracking-widest text-navy shadow-md hover:bg-gold-antique hover:text-white transition-all"
                >
                  <MessageSquare className="h-4 w-4" />
                  Request Official Quote
                </a>
                <a
                  href="tel:09128817136"
                  className="flex items-center justify-center gap-2 rounded-xl border border-navy/20 bg-white px-6 py-4 text-xs font-bold uppercase tracking-widest text-navy hover:bg-navy hover:text-gold transition-all"
                >
                  <Phone className="h-4 w-4" />
                  Speak to an Engineer
                </a>
              </div>

              {/* Guarantees Badges */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-gold-antique/15 pt-6 text-xs text-navy/70">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gold shrink-0" />
                  <span>{plan.warranty || '2 Years Warranty'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-gold shrink-0" />
                  <span>Certified Installation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gold shrink-0" />
                  <span>Prompt Nationwide Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications Breakdown Section */}
        <section id="specifications" className="mt-12 scroll-mt-24 space-y-8">
          <div className="rounded-2xl border border-gold-antique/20 bg-white p-6 sm:p-10 shadow-premium">
            <h2 className="font-serif text-2xl font-bold text-navy flex items-center gap-2">
              <Zap className="h-6 w-6 text-gold" /> System Configuration & Specifications
            </h2>
            <div className="mt-2 h-1 w-16 bg-gold" />
            <p className="mt-3 text-sm text-navy/60">
              Every component in the {plan.name} is engineered for durability, high conversion efficiency, and long lifespan under Nigerian climate conditions.
            </p>

            {/* Spec Cards Grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Inverter */}
              <div className="rounded-xl border border-gold-antique/15 bg-ivory p-5">
                <div className="flex items-center gap-2 text-gold">
                  <Cpu className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider text-navy">Solar Inverter</span>
                </div>
                <p className="mt-2 text-base font-bold text-navy">
                  {plan.inverterType || plan.capacity || 'Pure Sine Wave Smart Inverter'}
                </p>
                <p className="mt-1 text-xs text-navy/60">
                  Clean pure sine wave AC output suitable for sensitive electronics and motorized equipment.
                </p>
              </div>

              {/* Battery */}
              <div className="rounded-xl border border-gold-antique/15 bg-ivory p-5">
                <div className="flex items-center gap-2 text-gold">
                  <Battery className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider text-navy">Battery Storage</span>
                </div>
                <p className="mt-2 text-base font-bold text-navy">
                  {plan.batteryType || 'Deep-Cycle Energy Storage'}
                </p>
                <p className="mt-1 text-xs text-navy/60">
                  High depth of discharge (DoD) with long cycle life for overnight and rainy season reliability.
                </p>
              </div>

              {/* Solar Panels */}
              <div className="rounded-xl border border-gold-antique/15 bg-ivory p-5">
                <div className="flex items-center gap-2 text-gold">
                  <Sun className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider text-navy">Solar Panel Array</span>
                </div>
                <p className="mt-2 text-base font-bold text-navy">
                  {plan.panelType || (plan.totalSolarCapacity ? `${plan.totalSolarCapacity} Solar Array` : 'High-Efficiency Monocrystalline Panels')}
                </p>
                <p className="mt-1 text-xs text-navy/60">
                  Tier-1 Monocrystalline solar panels engineered for superior irradiance capture even during cloudy days.
                </p>
              </div>

              {/* Warranty */}
              <div className="rounded-xl border border-gold-antique/15 bg-ivory p-5">
                <div className="flex items-center gap-2 text-gold">
                  <Shield className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider text-navy">Warranty Protection</span>
                </div>
                <p className="mt-2 text-base font-bold text-navy">
                  {plan.warranty || '2 Years Comprehensive Warranty'}
                </p>
                <p className="mt-1 text-xs text-navy/60">
                  Direct manufacturer warranty with Cedoka technical assistance and repair coverage.
                </p>
              </div>

              {/* Installation */}
              <div className="rounded-xl border border-gold-antique/15 bg-ivory p-5">
                <div className="flex items-center gap-2 text-gold">
                  <Wrench className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider text-navy">Installation & Setup</span>
                </div>
                <p className="mt-2 text-base font-bold text-navy">
                  {plan.installation || 'Professional certified electrical installation available'}
                </p>
                <p className="mt-1 text-xs text-navy/60">
                  Conducted by licensed solar technicians following national safety codes and best earthing practices.
                </p>
              </div>

              {/* Accessories */}
              <div className="rounded-xl border border-gold-antique/15 bg-ivory p-5">
                <div className="flex items-center gap-2 text-gold">
                  <Package className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider text-navy">Included Accessories</span>
                </div>
                <p className="mt-2 text-base font-bold text-navy">
                  {plan.accessories || 'DC breakers, PV cabling, mounting brackets, MC4 connectors'}
                </p>
                <p className="mt-1 text-xs text-navy/60">
                  All necessary switchgear and safety disconnect accessories to ensure turnkey commissioning.
                </p>
              </div>
            </div>

            {/* Bill of Materials Table */}
            {plan.items && plan.items.length > 0 && (
              <div className="mt-10">
                <h3 className="font-serif text-lg font-bold text-navy mb-4">Complete Bill of Materials</h3>
                <div className="overflow-x-auto rounded-xl border border-gold-antique/15">
                  <table className="w-full text-left text-sm text-navy">
                    <thead className="bg-navy text-xs font-bold uppercase tracking-wider text-gold">
                      <tr>
                        <th className="px-4 py-3">Component Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Rating / Spec</th>
                        <th className="px-4 py-3 text-right">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-antique/10 bg-white">
                      {plan.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gold/5 transition-colors">
                          <td className="px-4 py-3.5 font-medium">{item.name}</td>
                          <td className="px-4 py-3.5">
                            <span className="rounded-full bg-navy/5 px-2.5 py-0.5 text-xs font-semibold capitalize text-navy/70">
                              {item.type}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-navy/60">
                            {[
                              Number(item.watts) > 0 ? (item.type === 'battery' ? `${item.watts}Ah` : `${item.watts}W`) : null,
                              Number(item.volts) > 0 ? `${item.volts}V` : null,
                            ].filter(Boolean).join(' • ') || '—'}
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold text-navy">
                            {item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* What This System Can Power */}
            {plan.canPower && plan.canPower.length > 0 && (
              <div className="mt-10">
                <h3 className="font-serif text-lg font-bold text-navy mb-4">What This System Can Power</h3>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {plan.canPower.map((appliance) => (
                    <div
                      key={appliance}
                      className="flex items-center gap-3 rounded-xl border border-gold-antique/15 bg-white p-3.5 shadow-sm"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                        <Zap className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-navy">{appliance}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes & Cautions Banner */}
            {plan.notes && (
              <div className="mt-8 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50/80 p-5">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Operating Guidelines & Notes</p>
                  <p className="mt-1 text-sm text-amber-800 leading-6">{plan.notes}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Related Plans Section */}
        {relatedPlans.length > 0 && (
          <section className="mt-16">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">More Solar Packages</span>
                <h2 className="mt-1 font-serif text-2xl font-bold text-navy sm:text-3xl">Explore Alternative Plans</h2>
                <div className="mt-2 h-1 w-16 bg-gold" />
              </div>
              <Link
                to="/solar#solar-plans"
                className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy hover:text-gold transition-colors"
              >
                View All Plans <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {relatedPlans.map((rPlan) => (
                <SolarPlanProductCard key={rPlan.id} plan={rPlan} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
};

export default SolarPlanDetailsPage;
