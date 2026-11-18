import { Link } from 'react-router-dom';
import { Truck, Clock, ShieldCheck, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { getBreadcrumbSchema, SEO_CONFIG } from '@/config/seo';
import { Card } from '@/components/ui/card';

const ShippingPage = () => {
  useSEO({
    title: 'Shipping Concierge & Nationwide Delivery | Cedokamall',
    description: 'Learn how Cedokamall delivers original electronics, solar panels, inverters and appliances across Lagos and all 36 Nigerian states safely and quickly.',
    keywords: ['Cedokamall shipping', 'electronics delivery Lagos', 'solar delivery Nigeria', 'interstate courier appliances'],
    url: `${SEO_CONFIG.siteUrl}/shipping`,
    type: 'website',
  });

  useStructuredData([
    getBreadcrumbSchema([
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Shipping Concierge', url: `${SEO_CONFIG.siteUrl}/shipping` },
    ]),
  ]);

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Header />

      <main className="flex-1 container py-8 sm:py-12 pb-24 sm:pb-32 max-w-4xl">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-4">
            <Truck className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy">Shipping &amp; Delivery Concierge</h1>
          <p className="mt-2 text-sm text-navy/70 leading-relaxed">
            Fast, secure fulfillment from our Lagos warehouse to your door anywhere in Nigeria.
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card className="p-6 bg-white border-gold-antique/20 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-navy text-gold">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-navy">Lagos State Deliveries</h2>
                <p className="text-xs text-navy/60">Island, Mainland &amp; Greater Lagos</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-navy/80">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Same-Day / Next-Day Delivery:</strong> Orders confirmed before 12:00 PM are dispatched same-day.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Store Pickup Available:</strong> Free walk-in pickup at 35 Ailegun Road, Ejigbo, Lagos.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Delivery Rates:</strong> Fixed local dispatch rates based on destination distance.</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 bg-white border-gold-antique/20 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-navy text-gold">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-navy">Nationwide Interstate Delivery</h2>
                <p className="text-xs text-navy/60">All 36 States &amp; Abuja FCT</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-navy/80">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Delivery Window:</strong> 2 to 4 business days via verified logistics partners (GIG Logistics, FedEx, Interstate Waybill).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Waybill Tracking:</strong> Live waybill number and carrier contact sent via SMS and WhatsApp.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Secure Hub Pickup or Home Delivery:</strong> Choose terminal pickup or doorstep arrival.</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Fragile Solar & Heavy Goods Protection */}
        <Card className="p-6 sm:p-8 bg-white border-gold/30 rounded-2xl shadow-sm mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-gold" />
            <h3 className="font-serif text-xl font-bold text-navy">Fragile Goods &amp; Heavy Solar Equipment Handling</h3>
          </div>
          <p className="text-xs sm:text-sm text-navy/70 leading-relaxed">
            Large solar panels (glass tempered), heavy lithium batteries (40kg - 80kg), and high-capacity inverters receive custom protective wooden crating and shock-absorption padding before dispatch. We guarantee your equipment arrives intact and functional.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-navy/80">
            <div className="p-3 rounded-lg bg-ivory">
              <strong>Reinforced Wooden Crating</strong>
              <p className="text-[11px] text-navy/60 mt-0.5">Custom frames for 400W–600W solar panels.</p>
            </div>
            <div className="p-3 rounded-lg bg-ivory">
              <strong>Pre-Dispatch QC Testing</strong>
              <p className="text-[11px] text-navy/60 mt-0.5">Every inverter and appliance is turned on and tested.</p>
            </div>
            <div className="p-3 rounded-lg bg-ivory">
              <strong>Transit Insurance</strong>
              <p className="text-[11px] text-navy/60 mt-0.5">Free replacement if damage occurs during carrier transit.</p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-sm text-navy/70">Have a custom delivery request or need urgent dispatch?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy text-gold text-xs font-bold uppercase tracking-wider hover:bg-gold hover:text-navy transition-colors"
            >
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/2349128817136?text=Hello%20Cedokamall%2C%20I%20have%20an%20inquiry%20regarding%20delivery%20and%20shipping."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:brightness-105 transition-all"
            >
              Talk to Shipping Concierge
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShippingPage;
