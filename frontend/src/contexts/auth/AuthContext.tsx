import React, { createContext, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import type { AuthContextType } from "../../types/auth/AuthContext";
import type { AuthUser } from "../../types/auth/AuthUser";
import type { JwtTokenClaims } from "../../types/auth/JwtTokenClaims";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const KEY = "authToken";

const decode = (token: string): JwtTokenClaims | null => {
  try {
    const d = jwtDecode<JwtTokenClaims>(token);
    const id = d?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    return id ? d : null;
  } catch {
    return null;
  }
};

const expired = (token: string): boolean => {
  try {
    const d = jwtDecode<{ exp?: number }>(token);
    return !d?.exp || d.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

const getInitialAuth = () => {
  const saved = localStorage.getItem(KEY);
  if (saved && !expired(saved)) {
    const claims = decode(saved);
    if (claims) {
      const id = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      const email = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
      const role = claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      return {
        token: saved,
        user: { id, username: email, role  } as AuthUser,
      };
    }
  }
  if (saved) localStorage.removeItem(KEY);
  return { token: null, user: null };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initial = getInitialAuth();

  const [token, setToken] = useState<string | null>(initial.token);
  const [user, setUser] = useState<AuthUser | null>(initial.user);
  const [isLoading] = useState(false);

const login = (t: string) => {
  const claims = decode(t);
  if (!claims || expired(t)) return;

  const id = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
  const email = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
  const role = claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  setToken(t);
  setUser({ id, username: email, role });
  localStorage.setItem(KEY, t);
};

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user && !!token, isLoading}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;