import React, { useEffect, useState } from 'react';
import { Calculator, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type {
  ComputedLoan,
  FinanceSettings,
  LoanAction,
  Transaction,
  TransactionType,
} from '../types/finance';
import { formatCurrency, getTodayISO } from '../utils/finance';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction: Transaction | null;
  prefilledAmount?: { amount: number; nonce: number } | null;
  onOpenCalculator?: () => void;
  settings: FinanceSettings;
  loans: ComputedLoan[];
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editingTransaction,
  prefilledAmount,
  onOpenCalculator,
  settings,
  loans,
  onSave,
}) => {
  const { t, formatText, translateAccount, translateCategory } = useLanguage();
  const [date, setDate] = useState(getTodayISO());
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState(settings.cashAccountName || 'Cash');
  const [notes, setNotes] = useState('');
  const [loanId, setLoanId] = useState('');
  const [loanAction, setLoanAction] = useState<LoanAction>('repayment');
  const [error, setError] = useState('');
  const [savedNotice, setSavedNotice] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSavedNotice('');
    if (editingTransaction) {
      setDate(editingTransaction.date);
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description);
      setAmount(String(editingTransaction.amount));
      setAccount(editingTransaction.account || settings.cashAccountName || 'Cash');
      setNotes(editingTransaction.notes || '');
      setLoanId(editingTransaction.loanId || '');
      setLoanAction(editingTransaction.loanAction || 'repayment');
    } else {
      setDate(getTodayISO());
      setType('expense');
      setCategory(settings.expenseCategories[0] || 'Kirana & Groceries');
      setDescription('');
      setAmount(prefilledAmount ? String(prefilledAmount.amount) : '');
      setAccount(settings.cashAccountName || 'Cash');
      setNotes('');
      setLoanId('');
      setLoanAction('repayment');
    }
  }, [isOpen, editingTransaction, settings]);

  useEffect(() => {
    if (!isOpen || !prefilledAmount) return;
    setAmount(String(prefilledAmount.amount));
  }, [isOpen, prefilledAmount]);

  if (!isOpen) return null;

  const availableCategories =
    type === 'income' ? settings.incomeCategories : settings.expenseCategories;

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    const list =
      nextType === 'income' ? settings.incomeCategories : settings.expenseCategories;
    if (!list.includes(category)) {
      setCategory(list[0] || 'General');
    }
  };

  const validateAndBuild = (): Omit<Transaction, 'id' | 'createdAt'> | null => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError(t.modals.errInvalidDate);
      return null;
    }
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError(t.modals.errPositiveAmount);
      return null;
    }
    if (!description.trim()) {
      setError(t.modals.errMissingDescription);
      return null;
    }

    return {
      date,
      type,
      category: category || (type === 'income' ? 'Other Income' : 'Other Expense'),
      description: description.trim(),
      amount: Math.round(parsedAmount * 100) / 100,
      account: account || settings.cashAccountName || 'Cash',
      notes: notes.trim() || undefined,
      loanId: loanId || undefined,
      loanAction: loanId ? loanAction : undefined,
    };
  };

  const handleSubmit = (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    setError('');
    const payload = validateAndBuild();
    if (!payload) return;

    onSave(payload, editingTransaction?.id);

    if (addAnother && !editingTransaction) {
      setDescription('');
      setAmount('');
      setNotes('');
      setLoanId('');
      setSavedNotice(
        formatText(t.modals.savedReadyNext, {
          amount: formatCurrency(payload.amount, settings.currency, settings.locale),
          date: payload.date,
        })
      );
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-modal-title"
    >
      <div className="w-full max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2
              id="tx-modal-title"
              className="text-base font-semibold text-[#0F6A3C] dark:text-emerald-300"
            >
              {editingTransaction ? t.modals.editTransaction : t.modals.newTransaction}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.modals.transactionSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
            aria-label={t.common.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="px-3.5 py-2.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg">
              {error}
            </div>
          )}

          {savedNotice && (
            <div className="px-3.5 py-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-lg">
              {savedNotice}
            </div>
          )}

          {/* Type Segmented Control */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.modals.transactionType}
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 text-xs font-medium rounded-md transition-colors ${
                  type === 'expense'
                    ? 'bg-white dark:bg-slate-900 text-red-700 dark:text-red-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t.modals.expenseButton}
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 text-xs font-medium rounded-md transition-colors ${
                  type === 'income'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t.modals.incomeButton}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="tx-date"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.modals.dateSameAllowed}
              </label>
              <input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label
                  htmlFor="tx-amount"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  {t.modals.amountInr}
                </label>
                {onOpenCalculator && (
                  <button
                    type="button"
                    onClick={onOpenCalculator}
                    aria-label={t.calculator.openCalculator}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0F6A3C] hover:text-[#0B532F] dark:text-[#FCE38A] dark:hover:underline"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>{t.nav.calculator}</span>
                  </button>
                )}
              </div>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="tx-desc"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              {t.common.description}
            </label>
            <input
              id="tx-desc"
              type="text"
              placeholder={t.modals.descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="tx-category"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.common.category}
              </label>
              <select
                id="tx-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {translateCategory(cat)}
                  </option>
                ))}
                {!availableCategories.includes(category) && category && (
                  <option value={category}>{translateCategory(category)}</option>
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="tx-account"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.common.account}
              </label>
              <select
                id="tx-account"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              >
                {settings.accounts.map((acc) => (
                  <option key={acc} value={acc}>
                    {translateAccount(acc)}
                  </option>
                ))}
                {!settings.accounts.includes(account) && account && (
                  <option value={account}>{translateAccount(account)}</option>
                )}
              </select>
            </div>
          </div>

          {loans.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label
                  htmlFor="tx-loan"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  {t.modals.linkToLoanOptional}
                </label>
                <select
                  id="tx-loan"
                  value={loanId}
                  onChange={(e) => setLoanId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                >
                  <option value="">{t.common.none}</option>
                  {loans.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.counterparty})
                    </option>
                  ))}
                </select>
              </div>
              {loanId && (
                <div>
                  <label
                    htmlFor="tx-loan-action"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    {t.modals.loanEntryRole}
                  </label>
                  <select
                    id="tx-loan-action"
                    value={loanAction}
                    onChange={(e) => setLoanAction(e.target.value as LoanAction)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  >
                    <option value="repayment">{t.modals.roleRepaymentOption}</option>
                    <option value="disbursement">{t.modals.roleDisbursementOption}</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="tx-notes"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              {t.modals.notesReferenceOptional}
            </label>
            <input
              id="tx-notes"
              type="text"
              placeholder={t.modals.notesReferencePlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap"
            >
              {t.common.cancel}
            </button>
            {!editingTransaction && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2 text-sm font-medium border border-[#0F6A3C]/30 dark:border-emerald-500/30 text-[#0F6A3C] dark:text-emerald-300 hover:bg-[#0F6A3C]/5 dark:hover:bg-emerald-500/10 rounded-xl transition-colors whitespace-nowrap"
              >
                {t.modals.saveAndAddAnother}
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-[#0F6A3C] text-white hover:bg-[#0B532F] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl transition-colors whitespace-nowrap"
            >
              {editingTransaction ? t.modals.updateTransaction : t.modals.saveTransaction}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
