import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { ComputedLoan, FinanceSettings, Loan, LoanDirection } from '../types/finance';
import { formatCurrency, getTodayISO } from '../utils/finance';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLoan: Loan | null;
  prefilledAmount?: { amount: number; nonce: number } | null;
  settings: FinanceSettings;
  onSave: (
    data: Omit<Loan, 'id' | 'createdAt'>,
    existingId?: string,
    postDisbursement?: boolean,
    disbursementAccount?: string
  ) => void;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  editingLoan,
  prefilledAmount,
  settings,
  onSave,
}) => {
  const { t, formatText, translateAccount, translateCategory } = useLanguage();
  const [title, setTitle] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [direction, setDirection] = useState<LoanDirection>('borrowed');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [initialRepaidAmount, setInitialRepaidAmount] = useState('0');
  const [interestRate, setInterestRate] = useState('0');
  const [startDate, setStartDate] = useState(getTodayISO());
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [postDisbursement, setPostDisbursement] = useState(false);
  const [disbursementAccount, setDisbursementAccount] = useState(
    settings.cashAccountName || 'Cash'
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (editingLoan) {
      setTitle(editingLoan.title);
      setCounterparty(editingLoan.counterparty);
      setDirection(editingLoan.direction);
      setPrincipalAmount(String(editingLoan.principalAmount));
      setInitialRepaidAmount(String(editingLoan.initialRepaidAmount));
      setInterestRate(String(editingLoan.interestRate));
      setStartDate(editingLoan.startDate);
      setDueDate(editingLoan.dueDate || '');
      setNotes(editingLoan.notes || '');
      setPostDisbursement(false);
    } else {
      setTitle('');
      setCounterparty('');
      setDirection('borrowed');
      setPrincipalAmount(prefilledAmount ? String(prefilledAmount.amount) : '');
      setInitialRepaidAmount('0');
      setInterestRate('0');
      setStartDate(getTodayISO());
      setDueDate('');
      setNotes('');
      setPostDisbursement(false);
      setDisbursementAccount(settings.cashAccountName || 'Cash');
    }
  }, [isOpen, editingLoan, settings]);

  useEffect(() => {
    if (!isOpen || !prefilledAmount) return;
    setPrincipalAmount(String(prefilledAmount.amount));
  }, [isOpen, prefilledAmount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const principal = Number(principalAmount);
    const initialRepaid = Number(initialRepaidAmount) || 0;
    const rate = Number(interestRate) || 0;

    if (!title.trim() || !counterparty.trim()) {
      setError(t.modals.errLoanTitleCounterparty);
      return;
    }
    if (!Number.isFinite(principal) || principal <= 0) {
      setError(t.modals.errPositivePrincipal);
      return;
    }
    if (initialRepaid < 0) {
      setError(t.modals.errNegativePriorPaid);
      return;
    }

    onSave(
      {
        title: title.trim(),
        counterparty: counterparty.trim(),
        direction,
        principalAmount: Math.round(principal * 100) / 100,
        initialRepaidAmount: Math.round(initialRepaid * 100) / 100,
        interestRate: Math.max(0, rate),
        startDate,
        dueDate,
        notes: notes.trim() || undefined,
      },
      editingLoan?.id,
      postDisbursement,
      disbursementAccount
    );
    onClose();
  };

  const disbursementActionLabel =
    direction === 'borrowed'
      ? `${t.common.income}: ${translateCategory('Loan Availed')}`
      : `${t.common.expense}: ${translateCategory('Loan Disbursed')}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loan-modal-title"
    >
      <div className="w-full max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h2
            id="loan-modal-title"
            className="text-base font-semibold text-[#6A1B9A] dark:text-purple-300"
          >
            {editingLoan ? t.modals.editLoanRecord : t.modals.addLoanRecord}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
            aria-label={t.common.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="px-3.5 py-2.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.modals.loanDirection}
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setDirection('borrowed')}
                className={`py-2 text-xs font-medium rounded-md transition-colors ${
                  direction === 'borrowed'
                    ? 'bg-white dark:bg-slate-900 text-red-700 dark:text-red-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t.modals.loanTakenOption}
              </button>
              <button
                type="button"
                onClick={() => setDirection('lent')}
                className={`py-2 text-xs font-medium rounded-md transition-colors ${
                  direction === 'lent'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t.modals.loanGivenOption}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="loan-title"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.modals.loanTitle}
              </label>
              <input
                id="loan-title"
                type="text"
                placeholder={t.modals.loanTitlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>
            <div>
              <label
                htmlFor="loan-counterparty"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.modals.counterparty}
              </label>
              <input
                id="loan-counterparty"
                type="text"
                placeholder={t.modals.counterpartyPlaceholder}
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="loan-principal"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.modals.principalInr}
              </label>
              <input
                id="loan-principal"
                type="number"
                step="0.01"
                min="0.01"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>
            <div>
              <label
                htmlFor="loan-initial-paid"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.modals.priorPaid}
              </label>
              <input
                id="loan-initial-paid"
                type="number"
                step="0.01"
                min="0"
                value={initialRepaidAmount}
                onChange={(e) => setInitialRepaidAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>
            <div>
              <label
                htmlFor="loan-rate"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.modals.interestPercent}
              </label>
              <input
                id="loan-rate"
                type="number"
                step="0.1"
                min="0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="loan-start"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.modals.startDate}
              </label>
              <input
                id="loan-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>
            <div>
              <label
                htmlFor="loan-due"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.modals.targetDueDateOptional}
              </label>
              <input
                id="loan-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>
          </div>

          {!editingLoan && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postDisbursement}
                  onChange={(e) => setPostDisbursement(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {formatText(t.modals.alsoRecordPrincipal, { action: disbursementActionLabel })}
                </span>
              </label>
              {postDisbursement && (
                <div>
                  <label
                    htmlFor="loan-acc"
                    className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
                  >
                    {t.modals.ledgerAccount}
                  </label>
                  <select
                    id="loan-acc"
                    value={disbursementAccount}
                    onChange={(e) => setDisbursementAccount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    {settings.accounts.map((acc) => (
                      <option key={acc} value={acc}>
                        {translateAccount(acc)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="loan-notes"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              {t.modals.notesOptional}
            </label>
            <input
              id="loan-notes"
              type="text"
              placeholder={t.modals.loanNotesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-[#6A1B9A] text-white hover:bg-[#53147A] dark:bg-purple-600 dark:hover:bg-purple-500 rounded-xl transition-colors"
            >
              {editingLoan ? t.modals.updateLoan : t.modals.saveLoan}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface RepaymentModalProps {
  loan: ComputedLoan | null;
  onClose: () => void;
  prefilledAmount?: { amount: number; nonce: number } | null;
  settings: FinanceSettings;
  onRecord: (params: {
    loan: ComputedLoan;
    amount: number;
    date: string;
    account: string;
    notes?: string;
  }) => void;
}

export const RepaymentModal: React.FC<RepaymentModalProps> = ({
  loan,
  onClose,
  prefilledAmount,
  settings,
  onRecord,
}) => {
  const { t, translateAccount } = useLanguage();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [account, setAccount] = useState(settings.cashAccountName || 'Cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loan) return;
    setAmount(loan.remainingBalance > 0 ? String(loan.remainingBalance) : '');
    setDate(getTodayISO());
    setAccount(settings.cashAccountName || 'Cash');
    setNotes('');
    setError('');
  }, [loan, settings]);

  useEffect(() => {
    if (!loan || !prefilledAmount) return;
    setAmount(String(prefilledAmount.amount));
  }, [loan, prefilledAmount]);

  if (!loan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError(t.modals.errPositivePayment);
      return;
    }
    onRecord({
      loan,
      amount: Math.round(parsed * 100) / 100,
      date,
      account,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="repay-modal-title"
    >
      <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2
              id="repay-modal-title"
              className="text-base font-semibold text-[#6A1B9A] dark:text-purple-300"
            >
              {t.modals.recordLoanPayment}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {loan.title} · {loan.counterparty}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="px-3.5 py-2.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pb-3 border-b border-slate-200 dark:border-slate-800">
            <span>{t.modals.remainingPrincipal}</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(loan.remainingBalance, settings.currency, settings.locale)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="repay-amount"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.modals.amountInr}
              </label>
              <input
                id="repay-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>
            <div>
              <label
                htmlFor="repay-date"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.modals.paymentDate}
              </label>
              <input
                id="repay-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="repay-account"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              {t.common.account}
            </label>
            <select
              id="repay-account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            >
              {settings.accounts.map((acc) => (
                <option key={acc} value={acc}>
                  {translateAccount(acc)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="repay-notes"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              {t.modals.notesOptional}
            </label>
            <input
              id="repay-notes"
              type="text"
              placeholder={t.modals.repayNotesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {loan.direction === 'borrowed'
              ? t.modals.repayLedgerNoteBorrowed
              : t.modals.repayLedgerNoteLent}
          </p>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-[#6A1B9A] text-white hover:bg-[#53147A] dark:bg-purple-600 dark:hover:bg-purple-500 rounded-xl transition-colors"
            >
              {t.modals.postPayment}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
