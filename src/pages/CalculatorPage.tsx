import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EnergyCalculator from '@/components/EnergyCalculator';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { getBreadcrumbSchema, SEO_CONFIG } from '@/config/seo';

const CalculatorPage = () => {
  useSEO({
    title: 'Solar Energy Calculator - Size Your System | Cedokamall',
    description: 'Use our free energy calculator to determine the right solar panel, battery and inverter capacity for your home or office in Nigeria.',
    keywords: ['solar calculator Nigeria', 'energy calculator', 'solar system sizing', 'solar panel calculator', 'inverter battery calculator'],
    url: `${SEO_CONFIG.siteUrl}/calculator`,
    type: 'website',
  });

  useStructuredData(
    getBreadcrumbSchema([
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Calculator', url: `${SEO_CONFIG.siteUrl}/calculator` },
    ])
  );

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      <div className="container py-8">
        <EnergyCalculator />
      </div>
      <Footer />
    </div>
  );
};

export default CalculatorPage;
