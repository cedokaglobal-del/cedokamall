import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, Search, ArrowRight, Phone, MessageSquare } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { getBreadcrumbSchema, getFaqSchema, COMMON_AEO_FAQS, SEO_CONFIG } from '@/config/seo';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ALL_FAQS = [
  {
    category: 'Orders & Payments',
    items: [
      {
        q: 'How do I place an order on Cedokamall?',
        a: 'You can browse products, add items to your cart, and proceed to checkout. At checkout, you can choose direct online payment, verified bank transfer, or one-click WhatsApp assisted checkout.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept secure card payments, instant bank transfers to Cedoka Global Limited, and WhatsApp invoice confirmations.',
      },
      {
        q: 'Is my online card transaction secure?',
        a: 'Yes, all online card transactions are processed securely through certified PCI-DSS compliant Nigerian payment gateways with 3D Secure 2FA tokenization.',
      },
    ],
  },
  {
    category: 'Solar Energy & Sizing',
    items: [
      {
        q: 'How do I know what solar inverter size I need?',
        a: 'Use our free interactive Solar Energy Calculator at cedokamall.com/calculator. Enter your daily appliances (fans, TVs, fridges, lighting, ACs) and operating hours to get instant recommendations.',
      },
      {
        q: 'What is the difference between Gel and Lithium (LiFePO4) batteries?',
        a: 'Lithium LiFePO4 batteries last 10–15 years (3,000+ cycles) and allow 80–90% discharge, while tubular gel batteries last 3–5 years and operate best at 50% depth of discharge.',
      },
      {
        q: 'Do you offer solar installation services in Nigeria?',
        a: 'Yes, we provide certified solar installation services and engineering guidance across Lagos, Ogun, Ibadan, Abuja, and other states.',
      },
    ],
  },
  {
    category: 'Delivery & Warranties',
    items: [
      {
        q: 'How long does delivery take in Lagos?',
        a: 'Deliveries within Lagos are typically completed within 24 to 48 hours. Orders placed before noon frequently arrive same-day.',
      },
      {
        q: 'How do interstate deliveries to other Nigerian states work?',
        a: 'Interstate deliveries take 2 to 4 business days via verified carrier terminals (GIG Logistics, FedEx, or dedicated interstate transit with live waybill tracking).',
      },
      {
        q: 'Are all products 100% original with manufacturer warranty?',
        a: 'Yes. Every appliance and solar component is guaranteed 100% genuine, backed by official manufacturer warranties ranging from 1 to 25 years.',
      },
      {
        q: 'What is your return policy?',
        a: 'We offer a 7-day replacement guarantee on any dead-on-arrival or defective items, provided they retain original serial numbers and packaging.',
      },
    ],
  },
];

const FaqPage = () => {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<string | null>('0-0');

  useSEO({
    title: 'Frequently Asked Questions (FAQ) - Direct Answers | Cedokamall',
    description: 'Find answers about electronics ordering, solar system sizing, inverters, warranty coverage, delivery across Nigeria, and payment methods.',
    keywords: ['Cedokamall FAQ', 'solar sizing questions', 'electronics warranty FAQ Nigeria'],
    url: `${SEO_CONFIG.siteUrl}/faq`,
    type: 'website',
  });

  useStructuredData([
    getBreadcrumbSchema([
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'FAQ', url: `${SEO_CONFIG.siteUrl}/faq` },
    ]),
    getFaqSchema(COMMON_AEO_FAQS),
  ]);

  const filteredCategories = ALL_FAQS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        !search.trim() ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Header />

      <main className="flex-1 container py-8 sm:py-12 pb-24 sm:pb-32 max-w-4xl">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-4">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy">Frequently Asked Questions</h1>
          <p className="mt-2 text-sm text-navy/70 leading-relaxed">
            Everything you need to know about our products, solar systems, shipping, and warranty protection.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-10">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions (e.g. solar, delivery, warranty)..."
            className="pl-10 h-11 bg-white border-gold-antique/30 rounded-xl text-sm"
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-8 mb-12">
          {filteredCategories.length === 0 ? (
            <Card className="p-8 text-center bg-white rounded-2xl border-dashed">
              <p className="text-sm text-navy/60">No questions matched &ldquo;{search}&rdquo;.</p>
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-3 text-xs font-bold uppercase tracking-widest text-gold hover:underline"
              >
                Clear Search
              </button>
            </Card>
          ) : (
            filteredCategories.map((cat, catIdx) => (
              <div key={cat.category} className="space-y-3">
                <h2 className="font-serif text-xl font-bold text-navy border-b border-gold-antique/20 pb-2">
                  {cat.category}
                </h2>
                <div className="space-y-2">
                  {cat.items.map((item, itemIdx) => {
                    const key = `${catIdx}-${itemIdx}`;
                    const isOpen = openIndex === key;
                    return (
                      <div
                        key={item.q}
                        className="rounded-xl border border-gold-antique/20 bg-white overflow-hidden transition-all duration-200"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenIndex(isOpen ? null : key)}
                          className="w-full flex items-center justify-between p-4 text-left font-serif font-bold text-sm sm:text-base text-navy hover:text-gold transition-colors gap-3"
                          aria-expanded={isOpen}
                        >
                          <span>{item.q}</span>
                          <ChevronDown
                            className={cn('h-4 w-4 text-gold shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-navy/70 leading-relaxed border-t border-gold-antique/10 bg-ivory/40">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Live Support Help */}
        <Card className="p-6 sm:p-8 bg-white border-gold/30 rounded-2xl shadow-sm text-center space-y-4">
          <h3 className="font-serif text-xl font-bold text-navy">Still Have Questions?</h3>
          <p className="text-xs sm:text-sm text-navy/60 max-w-md mx-auto">
            Our technical engineers and support agents are available Monday to Sunday from 9:00 AM to 6:00 PM.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a
              href="https://wa.me/2349128817136?text=Hello%20Cedokamall%2C%20I%20have%20a%20question%20about%20a%20product."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:brightness-105 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              Chat on WhatsApp
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy text-gold text-xs font-bold uppercase tracking-wider hover:bg-gold hover:text-navy transition-colors"
            >
              Contact Support Desk <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default FaqPage;
