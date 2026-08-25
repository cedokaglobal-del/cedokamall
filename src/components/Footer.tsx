import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Shield, RotateCcw, CreditCard } from 'lucide-react';

const Footer = () => (
  <footer className="bg-navy text-champagne border-t border-gold-antique/20">
    {/* Trust bar */}
    <div className="border-b border-gold-antique/10">
      <div className="container py-4 sm:py-6 md:py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {[
          { icon: Shield, label: 'Secure Payment', sub: 'Paystack & Flutterwave' },
          { icon: RotateCcw, label: 'Easy Returns', sub: '7-day money back' },
          { icon: CreditCard, label: 'Multiple Payment', sub: 'Cards, Transfer, COD' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-navy-deep border border-gold-antique/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 sm:w-5 h-4 sm:h-5 text-gold" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold tracking-tight leading-snug">{label}</p>
              <p className="text-[11px] sm:text-xs opacity-60 leading-snug">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Main footer content */}
    <div className="container py-6 sm:py-8 md:py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
      {/* Brand section */}
      <div className="space-y-4 sm:space-y-6">
        <Link to="/" className="inline-block group transition-transform duration-200 hover:scale-105">
          <img 
            src="/horizontal_logo.png" 
            alt="Cedokamall" 
            className="h-7 sm:h-9 w-auto object-contain mb-2"
            loading="eager"
          />
        </Link>
        <p className="text-xs sm:text-sm opacity-70 leading-relaxed max-w-xs font-sans">
          Redefining Nigerian electrical and gadget shopping.
        </p>
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm font-sans opacity-70">
          <p className="flex items-start gap-3">
            <MapPin className="w-3 h-3 text-gold flex-shrink-0 mt-0.5" />
            <span className="break-words">35 Ailegun Road, Ejigbo, Lagos</span>
          </p>
          <p className="flex items-start gap-3">
            <Phone className="w-3 h-3 text-gold flex-shrink-0 mt-0.5" />
            <Link to="tel:09128817136" className="hover:text-gold">09128817136</Link>
          </p>
          <p className="flex items-start gap-3">
            <Mail className="w-3 h-3 text-gold flex-shrink-0 mt-0.5" />
            <Link to="mailto:hello@cedokamall.com" className="hover:text-gold">hello@cedokamall.com</Link>
          </p>
        </div>
      </div>

      {/* Shop Collection */}
      <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm opacity-70 font-sans">
        <h5 className="font-serif text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gold">Shop Collection</h5>
        <ul className="space-y-1 sm:space-y-2">
          {[
            { label: 'Shop All Products', to: '/shop' },
            { label: 'Solar Energy', to: '/solar' },
            { label: 'All Brands', to: '/brands' },
            { label: 'New Arrivals', to: '/shop' },
            { label: 'Premium Picks', to: '/shop' },
          ].map(({ label, to }) => (
            <li key={label}>
              <Link 
                to={to}
                className="hover:text-gold transition-all duration-200"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Help */}
      <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm opacity-70 font-sans">
        <h5 className="font-serif text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gold">Help</h5>
        <ul className="space-y-1 sm:space-y-2">
          {[
            { label: 'Track My Order', to: '/track-order' },
            { label: 'Shipping Concierge', to: '/shipping' },
            { label: 'Returns Policy', to: '/returns' },
            { label: 'Private FAQ', to: '/faq' },
            { label: 'Contact Support', to: '/contact' },
          ].map(({ label, to }) => (
            <li key={label}>
              <Link 
                to={to}
                className="hover:text-gold transition-all duration-200"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Newsletter */}
      <div className="p-3 sm:p-4 rounded-lg border border-gold-antique/10">
        <h5 className="font-serif text-base sm:text-lg font-bold mb-2 sm:mb-3 text-gold">Newsletter</h5>
        <p className="text-xs sm:text-sm opacity-70 mb-2 sm:mb-3 leading-relaxed">
          Join for exclusive access to premium drops.
        </p>
        <div className="flex flex-col gap-2">
          <input 
            type="email" 
            placeholder="Your Email" 
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm bg-navy border border-gold-antique/20 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 text-champagne placeholder:text-champagne/40"
            aria-label="Email for newsletter"
          />
          <button 
            type="button"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-gold text-navy text-xs sm:text-sm font-bold hover:bg-gold-antique hover:text-white transition-all duration-200 shadow-premium-sm active:scale-95"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-gold-antique/10 py-3 sm:py-4">
      <div className="container flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 text-[10px] sm:text-xs opacity-50 font-sans uppercase tracking-widest">
        <p>© {new Date().getFullYear()} Cedokamall. All rights reserved.</p>
        <p className="flex items-center gap-2">
          Built with Integrity 
          <span className="text-gold">|</span> 
          Secured by Paystack
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;