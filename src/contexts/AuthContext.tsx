import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const adminEmailList = (import.meta.env.VITE_ADMIN_EMAILS ||
  import.meta.env.VITE_ADMIN_EMAIL ||
  '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function isAuthorizedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  if (adminEmailList.length === 0) return true;
  return adminEmailList.includes(email.toLowerCase());
}

function installAntiTamper() {
  if (typeof window === 'undefined') return;

  const protectedKeys = ['adminToken', 'adminEmail'];
  let authFlowActive = false;

  (window as Window & { __setAuthFlowActive?: (active: boolean) => void }).__setAuthFlowActive =
    (active: boolean) => {
      authFlowActive = active;
    };

  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function setProtectedItem(key: string, value: string) {
    if (protectedKeys.includes(key) && !authFlowActive) {
      console.warn('[Security] Unauthorized attempt to modify protected storage key:', key);
      return;
    }

    originalSetItem.call(this, key, value);
  };

  const originalRemoveItem = Storage.prototype.removeItem;
  Storage.prototype.removeItem = function removeProtectedItem(key: string) {
    if (protectedKeys.includes(key) && !authFlowActive) {
      console.warn('[Security] Unauthorized attempt to remove protected storage key:', key);
      return;
    }

    originalRemoveItem.call(this, key);
  };

  if (import.meta.env.MODE === 'production') {
    const noop = () => {};
    (window as Window & { console: Console }).console = {
      ...console,
      log: noop,
      warn: noop,
      error: noop,
      info: noop,
      debug: noop,
      table: noop,
      dir: noop,
      group: noop,
      groupEnd: noop,
      trace: noop,
      assert: noop,
    };
  }
}

async function applySession(session: Session | null) {
  const email = session?.user?.email ?? null;
  const authorized = isAuthorizedAdmin(email);

  if (session && !authorized) {
    await supabase.auth.signOut();
    return {
      isAuthenticated: false,
      isAdmin: false,
      adminEmail: null,
    };
  }

  if (session && authorized) {
    (window as Window & { __setAuthFlowActive?: (active: boolean) => void }).__setAuthFlowActive?.(true);
    localStorage.setItem('adminToken', session.access_token);
    localStorage.setItem('adminEmail', email ?? '');
    (window as Window & { __setAuthFlowActive?: (active: boolean) => void }).__setAuthFlowActive?.(false);

    return {
      isAuthenticated: true,
      isAdmin: true,
      adminEmail: email,
    };
  }

  (window as Window & { __setAuthFlowActive?: (active: boolean) => void }).__setAuthFlowActive?.(true);
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminEmail');
  (window as Window & { __setAuthFlowActive?: (active: boolean) => void }).__setAuthFlowActive?.(false);

  return {
    isAuthenticated: false,
    isAdmin: false,
    adminEmail: null,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    installAntiTamper();

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const syncSession = async (session: Session | null) => {
      const nextState = await applySession(session);
      setIsAuthenticated(nextState.isAuthenticated);
      setIsAdmin(nextState.isAdmin);
      setAdminEmail(nextState.adminEmail);
    };

    void supabase.auth.getSession().then(async ({ data }) => {
      await syncSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session).finally(() => setIsLoading(false));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!isSupabaseConfigured) {
        console.error('Supabase is not configured. Add the required environment variables.');
        return false;
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (!isAuthorizedAdmin(normalizedEmail)) {
        return false;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        console.error('Supabase login failed:', error.message);
        return false;
      }

      const sessionEmail = data.user?.email ?? data.session?.user?.email ?? null;
      if (!isAuthorizedAdmin(sessionEmail)) {
        await supabase.auth.signOut();
        return false;
      }

      setIsAuthenticated(true);
      setIsAdmin(true);
      setAdminEmail(sessionEmail);
      return true;
    } catch (error) {
      console.error('Unexpected login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }

    (window as Window & { __setAuthFlowActive?: (active: boolean) => void }).__setAuthFlowActive?.(true);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    (window as Window & { __setAuthFlowActive?: (active: boolean) => void }).__setAuthFlowActive?.(false);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAdminEmail(null);
  };

  const checkAuth = () => isAuthenticated;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAdmin, adminEmail, login, logout, checkAuth, isLoading }}
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
