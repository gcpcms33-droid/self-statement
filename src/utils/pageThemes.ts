import type { PageId } from '../types/finance';

export interface PageThemeConfig {
  id: PageId;
  primary: string;
  primaryHover: string;
  goldAccent: string;
  softSurfaceLight: string;
  softSurfaceDark: string;
  borderAccentLight: string;
  borderAccentDark: string;
  textAccentClass: string;
  badgeBgClass: string;
  buttonBgClass: string;
  chartPrimary: string;
  chartSecondary: string;
}

export const PAGE_THEMES: Record<PageId, PageThemeConfig> = {
  dashboard: {
    id: 'dashboard',
    primary: '#0F6A3C', // Deep Assam Green
    primaryHover: '#0B532F',
    goldAccent: '#D4A017', // Luxury Gold
    softSurfaceLight: 'rgba(15, 106, 60, 0.06)',
    softSurfaceDark: 'rgba(15, 106, 60, 0.18)',
    borderAccentLight: 'rgba(15, 106, 60, 0.22)',
    borderAccentDark: 'rgba(52, 211, 153, 0.24)',
    textAccentClass: 'text-[#0F6A3C] dark:text-emerald-400',
    badgeBgClass: 'bg-[#0F6A3C]/10 text-[#0F6A3C] dark:bg-emerald-500/15 dark:text-emerald-300',
    buttonBgClass:
      'bg-[#0F6A3C] hover:bg-[#0B532F] text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white',
    chartPrimary: '#0F6A3C',
    chartSecondary: '#D4A017',
  },
  transactions: {
    id: 'transactions',
    primary: '#1B5E20', // Dark Emerald
    primaryHover: '#144918',
    goldAccent: '#D4A017',
    softSurfaceLight: 'rgba(27, 94, 32, 0.06)',
    softSurfaceDark: 'rgba(27, 94, 32, 0.20)',
    borderAccentLight: 'rgba(27, 94, 32, 0.22)',
    borderAccentDark: 'rgba(74, 222, 128, 0.22)',
    textAccentClass: 'text-[#1B5E20] dark:text-emerald-400',
    badgeBgClass: 'bg-[#1B5E20]/10 text-[#1B5E20] dark:bg-emerald-500/15 dark:text-emerald-300',
    buttonBgClass:
      'bg-[#1B5E20] hover:bg-[#144918] text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white',
    chartPrimary: '#1B5E20',
    chartSecondary: '#D4A017',
  },
  loans: {
    id: 'loans',
    primary: '#6A1B9A', // Royal Purple
    primaryHover: '#53147A',
    goldAccent: '#D4A017',
    softSurfaceLight: 'rgba(106, 27, 154, 0.06)',
    softSurfaceDark: 'rgba(106, 27, 154, 0.22)',
    borderAccentLight: 'rgba(106, 27, 154, 0.22)',
    borderAccentDark: 'rgba(192, 132, 252, 0.25)',
    textAccentClass: 'text-[#6A1B9A] dark:text-purple-300',
    badgeBgClass: 'bg-[#6A1B9A]/10 text-[#6A1B9A] dark:bg-purple-500/20 dark:text-purple-300',
    buttonBgClass:
      'bg-[#6A1B9A] hover:bg-[#53147A] text-white dark:bg-purple-600 dark:hover:bg-purple-500 dark:text-white',
    chartPrimary: '#6A1B9A',
    chartSecondary: '#D4A017',
  },
  reports: {
    id: 'reports',
    primary: '#1565C0', // Brahmaputra Blue
    primaryHover: '#0F4D96',
    goldAccent: '#D4A017',
    softSurfaceLight: 'rgba(21, 101, 192, 0.06)',
    softSurfaceDark: 'rgba(21, 101, 192, 0.20)',
    borderAccentLight: 'rgba(21, 101, 192, 0.22)',
    borderAccentDark: 'rgba(96, 165, 250, 0.24)',
    textAccentClass: 'text-[#1565C0] dark:text-sky-400',
    badgeBgClass: 'bg-[#1565C0]/10 text-[#1565C0] dark:bg-sky-500/15 dark:text-sky-300',
    buttonBgClass:
      'bg-[#1565C0] hover:bg-[#0F4D96] text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white',
    chartPrimary: '#1565C0',
    chartSecondary: '#D4A017',
  },
  settings: {
    id: 'settings',
    primary: '#263238', // Modern Charcoal
    primaryHover: '#1B2429',
    goldAccent: '#D4A017',
    softSurfaceLight: 'rgba(38, 50, 56, 0.06)',
    softSurfaceDark: 'rgba(148, 163, 184, 0.14)',
    borderAccentLight: 'rgba(38, 50, 56, 0.20)',
    borderAccentDark: 'rgba(148, 163, 184, 0.24)',
    textAccentClass: 'text-[#263238] dark:text-slate-200',
    badgeBgClass: 'bg-[#263238]/10 text-[#263238] dark:bg-slate-700/60 dark:text-slate-200',
    buttonBgClass:
      'bg-[#263238] hover:bg-[#1B2429] text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900',
    chartPrimary: '#263238',
    chartSecondary: '#D4A017',
  },
};
