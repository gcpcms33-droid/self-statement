import type {
  AccountSummary,
  ComputedLoan,
  ComputedTransaction,
  ExportBundle,
  FinanceSettings,
  Loan,
  Transaction,
} from '../types/finance';

export const DEFAULT_CURRENCY = 'INR' as const;
export const DEFAULT_LOCALE = 'en-IN' as const;

export function formatCurrency(amount: number, currency = 'INR', locale = 'en-IN'): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return `₹${safeAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

export function formatCompactINR(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}₹${abs}`;
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  if (!y || !m) return yearMonth;
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Deterministic chronological sort:
 * Allows unlimited transactions on the exact same date.
 * Same-date entries are ordered by createdAt timestamp, then id.
 */
export function sortChronologicalAsc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt);
    return a.id.localeCompare(b.id);
  });
}

/**
 * Computes running balance for every single transaction row chronologically.
 * One Transaction = One Row, with exact runningBalance preserved regardless of display filtering.
 */
export function computeLedger(
  transactions: Transaction[],
  openingBalance = 0
): ComputedTransaction[] {
  const ordered = sortChronologicalAsc(transactions);
  let balance = Number.isFinite(openingBalance) ? openingBalance : 0;

  return ordered.map((tx, idx) => {
    const delta = tx.type === 'income' ? tx.amount : -tx.amount;
    balance = Math.round((balance + delta) * 100) / 100;
    return {
      ...tx,
      runningBalance: balance,
      chronologicalIndex: idx + 1,
    };
  });
}

/**
 * Computes live balances for Cash, Bank, UPI, and Credit Card
 * from their opening balances plus matching passbook/ledger transactions.
 */
export function computeAccountSummaries(
  settings: FinanceSettings,
  transactions: Transaction[]
): AccountSummary[] {
  const specs: {
    key: 'cash' | 'bank' | 'upi' | 'credit_card';
    name: string;
    openingBalance: number;
  }[] = [
    {
      key: 'cash',
      name: settings.cashAccountName || 'Cash',
      openingBalance: settings.cashAccountBalance || 0,
    },
    {
      key: 'bank',
      name: settings.bankAccountName || 'Bank',
      openingBalance: settings.bankAccountBalance || 0,
    },
    {
      key: 'upi',
      name: settings.upiAccountName || 'UPI',
      openingBalance: settings.upiAccountBalance || 0,
    },
    {
      key: 'credit_card',
      name: settings.creditCardAccountName || 'Credit Card',
      openingBalance: settings.creditCardAccountBalance || 0,
    },
  ];

  return specs.map((spec) => {
    let totalIncome = 0;
    let totalExpense = 0;
    for (const tx of transactions) {
      if (tx.account === spec.name) {
        if (tx.type === 'income') totalIncome += tx.amount;
        else totalExpense += tx.amount;
      }
    }
    const currentBalance =
      Math.round((spec.openingBalance + totalIncome - totalExpense) * 100) / 100;
    return {
      key: spec.key,
      name: spec.name,
      openingBalance: spec.openingBalance,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      currentBalance,
    };
  });
}

/**
 * Computes loan progress, remaining principal, and overdue state from linked repayment transactions.
 */
