import { Link } from 'react-router-dom';
import { RotateCcw, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Phone } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { getBreadcrumbSchema, SEO_CONFIG } from '@/config/seo';
import { Card } from '@/components/ui/card';

const ReturnsPage = () => {
  useSEO({
    title: 'Returns & Manufacturer Warranty Policy | Cedokamall',
    description: 'Cedokamall 7-day return policy and official manufacturer warranty guidelines for all genuine electronics, appliances, and solar systems in Nigeria.',
    keywords: ['Cedokamall returns policy', 'electronics warranty Nigeria', 'appliance return policy Lagos'],
    url: `${SEO_CONFIG.siteUrl}/returns`,
    type: 'website',
  });

  useStructuredData([
    getBreadcrumbSchema([
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Returns Policy', url: `${SEO_CONFIG.siteUrl}/returns` },
    ]),
  ]);

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Header />

      <main className="flex-1 container py-8 sm:py-12 pb-24 sm:pb-32 max-w-4xl">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-4">
            <RotateCcw className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy">Returns &amp; Warranty Policy</h1>
          <p className="mt-2 text-sm text-navy/70 leading-relaxed">
            Our commitment to 100% genuine products, fair returns, and dedicated manufacturer warranty protection.
          </p>
        </div>

        {/* 7-Day Policy Summary */}
        <Card className="p-6 sm:p-8 bg-white border-gold-antique/20 rounded-2xl shadow-sm mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-gold" />
            <h2 className="font-serif text-xl font-bold text-navy">7-Day Free Replacement Guarantee</h2>
          </div>
          <p className="text-xs sm:text-sm text-navy/70 leading-relaxed">
            If your product arrives damaged, defective, or noticeably different from the product description, you are eligible for a replacement or store credit within <strong>7 days</strong> of delivery receipt.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-ivory space-y-1.5">
              <p className="font-bold text-xs uppercase text-navy">Eligible for Return:</p>
              <ul className="text-xs text-navy/70 space-y-1 list-disc pl-4">
                <li>Factory defects or dead-on-arrival items</li>
                <li>Items damaged during courier transit</li>
                <li>Incorrect model or specification received</li>
                <li>Complete packaging, manuals, and accessories intact</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-ivory space-y-1.5">
              <p className="font-bold text-xs uppercase text-navy">Non-Returnable:</p>
              <ul className="text-xs text-navy/70 space-y-1 list-disc pl-4">
                <li>Damage caused by electrical power surges / NEPA lightning without surge protector</li>
                <li>Customer misuse, dropped equipment, or unauthorized repair attempts</li>
                <li>Items without original serial numbers and packaging</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 4 Steps to Return */}
        <div className="mb-10">
          <h3 className="font-serif text-xl font-bold text-navy mb-4">How to Initiate a Return</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Contact Us', desc: 'Notify us via WhatsApp or phone on 09128817136 within 7 days.' },
              { step: '2', title: 'Provide Photos', desc: 'Send clear photos/videos of the defect and your receipt.' },
              { step: '3', title: 'Inspection', desc: 'Drop off at our Ejigbo Lagos hub or send via carrier.' },
              { step: '4', title: 'Resolution', desc: 'Receive your brand-new replacement within 48-72 hours.' },
            ].map((s) => (
              <div key={s.step} className="p-4 rounded-xl bg-white border border-gold-antique/10 text-center">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy text-gold font-bold text-xs mb-2">
                  {s.step}
                </span>
                <h4 className="font-bold text-xs text-navy">{s.title}</h4>
                <p className="text-[11px] text-navy/60 mt-1 leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Official Manufacturer Warranty */}
        <Card className="p-6 sm:p-8 bg-white border-gold/30 rounded-2xl shadow-sm mb-10 space-y-4">
          <h3 className="font-serif text-xl font-bold text-navy">Official Manufacturer Warranties</h3>
          <p className="text-xs sm:text-sm text-navy/70 leading-relaxed">
            All major brand appliances (LG, Hisense, Maxi, MeWe) and renewable energy systems (Solar panels, Felicity/Must Inverters, LiFePO4 batteries) carry direct manufacturer warranties:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-navy/80 pt-1">
            <li className="flex items-center gap-2 p-2.5 rounded-lg bg-ivory">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span><strong>LG &amp; Hisense:</strong> 1 - 2 Years Standard Manufacturer Warranty</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 rounded-lg bg-ivory">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span><strong>Solar Panels:</strong> 10 - 25 Years Performance Warranty</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 rounded-lg bg-ivory">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span><strong>Lithium LiFePO4 Batteries:</strong> 3 - 5 Years Warranty</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 rounded-lg bg-ivory">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span><strong>Solar Inverters:</strong> 1 - 2 Years Replacement Warranty</span>
            </li>
          </ul>
        </Card>

        {/* Direct Action */}
        <div className="text-center space-y-4">
          <p className="text-sm text-navy/70">Need assistance with an existing warranty claim?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/2349128817136?text=Hello%20Cedokamall%2C%20I%20would%20like%20to%20inquire%20about%20a%20return%20or%20warranty%20claim."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:brightness-105 transition-all"
            >
              Start Claim via WhatsApp
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy text-gold text-xs font-bold uppercase tracking-wider hover:bg-gold hover:text-navy transition-colors"
            >
              Contact Support Desk <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnsPage;
