import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';

const tiers = [
  { name: 'Bronze', icon: Star, points: 0, color: 'text-amber-700' },
  { name: 'Silver', icon: Star, points: 5000, color: 'text-gray-400' },
  { name: 'Gold', icon: Trophy, points: 15000, color: 'text-gold' },
  { name: 'Platinum', icon: Trophy, points: 50000, color: 'text-purple-400' },
];

const LoyaltyBanner = () => {
  const currentPoints = 3200;
  const currentTier = tiers[0];
  const nextTier = tiers[1];
  const progress = (currentPoints / nextTier.points) * 100;

  return (
    <section className="bg-gradient-hero text-primary-foreground py-8">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center gap-6"
        >
          <div className="flex-1">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              CedokaPoints <span className="text-gradient-gold">Loyalty Program</span>
            </h2>
            <p className="text-primary-foreground/70 text-sm mb-4">Earn 1 point per ₦1 spent. Redeem for discounts, free shipping & exclusive perks!</p>
            <div className="flex items-center gap-4 flex-wrap">
              {tiers.map((t) => (
                <div key={t.name} className={`flex items-center gap-1 text-sm ${t.name === currentTier.name ? 'font-bold' : 'opacity-50'}`}>
                  <t.icon className={`w-4 h-4 ${t.color}`} />
                  {t.name}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-80 bg-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between text-sm mb-2">
              <span>{currentTier.name}</span>
              <span className="font-bold">{currentPoints.toLocaleString()} pts</span>
            </div>
            <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-gold rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-primary-foreground/60">{(nextTier.points - currentPoints).toLocaleString()} pts to {nextTier.name}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LoyaltyBanner;
