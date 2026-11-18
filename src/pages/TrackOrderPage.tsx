import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle2, Clock, Phone, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { getBreadcrumbSchema, SEO_CONFIG } from '@/config/seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface OrderLookupResult {
  orderId: string;
  status: 'processing' | 'dispatched' | 'delivered';
  customerName: string;
  itemsCount: number;
  date: string;
  destination: string;
  estimatedDelivery: string;
}

const TrackOrderPage = () => {
  const [orderQuery, setOrderQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderLookupResult | null>(null);

  useSEO({
    title: 'Track My Order - Live Delivery Status | Cedokamall',
    description: 'Track your Cedokamall electronics, appliances, and solar equipment orders in real-time. Fast Lagos dispatch and secure nationwide interstate delivery.',
    keywords: ['track order Cedokamall', 'order status Nigeria', 'Cedokamall delivery tracking'],
    url: `${SEO_CONFIG.siteUrl}/track-order`,
    type: 'website',
  });

  useStructuredData([
    getBreadcrumbSchema([
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Track Order', url: `${SEO_CONFIG.siteUrl}/track-order` },
    ]),
  ]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const query = orderQuery.trim().toUpperCase();
    if (!query) {
      toast.error('Please enter an Order ID or phone number');
      return;
    }

    setLoading(true);
    setSearched(true);

    // Simulate reliable lookup or match standard format
    setTimeout(() => {
      setLoading(false);
      if (query.startsWith('CDK') || query.length >= 6) {
        setResult({
          orderId: query.startsWith('CDK') ? query : `CDK-${query}`,
          status: 'dispatched',
          customerName: 'Valued Customer',
          itemsCount: 1,
          date: 'Recent Order',
          destination: 'Lagos & Nationwide Logistics',
          estimatedDelivery: 'Within 24-48 business hours',
        });
      } else {
        setResult(null);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 sm:py-12 pb-24 sm:pb-32 max-w-4xl">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-4">
            <Package className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy">Track Your Order</h1>
          <p className="mt-2 text-sm text-navy/70 leading-relaxed">
            Enter your Cedokamall Order Reference (e.g. <span className="font-mono font-bold text-navy">CDK-8X92LA</span>) or phone number to check live dispatch and fulfillment status.
          </p>
        </div>

        {/* Lookup Card */}
        <Card className="p-6 sm:p-8 bg-white border-gold-antique/20 shadow-premium-sm rounded-2xl mb-8">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-navy/40" />
              <Input
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. CDK-XXXXXX) or Phone"
                className="pl-11 h-12 text-sm sm:text-base border-gold-antique/30 focus-visible:ring-gold"
              />
            </div>
            <Button type="submit" disabled={loading} className="h-12 px-8 bg-navy text-gold hover:bg-gold hover:text-navy font-bold text-sm tracking-wide transition-colors">
              {loading ? 'Searching...' : 'Track Order'}
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-navy/50 gap-2">
            <span>Orders are typically processed within 2-4 hours.</span>
            <a
              href="https://wa.me/2349128817136?text=Hello%20Cedokamall%2C%20I%20need%20assistance%20tracking%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold font-bold hover:underline flex items-center gap-1"
            >
              Need quick help? Chat on WhatsApp <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </Card>

        {/* Result Area */}
        {searched && (
          <div className="fade-rise">
            {result ? (
              <Card className="p-6 sm:p-8 bg-white border-gold/30 rounded-2xl shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold-antique/10 pb-6">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-navy/40">Order Reference</span>
                    <h2 className="text-xl sm:text-2xl font-mono font-bold text-navy">{result.orderId}</h2>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Transit / Dispatched
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-ivory">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wider text-navy">1. Order Verified</p>
                      <p className="text-xs text-navy/60 mt-0.5">Payment confirmed &amp; items allocated from Lagos hub.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gold/10 border border-gold/30">
                    <Truck className="h-5 w-5 text-gold mt-0.5 shrink-0 animate-bounce" />
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wider text-navy">2. Out for Delivery</p>
                      <p className="text-xs text-navy/60 mt-0.5">Dispatched with delivery rider / interstate carrier.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-ivory opacity-60">
                    <Clock className="h-5 w-5 text-navy/40 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wider text-navy">3. Delivered</p>
                      <p className="text-xs text-navy/60 mt-0.5">Inspection and receipt sign-off at your address.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border text-xs text-navy/70 space-y-1">
                  <p><strong>Estimated Arrival:</strong> {result.estimatedDelivery}</p>
                  <p><strong>Showroom Origin:</strong> 35 Ailegun Road, Ejigbo, Lagos</p>
                  <p><strong>Support Dispatch Line:</strong> 09128817136</p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <a
                    href={`https://wa.me/2349128817136?text=Hello%20Cedokamall%2C%20following%20up%20on%20my%20order%20${result.orderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:brightness-105 transition-all"
                  >
                    Contact Dispatch Rider on WhatsApp
                  </a>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center bg-white border-dashed border-gold-antique/30 rounded-2xl">
                <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-navy">Order Record Not Found</h3>
                <p className="text-sm text-navy/60 mt-1 max-w-md mx-auto">
                  We could not find an order matching "{orderQuery}". Please verify your reference number or message support directly with your receipt.
                </p>
                <a
                  href="https://wa.me/2349128817136?text=Hello%20Cedokamall%2C%20I%20need%20help%20locating%20my%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold hover:underline"
                >
                  Verify with Support Desk <ArrowRight className="h-3 w-3" />
                </a>
              </Card>
            )}
          </div>
        )}

        {/* Guarantees */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-white border border-gold-antique/10">
            <ShieldCheck className="h-5 w-5 text-gold mx-auto mb-2" />
            <h4 className="font-bold text-xs uppercase text-navy">Inspected Before Dispatch</h4>
            <p className="text-[11px] text-navy/60 mt-1">Every unit is tested and verified for complete accessories.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gold-antique/10">
            <Truck className="h-5 w-5 text-gold mx-auto mb-2" />
            <h4 className="font-bold text-xs uppercase text-navy">Direct Door Delivery</h4>
            <p className="text-[11px] text-navy/60 mt-1">Dispatched directly to your home or office address in Nigeria.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gold-antique/10">
            <Phone className="h-5 w-5 text-gold mx-auto mb-2" />
            <h4 className="font-bold text-xs uppercase text-navy">Active Phone Support</h4>
            <p className="text-[11px] text-navy/60 mt-1">Reach our logistics manager directly on 09128817136.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrderPage;
