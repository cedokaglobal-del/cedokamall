import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';

const prizes = [
  { label: '₦500 Off', color: 'hsl(120,100%,20%)', value: 500 },
  { label: '10% Off', color: 'hsl(51,100%,50%)', value: 10 },
  { label: 'Free Ship', color: 'hsl(24,100%,50%)', value: 0 },
  { label: '₦1,000', color: 'hsl(120,60%,35%)', value: 1000 },
  { label: '5% Off', color: 'hsl(43,90%,40%)', value: 5 },
  { label: '₦200 Off', color: 'hsl(120,100%,14%)', value: 200 },
];

const SpinWheel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const prize = Math.floor(Math.random() * prizes.length);
    const newRotation = rotation + 1800 + (prize * (360 / prizes.length)) + Math.random() * (360 / prizes.length);
    setRotation(newRotation);
    setTimeout(() => {
      setSpinning(false);
      setResult(prizes[prize].label);
    }, 4000);
  };

  const segmentAngle = 360 / prizes.length;

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center animate-pulse-gold"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Gift className="w-6 h-6" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/60"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-background rounded-2xl p-6 max-w-sm w-full mx-4 text-center relative"
            >
              <button onClick={() => { setIsOpen(false); setResult(null); }} className="absolute top-3 right-3">
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-display text-2xl font-bold mb-1">🎡 Daily Spin</h3>
              <p className="text-sm text-muted-foreground mb-4">Win CedokaPoints & discounts!</p>

              {/* Wheel */}
              <div className="relative w-64 h-64 mx-auto mb-4">
                {/* Pointer */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-foreground" />
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full"
                  style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none' }}
                >
                  {prizes.map((prize, i) => {
                    const startAngle = i * segmentAngle;
                    const endAngle = startAngle + segmentAngle;
                    const startRad = (startAngle - 90) * Math.PI / 180;
                    const endRad = (endAngle - 90) * Math.PI / 180;
                    const x1 = 100 + 95 * Math.cos(startRad);
                    const y1 = 100 + 95 * Math.sin(startRad);
                    const x2 = 100 + 95 * Math.cos(endRad);
                    const y2 = 100 + 95 * Math.sin(endRad);
                    const largeArc = segmentAngle > 180 ? 1 : 0;
                    const midAngle = ((startAngle + endAngle) / 2 - 90) * Math.PI / 180;
                    const tx = 100 + 60 * Math.cos(midAngle);
                    const ty = 100 + 60 * Math.sin(midAngle);
                    return (
                      <g key={i}>
                        <path d={`M100,100 L${x1},${y1} A95,95 0 ${largeArc},1 ${x2},${y2} Z`} fill={prize.color} stroke="white" strokeWidth="1" />
                        <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold" transform={`rotate(${(startAngle + endAngle) / 2}, ${tx}, ${ty})`}>
                          {prize.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {result ? (
                <div className="animate-count-up">
                  <p className="text-lg font-bold text-primary">🎉 You won: {result}!</p>
                  <p className="text-sm text-muted-foreground mt-1">Added to your account</p>
                </div>
              ) : (
                <button
                  onClick={spin}
                  disabled={spinning}
                  className="px-8 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-lg hover:bg-cta-orange-light transition-colors disabled:opacity-60"
                >
                  {spinning ? 'Spinning...' : 'SPIN NOW!'}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SpinWheel;
