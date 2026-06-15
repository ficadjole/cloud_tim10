import React, { createContext, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import type { AuthContextType } from "../../types/auth/AuthContext";
import type { AuthUser } from "../../types/auth/AuthUser";
import type { JwtTokenClaims } from "../../types/auth/JwtTokenClaims";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const KEY = "authToken";
const USER_KEY = "authUser";
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

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
  const savedUser = localStorage.getItem(USER_KEY);
  if (saved && !expired(saved)) {
    const claims = decode(saved);
    if (claims) {
      const id = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      const email = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
      const role = claims[ROLE_CLAIM];
      const parsedUser = savedUser ? (JSON.parse(savedUser) as Partial<AuthUser>) : null;

      return {
        token: saved,
        user: {
          id,
          name: parsedUser?.name ?? email,
          email: parsedUser?.email ?? email,
          username: parsedUser?.username ?? parsedUser?.email ?? email,
          role,
        } as AuthUser,
      };
    }
  }
  if (saved) localStorage.removeItem(KEY);
  if (savedUser) localStorage.removeItem(USER_KEY);
  return { token: null, user: null };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initial = getInitialAuth();

  const [token, setToken] = useState<string | null>(initial.token);
  const [user, setUser] = useState<AuthUser | null>(initial.user);
  const [isLoading] = useState(false);

const login = (t: string, authUser?: Partial<AuthUser>) => {
  const claims = decode(t);
  if (!claims || expired(t)) return;

  const id = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
  const email = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
  const role = claims[ROLE_CLAIM];
  const nextUser: AuthUser = {
    id: authUser?.id ?? id,
    name: authUser?.name ?? authUser?.email ?? email,
    email: authUser?.email ?? email,
    username: authUser?.username ?? authUser?.email ?? email,
    role,
  };

  setToken(t);
  setUser(nextUser);
  localStorage.setItem(KEY, t);
  localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
};

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user && !!token, isLoading}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
