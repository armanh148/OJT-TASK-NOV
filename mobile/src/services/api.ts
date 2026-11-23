import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { localDb } from './localDatabase';

const TOKEN_KEY = '@budget_tracker_token';
const USER_KEY = '@budget_tracker_user';
const API_URL_KEY = '@budget_tracker_api_url';

// Auto-detect the backend API URL:
// 1. Explicit environment variable: EXPO_PUBLIC_API_URL (e.g. from .env or EAS build secrets)
// 2. Constants extra configuration
// 3. Physical phone / Expo Go LAN IP auto-detection via hostUri
// 4. Fallback to LAN IP: http://192.168.0.100:5000/api
export function getDefaultHost(): string {
  if (process.env.EXPO_PUBLIC_API_URL && process.env.EXPO_PUBLIC_API_URL.trim()) {
    return process.env.EXPO_PUBLIC_API_URL.trim().replace(/\/$/, '');
  }

  const extraUrl = (Constants.expoConfig?.extra as any)?.apiUrl;
  if (extraUrl && typeof extraUrl === 'string' && extraUrl.trim()) {
    return extraUrl.trim().replace(/\/$/, '');
  }

  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000/api`;
    }
  }

  // Local LAN IP reachable by both Android and iPhone
  return 'http://192.168.0.100:5000/api';
}

let cachedApiUrl: string | null = null;

export async function getApiBaseUrl(): Promise<string> {
  if (cachedApiUrl) return cachedApiUrl;
  try {
    const saved = await AsyncStorage.getItem(API_URL_KEY);
    if (saved && saved.trim()) {
      cachedApiUrl = saved.trim().replace(/\/$/, '');
      return cachedApiUrl;
    }
  } catch (e) {
    // ignore
  }
  const defaultHost = getDefaultHost();
  cachedApiUrl = defaultHost;
  return defaultHost;
}

export async function setApiBaseUrl(url: string): Promise<void> {
  const cleanUrl = url.trim().replace(/\/$/, '');
  cachedApiUrl = cleanUrl;
  await AsyncStorage.setItem(API_URL_KEY, cleanUrl);
}

export async function resetApiBaseUrl(): Promise<string> {
  const defaultHost = getDefaultHost();
  cachedApiUrl = defaultHost;
  await AsyncStorage.removeItem(API_URL_KEY);
  return defaultHost;
}

export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

export async function getStoredUser(): Promise<any | null> {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: any): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Universal HTTP Request Helper
async function request<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    requireAuth?: boolean;
  } = {}
): Promise<{ success: boolean; data?: T; message?: string; errors?: any }> {
  const { method = 'GET', body, requireAuth = true } = options;
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (requireAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await response.json().catch(() => ({
      success: false,
      message: `Server returned ${response.status} ${response.statusText}`,
    }));

    if (!response.ok) {
      const errorMsg = json.message || `Request failed with status ${response.status}`;
      return {
        success: false,
        message: errorMsg,
        errors: json.errors,
      };
    }

    return json;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')
          ? `Cannot connect to server at ${baseUrl}. Ensure backend is running and reachable on your Wi-Fi network.`
          : error.message || 'An unexpected network error occurred.',
    };
  }
}

export const api = {
  auth: {
    register: async (name: string, email: string, password: string) => {
      const res = await request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: { name, email, password },
        requireAuth: false,
      });
      if (res.success && res.data) return res;

      // Resilient Fallback to Local Embedded Database
      return await localDb.register(name, email, password);
    },

    login: async (email: string, password: string) => {
      const res = await request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: { email, password },
        requireAuth: false,
      });
      if (res.success && res.data) return res;

      // Resilient Fallback to Local Embedded Database (supports admin / admin00 out of the box)
      return await localDb.login(email, password);
    },

    me: async () => {
      const res = await request<{ user: any }>('/auth/me');
      if (res.success && res.data) return res;

      const user = await getStoredUser();
      if (user) {
        return { success: true, data: { user } };
      }
      return { success: false, message: 'Not authenticated' };
    },
  },

  income: {
    get: async (month: number, year: number) => {
      const res = await request<{
        income: { id: string; amount: string; month: number; year: number } | null;
        totalExpenses: string;
        remainingBalance: string;
        month: number;
        year: number;
      }>(`/income?month=${month}&year=${year}`);
      if (res.success && res.data) return res;

      // Local fallback
      const user = await getStoredUser();
      const userId = user?.id || 'user_admin_default_id';
      const inc = await localDb.getIncome(userId, month, year);
      const summ = await localDb.getSummary(userId, month, year);
      return {
        success: true,
        data: {
          income: inc,
          totalExpenses: summ.totalExpenses,
          remainingBalance: summ.remainingBalance,
          month,
          year,
        },
      };
    },

    set: async (month: number, year: number, amount: number | string) => {
      const res = await request<{
        id: string;
        amount: string;
        month: number;
        year: number;
      }>('/income', {
        method: 'POST',
        body: { month, year, amount },
      });
      if (res.success && res.data) return res;

      // Local fallback
      const user = await getStoredUser();
      const userId = user?.id || 'user_admin_default_id';
      const saved = await localDb.setIncome(userId, month, year, amount);
      return {
        success: true,
        data: {
          id: saved.id,
          amount: saved.amount,
          month: saved.month,
          year: saved.year,
        },
      };
    },
  },

  expenses: {
    list: async (month: number, year: number, category?: string) => {
      let query = `/expenses?month=${month}&year=${year}`;
      if (category && category !== 'ALL') query += `&category=${category}`;
      const res = await request<
        Array<{
          id: string;
          name: string;
          amount: string;
          category: string;
          date: string;
          month: number;
          year: number;
        }>
      >(query);
      if (res.success && res.data) return res;

      // Local fallback
      const user = await getStoredUser();
      const userId = user?.id || 'user_admin_default_id';
      const list = await localDb.getExpenses(userId, month, year, category);
      return {
        success: true,
        data: list,
      };
    },

    create: async (data: {
      name: string;
      amount: number | string;
      category?: string;
      date?: string;
      month?: number;
      year?: number;
    }) => {
      const res = await request<{
        id: string;
        name: string;
        amount: string;
        category: string;
        date: string;
      }>('/expenses', {
        method: 'POST',
        body: data,
      });
      if (res.success && res.data) return res;

      // Local fallback
      const user = await getStoredUser();
      const userId = user?.id || 'user_admin_default_id';
      const created = await localDb.createExpense(userId, data);
      return {
        success: true,
        data: {
          id: created.id,
          name: created.name,
          amount: created.amount,
          category: created.category,
          date: created.date,
        },
      };
    },

    update: async (
      id: string,
      data: {
        name?: string;
        amount?: number | string;
        category?: string;
        date?: string;
      }
    ) => {
      const res = await request<{
        id: string;
        name: string;
        amount: string;
        category: string;
        date: string;
      }>(`/expenses/${id}`, {
        method: 'PUT',
        body: data,
      });
      if (res.success && res.data) return res;

      // Local fallback
      const user = await getStoredUser();
      const userId = user?.id || 'user_admin_default_id';
      const updated = await localDb.updateExpense(userId, id, data);
      return {
        success: true,
        data: {
          id: updated.id,
          name: updated.name,
          amount: updated.amount,
          category: updated.category,
          date: updated.date,
        },
      };
    },

    delete: async (id: string) => {
      const res = await request<{ message: string }>(`/expenses/${id}`, {
        method: 'DELETE',
      });
      if (res.success && res.data) return res;

      // Local fallback
      const user = await getStoredUser();
      const userId = user?.id || 'user_admin_default_id';
      await localDb.deleteExpense(userId, id);
      return {
        success: true,
        data: { message: 'Expense deleted successfully' },
      };
    },
  },

  summary: {
    get: async (month: number, year: number) => {
      const res = await request<{
        totalIncome: string;
        totalExpenses: string;
        remainingBalance: string;
        expenseCount: number;
        percentageSpent: number;
        isOverspent: boolean;
        isNearLimit: boolean;
        categoryBreakdown: Record<string, string>;
        month: number;
        year: number;
      }>(`/summary?month=${month}&year=${year}`);
      if (res.success && res.data) return res;

      // Local fallback
      const user = await getStoredUser();
      const userId = user?.id || 'user_admin_default_id';
      const summ = await localDb.getSummary(userId, month, year);
      return {
        success: true,
        data: summ,
      };
    },
  },
};
