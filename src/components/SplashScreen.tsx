import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { HisaapBrandLockup } from './HisaapIcons';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const visibleMs = prefersReducedMotion ? 320 : 820;
    const fadeMs = prefersReducedMotion ? 120 : 260;

    const fadeTimer = window.setTimeout(() => {
      setFadingOut(true);
    }, visibleMs);

    const doneTimer = window.setTimeout(() => {
      onComplete();
    }, visibleMs + fadeMs);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      role="status"
      aria-label={t.common.brandTitle}
      onClick={onComplete}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8F9FA] dark:bg-slate-950 transition-opacity duration-250 cursor-pointer select-none ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundImage:
          'radial-gradient(640px 340px at 50% 42%, rgba(15, 106, 60, 0.08), transparent 72%)',
      }}
    >
      <div className="h-0.5 w-full gamosa-hairline fixed top-0 left-0" aria-hidden="true" />
      <div
        className={`flex flex-col items-center px-6 transition-transform duration-250 ${
          fadingOut ? 'scale-95' : 'scale-100'
        }`}
      >
        <HisaapBrandLockup
          layout="stacked"
          variant="splash"
          title={t.common.brandTitle}
          englishName="Hisaap"
          tagline={t.common.tagline}
          iconClassName="w-20 h-20 drop-shadow-md"
          titleClassName="mt-4 text-3xl font-bold tracking-tight text-[#0F6A3C] dark:text-slate-50 flex items-baseline justify-center gap-2"
          taglineClassName="mt-1.5 text-sm font-medium text-slate-600 dark:text-slate-300"
        />
        <div className="mt-6 w-20 h-0.5 rounded-full bg-gradient-to-r from-[#0F6A3C] via-[#D4A017] to-[#0F6A3C] opacity-75" />
      </div>
    </div>
  );
};
