import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations } from '../i18n/translations';
import { NavTab, User, NotificationItem } from '../types';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: keyof typeof translations['en']) => string;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  openConversation: (id: string) => void;
  currentUser: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  users: User[];
  switchUser: (userId: string) => Promise<void>;
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  refreshCount: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('bekya_lang') as Language) || 'en';
  });
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);

  const isRTL = language === 'ar';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bekya_lang', lang);
  };

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = useCallback(
    (key: keyof typeof translations['en']): string => {
      const dict = translations[language] || translations.en;
      return dict[key] || translations.en[key] || (key as string);
    },
    [language]
  );

  const triggerRefresh = useCallback(() => {
    setRefreshCount((prev) => prev + 1);
  }, []);

  // Fetch current user and team members
  const fetchAuth = useCallback(async () => {
    try {
      const storedUserId = localStorage.getItem('bekya_session_user_id');
      const headers: Record<string, string> = {};
      if (storedUserId) {
        headers['x-user-id'] = storedUserId;
      }

      const [currRes, teamRes] = await Promise.all([
        fetch('/api/auth/current', { headers }),
        fetch('/api/team'),
      ]);

      if (currRes.ok) {
        const data = await currRes.json();
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('bekya_session_user_id', data.user.id);
        } else {
          setCurrentUser(null);
          localStorage.removeItem('bekya_session_user_id');
        }
      } else {
        setCurrentUser(null);
      }

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setUsers(teamData.users || []);
      }
    } catch (err) {
      console.error('Error fetching auth data:', err);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Login handler
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }
      setCurrentUser(data.user);
      localStorage.setItem('bekya_session_user_id', data.user.id);
      triggerRefresh();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('bekya_session_user_id');
      setCurrentUser(null);
      setSelectedConversationId(null);
      setActiveTab('overview');
    }
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchAuth();
    fetchNotifications();
  }, [fetchAuth, fetchNotifications, refreshCount]);

  const switchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem('bekya_session_user_id', data.user.id);
        triggerRefresh();
      }
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const openConversation = (id: string) => {
    setSelectedConversationId(id);
    setActiveTab('inbox');
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        isRTL,
        t,
        activeTab,
        setActiveTab,
        selectedConversationId,
        setSelectedConversationId,
        openConversation,
        currentUser,
        isAuthenticated: Boolean(currentUser),
        authLoading,
        login,
        logout,
        users,
        switchUser,
        notifications,
        unreadNotifsCount,
        markNotificationRead,
        markAllNotificationsRead,
        refreshCount,
        triggerRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
