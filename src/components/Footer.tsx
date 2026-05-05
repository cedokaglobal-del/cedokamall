import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Shield, RotateCcw, CreditCard } from 'lucide-react';

const Footer = () => (
  <footer className="bg-navy text-champagne border-t border-gold-antique/20">
    {/* Trust bar */}
    <div className="border-b border-gold-antique/10">
      <div className="container py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[
          { icon: Shield, label: 'Secure Payment', sub: 'Paystack & Flutterwave' },
          { icon: RotateCcw, label: 'Easy Returns', sub: '7-day money back' },
          { icon: CreditCard, label: 'Multiple Payment', sub: 'Cards, Transfer, COD' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-md bg-navy-deep border border-gold-antique/20 flex items-center justify-center flex-shrink-0 group-hover:border-gold/50 transition-all duration-300">
              <Icon className="w-6 h-6 text-gold" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight">{label}</p>
              <p className="text-xs opacity-60">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="container py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
      <div className="space-y-6">
        <Link to="/" className="inline-block">
          <h4 className="font-serif text-2xl font-bold tracking-tight">
            <span>Cedoka</span><span className="text-gold">mall</span>
          </h4>
        </Link>
        <p className="text-sm opacity-70 leading-relaxed max-w-xs font-sans">
          Redefining Nigerian retail with global luxury standards. Experience authority, trust, and premium craftsmanship.
        </p>
        <div className="space-y-3 text-sm font-sans opacity-70">
          <p className="flex items-start gap-3"><MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" /> <span>35 Ailegun Road, Ejigbo, Lagos</span></p>
          <p className="flex items-start gap-3"><Phone className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" /> <Link to="tel:09128817136" className="hover:text-gold transition-colors">09128817136</Link></p>
          <p className="flex items-start gap-3"><Mail className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" /> <Link to="mailto:hello@cedokamall.com" className="hover:text-gold transition-colors">hello@cedokamall.com</Link></p>
        </div>
      </div>

      <div>
        <h5 className="font-serif text-lg font-bold mb-6 text-gold">Shop Collection</h5>
        <ul className="space-y-3 text-sm opacity-70 font-sans">
          {['Shop All Products', 'Luxury Deals', 'New Arrivals', 'Premium Picks', 'Our Legacy'].map(l => (
            <li key={l}><Link to="/shop" className="hover:text-gold hover:translate-x-1 transition-all inline-block">{l}</Link></li>
          ))}
        </ul>
      </div>

      <div>
        <h5 className="font-serif text-lg font-bold mb-6 text-gold">Concierge</h5>
        <ul className="space-y-3 text-sm opacity-70 font-sans">
          {['Track My Order', 'Shipping Concierge', 'Returns Policy', 'Private FAQ', 'Contact Luxury Support'].map(l => (
            <li key={l}><Link to="/" className="hover:text-gold hover:translate-x-1 transition-all inline-block">{l}</Link></li>
          ))}
        </ul>
      </div>

      <div className="bg-navy-deep p-6 rounded-md border border-gold-antique/10">
        <h5 className="font-serif text-lg font-bold mb-3">Newsletter</h5>
        <p className="text-sm opacity-70 mb-5 font-sans">Join our elite circle for exclusive access to premium drops.</p>
        <div className="flex flex-col gap-2">
          <input 
            type="email" 
            placeholder="Your Email" 
            className="w-full px-4 py-3 rounded-md text-sm bg-navy border border-gold-antique/20 focus:outline-none focus:border-gold transition-all text-champagne placeholder:text-champagne/30" 
          />
          <button className="w-full px-4 py-3 rounded-md bg-gold text-navy text-sm font-bold hover:bg-gold-antique hover:text-white transition-all shadow-md">
            Subscribe Now
          </button>
        </div>
      </div>
    </div>

    <div className="border-t border-gold-antique/10 py-6">
      <div className="container flex flex-col sm:flex-row justify-between items-center text-[10px] sm:text-xs opacity-40 font-sans uppercase tracking-widest gap-4">
        <p>© 2026 Cedokamall. All rights reserved.</p>
        <p className="flex items-center gap-2">Built with Integrity <span className="text-gold">|</span> Secured by Paystack</p>
      </div>
    </div>
  </footer>
);

export default Footer;
