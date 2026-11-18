import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EnergyCalculator from '@/components/EnergyCalculator';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { getBreadcrumbSchema, getFaqSchema, SEO_CONFIG } from '@/config/seo';

const CalculatorPage = () => {
  useSEO({
    title: 'Solar Energy Calculator - Size Your System | Cedokamall',
    description: 'Use our free energy calculator to determine the right solar panel, battery and inverter capacity for your home or office in Nigeria.',
    keywords: ['solar calculator Nigeria', 'energy calculator', 'solar system sizing', 'solar panel calculator', 'inverter battery calculator'],
    url: `${SEO_CONFIG.siteUrl}/calculator`,
    type: 'website',
  });

  useStructuredData([
    getBreadcrumbSchema([
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Calculator', url: `${SEO_CONFIG.siteUrl}/calculator` },
    ]),
    getFaqSchema([
      {
        question: 'How do I calculate what solar inverter and battery size I need in Nigeria?',
        answer: 'Add up the running wattage of all simultaneous appliances (fans, lights, TV, fridge, pumping machine). Multiply by operating hours to find daily energy in watt-hours (Wh). Divide by battery voltage (e.g. 24V or 48V) and battery depth-of-discharge (DOD) to determine amp-hour (Ah) capacity.',
      },
      {
        question: 'What size solar inverter is needed for a typical 3-bedroom apartment in Nigeria?',
        answer: 'A standard 3-bedroom flat in Nigeria without air conditioners requires a 2.5kVA to 3.5kVA 24V pure sine wave inverter with two 200Ah batteries. With one 1HP inverter AC, a 5kVA 48V solar system with lithium battery storage is recommended.',
      },
    ]),
  ]);

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      <div className="container py-8 pb-24 sm:pb-32">
        <EnergyCalculator />
      </div>
      <Footer />
    </div>
  );
};

export default CalculatorPage;
