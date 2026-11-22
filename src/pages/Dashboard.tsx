import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, CheckCircle2, Plus } from 'lucide-react';
import { HisaapBrandLockup } from '../components/HisaapIcons';
import { useLanguage } from '../contexts/LanguageContext';
import type {
  AccountSummary,
  ComputedLoan,
  ComputedTransaction,
  FinanceSettings,
  PageId,
} from '../types/finance';
import {
  buildCategoryBreakdown,
  buildMonthlySeries,
  formatCompactINR,
  formatCurrency,
  formatShortDate,
} from '../utils/finance';

interface DashboardProps {
  ledger: ComputedTransaction[];
  loans: ComputedLoan[];
  accountSummaries: AccountSummary[];
  settings: FinanceSettings;
  onUpdateSettings: (updates: Partial<FinanceSettings>) => void;
  onNavigate: (page: PageId) => void;
  onOpenNewTransaction: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  ledger,
  loans,
  accountSummaries,
  settings,
  onUpdateSettings,
  onNavigate,
  onOpenNewTransaction,
}) => {
  const { t, formatText, translateAccount, translateCategory } = useLanguage();
  const [setupOpening, setSetupOpening] = useState(String(settings.openingBalance || 0));
  const [cashName, setCashName] = useState(settings.cashAccountName);
  const [cashBal, setCashBal] = useState(String(settings.cashAccountBalance || 0));
  const [bankName, setBankName] = useState(settings.bankAccountName);
  const [bankBal, setBankBal] = useState(String(settings.bankAccountBalance || 0));
  const [upiName, setUpiName] = useState(settings.upiAccountName);
  const [upiBal, setUpiBal] = useState(String(settings.upiAccountBalance || 0));
  const [cardName, setCardName] = useState(settings.creditCardAccountName);
  const [cardBal, setCardBal] = useState(String(settings.creditCardAccountBalance || 0));
  const [setupSaved, setSetupSaved] = useState(false);

  useEffect(() => {
    setSetupOpening(String(settings.openingBalance || 0));
    setCashName(settings.cashAccountName);
    setCashBal(String(settings.cashAccountBalance || 0));
    setBankName(settings.bankAccountName);
    setBankBal(String(settings.bankAccountBalance || 0));
    setUpiName(settings.upiAccountName);
    setUpiBal(String(settings.upiAccountBalance || 0));
    setCardName(settings.creditCardAccountName);
    setCardBal(String(settings.creditCardAccountBalance || 0));
  }, [
    settings.openingBalance,
    settings.cashAccountName,
    settings.cashAccountBalance,
    settings.bankAccountName,
    settings.bankAccountBalance,
    settings.upiAccountName,
    settings.upiAccountBalance,
    settings.creditCardAccountName,
    settings.creditCardAccountBalance,
  ]);

  const handleAccountBalanceInput = (
    field: 'cash' | 'bank' | 'upi' | 'card',
    rawValue: string
  ) => {
    if (field === 'cash') setCashBal(rawValue);
    if (field === 'bank') setBankBal(rawValue);
    if (field === 'upi') setUpiBal(rawValue);
    if (field === 'card') setCardBal(rawValue);

    const c = Number(field === 'cash' ? rawValue : cashBal) || 0;
    const b = Number(field === 'bank' ? rawValue : bankBal) || 0;
    const u = Number(field === 'upi' ? rawValue : upiBal) || 0;
    const cc = Number(field === 'card' ? rawValue : cardBal) || 0;
    setSetupOpening(String(Math.round((c + b + u + cc) * 100) / 100));
  };

  const handleSaveInitialSetup = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedOpening = Number(setupOpening);
    const parsedCash = Number(cashBal) || 0;
    const parsedBank = Number(bankBal) || 0;
    const parsedUpi = Number(upiBal) || 0;
    const parsedCard = Number(cardBal) || 0;

    onUpdateSettings({
      openingBalance: Number.isFinite(parsedOpening)
        ? Math.round(parsedOpening * 100) / 100
        : 0,
      cashAccountName: cashName.trim() || 'Cash',
      cashAccountBalance: Math.round(parsedCash * 100) / 100,
      bankAccountName: bankName.trim() || 'Bank',
      bankAccountBalance: Math.round(parsedBank * 100) / 100,
      upiAccountName: upiName.trim() || 'UPI',
      upiAccountBalance: Math.round(parsedUpi * 100) / 100,
      creditCardAccountName: cardName.trim() || 'Credit Card',
      creditCardAccountBalance: Math.round(parsedCard * 100) / 100,
    });
    setSetupSaved(true);
    setTimeout(() => setSetupSaved(false), 2500);
  };

  const stats = useMemo(() => {
    const totalIncome = ledger
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = ledger
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const currentBalance =
      ledger.length > 0 ? ledger[ledger.length - 1].runningBalance : settings.openingBalance;
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    const totalBorrowedRemaining = loans
      .filter((l) => l.direction === 'borrowed')
      .reduce((sum, l) => sum + l.remainingBalance, 0);
    const totalLentRemaining = loans
      .filter((l) => l.direction === 'lent')
      .reduce((sum, l) => sum + l.remainingBalance, 0);
    const netLoanPosition = totalLentRemaining - totalBorrowedRemaining;
    const activeLoansCount = loans.filter((l) => l.status === 'active').length;

    return {
      totalIncome,
      totalExpense,
      currentBalance,
      netSavings,
      savingsRate,
      totalBorrowedRemaining,
      totalLentRemaining,
      netLoanPosition,
      activeLoansCount,
    };
  }, [ledger, loans, settings.openingBalance]);

  const monthlySeries = useMemo(() => buildMonthlySeries(ledger), [ledger]);
  const recentMonths = useMemo(() => monthlySeries.slice(-8), [monthlySeries]);
  const topExpenseCategories = useMemo(
    () => buildCategoryBreakdown(ledger, 'expense').slice(0, 6),
    [ledger]
  );
  const recentTransactions = useMemo(() => [...ledger].reverse().slice(0, 8), [ledger]);

  const currency = settings.currency;
  const locale = settings.locale;

  if (ledger.length === 0 && loans.length === 0) {
    return (
      <div className="space-y-6">
        {/* Dashboard Brand Header */}
        <section className="hisaap-card rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 ring-1 ring-[#0F6A3C]/12">
          <HisaapBrandLockup
            variant="app-icon"
            title={t.common.brandTitle}
            englishName="Hisaap"
            tagline={t.common.tagline}
            iconClassName="w-11 h-11 shrink-0 drop-shadow-xs"
            titleClassName="text-lg font-bold tracking-tight text-[#0F6A3C] dark:text-emerald-300 truncate flex items-baseline gap-1.5"
            taglineClassName="text-xs text-slate-600 dark:text-slate-400 truncate"
          />
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
              INR (₹)
            </span>
            <span aria-hidden="true">·</span>
            <span>{settings.ownerName.trim() || t.common.personalAccount}</span>
          </div>
        </section>

        {/* Empty KPI Summary Strip */}
        <section
          aria-label="Key Financial Indicators"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          <div className="hisaap-card rounded-2xl p-5 ring-1 ring-[#D4A017]/35">
            <div className="text-xs font-medium text-[#0F6A3C] dark:text-emerald-400">
              {t.dashboard.currentBalance}
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-50">
              {formatCurrency(settings.openingBalance, currency, locale)}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {t.dashboard.openingBalanceLabel}
            </div>
          </div>

          <div className="hisaap-card rounded-2xl p-5">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.dashboard.totalIncome}
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#0F6A3C] dark:text-emerald-400">
              {formatCurrency(0, currency, locale)}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {formatText(t.dashboard.creditEntriesCount, { count: 0 })}
            </div>
          </div>

          <div className="hisaap-card rounded-2xl p-5">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.dashboard.totalExpense}
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-red-700 dark:text-red-400">
              {formatCurrency(0, currency, locale)}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {formatText(t.dashboard.debitEntriesCount, { count: 0 })}
            </div>
          </div>

          <div className="hisaap-card rounded-2xl p-5">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.dashboard.netLoanPosition}
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-50">
              {formatCurrency(0, currency, locale)}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {formatText(t.dashboard.activeLoansCount, { count: 0 })}
            </div>
          </div>
        </section>

        {/* Initial Setup + First Action Grid */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          <div className="xl:col-span-8 hisaap-card rounded-2xl p-6">
            <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
              <h2 className="text-base font-semibold text-[#0F6A3C] dark:text-emerald-300">
                {t.dashboard.setupTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.dashboard.setupSubtitle}
              </p>
            </div>

            <form onSubmit={handleSaveInitialSetup} className="pt-5 space-y-4">
              <div>
                <label
                  htmlFor="dash-opening"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  {t.dashboard.openingBalanceInput}
                </label>
                <input
                  id="dash-opening"
                  type="number"
                  step="0.01"
                  value={setupOpening}
                  onChange={(e) => setSetupOpening(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t.dashboard.openingBalanceHint}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="dash-cash-bal"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t.dashboard.cashDefaultLabel}
                  </label>
                  <input
                    id="dash-cash-name"
                    type="text"
                    aria-label={t.dashboard.cashDefaultLabel}
                    value={cashName}
                    onChange={(e) => setCashName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                  />
                  <input
                    id="dash-cash-bal"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={cashBal}
                    onChange={(e) => handleAccountBalanceInput('cash', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="dash-bank-bal"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t.dashboard.bankLabel}
                  </label>
                  <input
                    id="dash-bank-name"
                    type="text"
                    aria-label={t.dashboard.bankLabel}
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                  />
                  <input
                    id="dash-bank-bal"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={bankBal}
                    onChange={(e) => handleAccountBalanceInput('bank', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="dash-upi-bal"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t.dashboard.upiLabel}
                  </label>
                  <input
                    id="dash-upi-name"
                    type="text"
                    aria-label={t.dashboard.upiLabel}
                    value={upiName}
                    onChange={(e) => setUpiName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                  />
                  <input
                    id="dash-upi-bal"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={upiBal}
                    onChange={(e) => handleAccountBalanceInput('upi', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="dash-card-bal"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t.dashboard.creditCardLabel}
                  </label>
                  <input
                    id="dash-card-name"
                    type="text"
                    aria-label={t.dashboard.creditCardLabel}
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                  />
                  <input
                    id="dash-card-bal"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={cardBal}
                    onChange={(e) => handleAccountBalanceInput('card', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t.dashboard.savedOpeningBalance}{' '}
                  <span className="font-mono tabular-nums font-medium text-slate-800 dark:text-slate-200">
                    {formatCurrency(settings.openingBalance, currency, locale)}
                  </span>
                </span>
                <div className="flex items-center gap-3">
                  {setupSaved && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0F6A3C] dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t.dashboard.setupSaved}
                    </span>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium rounded-xl bg-[#0F6A3C] text-white hover:bg-[#0B532F] dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors"
                  >
                    {t.dashboard.saveSetup}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="xl:col-span-4 hisaap-card rounded-2xl p-6 flex flex-col justify-between ring-1 ring-[#0F6A3C]/15">
            <div>
              <h2 className="text-base font-semibold text-[#0F6A3C] dark:text-emerald-300">
                {t.dashboard.emptyCardTitle}
              </h2>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.dashboard.emptyCardDesc}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenNewTransaction}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-[#0F6A3C] text-white hover:bg-[#0B532F] dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{t.dashboard.logFirstTransaction}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('settings')}
                className="px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {t.dashboard.importJsonBackup}
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Brand Header */}
      <section className="hisaap-card rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 ring-1 ring-[#0F6A3C]/12">
        <HisaapBrandLockup
          variant="app-icon"
          title={t.common.brandTitle}
          englishName="Hisaap"
          tagline={t.common.tagline}
          iconClassName="w-11 h-11 shrink-0 drop-shadow-xs"
          titleClassName="text-lg font-bold tracking-tight text-[#0F6A3C] dark:text-emerald-300 truncate flex items-baseline gap-1.5"
          taglineClassName="text-xs text-slate-600 dark:text-slate-400 truncate"
        />
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
            INR (₹)
          </span>
          <span aria-hidden="true">·</span>
          <span>{settings.ownerName.trim() || t.common.personalAccount}</span>
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section aria-label="Key Financial Indicators" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="hisaap-card rounded-2xl p-5 ring-1 ring-[#D4A017]/35">
          <div className="text-xs font-medium text-[#0F6A3C] dark:text-emerald-400">
            {t.dashboard.currentBalance}
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-50">
            {formatCurrency(stats.currentBalance, currency, locale)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              {t.dashboard.openingLabel}: {formatCurrency(settings.openingBalance, currency, locale)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {formatText(t.dashboard.entriesCount, { count: ledger.length })}
            </span>
          </div>
        </div>

        <div className="hisaap-card rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.dashboard.totalIncome}
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#0F6A3C] dark:text-emerald-400">
            {formatCurrency(stats.totalIncome, currency, locale)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#0F6A3C] dark:text-emerald-400" />
            <span className="tabular-nums">
              {formatText(t.dashboard.creditEntriesCount, {
                count: ledger.filter((tx) => tx.type === 'income').length,
              })}
            </span>
          </div>
        </div>

        <div className="hisaap-card rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.dashboard.totalExpense}
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-red-700 dark:text-red-400">
            {formatCurrency(stats.totalExpense, currency, locale)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span className="tabular-nums">
                {formatText(t.dashboard.debitEntriesCount, {
                  count: ledger.filter((tx) => tx.type === 'expense').length,
                })}
              </span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {formatText(t.dashboard.savedPercent, { percent: stats.savingsRate.toFixed(1) })}
            </span>
          </div>
        </div>

        <div className="hisaap-card rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.dashboard.netLoanPosition}
          </div>
          <div
            className={`mt-2 text-2xl font-bold font-mono tabular-nums ${
              stats.netLoanPosition >= 0
                ? 'text-slate-900 dark:text-slate-50'
                : 'text-amber-700 dark:text-amber-400'
            }`}
          >
            {stats.netLoanPosition >= 0 ? '+' : ''}
            {formatCurrency(stats.netLoanPosition, currency, locale)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
            <span className="tabular-nums">
              {t.dashboard.payableLabel}: {formatCurrency(stats.totalBorrowedRemaining, currency, locale)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {formatText(t.dashboard.activeCount, { count: stats.activeLoansCount })}
            </span>
          </div>
        </div>
      </section>

      {/* Account Balances Row (Cash, Bank, UPI, Credit Card) */}
      <section aria-label="Indian Account Balances" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {accountSummaries.map((acc) => (
          <div
            key={acc.key}
            className="hisaap-card rounded-2xl px-5 py-4 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                {translateAccount(acc.name)}
              </div>
              <div className="mt-1 text-base font-semibold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {formatCurrency(acc.currentBalance, currency, locale)}
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 dark:text-slate-400 shrink-0 font-mono tabular-nums">
              <div>
                {t.dashboard.openShort}: {formatCompactINR(acc.openingBalance)}
              </div>
              <div className="mt-0.5">
                +{formatCompactINR(acc.totalIncome)} / −{formatCompactINR(acc.totalExpense)}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Primary Charts Row */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 hisaap-card rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {t.dashboard.incomeVsExpensesTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.dashboard.incomeVsExpensesSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#0F6A3C] inline-block" />
                {t.common.income}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#C62828] inline-block" />
                {t.common.expense}
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentMonths} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={68}
                  tickFormatter={(v) => formatCompactINR(v)}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2.5 shadow-md text-xs space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {row.label}
                        </div>
                        <div className="flex items-center justify-between gap-5">
                          <span className="text-slate-500 dark:text-slate-400">
                            {t.common.income}
                          </span>
                          <span className="font-mono tabular-nums font-medium text-emerald-700 dark:text-emerald-400">
                            {formatCurrency(row.income, currency, locale)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-5">
                          <span className="text-slate-500 dark:text-slate-400">
                            {t.common.expense}
                          </span>
                          <span className="font-mono tabular-nums font-medium text-red-700 dark:text-red-400">
                            {formatCurrency(row.expense, currency, locale)}
                          </span>
                        </div>
                        <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-5">
                          <span className="text-slate-500 dark:text-slate-400">
                            {t.common.net}
                          </span>
                          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(row.net, currency, locale)}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="income" fill="#0F6A3C" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expense" fill="#C62828" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-5 hisaap-card rounded-2xl p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              {t.dashboard.runningBalanceTrendTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.dashboard.runningBalanceTrendSubtitle}
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recentMonths} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F6A3C" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#D4A017" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={68}
                  tickFormatter={(v) => formatCompactINR(v)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 shadow-md text-xs">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {row.label}
                        </div>
                        <div className="mt-1 font-mono tabular-nums text-[#0F6A3C] dark:text-emerald-400 font-medium">
                          {formatCurrency(row.closingBalance, currency, locale)}
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="closingBalance"
                  stroke="#0F6A3C"
                  strokeWidth={2.25}
                  fill="url(#balanceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Bottom Split: Recent Ledger Rows + Expense Breakdown */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 hisaap-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {t.dashboard.recentEntriesTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.dashboard.recentEntriesSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('transactions')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F6A3C] hover:text-[#0B532F] dark:text-emerald-400 dark:hover:text-emerald-300 whitespace-nowrap shrink-0"
            >
              <span>{t.dashboard.fullPassbook}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 sm:px-6 whitespace-nowrap">{t.common.date}</th>
                  <th className="py-3 px-4 whitespace-nowrap">{t.common.description}</th>
                  <th className="py-3 px-4 whitespace-nowrap hidden sm:table-cell">
                    {t.common.account}
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">{t.common.amount}</th>
                  <th className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                    {t.common.runningBalance}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 sm:px-6 font-mono tabular-nums text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatShortDate(tx.date)}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium max-w-[220px] truncate">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:table-cell">
                      {translateAccount(tx.account)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono tabular-nums text-xs font-medium whitespace-nowrap ${
                        tx.type === 'income'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-red-700 dark:text-red-400'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '−'}
                      {formatCurrency(tx.amount, currency, locale)}
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right font-mono tabular-nums text-xs font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {formatCurrency(tx.runningBalance, currency, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-4 hisaap-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                  {t.dashboard.expenseAllocationTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.dashboard.expenseAllocationSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('reports')}
                className="text-xs font-medium text-[#1565C0] hover:underline dark:text-sky-400 whitespace-nowrap"
              >
                {t.dashboard.reportsLink}
              </button>
            </div>

            {topExpenseCategories.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-8 text-center">
                {t.dashboard.noExpensesRecorded}
              </p>
            ) : (
              <div className="space-y-4">
                {topExpenseCategories.map((item) => (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {translateCategory(item.category)}
                      </span>
                      <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400 shrink-0">
                        {formatCurrency(item.amount, currency, locale)} · {item.sharePercent}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0F6A3C] to-[#D4A017] rounded-full"
                        style={{ width: `${Math.min(100, item.sharePercent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {t.dashboard.activeLoansTracked}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('loans')}
              className="font-medium text-[#6A1B9A] dark:text-purple-300 hover:underline whitespace-nowrap"
            >
              {formatText(t.dashboard.viewSummarySuffix, { count: stats.activeLoansCount })}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
