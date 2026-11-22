import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_SETTINGS } from '../data/seedData';
import type {
  AccountSummary,
  ComputedLoan,
  ComputedTransaction,
  ExportBundle,
  FinanceSettings,
  Loan,
  Transaction,
} from '../types/finance';
import {
  computeAccountSummaries,
  computeLedger,
  computeLoans,
  generateId,
} from '../utils/finance';

interface LedgerPayload {
  transactions: Transaction[];
  loans: Loan[];
  settings: FinanceSettings;
}

const STORAGE_KEY = 'hisaap_ledger_v1';

function normalizeSettings(raw: Partial<FinanceSettings>): FinanceSettings {
  const merged: FinanceSettings = {
    ...DEFAULT_SETTINGS,
    ...raw,
    ownerName: raw.ownerName ?? '',
    bankAccountName:
      raw.bankAccountName === 'SBI Bank' || !raw.bankAccountName
        ? 'Bank'
        : raw.bankAccountName,
    currency: 'INR',
    locale: 'en-IN',
  };

  const legacyRemoved = (merged.accounts || []).filter(
    (a) =>
      a !== 'Checking' &&
      a !== 'High-Yield Savings' &&
      a !== 'Bank Account' &&
      a !== 'Cash Account' &&
      a !== 'UPI Account' &&
      a !== 'SBI Bank'
  );
  const coreIndianAccounts = [
    merged.cashAccountName || 'Cash',
    merged.bankAccountName || 'Bank',
    merged.upiAccountName || 'UPI',
    merged.creditCardAccountName || 'Credit Card',
  ];
  merged.accounts = Array.from(new Set([...coreIndianAccounts, ...legacyRemoved]));
  return merged;
}

function loadInitialLedger(): LedgerPayload {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        transactions: [],
        loans: [],
        settings: normalizeSettings({}),
      };
    }
    const parsed = JSON.parse(raw) as Partial<LedgerPayload>;
    return {
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      loans: Array.isArray(parsed.loans) ? parsed.loans : [],
      settings: normalizeSettings(parsed.settings || {}),
    };
  } catch {
    return {
      transactions: [],
      loans: [],
      settings: normalizeSettings({}),
    };
  }
}

