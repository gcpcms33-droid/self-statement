export type PageId = 'dashboard' | 'transactions' | 'loans' | 'reports' | 'settings';

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
}

export type TransactionType = 'income' | 'expense';

export type LoanDirection = 'borrowed' | 'lent';

export type LoanAction = 'disbursement' | 'repayment';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string;
  description: string;
  amount: number; // positive number in INR
  account: string;
  notes?: string;
  loanId?: string;
  loanAction?: LoanAction;
  createdAt: string; // ISO timestamp for deterministic same-date ordering
}

export interface ComputedTransaction extends Transaction {
  runningBalance: number;
  chronologicalIndex: number; // 1-based index in chronological ledger
}

export interface Loan {
  id: string;
  title: string;
  counterparty: string;
  direction: LoanDirection;
  principalAmount: number;
  initialRepaidAmount: number;
  interestRate: number; // annual % p.a.
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export interface ComputedLoan extends Loan {
  linkedRepaidAmount: number;
  totalRepaid: number;
  remainingBalance: number;
  progressPercent: number;
  status: 'active' | 'settled';
  isOverdue: boolean;
  linkedTransactions: Transaction[];
}

export type ThemeMode = 'light' | 'dark';

export interface AccountSetup {
  cashAccountName: string;
  cashAccountBalance: number;
  bankAccountName: string;
  bankAccountBalance: number;
  upiAccountName: string;
  upiAccountBalance: number;
  creditCardAccountName: string;
  creditCardAccountBalance: number;
}

export interface AccountSummary {
  key: 'cash' | 'bank' | 'upi' | 'credit_card';
  name: string;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
}

export interface FinanceSettings extends AccountSetup {
  ownerName: string;
  currency: 'INR';
  locale: 'en-IN';
  openingBalance: number;
  theme: ThemeMode;
  incomeCategories: string[];
  expenseCategories: string[];
  accounts: string[];
}

export interface ExportBundle {
  version: number;
  app: string;
  exportedAt: string;
  settings: FinanceSettings;
  transactions: Transaction[];
  loans: Loan[];
  profile?: UserProfile;
}
