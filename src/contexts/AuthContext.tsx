import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminEmail');
    
    if (token && email) {
      setIsAuthenticated(true);
      setIsAdmin(true);
      setAdminEmail(email);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Admin credentials
      const ADMIN_EMAIL = 'cedokamall@gmail.com';
      const ADMIN_PASSWORD = 'ckd12_#cedoka';
      
      // Validate credentials
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = `token-${Date.now()}-${Math.random()}`;
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminEmail', email);
        
        setIsAuthenticated(true);
        setIsAdmin(true);
        setAdminEmail(email);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAdminEmail(null);
  };

  const checkAuth = (): boolean => {
    const token = localStorage.getItem('adminToken');
    const isValid = !!token;
    
    if (!isValid) {
      logout();
    }
    
    return isValid;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isAdmin, 
        adminEmail, 
        login, 
        logout, 
        checkAuth,
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
