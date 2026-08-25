import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateEmail } from '@/config/security';
import { useAuth } from '@/contexts/useAuth';
import { useSEO } from '@/hooks/useSEO';
import { Mail, Lock, ShieldCheck, ArrowRight, Star } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, loginWithMagicLink } = useAuth();
  useSEO({
    title: 'Admin Login - Cedokamall',
    description: '',
    keywords: [],
    robots: 'noindex, nofollow',
    type: 'website',
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic-link'>('password');

  useEffect(() => {
    const preloadAdminRoutes = () => {
      void import('./AdminDashboard');
      void import('./AdminProducts');
      void import('./AdminAnalytics');
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(preloadAdminRoutes, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = setTimeout(preloadAdminRoutes, 400);
    return () => window.clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email || !validateEmail(email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      if (loginMethod === 'password') {
        if (!password) {
          setError('Please enter your password');
          setIsLoading(false);
          return;
        }

        // Attempt password login
        const result = await login(email, password);
        
        if (result.success) {
          if (result.message) {
            setSuccess(result.message);
          } else {
            navigate('/admin');
          }
        } else {
          setError(result.message || 'Access denied. Please ensure your account is activated and you have admin privileges.');
        }
      } else {
        // Attempt magic link login
        const result = await loginWithMagicLink(email);
        if (result.success) {
          setSuccess(result.message);
        } else {
          setError(result.message);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please contact the administrator.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-outfit">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-600/20 to-primary/20 px-8 py-10 flex flex-col items-center border-b border-white/5">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-6 transform hover:scale-110 transition-transform duration-300">
              <img
                src="/logo.png"
                alt="Cedoka"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-emerald-400/80 text-sm font-medium mt-1 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Secure Access
            </p>
          </div>

          {/* Form Content */}
          <div className="px-8 py-10">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="mt-0.5">⚠️</span> 
                <span className="break-words font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <Star className="w-5 h-5 shrink-0" />
                <span className="break-words font-medium leading-relaxed">{success}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@cedokamall.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-14 pl-12 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-white/20"
                    autoComplete="email"
                  />
                </div>
              </div>

              {loginMethod === 'password' && (
                <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="password" className="text-xs font-bold text-white/50 uppercase tracking-wider">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('magic-link')}
                      className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-14 pl-12 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-white/20"
                      autoComplete="current-password"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <span className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {loginMethod === 'password' ? 'Sign In' : 'Send Login Link'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="w-full h-px bg-white/5 relative">
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-[#1e293b] text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                  Or
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => setLoginMethod(loginMethod === 'password' ? 'magic-link' : 'password')}
                className="text-sm font-semibold text-white/60 hover:text-white transition-colors"
              >
                {loginMethod === 'password' 
                  ? 'Sign in without password' 
                  : 'Sign in with password instead'}
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-[0.3em] mt-8">
          Cedokamall Global &copy; 2026 • Security First
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
