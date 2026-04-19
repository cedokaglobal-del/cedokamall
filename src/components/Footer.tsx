import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Shield, RotateCcw, CreditCard } from 'lucide-react';

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground">
    {/* Trust bar */}
    <div className="border-b border-primary-foreground/10">
      <div className="container py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: Shield, label: 'Secure Payment', sub: 'Paystack & Flutterwave' },
          { icon: RotateCcw, label: 'Easy Returns', sub: '7-day money back' },
          { icon: CreditCard, label: 'Multiple Payment', sub: 'Cards, Transfer, COD' },
          // Removed: { icon: Truck, label: 'Free Delivery', sub: 'Orders over ₦50,000' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-gold" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-primary-foreground/60">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="container py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <div>
        <h4 className="font-display text-lg font-bold mb-4">
          <span>Cedoka</span><span className="text-gold">mall</span>
        </h4>
        <p className="text-sm text-primary-foreground/60 mb-4">Everything you need. Delivered Nationwide, built for Nigeria.</p>
        <div className="space-y-2 text-sm text-primary-foreground/60">
          <p className="flex items-start gap-2"><MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span className="flex-1 break-words">2 Mukaila Okunade Street, By Okeafo Bus Stop, Lagos</span></p>
          <p className="flex items-start gap-2"><Phone className="w-4 h-4 flex-shrink-0 mt-0.5" /> <Link to="tel:09128817136" className="flex-1 break-words hover:text-gold transition-colors">09128817136 (Primary)</Link></p>
          <div className="pl-6 space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-primary-foreground/40 mb-1">Other Lines:</p>
            <p className="text-sm text-primary-foreground/60"><Link to="tel:+2349074190070" className="hover:text-gold transition-colors">+234 907 419 0070</Link></p>
            <p className="text-sm text-primary-foreground/60"><Link to="tel:+2348063719884" className="hover:text-gold transition-colors">+234 806 371 9884</Link></p>
            <p className="text-sm text-primary-foreground/60"><Link to="tel:+2347045851131" className="hover:text-gold transition-colors">+234 704 585 1131</Link></p>
          </div>
          <p className="flex items-start gap-2 pt-1"><Mail className="w-4 h-4 flex-shrink-0 mt-0.5" /> <Link to="mailto:hello@cedokamall.com" className="flex-1 break-words hover:text-gold transition-colors">hello@cedokamall.com</Link></p>
        </div>
      </div>
      <div>
        <h5 className="font-semibold mb-4">Quick Links</h5>
        <ul className="space-y-2 text-sm text-primary-foreground/60">
          {['Shop All', 'Flash Deals', 'New Arrivals', 'Best Sellers', 'Our Story'].map(l => (
            <li key={l}><Link to="/shop" className="hover:text-gold transition-colors truncate">{l}</Link></li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="font-semibold mb-4">Customer Service</h5>
        <ul className="space-y-2 text-sm text-primary-foreground/60">
          {['Track Order', 'Shipping Info', 'Returns Policy', 'FAQs', 'Contact Us'].map(l => (
            <li key={l}><Link to="/" className="hover:text-gold transition-colors truncate">{l}</Link></li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="font-semibold mb-4">Newsletter</h5>
        <p className="text-sm text-primary-foreground/60 mb-3">Get ₦1,000 off your first order!</p>
        <div className="flex flex-col sm:flex-row">
          <input type="email" placeholder="Your email" className="flex-1 px-3 py-2 rounded-t-lg sm:rounded-l-lg sm:rounded-t-none text-sm bg-primary-foreground/10 border border-primary-foreground/20 focus:outline-none text-primary-foreground placeholder:text-primary-foreground/40 min-w-0" />
          <button className="px-4 py-2 rounded-b-lg sm:rounded-r-lg sm:rounded-b-none bg-accent text-accent-foreground text-sm font-bold hover:bg-cta-orange-light transition-colors whitespace-nowrap">Join</button>
        </div>
        <p className="text-xs text-primary-foreground/40 mt-4">RC 1234567 • CAC Registered</p>
      </div>
    </div>

    <div className="border-t border-primary-foreground/10 py-4">
      <div className="container flex flex-col sm:flex-row justify-between items-center text-xs text-primary-foreground/40">
        <p>© 2026 Cedokamall.com. All rights reserved.</p>
        <p>Secured by Paystack & Flutterwave 🔒</p>
      </div>
    </div>
  </footer>
);

export default Footer;
