import { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Sun, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'General', icon: LayoutGrid, href: '/shop' },
  { label: 'Solar', icon: Sun, href: '/solar' },
  { label: 'Calculator', icon: Calculator, href: '/solar#solar-calculator' },
];

const MobileBottomNav = () => {
  const location = useLocation();

  const isActive = useCallback((item: typeof NAV_ITEMS[number]) => {
    if (item.href === '/') return location.pathname === '/';
    if (item.href === '/solar#solar-calculator') return location.pathname === '/solar';
    if (item.href === '/solar') return location.pathname === '/solar';
    return location.pathname.startsWith(item.href!);
  }, [location.pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gold-antique/20 bg-navy shadow-2xl md:hidden" aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.label}
              to={item.href!}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 py-1 transition-colors',
                active ? 'text-gold' : 'text-champagne/40'
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn('h-5 w-5', active && 'text-gold')} />
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-wider whitespace-nowrap',
                active ? 'text-gold' : 'text-champagne/40'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
