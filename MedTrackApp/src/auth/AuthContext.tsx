import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

export type AuthProfile = {
  id: string;
  email: string;
  name?: string;
  avatarUri?: string;
};

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  profile: AuthProfile | null;
  pendingEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<AuthProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const randomDelay = () => 400 + Math.floor(Math.random() * 300);

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadState = async () => {
      try {
        const [[, authValue], [, profileValue], [, pendingValue]] = await AsyncStorage.multiGet([
          STORAGE_KEYS.AUTH_IS_AUTHENTICATED,
          STORAGE_KEYS.AUTH_PROFILE,
          STORAGE_KEYS.AUTH_PENDING_EMAIL,
        ]);

        setIsAuthenticated(authValue === 'true');
        if (profileValue) {
          try {
            const parsed: AuthProfile = JSON.parse(profileValue);
            setProfile(parsed);
          } catch {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        setPendingEmail(pendingValue ?? null);
      } catch {
        setIsAuthenticated(false);
        setProfile(null);
        setPendingEmail(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  const persistState = useCallback(
    async (nextAuth: boolean, nextProfile: AuthProfile | null, nextPending: string | null) => {
      const entries: [string, string | null][] = [
        [STORAGE_KEYS.AUTH_IS_AUTHENTICATED, nextAuth ? 'true' : 'false'],
        [STORAGE_KEYS.AUTH_PROFILE, nextProfile ? JSON.stringify(nextProfile) : null],
        [STORAGE_KEYS.AUTH_PENDING_EMAIL, nextPending],
      ];

      const tasks = entries.map(([key, value]) =>
        value === null ? AsyncStorage.removeItem(key) : AsyncStorage.setItem(key, value),
      );

      await Promise.all(tasks);
    },
  );

  const login = useCallback(
    async (email: string, _password: string) => {
      await wait(randomDelay());
      const trimmed = email.trim().toLowerCase();
      const nextProfile: AuthProfile = {
        id: profile?.id ?? `user-${Date.now()}`,
        email: trimmed,
        name: profile?.name,
        avatarUri: profile?.avatarUri,
      };

      setIsAuthenticated(true);
      setProfile(nextProfile);
      setPendingEmail(null);
      await persistState(true, nextProfile, null);
    },
    [persistState, profile],
  );

  const register = useCallback(
    async (email: string, _password: string) => {
      await wait(randomDelay());
      const trimmed = email.trim().toLowerCase();
      setIsAuthenticated(false);
      setProfile(null);
      setPendingEmail(trimmed);
      await persistState(false, null, trimmed);
    },
    [persistState],
  );

  const verifyEmail = useCallback(
    async (code: string) => {
      await wait(randomDelay());
      const sanitized = code.trim();
      if (sanitized.length !== 6) {
        throw new Error('invalid_code');
      }

      const email = pendingEmail ?? profile?.email;
      if (!email) {
        throw new Error('missing_email');
      }

      const nextProfile: AuthProfile = {
        id: profile?.id ?? `user-${Date.now()}`,
        email,
        name: profile?.name,
        avatarUri: profile?.avatarUri,
      };

      setIsAuthenticated(true);
      setProfile(nextProfile);
      setPendingEmail(null);
      await persistState(true, nextProfile, null);
    },
    [pendingEmail, profile, persistState],
  );

  const logout = useCallback(async () => {
    await wait(randomDelay());
    setIsAuthenticated(false);
    setProfile(null);
    setPendingEmail(null);
    await persistState(false, null, null);
  }, [persistState]);

  const updateProfile = useCallback(
    async (patch: Partial<AuthProfile>) => {
      if (!profile) {
        return;
      }
      const nextProfile: AuthProfile = {
        ...profile,
        ...patch,
      };
      setProfile(nextProfile);
      await persistState(true, nextProfile, pendingEmail);
    },
    [pendingEmail, persistState, profile],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated,
      profile,
      pendingEmail,
      login,
      register,
      verifyEmail,
      logout,
      updateProfile,
    }),
    [isAuthenticated, isLoading, login, logout, pendingEmail, profile, register, updateProfile, verifyEmail],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
