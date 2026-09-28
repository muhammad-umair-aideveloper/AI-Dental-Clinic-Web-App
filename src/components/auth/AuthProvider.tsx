"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "user";
  created_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: "admin" | "user" | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  signup: (params: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  // Backward compatibility
  isClerkConfigured: boolean;
  demoUser: { name: string; email: string; phone: string } | null;
  loginDemoUser: (name: string, email: string, phone: string) => void;
  logoutDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isLoading: true,
  error: null,
  login: async () => ({ success: false, error: "Not initialized" }),
  signup: async () => ({ success: false, error: "Not initialized" }),
  logout: async () => {},
  refreshSession: async () => {},
  isClerkConfigured: false,
  demoUser: null,
  loginDemoUser: () => {},
  logoutDemoUser: () => {},
});

export const useAuth = () => useContext(AuthContext);
// Alias for backward compatibility with existing code
export const usePatient = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check persistent session on mount
  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.authenticated && data.user) {
        setUser(data.user);
        setError(null);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      console.error("[AuthProvider] Failed to fetch session:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.error || "Login failed. Please check your credentials.";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err: any) {
      const errorMsg = err?.message || "An unexpected network error occurred.";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (params: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.error || "Registration failed.";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err: any) {
      const errorMsg = err?.message || "An unexpected network error occurred.";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setError(null);
    } catch (err) {
      console.error("[AuthProvider] Logout error:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Compatibility with legacy demoUser
  const demoUser = user
    ? { name: user.name, email: user.email, phone: user.phone }
    : null;

  const loginDemoUser = (name: string, email: string, phone: string) => {
    // Treat legacy demo user login as active patient
    setUser({
      id: "usr-demo",
      name,
      email,
      phone,
      role: "user",
    });
  };

  const logoutDemoUser = () => {
    logout();
  };

  const contextValue: AuthContextType = {
    user,
    role: user?.role || null,
    isLoading,
    error,
    login,
    signup,
    logout,
    refreshSession,
    isClerkConfigured: false,
    demoUser,
    loginDemoUser,
    logoutDemoUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
