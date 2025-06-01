'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/lib/api-auth';

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'employee';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthResponse {
  user: User;
  // tokens are handled via httpOnly cookies, so no access/refresh here needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  requireAuth?: boolean; // new optional prop
}

export function AuthProvider({ children, requireAuth = false }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // start as false

  useEffect(() => {
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Always attempt fetch, even if not required
  fetchUserProfile();
}, []);


  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authService.login({ email, password });
      setUser(response.user);
      // no localStorage set, tokens are httpOnly cookies
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authService.register(userData);
      setUser(response.user);
      // no localStorage set
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      // no localStorage cleanup needed
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
