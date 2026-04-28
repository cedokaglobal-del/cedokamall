import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateEmail } from '@/config/security';
import { useAuth } from '@/contexts/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email || !validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }

      if (!password) {
        setError('Please enter your password');
        return;
      }

      // Attempt login
      const success = await login(email, password);
      
      if (success) {
        navigate('/admin');
      } else {
        setError('Login failed. Check your email, password, and admin access.');
      }
    } catch (err) {
      setError('Login failed. Check your email, password, and admin access.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-emerald-800 to-primary/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header band */}
          <div className="bg-gradient-to-r from-primary to-emerald-700 px-8 py-8 flex flex-col items-center">
            <img
              src="/logo.png"
              alt="Cedoka Admin"
              className="object-contain mb-3"
              style={{ height: '56px', width: 'auto', maxWidth: '180px' }}
            />
            <p className="text-primary-foreground/80 text-sm mt-1">Admin Control Panel</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h1 className="text-2xl font-bold text-center mb-1">Sign In</h1>
            <p className="text-center text-muted-foreground text-sm mb-6">
              Enter your credentials to access the dashboard
            </p>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2">
                <span className="font-semibold">⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@cedokamall.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="mt-1.5 h-11"
                  autoComplete="email"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="mt-1.5 h-11"
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-base font-semibold mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Authorized personnel only. All access is logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
