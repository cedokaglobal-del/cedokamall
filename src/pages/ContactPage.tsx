import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, CheckCircle2, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { getBreadcrumbSchema, SEO_CONFIG } from '@/config/seo';
import { COMPANY_CONFIG, formatWhatsAppHref } from '@/config/company';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useSEO({
    title: 'Contact Us & Showroom Location | Cedokamall Lagos',
    description: 'Get in touch with Cedokamall support team or visit our showroom at 35 Ailegun Road, Ejigbo, Lagos. Call 09128817136 or message us directly on WhatsApp.',
    keywords: ['Cedokamall contact', 'Cedokamall phone number', 'electronics store Ejigbo Lagos', 'solar company Lagos contact'],
    url: `${SEO_CONFIG.siteUrl}/contact`,
    type: 'website',
  });

  useStructuredData([
    getBreadcrumbSchema([
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Contact Us', url: `${SEO_CONFIG.siteUrl}/contact` },
    ]),
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error('Please enter your name and message.');
      return;
    }

    // The message is delivered through WhatsApp; only claim success if the
    // chat actually opened, and tell the customer to tap Send.
    const text = `Hello Cedokamall,\n\nName: ${name}\nPhone: ${phone || 'Not provided'}\nEmail: ${email || 'Not provided'}\n\nMessage: ${message}`;
    const chat = window.open(formatWhatsAppHref(text), '_blank', 'noopener,noreferrer');
    if (!chat) {
      toast.error('Please allow pop-ups, or use the WhatsApp link below to send your message.');
      return;
    }
    setSubmitted(true);
    toast.success('Your message is ready in WhatsApp. Please tap Send to reach our team.');
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Header />

      <main className="flex-1 container py-8 sm:py-12 pb-24 sm:pb-32 max-w-5xl">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-4">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy">Contact &amp; Customer Support</h1>
          <p className="mt-2 text-sm text-navy/70 leading-relaxed">
            Have a question about an appliance, need solar system engineering guidance, or want to track an order? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information Sidebar */}
          <div className="space-y-4">
            <Card className="p-6 bg-navy text-champagne rounded-2xl border-gold-antique/20 shadow-sm space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-gold">Cedoka Global Limited</h2>
                <p className="text-xs text-champagne/70 mt-1">Official Nigerian Electronics &amp; Solar Center</p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white">Showroom &amp; Dispatch Hub:</strong>
                    <span className="text-champagne/80">35 Ailegun Road, Ejigbo, Lagos State, Nigeria</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white">Phone Inquiries:</strong>
                    <a href="tel:09128817136" className="text-gold hover:underline">09128817136</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white">Official Email:</strong>
                    <a href={`mailto:${COMPANY_CONFIG.email}`} className="text-gold hover:underline break-all">{COMPANY_CONFIG.email}</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white">Operating Hours:</strong>
                    <span className="text-champagne/80">Monday – Sunday: 9:00 AM – 6:00 PM (WAT)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <a
                  href={formatWhatsAppHref('Hello Cedokamall, I have an inquiry.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:brightness-105 transition-all"
                >
                  <MessageSquare className="h-4 w-4" />
                  Direct WhatsApp Chat
                </a>
              </div>
            </Card>
          </div>

          {/* Interactive Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 sm:p-8 bg-white border-gold-antique/20 rounded-2xl shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-navy mb-2">Send Us a Direct Message</h2>
              <p className="text-xs text-navy/60 mb-6">
                Fill out the form below. We will reply promptly via email, phone, or WhatsApp.
              </p>

              {submitted ? (
                <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
                  <h3 className="font-serif text-xl font-bold text-emerald-900">Message Sent Successfully!</h3>
                  <p className="text-xs sm:text-sm text-emerald-800">
                    Thank you, {name}. A customer support representative has been notified and will contact you shortly.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setPhone('');
                      setMessage('');
                    }}
                    variant="outline"
                    className="mt-2 text-xs"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-name" className="text-xs font-bold uppercase tracking-wider text-navy">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="contact-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Tunde Adebayo"
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-phone" className="text-xs font-bold uppercase tracking-wider text-navy">
                        Phone / WhatsApp Number
                      </label>
                      <Input
                        id="contact-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 08012345678"
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="text-xs font-bold uppercase tracking-wider text-navy">
                      Email Address
                    </label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. tunde@gmail.com"
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="text-xs font-bold uppercase tracking-wider text-navy">
                      Message / Inquired Equipment <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="contact-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what you are looking for (e.g. 5kVA Solar Inverter pricing, Hisense 55-inch TV availability, Delivery inquiry)..."
                      rows={5}
                      required
                      className="rounded-xl resize-none p-3.5 text-base sm:text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full sm:w-auto h-12 px-8 bg-navy text-gold hover:bg-gold hover:text-navy font-bold text-xs uppercase tracking-wider transition-colors gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submit Inquiry &amp; Open WhatsApp
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
