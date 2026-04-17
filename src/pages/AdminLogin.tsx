import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateEmail, validatePassword } from '@/config/security';
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
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <img src="/logo.png" alt="Cedoka Admin" className="w-12 h-12 object-contain" />
            <span className="ml-3 font-bold text-xl">Cedoka Admin</span>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Admin Login</h1>
          <p className="text-center text-muted-foreground mb-6">
            Sign in to your admin account
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="cedokamall@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="mt-2"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Notice */}
          <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm">
            <p className="font-semibold mb-2">Demo Credentials</p>
            <p className="mb-2 text-xs">
              <span className="font-mono">Email: cedokamall@gmail.com</span>
              <br />
              <span className="font-mono">Password: ckd12_#cedoka</span>
            </p>
            <p className="text-xs">In production, implement proper authentication with JWT tokens.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
