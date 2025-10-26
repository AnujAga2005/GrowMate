/**
 * Authentication Context
 * Handles user session persistence across page refreshes
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On app load - check if token exists and restore session
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if token exists in localStorage
        if (authService.isAuthenticated()) {
          // Validate token by fetching current user
          const response = await authService.getMe();
          setUser(response.user);
        }
      } catch (error) {
        // Token is invalid or expired - clear it
        console.error('Session restoration failed:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authService.register({ name, email, password });
    setUser(response.user);
  };

  const loginWithToken = async (token: string) => {
    // Save token to localStorage
    localStorage.setItem('token', token);
    
    // Fetch user data
    const response = await authService.getMe();
    setUser(response.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithToken,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}