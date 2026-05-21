import { createContext, useEffect, useState, useMemo, useCallback, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AuthContext } from '@/contexts/auth-context';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithMagicLink: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
  isLoading: boolean;
}

type AuthStateSnapshot = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminEmail: string | null;
};

// Authorized admin emails - Load from environment variables only
// Remove all hardcoded credentials from source code for security
const HARDCODED_ADMINS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').filter(Boolean).map(e => e.trim());

// Passwords should NEVER be hardcoded - use environment variables or secure auth providers
const ENFORCED_PASSWORDS: Record<string, string> = {};

const adminEmailList = Array.from(new Set([
  ...(import.meta.env.VITE_ADMIN_EMAILS || '').split(','),
  ...(import.meta.env.VITE_ADMIN_EMAIL || '').split(','),
  ...HARDCODED_ADMINS
]))
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function isListedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmailList.includes(email.toLowerCase());
}

async function resolveAdminStatus(session: Session | null): Promise<AuthStateSnapshot> {
  const email = session?.user?.email ?? null;
  const userMetadata = session?.user?.user_metadata;
  
  if (!session || !email) {
    return {
      isAuthenticated: false,
      isAdmin: false,
      adminEmail: null,
    };
  }

  // Check if email is in the authorized list
  const isAuthorized = isListedAdmin(email);
  
  if (!isAuthorized) {
    console.warn('Unauthorized admin attempt:', email);
    return {
      isAuthenticated: false,
      isAdmin: false,
      adminEmail: null,
    };
  }

  // Check for activation status in metadata if it exists
  const isActivated = userMetadata?.activated !== false && userMetadata?.active !== false;
  if (!isActivated) {
    console.warn('Account is not activated:', email);
    return {
      isAuthenticated: false,
      isAdmin: false,
      adminEmail: null,
    };
  }

  try {
    const { data, error } = await supabase.rpc('is_admin');
    if (!error && data === true) {
      return {
        isAuthenticated: true,
        isAdmin: true,
        adminEmail: email,
      };
    }
  } catch (error) {
    console.error('Admin role check failed:', error);
  }

  // Fallback to listed admin check (includes our hardcoded list)
  const isHardcodedAdmin = isListedAdmin(email);
  return {
    isAuthenticated: isHardcodedAdmin,
    isAdmin: isHardcodedAdmin,
    adminEmail: isHardcodedAdmin ? email : null,
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

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      if (!isSupabaseConfigured) {
        return { success: false, message: 'Supabase is not configured.' };
      }

      const normalizedEmail = email.trim().toLowerCase();
      
      // Verify if email is in the allowed list
      if (!isListedAdmin(normalizedEmail)) {
        return { success: false, message: 'Access denied: Your email is not in the authorized admin list.' };
      }

      // Enforce specific password if defined in ENFORCED_PASSWORDS
      const enforcedPassword = ENFORCED_PASSWORDS[normalizedEmail];
      if (enforcedPassword && password !== enforcedPassword) {
        return { success: false, message: 'Invalid password for this admin account.' };
      }

      let { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      const nextState = await resolveAdminStatus(data.session);
      if (!nextState.isAdmin) {
        await supabase.auth.signOut();
        return { success: false, message: 'Access denied. You do not have admin privileges.' };
      }

      setIsAuthenticated(nextState.isAuthenticated);
      setIsAdmin(nextState.isAdmin);
      setAdminEmail(nextState.adminEmail);
      return { success: true };
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      return { success: false, message: error?.message || 'An unexpected error occurred.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithMagicLink = useCallback(async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const normalizedEmail = email.trim().toLowerCase();

      if (!isListedAdmin(normalizedEmail)) {
        return { success: false, message: 'Access denied: Your email is not in the authorized admin list.' };
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: window.location.origin + '/admin',
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Check your email for the login link!' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to send magic link.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }

    setIsAuthenticated(false);
    setIsAdmin(false);
    setAdminEmail(null);
  }, []);

  const checkAuth = useCallback(() => isAuthenticated && isAdmin, [isAuthenticated, isAdmin]);

  const value = useMemo(() => ({
    isAuthenticated,
    isAdmin,
    adminEmail,
    login,
    loginWithMagicLink,
    logout,
    checkAuth,
    isLoading,
  }), [isAuthenticated, isAdmin, adminEmail, checkAuth, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

