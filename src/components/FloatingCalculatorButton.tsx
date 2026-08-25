import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calculator, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import EnergyCalculator from './EnergyCalculator';

interface FloatingCalculatorButtonProps {
  externalOpen?: boolean;
  onExternalToggle?: (open: boolean) => void;
}

const APPLIANCE_COUNT_KEY = 'cedoka_energy_calculator';

const FloatingCalculatorButton = ({ externalOpen, onExternalToggle }: FloatingCalculatorButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [applianceCount, setApplianceCount] = useState(0);

  const actualOpen = externalOpen !== undefined ? externalOpen : isOpen;
  const setActualOpen = onExternalToggle || setIsOpen;

  useEffect(() => {
    const updateCount = () => {
      try {
        const raw = sessionStorage.getItem(APPLIANCE_COUNT_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          const count = data.appliances?.filter((a: { enabled: boolean }) => a.enabled)?.length || 0;
          setApplianceCount(count);
        }
      } catch { /* noop */ }
    };

    updateCount();
    window.addEventListener('storage', updateCount);
    const interval = setInterval(updateCount, 3000);

    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(interval);
    };
  }, []);

  const handleToggle = useCallback(() => {
    setActualOpen((prev: boolean) => !prev);
  }, [setActualOpen]);

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'fixed z-40 flex items-center gap-2 rounded-full shadow-xl transition-all duration-300 hover:scale-105',
          'bottom-6 right-6 bg-navy text-champagne border border-gold/30',
          'px-4 py-3 md:px-5 md:py-3.5',
          'text-xs font-bold uppercase tracking-widest',
          actualOpen && 'scale-90 opacity-0 pointer-events-none'
        )}
        aria-label="Open Energy Calculator"
      >
        <Calculator className="h-5 w-5 text-gold" />
        <span className="hidden sm:inline">Energy Calc</span>
        {applianceCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-navy">
            {applianceCount > 9 ? '9+' : applianceCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {actualOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setActualOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-ivory shadow-2xl transition-transform duration-400 ease-smooth overflow-y-auto',
          actualOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Energy Calculator"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-navy px-6 py-4">
          <div className="flex items-center gap-3">
            <Calculator className="h-5 w-5 text-gold" />
            <span className="text-sm font-bold uppercase tracking-widest text-champagne">Energy Calculator</span>
          </div>
          <button
            type="button"
            onClick={() => setActualOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-champagne transition-colors hover:bg-white/20"
            aria-label="Close calculator"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 md:p-6">
          <EnergyCalculator />
        </div>
      </div>
    </>
  );
};

export default FloatingCalculatorButton;
