// Company contact information and configuration.
// Import these values instead of hardcoding them in components so one change
// updates the whole website.
export const COMPANY_CONFIG = {
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '2349128817136',
  email: 'hello@cedokamall.com',
  phone: '09128817136',
  otherLines: [
    '+2349074190070',
    '+2348063719884',
    '+2347045851131',
  ],
  address: '35 Ailegun Road, Ejigbo, Lagos',
  businessHours: '24/7 (Online Shop)',
};

/** Builds a WhatsApp deep link with an optional pre-filled message. */
export const formatWhatsAppHref = (message?: string): string => {
  const base = `https://wa.me/${COMPANY_CONFIG.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};
