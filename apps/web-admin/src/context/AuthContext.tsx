import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import * as cookieStorage from "../lib/cookies";
import {
  api,
  AuthenticationError,
  NotFoundError,
  NetworkError,
} from "../services/api";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      const storedToken = cookieStorage.getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const userData = await api.getMe();
        if (cancelled) return;

        if (userData?.role !== "ADMIN") {
          setError("Access denied. Admin privileges required.");
          cookieStorage.clearAuth();
          setToken(null);
          setUser(null);
          return;
        }
        setToken(storedToken);
        setUser(userData);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        if (
          err instanceof AuthenticationError ||
          err instanceof NotFoundError
        ) {
          cookieStorage.clearAuth();
          setToken(null);
          setUser(null);
          setError(
            err instanceof NotFoundError
              ? "Your account is no longer active. Please contact support."
              : null,
          );
          setIsLoading(false);
          return;
        }
        if (err instanceof NetworkError) {
          setError("Connection issue. Retrying...");
          setIsLoading(false);
          setTimeout(() => {
            setError(null);
            initAuth();
          }, 3000);
          return;
        }
        console.error("Failed to restore session:", err);
        cookieStorage.clearAuth();
        setToken(null);
        setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    initAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = (newToken: string, userData: User) => {
    if (userData?.role !== "ADMIN") {
      setError("Access denied. Admin privileges required.");
      return;
    }
    setToken(newToken);
    setUser(userData);
    setError(null);
    cookieStorage.setToken(newToken);
    cookieStorage.setUser(userData as unknown as Record<string, unknown>);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setError(null);
    cookieStorage.clearAuth();
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        logout,
        clearError,
        isAuthenticated: !!token && !!user && user.role === "ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
