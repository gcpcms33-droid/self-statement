import { useCallback, useRef, useState } from 'react';
import type { UserProfile } from '../types/finance';

export const PROFILE_STORAGE_KEY = 'hisaap_profile_v1';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  avatarUrl: '',
};

function loadInitialProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      avatarUrl: typeof parsed.avatarUrl === 'string' ? parsed.avatarUrl : '',
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(loadInitialProfile);
  const profileRef = useRef<UserProfile>(profile);
  const [storageError, setStorageError] = useState<string>('');

  const updateProfile = useCallback((updates: Partial<UserProfile>): boolean => {
    const next: UserProfile = {
      ...profileRef.current,
      ...updates,
    };
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
      profileRef.current = next;
      setProfile(next);
      setStorageError('');
      return true;
    } catch {
      setStorageError('STORAGE_QUOTA_EXCEEDED');
      return false;
    }
  }, []);

  const clearStorageError = useCallback(() => {
    setStorageError('');
  }, []);

  return {
    profile,
    updateProfile,
    storageError,
    clearStorageError,
  };
}
