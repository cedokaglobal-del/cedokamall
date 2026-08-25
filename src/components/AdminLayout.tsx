import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Home, Package, BarChart3, ShoppingCart, Sun } from 'lucide-react';
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
    <div className="flex h-screen bg-ivory font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 sm:p-6 border-b border-gold/10">
            <Link to="/admin" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
              <img
                src="/logo.png"
                alt="Cedoka Admin"
                className="brightness-0 invert opacity-90 h-7 sm:h-8 lg:h-9 w-auto"
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} to={item.href}>
                  <button
                    className={`flex w-full items-center gap-4 rounded-md px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
                      active 
                        ? 'bg-gold text-navy shadow-lg shadow-gold/20' 
                        : 'text-champagne/60 hover:text-gold hover:bg-white/5'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 sm:p-6 border-t border-gold/10">
            <button
              className="flex w-full items-center gap-4 rounded-md px-4 py-3 text-sm font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gold-antique/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm relative z-10">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-navy hover:bg-ivory rounded-md transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="font-serif text-base sm:text-xl font-bold text-navy truncate">Administrative Excellence</h1>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold uppercase tracking-widest text-navy">{adminEmail || 'Authority'}</p>
              <p className="text-[10px] font-medium text-navy/40 uppercase tracking-tighter">Authorized Personnel</p>
            </div>
            <div className="w-10 h-10 rounded-md bg-navy text-gold flex items-center justify-center font-serif text-lg font-bold shadow-md border border-gold/20">
              {adminEmail?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-12">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
