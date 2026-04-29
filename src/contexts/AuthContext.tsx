import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AuthContext } from '@/contexts/auth-context';
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

type AuthStateSnapshot = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminEmail: string | null;
};

const adminEmailList = (import.meta.env.VITE_ADMIN_EMAILS ||
  import.meta.env.VITE_ADMIN_EMAIL ||
  '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function isListedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  if (adminEmailList.length === 0) return true;
  return adminEmailList.includes(email.toLowerCase());
}

async function resolveAdminStatus(session: Session | null): Promise<AuthStateSnapshot> {
  const email = session?.user?.email ?? null;
  if (!session || !email) {
    return {
      isAuthenticated: false,
      isAdmin: false,
      adminEmail: null,
    };
  }

  try {
    const { data, error } = await supabase.rpc('is_admin');
    if (!error) {
      const isAdmin = Boolean(data);
      return {
        isAuthenticated: isAdmin,
        isAdmin,
        adminEmail: isAdmin ? email : null,
      };
    }
  } catch (error) {
    console.error('Admin role check failed:', error);
  }

  const isAdmin = isListedAdmin(email);
  return {
    isAuthenticated: isAdmin,
    isAdmin,
    adminEmail: isAdmin ? email : null,
  };
}

async function applySession(session: Session | null) {
  const nextState = await resolveAdminStatus(session);

  if (session && !nextState.isAdmin) {
    await supabase.auth.signOut();
  }

  return nextState;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        console.error('Supabase login failed:', error.message);
        return false;
      }

      const nextState = await resolveAdminStatus(data.session);
      if (!nextState.isAdmin) {
        await supabase.auth.signOut();
        return false;
      }

      setIsAuthenticated(nextState.isAuthenticated);
      setIsAdmin(nextState.isAdmin);
      setAdminEmail(nextState.adminEmail);
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

    setIsAuthenticated(false);
    setIsAdmin(false);
    setAdminEmail(null);
  };

  const checkAuth = () => isAuthenticated && isAdmin;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAdmin, adminEmail, login, logout, checkAuth, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

