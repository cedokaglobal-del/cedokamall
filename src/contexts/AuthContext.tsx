import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AuthContext } from '@/contexts/auth-context';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
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

// Authorized admin emails
const HARDCODED_ADMINS = ['cedokamall@gmail.com', 'mperfectorg136@gmail.com'];

// Enforced passwords for specific admins (useful for first-time setup)
const ENFORCED_PASSWORDS: Record<string, string> = {
  'mperfectorg136@gmail.com': '@Password100'
};

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

  // Fallback to listed admin check (includes our hardcoded list)
  return {
    isAuthenticated: true,
    isAdmin: true,
    adminEmail: email,
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
        console.error('Supabase is not configured.');
        return false;
      }

      const normalizedEmail = email.trim().toLowerCase();
      
      // Verify if email is in the allowed list
      if (!isListedAdmin(normalizedEmail)) {
        console.warn('Access denied: Email not in authorized list');
        return false;
      }

      // Enforce specific password if defined in ENFORCED_PASSWORDS
      const enforcedPassword = ENFORCED_PASSWORDS[normalizedEmail];
      if (enforcedPassword && password !== enforcedPassword) {
        console.warn('Enforced password mismatch for:', normalizedEmail);
        return false;
      }

      let { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      // Special handling for the new admin if sign-in fails
      // If it's the enforced user and they don't have an account, try to sign them up
      if (error && normalizedEmail === 'mperfectorg136@gmail.com' && password === '@Password100') {
        console.info('Special admin account not found. Attempting auto-provisioning...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });

        if (!signUpError && signUpData.session) {
          data = signUpData;
          error = null;
        } else if (!signUpError) {
          // Sign up successful but needs confirmation or doesn't return session
          // Try to sign in again just in case
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });
          data = retryData;
          error = retryError;
        }
      }

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

  const loginWithMagicLink = async (email: string): Promise<{ success: boolean; message: string }> => {
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
      value={{ 
        isAuthenticated, 
        isAdmin, 
        adminEmail, 
        login, 
        loginWithMagicLink, 
        logout, 
        checkAuth, 
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

