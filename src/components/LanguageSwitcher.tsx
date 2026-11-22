import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'default' | 'subtle';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'default' }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t.common.languageSwitchAria}
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-lg border shrink-0 ${
        variant === 'subtle'
          ? 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
          : 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
      }`}
    >
      <Globe
        className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1.5 mr-0.5 hidden sm:block shrink-0"
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => setLanguage('as')}
        aria-pressed={language === 'as'}
        aria-label={t.common.assameseLabel}
        title={t.common.assameseLabel}
        className={`px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
          language === 'as'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <span className="sm:hidden">অস</span>
        <span className="hidden sm:inline">{t.common.assameseLabel}</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        aria-label={t.common.englishLabel}
        title={t.common.englishLabel}
        className={`px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
          language === 'en'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <span className="sm:hidden">EN</span>
        <span className="hidden sm:inline">{t.common.englishLabel}</span>
      </button>
    </div>
  );
};
