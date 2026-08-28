import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Home, Package, BarChart3, ShoppingCart, Sun, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, adminEmail } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/admin' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: ShoppingCart, label: 'Sales', href: '/admin/sales' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: Package, label: 'Flash Deals', href: '/admin/flash-deals' },
    { icon: Sun, label: 'Solar Plans', href: '/admin/solar-plans' },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="flex h-dvh bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
            <img
              src="/logo.png"
              alt="Cedoka"
              className="h-7 w-auto brightness-0 invert opacity-90"
            />
            <span className="text-xs font-bold uppercase tracking-widest text-champagne/60 hidden sm:inline">Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-champagne/60 hover:text-gold hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} to={item.href} onClick={() => setSidebarOpen(false)}>
                <span
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? 'bg-gold text-navy shadow-md shadow-gold/20'
                      : 'text-champagne/70 hover:text-gold hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Return to site + Logout */}
        <div className="border-t border-white/10 p-3 space-y-1">
          <a
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-champagne/70 hover:text-gold hover:bg-white/5 transition-all"
            onClick={() => setSidebarOpen(false)}
          >
            <ExternalLink className="w-4.5 h-4.5" />
            Return to Site
          </a>
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
            onClick={() => { handleLogout(); setSidebarOpen(false); }}
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-base font-bold text-navy truncate sm:text-lg">
              {menuItems.find((m) => isActive(m.href))?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-bold text-navy">{adminEmail || 'Admin'}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-navy text-gold flex items-center justify-center text-sm font-bold">
              {adminEmail?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
