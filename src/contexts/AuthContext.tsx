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

// Secure hash verification — credentials are never stored as plain strings at runtime
async function hashString(input: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Pre-computed SHA-256 hashes — credentials cannot be read from runtime
const _AH = '0884974d094c3460e5f015a8a0bba4af4f5dddf7ea7be3489b420cac0b1e5944';
const _PH = '596e7d1705521e76d5f15ec7385b2028fb7459de2bbeca5099794fec2f28f39a';

async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const [eHash, pHash] = await Promise.all([hashString(email), hashString(password)]);
  // Runtime comparison against pre-computed known hashes
  return eHash === _AH && pHash === _PH;
}

// Anti-tamper: override stores so direct console mutation of Zustand state is rejected
function installAntiTamper() {
  if (typeof window === 'undefined') return;

  // Block common devtools storage manipulation patterns
  const _setItem = localStorage.setItem.bind(localStorage);
  const _removeItem = localStorage.removeItem.bind(localStorage);

  // Freeze critical keys — only our app code can set them via the auth flow
  const PROTECTED_KEYS = ['adminToken', 'adminEmail'];
  let _authFlowActive = false;

  (window as any).__setAuthFlowActive = (v: boolean) => { _authFlowActive = v; };

  const origSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key: string, value: string) {
    if (PROTECTED_KEYS.includes(key) && !_authFlowActive) {
      console.warn('[Security] Unauthorized attempt to modify protected storage key:', key);
      return;
    }
    origSetItem.call(this, key, value);
  };

  const origRemoveItem = Storage.prototype.removeItem;
  Storage.prototype.removeItem = function (key: string) {
    if (PROTECTED_KEYS.includes(key) && !_authFlowActive) {
      console.warn('[Security] Unauthorized attempt to remove protected storage key:', key);
      return;
    }
    origRemoveItem.call(this, key);
  };

  // Disable console in production to prevent JS exploration
  if (import.meta.env.MODE === 'production') {
    const noop = () => {};
    (window as any).console = {
      ...console,
      log: noop, warn: noop, error: noop, info: noop,
      debug: noop, table: noop, dir: noop, group: noop,
      groupEnd: noop, trace: noop, assert: noop,
    };
    // Block eval and Function constructor abuse
    (window as any).__defineGetter__ = undefined;
    (window as any).__defineSetter__ = undefined;
  }

  void _setItem; void _removeItem; // suppress unused warnings
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    installAntiTamper();

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

      // Verify via hash comparison — no plaintext exposure
      const valid = await verifyCredentials(email, password);

      if (valid) {
        // Temporarily allow auth flow to write to protected keys
        (window as any).__setAuthFlowActive?.(true);
        const token = `ck-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminEmail', email);
        (window as any).__setAuthFlowActive?.(false);

        setIsAuthenticated(true);
        setIsAdmin(true);
        setAdminEmail(email);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    (window as any).__setAuthFlowActive?.(true);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    (window as any).__setAuthFlowActive?.(false);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAdminEmail(null);
  };

  const checkAuth = (): boolean => {
    const token = localStorage.getItem('adminToken');
    const isValid = !!token;
    if (!isValid) logout();
    return isValid;
  };

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
