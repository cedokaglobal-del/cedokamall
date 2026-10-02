import { useCallback, useEffect, useRef, useState } from 'react';
import { Calculator, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import EnergyCalculator from './EnergyCalculator';

/**
 * The site's floating action rail.
 *
 * Holds two round, icon-only buttons in one vertical stack so they can never
 * overlap each other or the mobile bottom navigation:
 *
 *   - Energy calculator (opens a side drawer)
 *   - WhatsApp chat bubble (draggable on phones, pinned on desktop)
 *
 * Mounted once at the app level so the calculator is reachable from every page
 * rather than only the standalone calculator route.
 */
const FloatingActions = () => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [applianceCount, setApplianceCount] = useState(0);

  // Keep the calculator badge in step with what has been added.
  useEffect(() => {
    const updateCount = () => {
      try {
        const raw = sessionStorage.getItem('cedoka_energy_calculator');
        if (!raw) {
          setApplianceCount(0);
          return;
        }
        const data = JSON.parse(raw);
        setApplianceCount(data.appliances?.filter((a: { enabled: boolean }) => a.enabled)?.length || 0);
      } catch {
        /* noop */
      }
    };

    updateCount();
    const interval = setInterval(updateCount, 3000);
    return () => clearInterval(interval);
  }, []);

  // Close the drawer on Escape so it behaves like a real dialog.
  useEffect(() => {
    if (!isCalculatorOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsCalculatorOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCalculatorOpen]);

  return (
    <>
      {/* Calculator button — top slot of the rail */}
      <button
        type="button"
        onClick={() => setIsCalculatorOpen(true)}
        className={cn(
          'fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full md:h-16 md:w-16',
          // Sits directly above the WhatsApp bubble; lifted on phones to clear
          // the bottom navigation bar.
          'bottom-[152px] md:bottom-[104px]',
          'bg-navy text-gold border border-gold/40 shadow-xl',
          'transition-transform duration-200 hover:scale-105 active:scale-95',
          isCalculatorOpen && 'pointer-events-none opacity-0'
        )}
        aria-label="Open Energy Calculator"
        title="Energy Calculator"
      >
        <Calculator className="h-6 w-6 md:h-7 md:w-7" aria-hidden="true" />
        {applianceCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-navy ring-2 ring-ivory">
            {applianceCount > 9 ? '9+' : applianceCount}
          </span>
        )}
      </button>

      <WhatsAppBubble />

      {/* Backdrop */}
      {isCalculatorOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsCalculatorOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-[60] h-full w-full max-w-2xl overflow-y-auto bg-ivory shadow-2xl transition-transform duration-300 ease-out',
          isCalculatorOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Energy Calculator"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-navy px-6 py-4">
          <div className="flex items-center gap-3">
            <Calculator className="h-5 w-5 text-gold" aria-hidden="true" />
            <span className="text-sm font-bold uppercase tracking-widest text-champagne">Energy Calculator</span>
          </div>
          <button
            type="button"
            onClick={() => setIsCalculatorOpen(false)}
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

const WA_POSITION_KEY = 'cedoka_wa_position';
const WA_MIN_BOTTOM = 88;
const WA_MAX_BOTTOM = 260;

/**
 * WhatsApp bubble, bottom slot of the rail. Draggable on phones so a thumb can
 * move it clear of content; from `md` up it is pinned to its slot.
 */
const WhatsAppBubble = () => {
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem(WA_POSITION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { bottom?: number; right?: number };
        return {
          bottom: Math.min(WA_MAX_BOTTOM, Math.max(WA_MIN_BOTTOM, Number(parsed.bottom) || WA_MIN_BOTTOM)),
          right: Math.min(80, Math.max(8, Number.isFinite(Number(parsed.right)) ? Number(parsed.right) : 16)),
        };
      }
    } catch {
      /* ignore */
    }
    return { bottom: WA_MIN_BOTTOM, right: 16 };
  });

  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = (event: MediaQueryList | MediaQueryListEvent) => setIsDesktop(event.matches);
    sync(mq);
    mq.addEventListener('change', sync as (event: MediaQueryListEvent) => void);
    return () => mq.removeEventListener('change', sync as (event: MediaQueryListEvent) => void);
  }, []);

  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startBottom: WA_MIN_BOTTOM, startRight: 16 });

  const onStart = useCallback(
    (clientX: number, clientY: number) => {
      if (isDesktop) return;
      const d = dragRef.current;
      d.dragging = false;
      d.startX = clientX;
      d.startY = clientY;
      d.startBottom = pos.bottom;
      d.startRight = pos.right;
    },
    [isDesktop, pos.bottom, pos.right]
  );

  const onMove = useCallback(
    (clientX: number, clientY: number) => {
      if (isDesktop) return;
      const d = dragRef.current;
      const dx = clientX - d.startX;
      const dy = clientY - d.startY;
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) d.dragging = true;
      if (d.dragging) {
        setPos({
          bottom: Math.min(WA_MAX_BOTTOM, Math.max(WA_MIN_BOTTOM, Math.round(d.startBottom - dy))),
          right: Math.min(80, Math.max(8, Math.round(d.startRight - dx))),
        });
      }
    },
    [isDesktop]
  );

  const onEnd = useCallback(() => {
    if (dragRef.current.dragging) {
      try {
        localStorage.setItem(WA_POSITION_KEY, JSON.stringify(pos));
      } catch {
        /* ignore */
      }
    }
  }, [pos]);

  return (
    <a
      href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2349128817136'}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (dragRef.current.dragging) {
          e.preventDefault();
          dragRef.current.dragging = false;
        }
      }}
      onMouseDown={(e) => onStart(e.clientX, e.clientY)}
      onMouseMove={(e) => {
        if (e.buttons === 1) onMove(e.clientX, e.clientY);
      }}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchStart={(e) => onStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => onMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={(e) => {
        if (dragRef.current.dragging) e.preventDefault();
        onEnd();
      }}
      className={cn(
        'fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-transform duration-200 hover:scale-105 active:scale-95 select-none md:h-16 md:w-16 md:right-6',
        isDesktop ? 'bottom-6 touch-auto' : 'touch-none'
      )}
      style={isDesktop ? undefined : { bottom: `${pos.bottom}px`, right: `${pos.right}px` }}
      aria-label="Chat with support on WhatsApp"
      title="Chat with Support"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current md:h-8 md:w-8" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
};

export default FloatingActions;
