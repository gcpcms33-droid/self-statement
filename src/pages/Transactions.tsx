import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpDown,
  ArrowUpRight,
  Copy,
  Download,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { ComputedTransaction, FinanceSettings, Transaction } from '../types/finance';
import { formatCurrency, formatMonthLabel, formatShortDate } from '../utils/finance';

interface TransactionsProps {
  ledger: ComputedTransaction[];
  settings: FinanceSettings;
  onAddNew: () => void;
  onEdit: (tx: Transaction) => void;
  onDuplicate: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({
  ledger,
  settings,
  onAddNew,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const { t, formatText, translateAccount, translateCategory } = useLanguage();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [pageSize, setPageSize] = useState<number>(25);
  const [page, setPage] = useState<number>(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    for (const tx of ledger) {
      set.add(tx.date.slice(0, 7));
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [ledger]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    for (const tx of ledger) {
      set.add(tx.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [ledger]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = ledger.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
      if (monthFilter !== 'all' && !tx.date.startsWith(monthFilter)) return false;
      if (q) {
        const hay = `${tx.date} ${tx.description} ${tx.category} ${tx.account} ${tx.notes || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return sortOrder === 'newest' ? [...list].reverse() : list;
  }, [ledger, search, typeFilter, categoryFilter, monthFilter, sortOrder]);

  const filteredTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of filtered) {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    }
    return {
      income,
      expense,
      net: income - expense,
    };
  }, [filtered]);

  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const visibleRows = useMemo(() => {
    if (pageSize === 0) return filtered;
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSize, safePage]);

  const handleExportCsv = () => {
    const headers = [
      'Seq',
      'Date',
      'Type',
      'Category',
      'Description',
      'Account',
      'Amount',
      'RunningBalance',
      'Notes',
    ];
    const escapeCsv = (val: string | number) => {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    const rows = filtered.map((tx) => [
      tx.chronologicalIndex,
      tx.date,
      tx.type,
      tx.category,
      tx.description,
      tx.account,
      tx.type === 'income' ? tx.amount : -tx.amount,
      tx.runningBalance,
      tx.notes || '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hisaap-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currency = settings.currency;

  const typeFilterLabels: Record<'all' | 'income' | 'expense', string> = {
    all: t.common.all,
    income: t.common.income,
    expense: t.common.expense,
  };

  return (
    <div className="space-y-6">
      {/* Header Summary Strip */}
      <div className="hisaap-card rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#1B5E20] dark:text-emerald-300">
            {t.transactions.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.transactions.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400">
              {t.transactions.filteredCredits}
            </span>
            <div className="font-mono tabular-nums font-semibold text-[#1B5E20] dark:text-emerald-400 mt-0.5">
              +{formatCurrency(filteredTotals.income, currency)}
            </div>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">
              {t.transactions.filteredDebits}
            </span>
            <div className="font-mono tabular-nums font-semibold text-red-700 dark:text-red-400 mt-0.5">
              −{formatCurrency(filteredTotals.expense, currency)}
            </div>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">
              {t.transactions.filteredNet}
            </span>
            <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {formatCurrency(filteredTotals.net, currency)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#1B5E20]/25 dark:border-emerald-500/30 rounded-xl text-[#1B5E20] dark:text-emerald-300 hover:bg-[#1B5E20]/5 dark:hover:bg-emerald-500/10 disabled:opacity-40 whitespace-nowrap transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.transactions.exportCsv}</span>
          </button>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="hisaap-card rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t.transactions.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 dark:focus:ring-emerald-500/40"
          />
        </div>

        {/* Segmented Type Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
          {(['all', 'income', 'expense'] as const).map((typeKey) => (
            <button
              key={typeKey}
              type="button"
              onClick={() => {
                setTypeFilter(typeKey);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                typeFilter === typeKey
                  ? 'bg-[#1B5E20] text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {typeFilterLabels[typeKey]}
            </button>
          ))}
        </div>

        <select
          aria-label={t.transactions.allCategories}
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs font-medium bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
        >
          <option value="all">{t.transactions.allCategories}</option>
          {availableCategories.map((c) => (
            <option key={c} value={c}>
              {translateCategory(c)}
            </option>
          ))}
        </select>

        <select
          aria-label={t.transactions.allMonths}
          value={monthFilter}
          onChange={(e) => {
            setMonthFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs font-medium bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
        >
          <option value="all">{t.transactions.allMonths}</option>
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {formatMonthLabel(m)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>
            {sortOrder === 'newest' ? t.transactions.newestFirst : t.transactions.oldestFirst}
          </span>
        </button>
      </div>

      {/* Ledger Table */}
      <div className="hisaap-card rounded-2xl overflow-hidden">
        {visibleRows.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {ledger.length === 0
                ? t.transactions.noTransactionsYet
                : t.transactions.noMatchingTransactions}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {ledger.length === 0 ? t.transactions.emptyHint : t.transactions.filterEmptyHint}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {ledger.length === 0 ? (
                <button
                  type="button"
                  onClick={onAddNew}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-[#1B5E20] text-white hover:bg-[#144918] dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.common.addTransaction}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setTypeFilter('all');
                    setCategoryFilter('all');
                    setMonthFilter('all');
                  }}
                  className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {t.transactions.clearFilters}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-950/40">
                    <th className="py-3 pl-5 pr-2 whitespace-nowrap w-12">#</th>
                    <th className="py-3 px-3 whitespace-nowrap">{t.common.date}</th>
                    <th className="py-3 px-3 whitespace-nowrap">{t.common.description}</th>
                    <th className="py-3 px-3 whitespace-nowrap">{t.common.category}</th>
                    <th className="py-3 px-3 whitespace-nowrap hidden md:table-cell">
                      {t.common.account}
                    </th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">{t.common.amount}</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">
                      {t.common.runningBalance}
                    </th>
                    <th className="py-3 pl-3 pr-5 text-right whitespace-nowrap">
                      {t.common.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                  {visibleRows.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 pl-5 pr-2 font-mono tabular-nums text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {tx.chronologicalIndex}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatShortDate(tx.date)}
                      </td>
                      <td className="py-2.5 px-3 max-w-[260px]">
                        <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {tx.description}
                        </div>
                        {(tx.notes || tx.loanId) && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {tx.loanId ? t.transactions.loanLinkedEntry : ''}
                            {tx.loanId && tx.notes ? ' · ' : ''}
                            {tx.notes || ''}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {translateCategory(tx.category)}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap hidden md:table-cell">
                        {translateAccount(tx.account)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono tabular-nums text-xs font-medium whitespace-nowrap ${
                          tx.type === 'income'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-red-700 dark:text-red-400'
                        }`}
                      >
                        <span className="inline-flex items-center justify-end gap-1">
                          {tx.type === 'income' ? (
                            <ArrowDownLeft className="w-3 h-3 shrink-0" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 shrink-0" />
                          )}
                          <span>
                            {tx.type === 'income' ? '+' : '−'}
                            {formatCurrency(tx.amount, currency)}
                          </span>
                        </span>
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono tabular-nums text-xs font-semibold whitespace-nowrap ${
                          tx.runningBalance < 0
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {formatCurrency(tx.runningBalance, currency)}
                      </td>
                      <td className="py-2.5 pl-3 pr-5 text-right whitespace-nowrap">
                        {confirmDeleteId === tx.id ? (
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                onDelete(tx.id);
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
                          <span className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEdit(tx)}
                              title={t.transactions.editTitle}
                              aria-label={`${t.common.edit} ${tx.description}`}
                              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDuplicate(tx)}
                              title={t.transactions.duplicateTitle}
                              aria-label={`${t.common.duplicate} ${tx.description}`}
                              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(tx.id)}
                              title={t.transactions.deleteTitle}
                              aria-label={`${t.common.delete} ${tx.description}`}
                              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span className="tabular-nums">
                  {formatText(t.transactions.showingCount, {
                    visible: visibleRows.length,
                    total: filtered.length,
                  })}
                </span>
                <select
                  aria-label={t.transactions.rowsPerPageAria}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-300"
                >
                  <option value={25}>{formatText(t.transactions.perPage, { count: 25 })}</option>
                  <option value={50}>{formatText(t.transactions.perPage, { count: 50 })}</option>
                  <option value={100}>{formatText(t.transactions.perPage, { count: 100 })}</option>
                  <option value={0}>
                    {formatText(t.transactions.showAll, { total: filtered.length })}
                  </option>
                </select>
              </div>

              {pageSize !== 0 && totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
                  >
                    {t.common.previous}
                  </button>
                  <span className="font-mono tabular-nums px-2">
                    {formatText(t.transactions.pageLabel, {
                      page: safePage,
                      total: totalPages,
                    })}
                  </span>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
                  >
                    {t.common.next}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
