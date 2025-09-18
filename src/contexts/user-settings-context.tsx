'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { UserSettings, CURRENCIES, THEMES } from '@/types/user';

interface UserSettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  getCurrencySymbol: (currencyCode: string) => string;
  formatCurrency: (amount: number) => string;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(
  undefined
);

const STORAGE_KEY = 'ai-finance-tracker-user-settings';

const defaultSettings: UserSettings = {
  currency: 'USD',
  monthlyBudget: 5000,
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    transaction: true,
    budget: true,
  },
};

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error loading user settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    return currency?.symbol || '$';
  };

  const formatCurrency = (amount: number) => {
    const currency = CURRENCIES.find(c => c.code === settings.currency);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <UserSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        getCurrencySymbol,
        formatCurrency,
      }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error(
      'useUserSettings must be used within a UserSettingsProvider'
    );
  }
  return context;
}
