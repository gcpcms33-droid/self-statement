import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { as } from '../locales/as';
import { en, type TranslationKeys } from '../locales/en';

export type AppLanguage = 'as' | 'en';

const LANGUAGE_STORAGE_KEY = 'hisaap_language_v1';

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: TranslationKeys;
  formatText: (template: string, vars: Record<string, string | number>) => string;
  translateAccount: (name: string) => string;
  translateCategory: (name: string) => string;
}

const DICTIONARIES: Record<AppLanguage, TranslationKeys> = {
  as,
  en,
};

function readInitialLanguage(): AppLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'as') {
      return stored;
    }
  } catch {
    // Ignore storage read errors
  }
  return 'as';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(readInitialLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore storage write errors
    }
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'as' ? 'en' : 'as'));
  }, []);

  const t = DICTIONARIES[language];

  const formatText = useCallback(
    (template: string, vars: Record<string, string | number>) => {
      let out = template;
      for (const [k, v] of Object.entries(vars)) {
        out = out.split(`{${k}}`).join(String(v));
      }
      return out;
    },
    []
  );

  const translateAccount = useCallback(
    (name: string) => {
      return t.accounts[name] || name;
    },
    [t]
  );

  const translateCategory = useCallback(
    (name: string) => {
      return t.categories[name] || name;
    },
    [t]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      formatText,
      translateAccount,
      translateCategory,
    }),
    [language, setLanguage, toggleLanguage, t, formatText, translateAccount, translateCategory]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