export function computeLoans(
  loans: Loan[],
  transactions: Transaction[],
  referenceDateISO = getTodayISO()
): ComputedLoan[] {
  return loans.map((loan) => {
    const linked = transactions
      .filter((tx) => tx.loanId === loan.id)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

    const linkedRepaidAmount = linked
      .filter((tx) => {
        if (tx.loanAction === 'repayment') return true;
        if (tx.loanAction === 'disbursement') return false;
        return loan.direction === 'borrowed' ? tx.type === 'expense' : tx.type === 'income';
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalRepaid = Math.round((loan.initialRepaidAmount + linkedRepaidAmount) * 100) / 100;
    const remainingBalance = Math.max(
      0,
      Math.round((loan.principalAmount - totalRepaid) * 100) / 100
    );
    const progressPercent =
      loan.principalAmount > 0
        ? Math.min(100, Math.round((totalRepaid / loan.principalAmount) * 1000) / 10)
        : 100;

    const status: 'active' | 'settled' = remainingBalance <= 0.005 ? 'settled' : 'active';
    const isOverdue =
      status === 'active' && Boolean(loan.dueDate) && loan.dueDate < referenceDateISO;

    return {
      ...loan,
      linkedRepaidAmount,
      totalRepaid,
      remainingBalance,
      progressPercent,
      status,
      isOverdue,
      linkedTransactions: linked,
    };
  });
}

export interface MonthlyAggregate {
  monthKey: string; // YYYY-MM
  label: string;
  shortLabel: string;
  income: number;
  expense: number;
  net: number;
  closingBalance: number;
  count: number;
}

export function buildMonthlySeries(
  computedTransactions: ComputedTransaction[],
  year?: number
): MonthlyAggregate[] {
  const map = new Map<string, MonthlyAggregate>();

  if (year) {
    for (let m = 1; m <= 12; m++) {
      const monthKey = `${year}-${String(m).padStart(2, '0')}`;
      const d = new Date(year, m - 1, 1);
      map.set(monthKey, {
        monthKey,
        label: d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        shortLabel: d.toLocaleDateString('en-IN', { month: 'short' }),
        income: 0,
        expense: 0,
        net: 0,
        closingBalance: 0,
        count: 0,
      });
    }
  }

  for (const tx of computedTransactions) {
    const monthKey = tx.date.slice(0, 7);
    const txYear = Number(tx.date.slice(0, 4));
    if (year && txYear !== year) continue;

    if (!map.has(monthKey)) {
      const [y, m] = monthKey.split('-').map(Number);
      const d = new Date(y, (m || 1) - 1, 1);
      map.set(monthKey, {
        monthKey,
        label: d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        shortLabel: d.toLocaleDateString('en-IN', { month: 'short' }),
        income: 0,
        expense: 0,
        net: 0,
        closingBalance: tx.runningBalance,
        count: 0,
      });
    }

    const entry = map.get(monthKey)!;
    if (tx.type === 'income') {
      entry.income = Math.round((entry.income + tx.amount) * 100) / 100;
    } else {
      entry.expense = Math.round((entry.expense + tx.amount) * 100) / 100;
    }
    entry.net = Math.round((entry.income - entry.expense) * 100) / 100;
    entry.closingBalance = tx.runningBalance;
    entry.count += 1;
  }

  const sorted = Array.from(map.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  let lastBalance = 0;
  for (const item of sorted) {
    if (item.count > 0) {
      lastBalance = item.closingBalance;
    } else {
      item.closingBalance = lastBalance;
    }
  }
  return sorted;
}

export interface CategoryAggregate {
  category: string;
  amount: number;
  count: number;
  sharePercent: number;
}

export function buildCategoryBreakdown(
  transactions: Transaction[],
  type: 'income' | 'expense'
): CategoryAggregate[] {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);
  const map = new Map<string, { amount: number; count: number }>();

  for (const tx of filtered) {
    const current = map.get(tx.category) || { amount: 0, count: 0 };
    current.amount = Math.round((current.amount + tx.amount) * 100) / 100;
    current.count += 1;
    map.set(tx.category, current);
  }

  return Array.from(map.entries())
    .map(([category, stats]) => ({
      category,
      amount: stats.amount,
      count: stats.count,
      sharePercent: total > 0 ? Math.round((stats.amount / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function validateImportBundle(
  raw: unknown,
  fallbackSettings: FinanceSettings
): { valid: true; bundle: ExportBundle } | { valid: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Invalid JSON structure: expected an object.' };
  }

  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.transactions)) {
    return { valid: false, error: 'Missing or invalid "transactions" array in JSON.' };
  }

  const validatedTransactions: Transaction[] = [];
  for (let i = 0; i < obj.transactions.length; i++) {
    const item = obj.transactions[i] as Record<string, unknown>;
    if (!item || typeof item !== 'object') {
      return { valid: false, error: `Transaction at index ${i} is not a valid object.` };
    }
    const date = typeof item.date === 'string' ? item.date : '';
    const type = item.type === 'income' || item.type === 'expense' ? item.type : null;
    const amount = typeof item.amount === 'number' ? item.amount : Number(item.amount);
    const description = typeof item.description === 'string' ? item.description.trim() : '';
    const category =
      typeof item.category === 'string' && item.category.trim() ? item.category.trim() : 'General';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return {
        valid: false,
        error: `Transaction #${i + 1} has invalid date "${date}" (expected YYYY-MM-DD).`,
      };
    }
    if (!type) {
      return {
        valid: false,
        error: `Transaction #${i + 1} has invalid type (expected "income" or "expense").`,
      };
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { valid: false, error: `Transaction #${i + 1} must have a positive numeric amount.` };
    }
    if (!description) {
      return { valid: false, error: `Transaction #${i + 1} is missing a description.` };
    }

    validatedTransactions.push({
      id: typeof item.id === 'string' && item.id ? item.id : generateId('tx'),
      date,
      type,
      category,
      description,
      amount: Math.round(amount * 100) / 100,
      account:
        typeof item.account === 'string' && item.account
          ? item.account
          : fallbackSettings.cashAccountName || 'Cash',
      notes: typeof item.notes === 'string' ? item.notes : undefined,
      loanId: typeof item.loanId === 'string' ? item.loanId : undefined,
      loanAction:
        item.loanAction === 'disbursement' || item.loanAction === 'repayment'
          ? item.loanAction
          : undefined,
      createdAt:
        typeof item.createdAt === 'string' && item.createdAt
          ? item.createdAt
          : new Date().toISOString(),
    });
  }

  const validatedLoans: Loan[] = [];
  if (Array.isArray(obj.loans)) {
    for (let i = 0; i < obj.loans.length; i++) {
      const item = obj.loans[i] as Record<string, unknown>;
      if (!item || typeof item !== 'object') {
        return { valid: false, error: `Loan at index ${i} is not a valid object.` };
      }
      const direction =
        item.direction === 'borrowed' || item.direction === 'lent' ? item.direction : null;
      const principal = Number(item.principalAmount);
      if (!direction || !Number.isFinite(principal) || principal <= 0) {
        return { valid: false, error: `Loan #${i + 1} has invalid direction or principalAmount.` };
      }
      validatedLoans.push({
        id: typeof item.id === 'string' && item.id ? item.id : generateId('loan'),
        title: typeof item.title === 'string' && item.title ? item.title : 'Untitled Loan',
        counterparty:
          typeof item.counterparty === 'string' && item.counterparty
            ? item.counterparty
            : 'Unknown',
        direction,
        principalAmount: Math.round(principal * 100) / 100,
        initialRepaidAmount: Math.max(0, Number(item.initialRepaidAmount) || 0),
        interestRate: Math.max(0, Number(item.interestRate) || 0),
        startDate:
          typeof item.startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.startDate)
            ? item.startDate
            : getTodayISO(),
        dueDate:
          typeof item.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.dueDate)
            ? item.dueDate
            : '',
        notes: typeof item.notes === 'string' ? item.notes : undefined,
        createdAt:
          typeof item.createdAt === 'string' && item.createdAt
            ? item.createdAt
            : new Date().toISOString(),
      });
    }
  }

  const rawSettings =
    obj.settings && typeof obj.settings === 'object'
      ? (obj.settings as Partial<FinanceSettings>)
      : {};

  const mergedSettings: FinanceSettings = {
    ownerName:
      typeof rawSettings.ownerName === 'string' && rawSettings.ownerName.trim()
        ? rawSettings.ownerName.trim()
        : fallbackSettings.ownerName,
    currency: 'INR',
    locale: 'en-IN',
    openingBalance:
      typeof rawSettings.openingBalance === 'number' && Number.isFinite(rawSettings.openingBalance)
        ? rawSettings.openingBalance
        : fallbackSettings.openingBalance,
    cashAccountName:
      typeof rawSettings.cashAccountName === 'string' && rawSettings.cashAccountName.trim()
        ? rawSettings.cashAccountName.trim()
        : fallbackSettings.cashAccountName,
    cashAccountBalance:
      typeof rawSettings.cashAccountBalance === 'number' &&
      Number.isFinite(rawSettings.cashAccountBalance)
        ? rawSettings.cashAccountBalance
        : fallbackSettings.cashAccountBalance,
    bankAccountName:
      typeof rawSettings.bankAccountName === 'string' && rawSettings.bankAccountName.trim()
        ? rawSettings.bankAccountName.trim()
        : fallbackSettings.bankAccountName,
    bankAccountBalance:
      typeof rawSettings.bankAccountBalance === 'number' &&
      Number.isFinite(rawSettings.bankAccountBalance)
        ? rawSettings.bankAccountBalance
        : fallbackSettings.bankAccountBalance,
    upiAccountName:
      typeof rawSettings.upiAccountName === 'string' && rawSettings.upiAccountName.trim()
        ? rawSettings.upiAccountName.trim()
        : fallbackSettings.upiAccountName,
    upiAccountBalance:
      typeof rawSettings.upiAccountBalance === 'number' &&
      Number.isFinite(rawSettings.upiAccountBalance)
        ? rawSettings.upiAccountBalance
        : fallbackSettings.upiAccountBalance,
    creditCardAccountName:
      typeof rawSettings.creditCardAccountName === 'string' &&
      rawSettings.creditCardAccountName.trim()
        ? rawSettings.creditCardAccountName.trim()
        : fallbackSettings.creditCardAccountName,
    creditCardAccountBalance:
      typeof rawSettings.creditCardAccountBalance === 'number' &&
      Number.isFinite(rawSettings.creditCardAccountBalance)
        ? rawSettings.creditCardAccountBalance
        : fallbackSettings.creditCardAccountBalance,
    theme:
      rawSettings.theme === 'light' || rawSettings.theme === 'dark'
        ? rawSettings.theme
        : fallbackSettings.theme,
    incomeCategories: Array.isArray(rawSettings.incomeCategories)
      ? rawSettings.incomeCategories.filter(
          (c): c is string => typeof c === 'string' && Boolean(c.trim())
        )
      : fallbackSettings.incomeCategories,
    expenseCategories: Array.isArray(rawSettings.expenseCategories)
      ? rawSettings.expenseCategories.filter(
          (c): c is string => typeof c === 'string' && Boolean(c.trim())
        )
      : fallbackSettings.expenseCategories,
    accounts: Array.isArray(rawSettings.accounts)
      ? rawSettings.accounts.filter((a): a is string => typeof a === 'string' && Boolean(a.trim()))
      : fallbackSettings.accounts,
  };

  const rawProfile =
    obj.profile && typeof obj.profile === 'object'
      ? (obj.profile as Record<string, unknown>)
      : null;

  const validatedProfile = rawProfile
    ? {
        name: typeof rawProfile.name === 'string' ? rawProfile.name : '',
        email: typeof rawProfile.email === 'string' ? rawProfile.email : '',
        avatarUrl: typeof rawProfile.avatarUrl === 'string' ? rawProfile.avatarUrl : '',
      }
    : undefined;

  return {
    valid: true,
    bundle: {
      version: 3,
      app: 'Hisaap',
      exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(),
      settings: mergedSettings,
      transactions: validatedTransactions,
      loans: validatedLoans,
      profile: validatedProfile,
    },
  };
}
