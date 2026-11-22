import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { ComputedTransaction, FinanceSettings } from '../types/finance';
import {
  buildCategoryBreakdown,
  buildMonthlySeries,
  formatCompactINR,
  formatCurrency,
  formatMonthLabel,
} from '../utils/finance';

interface ReportsProps {
  ledger: ComputedTransaction[];
  settings: FinanceSettings;
}

export const Reports: React.FC<ReportsProps> = ({ ledger, settings }) => {
  const { t, formatText, translateCategory } = useLanguage();

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    for (const tx of ledger) {
      years.add(Number(tx.date.slice(0, 4)));
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [ledger]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    const today = new Date();
    months.add(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
    for (const tx of ledger) {
      months.add(tx.date.slice(0, 7));
    }
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [ledger]);

  const [reportMode, setReportMode] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    () => availableMonths[0] || new Date().toISOString().slice(0, 7)
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    () => availableYears[0] || new Date().getFullYear()
  );

  const periodTransactions = useMemo(() => {
    if (reportMode === 'monthly') {
      return ledger.filter((tx) => tx.date.startsWith(selectedMonth));
    }
    return ledger.filter((tx) => tx.date.startsWith(`${selectedYear}-`));
  }, [ledger, reportMode, selectedMonth, selectedYear]);

  const periodStats = useMemo(() => {
    const income = periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expense = periodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const net = income - expense;
    const savingsRate = income > 0 ? (net / income) * 100 : 0;
    return {
      income,
      expense,
      net,
      savingsRate,
      count: periodTransactions.length,
    };
  }, [periodTransactions]);

  // Daily series for Monthly Report
  const dailySeries = useMemo(() => {
    if (reportMode !== 'monthly') return [];
    const [y, m] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const map = new Map<string, { day: string; income: number; expense: number }>();

    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${selectedMonth}-${String(d).padStart(2, '0')}`;
      map.set(key, { day: String(d), income: 0, expense: 0 });
    }

    for (const tx of periodTransactions) {
      const entry = map.get(tx.date);
      if (!entry) continue;
      if (tx.type === 'income') entry.income = Math.round((entry.income + tx.amount) * 100) / 100;
      else entry.expense = Math.round((entry.expense + tx.amount) * 100) / 100;
    }

    return Array.from(map.values());
  }, [reportMode, selectedMonth, periodTransactions]);

  // Monthly series for Yearly Report
  const yearlyMonthlySeries = useMemo(
    () => (reportMode === 'yearly' ? buildMonthlySeries(ledger, selectedYear) : []),
    [reportMode, ledger, selectedYear]
  );

  const expenseBreakdown = useMemo(
    () => buildCategoryBreakdown(periodTransactions, 'expense'),
    [periodTransactions]
  );

  const incomeBreakdown = useMemo(
    () => buildCategoryBreakdown(periodTransactions, 'income'),
    [periodTransactions]
  );

  const handleExportReport = () => {
    const payload = {
      reportType: reportMode,
      period: reportMode === 'monthly' ? selectedMonth : String(selectedYear),
      currency: settings.currency,
      generatedAt: new Date().toISOString(),
      summary: periodStats,
      incomeByCategory: incomeBreakdown,
      expenseByCategory: expenseBreakdown,
      monthlySeries: reportMode === 'yearly' ? yearlyMonthlySeries : undefined,
      transactions: periodTransactions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hisaap-${reportMode}-report-${
      reportMode === 'monthly' ? selectedMonth : selectedYear
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currency = settings.currency;
  const periodLabel =
    reportMode === 'monthly'
      ? formatMonthLabel(selectedMonth)
      : `${t.reports.yearPrefix} ${selectedYear}`;

  const cashflowChartData = useMemo(() => {
    if (reportMode === 'monthly') {
      return dailySeries.map((d) => ({
        axisLabel: d.day,
        tooltipTitle: `${periodLabel} · ${t.reports.dayLabel} ${d.day}`,
        income: d.income,
        expense: d.expense,
      }));
    }
    return yearlyMonthlySeries.map((m) => ({
      axisLabel: m.shortLabel,
      tooltipTitle: m.label,
      income: m.income,
      expense: m.expense,
    }));
  }, [reportMode, dailySeries, yearlyMonthlySeries, periodLabel, t.reports.dayLabel]);

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="hisaap-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setReportMode('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                reportMode === 'monthly'
                  ? 'bg-[#1565C0] text-white dark:bg-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.reports.monthlyReport}
            </button>
            <button
              type="button"
              onClick={() => setReportMode('yearly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                reportMode === 'yearly'
                  ? 'bg-[#1565C0] text-white dark:bg-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.reports.yearlyReport}
            </button>
          </div>

          {reportMode === 'monthly' ? (
            <select
              aria-label={t.reports.selectMonth}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
          ) : (
            <select
              aria-label={t.reports.selectYear}
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 text-xs font-medium bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="button"
          onClick={handleExportReport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-[#1565C0]/30 dark:border-sky-500/30 rounded-xl text-[#1565C0] dark:text-sky-300 hover:bg-[#1565C0]/5 dark:hover:bg-sky-500/10 whitespace-nowrap transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t.reports.exportReportJson}</span>
        </button>
      </div>

      {/* Period Summary KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="hisaap-card rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {formatText(t.reports.periodIncome, { period: periodLabel })}
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#0F6A3C] dark:text-emerald-400">
            {formatCurrency(periodStats.income, currency)}
          </div>
        </div>

        <div className="hisaap-card rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {formatText(t.reports.periodExpenses, { period: periodLabel })}
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-red-700 dark:text-red-400">
            {formatCurrency(periodStats.expense, currency)}
          </div>
        </div>

        <div className="hisaap-card rounded-2xl p-5 ring-1 ring-[#1565C0]/20">
          <div className="text-xs font-medium text-[#1565C0] dark:text-sky-400">
            {t.reports.netCashflow}
          </div>
          <div
            className={`mt-2 text-2xl font-bold font-mono tabular-nums ${
              periodStats.net >= 0
                ? 'text-slate-900 dark:text-slate-50'
                : 'text-red-700 dark:text-red-400'
            }`}
          >
            {periodStats.net >= 0 ? '+' : ''}
            {formatCurrency(periodStats.net, currency)}
          </div>
        </div>

        <div className="hisaap-card rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.reports.savingsRateVolume}
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-50">
            {periodStats.savingsRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {formatText(t.reports.transactionsRecorded, { count: periodStats.count })}
          </div>
        </div>
      </section>

      {/* Main Chart Section */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 hisaap-card rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {reportMode === 'monthly'
                  ? formatText(t.reports.dailyCashflowTitle, { period: periodLabel })
                  : formatText(t.reports.yearlyCashflowTitle, { year: selectedYear })}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {reportMode === 'monthly'
                  ? t.reports.dailyCashflowSubtitle
                  : t.reports.yearlyCashflowSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#1565C0] inline-block" />
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
              <BarChart
                data={cashflowChartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="axisLabel"
                  tick={{ fontSize: 11, fill: '#64748b' }}
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
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 shadow-md text-xs space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {row.tooltipTitle}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">{t.common.income}</span>
                          <span className="font-mono tabular-nums text-[#1565C0] dark:text-sky-400">
                            {formatCurrency(row.income, currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">{t.common.expense}</span>
                          <span className="font-mono tabular-nums text-red-700 dark:text-red-400">
                            {formatCurrency(row.expense, currency)}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="income" fill="#1565C0" radius={[3, 3, 0, 0]} maxBarSize={24} />
                <Bar dataKey="expense" fill="#C62828" radius={[3, 3, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Trend or Top Categories */}
        <div className="xl:col-span-4 hisaap-card rounded-2xl p-6">
          {reportMode === 'yearly' ? (
            <>
              <h2 className="text-base font-semibold text-[#1565C0] dark:text-sky-300">
                {t.reports.netMonthlyCashflowTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-5">
                {formatText(t.reports.netMonthlyCashflowSubtitle, { year: selectedYear })}
              </p>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyMonthlySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="shortLabel"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      width={64}
                      tickFormatter={(v) => formatCompactINR(v)}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const row = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-md text-xs">
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {row.label}
                            </div>
                            <div className="mt-1 font-mono tabular-nums text-[#1565C0] dark:text-sky-400">
                              {t.common.net}: {formatCurrency(row.net, currency)}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="net"
                      stroke="#1565C0"
                      strokeWidth={2.25}
                      dot={{ r: 3.5, fill: '#1565C0' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-base font-semibold text-[#1565C0] dark:text-sky-300">
                {formatText(t.reports.spendingShareTitle, { period: periodLabel })}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-5">
                {t.reports.spendingShareSubtitle}
              </p>
              {expenseBreakdown.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                  {formatText(t.reports.noExpensesInPeriod, { period: periodLabel })}
                </div>
              ) : (
                <div className="space-y-4">
                  {expenseBreakdown.slice(0, 7).map((item) => (
                    <div key={item.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {translateCategory(item.category)}
                        </span>
                        <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400 shrink-0">
                          {formatCurrency(item.amount, currency)} ({item.sharePercent}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1565C0] dark:bg-sky-400 rounded-full"
                          style={{ width: `${Math.min(100, item.sharePercent)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Yearly 12-Month Breakdown Table */}
      {reportMode === 'yearly' && (
        <section className="hisaap-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800">
            <h2 className="text-base font-semibold text-[#1565C0] dark:text-sky-300">
              {formatText(t.reports.yearlySummaryTitle, { year: selectedYear })}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-950/40">
                  <th className="py-3 px-6 whitespace-nowrap">{t.reports.monthCol}</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    {t.reports.transactionsCol}
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    {t.reports.incomeCol}
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    {t.reports.expensesCol}
                  </th>
                  <th className="py-3 px-6 text-right whitespace-nowrap">
                    {t.reports.netCashflowCol}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {yearlyMonthlySeries.map((row) => (
                  <tr key={row.monthKey} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-6 font-medium text-slate-900 dark:text-slate-100">
                      {row.label}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {row.count}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(row.income, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-red-700 dark:text-red-400">
                      {formatCurrency(row.expense, currency)}
                    </td>
                    <td
                      className={`py-3 px-6 text-right font-mono tabular-nums font-semibold ${
                        row.net >= 0
                          ? 'text-slate-900 dark:text-slate-100'
                          : 'text-red-700 dark:text-red-400'
                      }`}
                    >
                      {row.net >= 0 ? '+' : ''}
                      {formatCurrency(row.net, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Category Breakdown Tables */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="hisaap-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              {formatText(t.reports.expenseBreakdownTitle, { period: periodLabel })}
            </h2>
          </div>
          {expenseBreakdown.length === 0 ? (
            <p className="p-6 text-xs text-slate-500 dark:text-slate-400">
              {t.reports.noExpenseEntriesPeriod}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-6 whitespace-nowrap">{t.common.category}</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">{t.common.rows}</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">{t.common.share}</th>
                    <th className="py-3 px-6 text-right whitespace-nowrap">{t.common.total}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {expenseBreakdown.map((item) => (
                    <tr key={item.category}>
                      <td className="py-3 px-6 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {translateCategory(item.category)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {item.count}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {item.sharePercent.toFixed(1)}%
                      </td>
                      <td className="py-3 px-6 text-right font-mono tabular-nums font-medium text-red-700 dark:text-red-400 whitespace-nowrap">
                        {formatCurrency(item.amount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="hisaap-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              {formatText(t.reports.incomeBreakdownTitle, { period: periodLabel })}
            </h2>
          </div>
          {incomeBreakdown.length === 0 ? (
            <p className="p-6 text-xs text-slate-500 dark:text-slate-400">
              {t.reports.noIncomeEntriesPeriod}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-6 whitespace-nowrap">{t.common.category}</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">{t.common.rows}</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">{t.common.share}</th>
                    <th className="py-3 px-6 text-right whitespace-nowrap">{t.common.total}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {incomeBreakdown.map((item) => (
                    <tr key={item.category}>
                      <td className="py-3 px-6 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {translateCategory(item.category)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {item.count}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {item.sharePercent.toFixed(1)}%
                      </td>
                      <td className="py-3 px-6 text-right font-mono tabular-nums font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {formatCurrency(item.amount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
