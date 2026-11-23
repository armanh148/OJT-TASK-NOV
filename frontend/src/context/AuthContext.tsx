'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const storedUser = localStorage.getItem('mbt_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Verify with server
        const res = await apiClient.get('/auth/me');
        if (res.data?.data?.user) {
          setUser(res.data.data.user);
          localStorage.setItem('mbt_user', JSON.stringify(res.data.data.user));
        }
      } catch {
        // Not authenticated
        setUser(null);
        localStorage.removeItem('mbt_user');
        localStorage.removeItem('mbt_token');
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { user: userData, token } = res.data.data;

      setUser(userData);
      localStorage.setItem('mbt_user', JSON.stringify(userData));
      localStorage.setItem('mbt_token', token);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiClient.post('/auth/register', { name, email, password });
      const { user: userData, token } = res.data.data;

      setUser(userData);
      localStorage.setItem('mbt_user', JSON.stringify(userData));
      localStorage.setItem('mbt_token', token);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.',
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      setUser(null);
      localStorage.removeItem('mbt_user');
      localStorage.removeItem('mbt_token');
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