export function useFinanceStore() {
  const [initial] = useState<LedgerPayload>(loadInitialLedger);
  const [transactions, setTransactions] = useState<Transaction[]>(initial.transactions);
  const [loans, setLoans] = useState<Loan[]>(initial.loans);
  const [settings, setSettings] = useState<FinanceSettings>(initial.settings);

  // Sync theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist single-user ledger directly to Local Storage
  useEffect(() => {
    const payload: LedgerPayload = {
      transactions,
      loans,
      settings,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [transactions, loans, settings]);

  // Chronological ledger with running balance per row
  const computedLedger: ComputedTransaction[] = useMemo(
    () => computeLedger(transactions, settings.openingBalance),
    [transactions, settings.openingBalance]
  );

  const computedLoans: ComputedLoan[] = useMemo(
    () => computeLoans(loans, transactions),
    [loans, transactions]
  );

  const accountSummaries: AccountSummary[] = useMemo(
    () => computeAccountSummaries(settings, transactions),
    [settings, transactions]
  );

  // Transaction CRUD
  const addTransaction = useCallback(
    (input: Omit<Transaction, 'id' | 'createdAt'>) => {
      const next: Transaction = {
        ...input,
        id: generateId('tx'),
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [...prev, next]);
      return next;
    },
    []
  );

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
      );
    },
    []
  );

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  const duplicateTransaction = useCallback((tx: Transaction) => {
    const copy: Transaction = {
      ...tx,
      id: generateId('tx'),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [...prev, copy]);
    return copy;
  }, []);

  // Loan CRUD
  const addLoan = useCallback(
    (
      input: Omit<Loan, 'id' | 'createdAt'>,
      alsoPostDisbursementTx = false,
      disbursementAccount = settings.cashAccountName || 'Cash'
    ) => {
      const loanId = generateId('loan');
      const newLoan: Loan = {
        ...input,
        id: loanId,
        createdAt: new Date().toISOString(),
      };
      setLoans((prev) => [...prev, newLoan]);

      if (alsoPostDisbursementTx) {
        const txType = input.direction === 'borrowed' ? 'income' : 'expense';
        const txCategory =
          input.direction === 'borrowed' ? 'Loan Availed' : 'Loan Disbursed';
        const tx: Transaction = {
          id: generateId('tx'),
          date: input.startDate,
          type: txType,
          category: txCategory,
          description: `${input.direction === 'borrowed' ? 'Loan from' : 'Loan to'} ${input.counterparty}: ${input.title}`,
          amount: input.principalAmount,
          account: disbursementAccount,
          loanId,
          loanAction: 'disbursement',
          createdAt: new Date().toISOString(),
        };
        setTransactions((prev) => [...prev, tx]);
      }

      return newLoan;
    },
    [settings.cashAccountName]
  );

  const updateLoan = useCallback(
    (id: string, updates: Partial<Omit<Loan, 'id'>>) => {
      setLoans((prev) =>
        prev.map((loan) => (loan.id === id ? { ...loan, ...updates } : loan))
      );
    },
    []
  );

  const deleteLoan = useCallback((id: string) => {
    setLoans((prev) => prev.filter((loan) => loan.id !== id));
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.loanId === id ? { ...tx, loanId: undefined, loanAction: undefined } : tx
      )
    );
  }, []);

  const recordLoanRepayment = useCallback(
    (params: {
      loan: ComputedLoan;
      amount: number;
      date: string;
      account: string;
      notes?: string;
    }) => {
      const { loan, amount, date, account, notes } = params;
      const isBorrowed = loan.direction === 'borrowed';
      const tx: Transaction = {
        id: generateId('tx'),
        date,
        type: isBorrowed ? 'expense' : 'income',
        category: isBorrowed ? 'Loan EMI / Repayment' : 'Loan Recovery Received',
        description: `${loan.title} — ${isBorrowed ? 'Payment to' : 'Receipt from'} ${loan.counterparty}`,
        amount,
        account,
        notes,
        loanId: loan.id,
        loanAction: 'repayment',
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [...prev, tx]);
      return tx;
    },
    []
  );

  // Settings
  const updateSettings = useCallback((updates: Partial<FinanceSettings>) => {
    setSettings((prev) => {
      const next: FinanceSettings = {
        ...prev,
        ...updates,
        currency: 'INR',
        locale: 'en-IN',
      };
      const coreNames = [
        next.cashAccountName || 'Cash',
        next.bankAccountName || 'Bank',
        next.upiAccountName || 'UPI',
        next.creditCardAccountName || 'Credit Card',
      ];
      const existingCustom = (next.accounts || []).filter(
        (acc) =>
          acc !== prev.cashAccountName &&
          acc !== prev.bankAccountName &&
          acc !== prev.upiAccountName &&
          acc !== prev.creditCardAccountName &&
          !coreNames.includes(acc)
      );
      next.accounts = Array.from(new Set([...coreNames, ...existingCustom]));
      return next;
    });
  }, []);

  // Export & Import JSON
  const buildExportBundle = useCallback((): ExportBundle => {
    return {
      version: 3,
      app: 'Hisaap',
      exportedAt: new Date().toISOString(),
      settings,
      transactions,
      loans,
    };
  }, [settings, transactions, loans]);

  const importBundle = useCallback(
    (bundle: ExportBundle, mode: 'replace' | 'merge') => {
      const importedIncomeCats = bundle.transactions
        .filter((t) => t.type === 'income' && t.category.trim())
        .map((t) => t.category.trim());
      const importedExpenseCats = bundle.transactions
        .filter((t) => t.type === 'expense' && t.category.trim())
        .map((t) => t.category.trim());
      const importedAccounts = bundle.transactions
        .filter((t) => t.account.trim())
        .map((t) => t.account.trim());

      if (mode === 'replace') {
        setTransactions(bundle.transactions);
        setLoans(bundle.loans);
        const baseSettings = normalizeSettings(bundle.settings);
        setSettings({
          ...baseSettings,
          incomeCategories: Array.from(
            new Set([...baseSettings.incomeCategories, ...importedIncomeCats])
          ),
          expenseCategories: Array.from(
            new Set([...baseSettings.expenseCategories, ...importedExpenseCats])
          ),
          accounts: Array.from(new Set([...baseSettings.accounts, ...importedAccounts])),
        });
      } else {
        const existingLoanIds = new Set(loans.map((l) => l.id));
        const loanIdMap = new Map<string, string>();
        const incomingLoans = bundle.loans.map((l) => {
          if (existingLoanIds.has(l.id)) {
            const newId = generateId('loan');
            loanIdMap.set(l.id, newId);
            return { ...l, id: newId };
          }
          return l;
        });

        setLoans((prev) => [...prev, ...incomingLoans]);
        setTransactions((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          const incoming = bundle.transactions.map((t) => {
            const remappedLoanId = t.loanId ? loanIdMap.get(t.loanId) || t.loanId : undefined;
            return {
              ...t,
              id: existingIds.has(t.id) ? generateId('tx') : t.id,
              loanId: remappedLoanId,
            };
          });
          return [...prev, ...incoming];
        });
        setSettings((prev) => ({
          ...prev,
          incomeCategories: Array.from(
            new Set([...prev.incomeCategories, ...importedIncomeCats])
          ),
          expenseCategories: Array.from(
            new Set([...prev.expenseCategories, ...importedExpenseCats])
          ),
          accounts: Array.from(new Set([...prev.accounts, ...importedAccounts])),
        }));
      }
    },
    [loans]
  );

  const clearAllData = useCallback(() => {
    setTransactions([]);
    setLoans([]);
    setSettings((prev) => ({
      ...prev,
      openingBalance: 0,
      cashAccountBalance: 0,
      bankAccountBalance: 0,
      upiAccountBalance: 0,
      creditCardAccountBalance: 0,
    }));
  }, []);

  return {
    transactions,
    computedLedger,
    loans,
    computedLoans,
    accountSummaries,
    settings,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
    addLoan,
    updateLoan,
    deleteLoan,
    recordLoanRepayment,
    updateSettings,
    buildExportBundle,
    importBundle,
    clearAllData,
  };
}
