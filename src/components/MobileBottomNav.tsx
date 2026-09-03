import { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Sun, Sprout, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'General', icon: LayoutGrid, href: '/shop?view=all' },
  { label: 'Electronics', icon: LayoutGrid, href: '/shop' },
  { label: 'Solar', icon: Sun, href: '/solar' },
  { label: 'Farm', icon: Sprout, href: '/farms' },
  { label: 'Calculator', icon: Calculator, href: '/calculator' },
];

const MobileBottomNav = () => {
  const location = useLocation();

  const isActive = useCallback((item: typeof NAV_ITEMS[number]) => {
    if (item.href === '/') return location.pathname === '/';
    if (item.href === '/shop?view=all') return location.pathname === '/shop' && location.search.includes('view=all');
    if (item.href === '/shop') return location.pathname === '/shop' && !location.search.includes('view=all');
    if (item.href === '/solar') return location.pathname === '/solar';
    if (item.href === '/farms') return location.pathname === '/farms';
    if (item.href === '/calculator') return location.pathname === '/calculator';
    return location.pathname.startsWith(item.href);
  }, [location.pathname, location.search]);

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] border-t-2 border-gold bg-navy pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.4)] md:hidden" aria-label="Mobile navigation">
      <div className="grid h-16 grid-cols-6 px-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-0 transition-colors',
                active ? 'text-gold' : 'text-champagne/40'
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn('h-4 w-4', active && 'text-gold')} />
              <span className={cn(
                'text-[8px] font-bold uppercase tracking-wider whitespace-nowrap leading-tight',
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
