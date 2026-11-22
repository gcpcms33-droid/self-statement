import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import type { ComputedLoan, FinanceSettings, Loan } from '../types/finance';
import { formatCompactINR, formatCurrency, formatShortDate } from '../utils/finance';

interface LoanSummaryProps {
  loans: ComputedLoan[];
  settings: FinanceSettings;
  onAddLoan: () => void;
  onEditLoan: (loan: Loan) => void;
  onDeleteLoan: (id: string) => void;
  onRecordPayment: (loan: ComputedLoan) => void;
}

export const LoanSummary: React.FC<LoanSummaryProps> = ({
  loans,
  settings,
  onAddLoan,
  onEditLoan,
  onDeleteLoan,
  onRecordPayment,
}) => {
  const { t, formatText, translateAccount } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'borrowed' | 'lent' | 'settled'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const summary = useMemo(() => {
    const borrowed = loans.filter((l) => l.direction === 'borrowed');
    const lent = loans.filter((l) => l.direction === 'lent');

    const totalBorrowedPrincipal = borrowed.reduce((s, l) => s + l.principalAmount, 0);
    const totalBorrowedRemaining = borrowed.reduce((s, l) => s + l.remainingBalance, 0);
    const totalLentPrincipal = lent.reduce((s, l) => s + l.principalAmount, 0);
    const totalLentRemaining = lent.reduce((s, l) => s + l.remainingBalance, 0);
    const netPosition = totalLentRemaining - totalBorrowedRemaining;
    const activeCount = loans.filter((l) => l.status === 'active').length;
    const settledCount = loans.filter((l) => l.status === 'settled').length;

    return {
      totalBorrowedPrincipal,
      totalBorrowedRemaining,
      totalLentPrincipal,
      totalLentRemaining,
      netPosition,
      activeCount,
      settledCount,
    };
  }, [loans]);

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      if (filter === 'borrowed') return loan.direction === 'borrowed' && loan.status === 'active';
      if (filter === 'lent') return loan.direction === 'lent' && loan.status === 'active';
      if (filter === 'settled') return loan.status === 'settled';
      return true;
    });
  }, [loans, filter]);

  const chartData = useMemo(
    () =>
      loans.map((l) => ({
        name: l.title.length > 18 ? `${l.title.slice(0, 16)}…` : l.title,
        fullTitle: l.title,
        repaid: l.totalRepaid,
        remaining: l.remainingBalance,
      })),
    [loans]
  );

  const currency = settings.currency;

  const filterTabs = [
    { id: 'all', label: t.loans.allLoans },
    { id: 'borrowed', label: t.loans.loanTakenFilter },
    { id: 'lent', label: t.loans.loanGivenFilter },
    { id: 'settled', label: t.loans.settled },
  ] as const;

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="hisaap-card rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.loans.availedPayableCard}
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-red-700 dark:text-red-400">
            {formatCurrency(summary.totalBorrowedRemaining, currency)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {t.loans.totalPrincipal}: {formatCurrency(summary.totalBorrowedPrincipal, currency)}
          </div>
        </div>

        <div className="hisaap-card rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.loans.givenReceivableCard}
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#0F6A3C] dark:text-emerald-400">
            {formatCurrency(summary.totalLentRemaining, currency)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {t.loans.totalPrincipal}: {formatCurrency(summary.totalLentPrincipal, currency)}
          </div>
        </div>

        <div className="hisaap-card rounded-2xl p-5 ring-1 ring-[#6A1B9A]/20">
          <div className="text-xs font-medium text-[#6A1B9A] dark:text-purple-300">
            {t.loans.netLoanPosition}
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-50">
            {summary.netPosition >= 0 ? '+' : ''}
            {formatCurrency(summary.netPosition, currency)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {t.loans.receivablesMinusPayables}
          </div>
        </div>

        <div className="hisaap-card rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.loans.trackedAgreements}
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-50">
            {loans.length}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {formatText(t.loans.activeSettledSummary, {
              active: summary.activeCount,
              settled: summary.settledCount,
            })}
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="hisaap-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-[#6A1B9A] text-white dark:bg-purple-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onAddLoan}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-[#6A1B9A] text-white hover:bg-[#53147A] dark:bg-purple-600 dark:hover:bg-purple-500 transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.loans.addLoan}</span>
        </button>
      </div>

      {/* Loan Progress Chart */}
      {loans.length > 0 && (
        <div className="hisaap-card rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {t.loans.repaymentChartTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.loans.repaymentChartSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#6A1B9A] inline-block" />
                {t.loans.repaid}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-300 dark:bg-slate-600 inline-block" />
                {t.loans.remaining}
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
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
                          {row.fullTitle}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">{t.loans.repaid}</span>
                          <span className="font-mono tabular-nums text-[#6A1B9A] dark:text-purple-300 font-medium">
                            {formatCurrency(row.repaid, currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">{t.loans.remaining}</span>
                          <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                            {formatCurrency(row.remaining, currency)}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="repaid" stackId="a" fill="#6A1B9A" maxBarSize={40} />
                <Bar
                  dataKey="remaining"
                  stackId="a"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Loan Table / List */}
      <div className="hisaap-card rounded-2xl overflow-hidden">
        {filteredLoans.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {loans.length === 0 ? t.loans.noLoansYet : t.loans.noMatchingLoans}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t.loans.emptyHint}
            </p>
            <button
              type="button"
              onClick={onAddLoan}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-[#6A1B9A] text-white hover:bg-[#53147A] dark:bg-purple-600 dark:hover:bg-purple-500 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.loans.addLoan}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredLoans.map((loan) => {
              const isExpanded = expandedId === loan.id;
              return (
                <div key={loan.id} className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {loan.title}
                        </h3>
                        <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {loan.counterparty}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                          ·
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            loan.direction === 'borrowed'
                              ? 'text-red-700 dark:text-red-400'
                              : 'text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          {loan.direction === 'borrowed'
                            ? t.loans.loanTakenFilter
                            : t.loans.loanGivenFilter}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          {t.loans.startedLabel} {formatShortDate(loan.startDate)}
                        </span>
                        {loan.dueDate && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>
                              {t.loans.dueLabel} {formatShortDate(loan.dueDate)}
                            </span>
                          </>
                        )}
                        {loan.interestRate > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {formatText(t.loans.interestPerAnnum, { rate: loan.interestRate })}
                            </span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        {loan.status === 'settled' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t.loans.settled}
                          </span>
                        ) : loan.isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-400 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {t.loans.overdue}
                          </span>
                        ) : (
                          <span>{t.loans.active}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div className="grid grid-cols-3 gap-3 sm:gap-5 text-left sm:text-right w-full sm:w-auto">
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {t.loans.principal}
                          </div>
                          <div className="text-sm font-mono tabular-nums font-medium text-slate-900 dark:text-slate-100">
                            {formatCurrency(loan.principalAmount, currency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {t.loans.repaid}
                          </div>
                          <div className="text-sm font-mono tabular-nums font-medium text-emerald-700 dark:text-emerald-400">
                            {formatCurrency(loan.totalRepaid, currency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {t.loans.remaining}
                          </div>
                          <div className="text-sm font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-50">
                            {formatCurrency(loan.remainingBalance, currency)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {loan.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => onRecordPayment(loan)}
                            className="px-3 py-1.5 text-xs font-medium bg-[#6A1B9A] text-white hover:bg-[#53147A] dark:bg-purple-600 dark:hover:bg-purple-500 rounded-xl transition-colors whitespace-nowrap"
                          >
                            {t.loans.recordPayment}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : loan.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap"
                        >
                          <span>
                            {formatText(t.loans.historyCount, {
                              count: loan.linkedTransactions.length,
                            })}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditLoan(loan)}
                          aria-label={`${t.common.edit} ${loan.title}`}
                          className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {confirmDeleteId === loan.id ? (
                          <span className="inline-flex items-center gap-1 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteLoan(loan.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-1 font-medium text-white bg-red-600 hover:bg-red-700 rounded"
                            >
                              {t.common.delete}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                            >
                              {t.common.cancel}
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(loan.id)}
                            aria-label={`${t.common.delete} ${loan.title}`}
                            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          loan.status === 'settled'
                            ? 'bg-[#0F6A3C] dark:bg-emerald-500'
                            : 'bg-gradient-to-r from-[#6A1B9A] to-[#D4A017]'
                        }`}
                        style={{ width: `${loan.progressPercent}%` }}
                      />
                    </div>
                    <span className="font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400 w-14 text-right">
                      {loan.progressPercent.toFixed(1)}%
                    </span>
                  </div>

                  {loan.notes && (
                    <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                      {loan.notes}
                    </p>
                  )}

                  {/* Expanded Linked Ledger Rows */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t.loans.linkedEntriesTitle}
                      </div>
                      {loan.linkedTransactions.length === 0 ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t.loans.noLinkedEntries}
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th className="py-2 pr-4">{t.common.date}</th>
                                <th className="py-2 px-3">{t.loans.roleCol}</th>
                                <th className="py-2 px-3">{t.common.description}</th>
                                <th className="py-2 px-3">{t.common.account}</th>
                                <th className="py-2 pl-3 text-right">{t.common.amount}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                              {loan.linkedTransactions.map((tx) => (
                                <tr key={tx.id}>
                                  <td className="py-2 pr-4 font-mono tabular-nums text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                    {formatShortDate(tx.date)}
                                  </td>
                                  <td className="py-2 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                    {tx.loanAction === 'disbursement'
                                      ? t.loans.roleDisbursement
                                      : t.loans.roleRepayment}
                                  </td>
                                  <td className="py-2 px-3 text-slate-900 dark:text-slate-100">
                                    {tx.description}
                                  </td>
                                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                    {translateAccount(tx.account)}
                                  </td>
                                  <td
                                    className={`py-2 pl-3 text-right font-mono tabular-nums font-medium whitespace-nowrap ${
                                      tx.type === 'income'
                                        ? 'text-emerald-700 dark:text-emerald-400'
                                        : 'text-red-700 dark:text-red-400'
                                    }`}
                                  >
                                    {tx.type === 'income' ? '+' : '−'}
                                    {formatCurrency(tx.amount, currency)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
