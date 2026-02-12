"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthService, type User } from "@/lib/auth-service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, newPassword: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const result = AuthService.login(email, password);
    if (result.success && result.session) {
      const currentUser = AuthService.getCurrentUser();
      setUser(currentUser || null);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = AuthService.register(email, password, name);
    if (result.success && result.user) {
      // Auto-login after registration
      const loginResult = await login(email, password);
      return loginResult;
    }
    return { success: false, error: result.error };
  };

  const resetPassword = (email: string, newPassword: string) => {
    return AuthService.resetPassword(email, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
