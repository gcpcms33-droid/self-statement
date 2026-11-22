import React, { useEffect, useRef, useState } from 'react';
import { Calculator, ChevronDown, Menu, Plus, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { PageId, UserProfile } from '../types/finance';
import { PAGE_THEMES } from '../utils/pageThemes';
import {
  DashboardJaapiIcon,
  HisaapBrandLockup,
  HisaapLogoIcon,
  LoansHandshakeRupeeIcon,
  ProfileAssameseAvatarIcon,
  ReportsAnalyticsIcon,
  SettingsAssameseGearIcon,
  TransactionsLedgerIcon,
} from './HisaapIcons';
import { LanguageSwitcher } from './LanguageSwitcher';

interface LayoutProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenNewTransaction: () => void;
  calculatorOpen: boolean;
  onToggleCalculator: () => void;
  profile: UserProfile;
  ownerName: string;
  currentBalanceFormatted: string;
  children: React.ReactNode;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const Layout: React.FC<LayoutProps> = ({
  activePage,
  onNavigate,
  onOpenNewTransaction,
  calculatorOpen,
  onToggleCalculator,
  profile,
  ownerName,
  currentBalanceFormatted,
  children,
}) => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const activeTheme = PAGE_THEMES[activePage];

  const navItems: {
    id: PageId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: DashboardJaapiIcon },
    { id: 'transactions', label: t.nav.transactions, icon: TransactionsLedgerIcon },
    { id: 'loans', label: t.nav.loans, icon: LoansHandshakeRupeeIcon },
    { id: 'reports', label: t.nav.reports, icon: ReportsAnalyticsIcon },
    { id: 'settings', label: t.nav.settings, icon: SettingsAssameseGearIcon },
  ];

  const pageTitles: Record<PageId, string> = {
    dashboard: t.nav.dashboard,
    transactions: t.nav.transactions,
    loans: t.nav.loans,
    reports: t.nav.reports,
    settings: t.nav.settings,
  };

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileMenuOpen]);

  const handleNav = (id: PageId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  };

  const displayName = profile.name.trim() || ownerName.trim() || t.common.personalAccount;
  const initials = getInitials(profile.name.trim() || ownerName.trim());

  const renderAvatar = (sizeClass: string, textSizeClass: string, iconSizeClass: string) => {
    if (profile.avatarUrl) {
      return (
        <img
          src={profile.avatarUrl}
          alt={displayName}
          className={`${sizeClass} rounded-full object-cover shrink-0 ring-1 ring-[#D4A017]/50`}
        />
      );
    }
    return (
      <span
        className={`${sizeClass} rounded-full text-white ${textSizeClass} font-semibold flex items-center justify-center shrink-0 ring-1 ring-[#D4A017]/40`}
        style={{ backgroundColor: activeTheme.primary }}
      >
        {initials || <ProfileAssameseAvatarIcon className={iconSizeClass} />}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FA] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-68 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="h-0.5 w-full gamosa-hairline shrink-0" aria-hidden="true" />
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800">
          <HisaapBrandLockup
            variant="sidebar"
            title={t.common.brandTitle}
            englishName="Hisaap"
            tagline={t.common.tagline}
            iconClassName="w-10 h-10 shrink-0 drop-shadow-xs"
            titleClassName="text-base font-bold tracking-tight text-[#0F6A3C] dark:text-slate-50 truncate flex items-baseline gap-1.5"
            taglineClassName="text-[11px] text-slate-500 dark:text-slate-400 truncate"
          />
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5" aria-label="Primary Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const itemTheme = PAGE_THEMES[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                style={
                  isActive
                    ? {
                        backgroundColor: itemTheme.primary,
                      }
                    : undefined
                }
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6A3C] ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={onToggleCalculator}
              aria-pressed={calculatorOpen}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6A3C] ${
                calculatorOpen
                  ? 'bg-[#0F6A3C]/12 text-[#0F6A3C] ring-1 ring-[#D4A017]/60 dark:bg-emerald-950/70 dark:text-[#FCE38A]'
                  : 'text-slate-600 hover:text-[#0F6A3C] hover:bg-[#0F6A3C]/8 dark:text-slate-300 dark:hover:text-[#FCE38A] dark:hover:bg-slate-800/70'
              }`}
            >
              <Calculator className="w-4 h-4 shrink-0 text-[#D4A017]" />
              <span>{t.nav.calculator}</span>
            </button>
          </div>
        </nav>

        <div className="p-5 border-t border-slate-200/80 dark:border-slate-800 space-y-3.5">
          <div className="rounded-xl p-3.5 bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {t.nav.netLedgerBalance}
            </div>
            <div className="mt-1 text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {currentBalanceFormatted}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleNav('settings')}
            className="w-full pt-1 flex items-center gap-2.5 text-left hover:opacity-85 transition-opacity"
          >
            {renderAvatar('w-8 h-8', 'text-[11px]', 'w-4 h-4')}
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {profile.email || t.nav.profile}
              </div>
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-[1px]"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[84vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-10 overflow-y-auto">
            <div className="h-0.5 w-full gamosa-hairline shrink-0" aria-hidden="true" />
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <HisaapBrandLockup
                variant="sidebar"
                title={t.common.brandTitle}
                englishName="Hisaap"
                tagline={t.common.tagline}
                iconClassName="w-9 h-9 shrink-0"
                titleClassName="text-sm font-bold tracking-tight text-[#0F6A3C] dark:text-slate-50 truncate flex items-baseline gap-1.5"
                taglineClassName="text-[11px] text-slate-500 dark:text-slate-400 truncate"
              />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg"
                aria-label={t.nav.closeMenu}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                const itemTheme = PAGE_THEMES[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNav(item.id)}
                    style={
                      isActive
                        ? {
                            backgroundColor: itemTheme.primary,
                          }
                        : undefined
                    }
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onToggleCalculator();
                  }}
                  aria-pressed={calculatorOpen}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${
                    calculatorOpen
                      ? 'bg-[#0F6A3C]/12 text-[#0F6A3C] ring-1 ring-[#D4A017]/60 dark:bg-emerald-950/70 dark:text-[#FCE38A]'
                      : 'text-slate-600 hover:text-[#0F6A3C] hover:bg-slate-100 dark:text-slate-300 dark:hover:text-[#FCE38A] dark:hover:bg-slate-800'
                  }`}
                >
                  <Calculator className="w-4 h-4 shrink-0 text-[#D4A017]" />
                  <span>{t.nav.calculator}</span>
                </button>
              </div>
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t.nav.netLedgerBalance}
                </div>
                <div className="mt-1 text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {currentBalanceFormatted}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleNav('settings')}
                className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5 text-left"
              >
                {renderAvatar('w-8 h-8', 'text-[11px]', 'w-4 h-4')}
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                    {displayName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {profile.email || t.nav.profile}
                  </div>
                </div>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className="flex-1 lg:pl-68 flex flex-col min-w-0 transition-colors duration-200"
        style={{
          backgroundImage: `radial-gradient(920px 360px at 82% -8%, ${activeTheme.softSurfaceLight}, transparent 70%)`,
        }}
      >
        <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
          <div className="h-0.5 w-full gamosa-hairline lg:hidden" aria-hidden="true" />
          <div className="h-16 px-3 sm:px-8 flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg shrink-0"
                aria-label={t.nav.openMenu}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 sm:gap-2.5 text-sm min-w-0">
                <button
                  type="button"
                  onClick={() => handleNav('dashboard')}
                  className="inline-flex items-center gap-2 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6A3C] rounded-lg"
                  aria-label={t.common.brandTitle}
                >
                  <HisaapLogoIcon variant="sidebar" className="w-7 h-7 shrink-0" />
                  <span className="font-semibold text-[#0F6A3C] dark:text-emerald-300 hidden sm:inline whitespace-nowrap">
                    {t.common.brandTitle}
                  </span>
                </button>
                <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">/</span>
                <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-50 truncate">
                  {pageTitles[activePage]}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={onToggleCalculator}
                aria-label={t.calculator.openCalculator}
                aria-pressed={calculatorOpen}
                className={`lg:hidden p-1.5 sm:p-2 rounded-xl border transition-colors shrink-0 ${
                  calculatorOpen
                    ? 'bg-[#0F6A3C] text-[#FCE38A] border-[#D4A017]'
                    : 'bg-white/90 dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-700 text-[#0F6A3C] dark:text-[#FCE38A] hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Calculator className="w-4 h-4" />
              </button>

              <LanguageSwitcher />

              <button
                type="button"
                onClick={onOpenNewTransaction}
                className={`inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6A3C] ${activeTheme.buttonBgClass}`}
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{t.common.addTransaction}</span>
                <span className="sm:hidden">{t.common.addShort}</span>
              </button>

              {/* Top-Right Profile Icon & Dropdown */}
              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-label={t.nav.openProfileMenu}
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                  className="inline-flex items-center gap-1.5 sm:gap-2 p-0.5 pr-1.5 sm:p-1 sm:pr-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6A3C]"
                >
                  {renderAvatar('w-7 h-7 sm:w-8 sm:h-8', 'text-[11px] sm:text-xs', 'w-4 h-4')}
                  <span className="hidden md:inline text-xs font-medium text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                </button>

                {profileMenuOpen && (
                  <div
                    role="menu"
                    aria-label={t.nav.openProfileMenu}
                    className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      {renderAvatar('w-9 h-9', 'text-xs', 'w-4 h-4')}
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {displayName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {profile.email || t.nav.profile}
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleNav('settings')}
                        className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5"
                      >
                        <ProfileAssameseAvatarIcon className="w-4 h-4 text-[#0F6A3C] dark:text-emerald-400 shrink-0" />
                        <span>{t.nav.editProfile}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main
          key={activePage}
          className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1440px] w-full mx-auto hisaap-page-enter"
        >
          {children}
        </main>
      </div>
    </div>
  );
};
