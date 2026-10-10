import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Business, NotificationItem } from '../types';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../utils/api';

interface AuthContextType {
  user: User | null;
  business: Business | null;
  token: string | null;
  isLoading: boolean;
  currency: string;
  currencySymbol: string;
  formatCurrency: (amount: number) => string;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, businessData?: Partial<Business>) => Promise<void>;
  logout: () => Promise<void>;
  updateBusiness: (updates: Partial<Business>) => Promise<void>;
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshBusiness: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  CAD: 'C$',
  AUD: 'A$',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const currency = business?.currency || 'INR';
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '₹';

  const formatCurrency = (amount: number): string => {
    return `${currencySymbol}${amount.toLocaleString('en-IN')}`;
  };

  const refreshBusiness = async () => {
    if (!token) return;
    try {
      const data = await api.get<Business>('/api/business');
      setBusiness(data);
    } catch (err) {
      console.error('Failed to fetch business', err);
    }
  };

  const refreshNotifications = async () => {
    if (!token) return;
    try {
      const data = await api.get<NotificationItem[]>('/api/notifications');
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.post(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  // Initial authentication check
  useEffect(() => {
    const initAuth = async () => {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.get<{ user: User; business: Business }>('/api/auth/me');
        setUser(data.user);
        setBusiness(data.business);
        setToken(stored);
        // fetch initial notifications
        const notifs = await api.get<NotificationItem[]>('/api/notifications').catch(() => []);
        setNotifications(notifs || []);
      } catch (err) {
        console.error('Auth verification failed:', err);
        removeStoredToken();
        setUser(null);
        setBusiness(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ user: User; token: string; business: Business }>('/api/auth/login', {
      email,
      password,
    });
    setStoredToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setBusiness(data.business);
    refreshNotifications();
  };

  const register = async (name: string, email: string, password: string, businessData?: Partial<Business>) => {
    const data = await api.post<{ user: User; token: string; business: Business }>('/api/auth/register', {
      name,
      email,
      password,
      business: businessData,
    });
    setStoredToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setBusiness(data.business);
    refreshNotifications();
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // ignore
    }
    removeStoredToken();
    setToken(null);
    setUser(null);
    setBusiness(null);
    setNotifications([]);
  };

  const updateBusiness = async (updates: Partial<Business>) => {
    const updated = await api.put<Business>('/api/business', updates);
    setBusiness(updated);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        token,
        isLoading,
        currency,
        currencySymbol,
        formatCurrency,
        login,
        register,
        logout,
        updateBusiness,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        refreshNotifications,
        refreshBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
