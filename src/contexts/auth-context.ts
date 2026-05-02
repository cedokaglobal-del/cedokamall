import * as React from "react";

export type AuthContextValue = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithMagicLink: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
  isLoading: boolean;
};

export const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);
