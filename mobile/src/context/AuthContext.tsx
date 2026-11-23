import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  api,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getStoredUser,
  setStoredUser,
} from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    try {
      const savedToken = await getAuthToken();
      const savedUser = await getStoredUser();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);

        // Verify with server in background
        api.auth
          .me()
          .then((res) => {
            if (res.success && res.data?.user) {
              setUser(res.data.user);
              setStoredUser(res.data.user);
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login(email.trim(), password);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      await setAuthToken(res.data.token);
      await setStoredUser(res.data.user);
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.auth.register(name.trim(), email.trim(), password);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      await setAuthToken(res.data.token);
      await setStoredUser(res.data.user);
      return { success: true };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await removeAuthToken();
  };

  const refreshUser = async () => {
    if (!token) return;
    const res = await api.auth.me();
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      await setStoredUser(res.data.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
