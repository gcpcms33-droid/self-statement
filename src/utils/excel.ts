import * as XLSX from 'xlsx';
import type {
  AccountSummary,
  ComputedLoan,
  ComputedTransaction,
  ExportBundle,
  FinanceSettings,
  Loan,
  LoanDirection,
  Transaction,
  TransactionType,
} from '../types/finance';
import { generateId, getTodayISO } from './finance';

export interface ExcelExportInput {
  ledger: ComputedTransaction[];
  loans: ComputedLoan[];
  accountSummaries: AccountSummary[];
  settings: FinanceSettings;
}

export function exportLedgerToExcel({
  ledger,
  loans,
  accountSummaries,
  settings,
}: ExcelExportInput): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Transactions
  const txRows =
    ledger.length > 0
      ? ledger.map((tx, idx) => ({
          '#': idx + 1,
          Date: tx.date,
          Type: tx.type === 'income' ? 'Income' : 'Expense',
          Category: tx.category,
          Description: tx.description,
          Account: tx.account,
          'Amount (INR)': tx.amount,
          'Running Balance (INR)': tx.runningBalance,
          Notes: tx.notes || '',
          'Loan ID': tx.loanId || '',
          'Loan Action': tx.loanAction || '',
          ID: tx.id,
          'Created At': tx.createdAt,
        }))
      : [
          {
            '#': '',
            Date: getTodayISO(),
            Type: 'Expense',
            Category: 'Groceries',
            Description: 'Sample entry (replace or delete before importing)',
            Account: settings.cashAccountName || 'Cash',
            'Amount (INR)': 0,
            'Running Balance (INR)': settings.openingBalance || 0,
            Notes: '',
            'Loan ID': '',
            'Loan Action': '',
            ID: '',
            'Created At': '',
          },
        ];

  const txSheet = XLSX.utils.json_to_sheet(txRows);
  txSheet['!cols'] = [
    { wch: 6 },
    { wch: 13 },
    { wch: 10 },
    { wch: 22 },
    { wch: 34 },
    { wch: 16 },
    { wch: 15 },
    { wch: 20 },
    { wch: 26 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, txSheet, 'Transactions');

  // Sheet 2: Loans
  const loanRows =
    loans.length > 0
      ? loans.map((loan) => ({
          Title: loan.title,
          Counterparty: loan.counterparty,
          Direction: loan.direction === 'borrowed' ? 'Loan Taken' : 'Loan Given',
          'Principal (INR)': loan.principalAmount,
          'Initial Repaid (INR)': loan.initialRepaidAmount,
          'Linked Repaid (INR)': loan.linkedRepaidAmount,
          'Remaining Balance (INR)': loan.remainingBalance,
          'Interest Rate (%)': loan.interestRate,
          'Start Date': loan.startDate,
          'Due Date': loan.dueDate || '',
          Status: loan.status === 'settled' ? 'Settled' : 'Active',
          Notes: loan.notes || '',
          ID: loan.id,
        }))
      : [
          {
            Title: '',
            Counterparty: '',
            Direction: 'Loan Taken',
            'Principal (INR)': 0,
            'Initial Repaid (INR)': 0,
            'Linked Repaid (INR)': 0,
            'Remaining Balance (INR)': 0,
            'Interest Rate (%)': 0,
            'Start Date': '',
            'Due Date': '',
            Status: '',
            Notes: '',
            ID: '',
          },
        ];

  const loanSheet = XLSX.utils.json_to_sheet(loanRows);
  loanSheet['!cols'] = [
    { wch: 24 },
    { wch: 22 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 16 },
    { wch: 13 },
    { wch: 13 },
    { wch: 10 },
    { wch: 26 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, loanSheet, 'Loans');

  // Sheet 3: Account Summary
  const summaryRows = accountSummaries.map((acc) => ({
    Account: acc.name,
    'Opening Balance (INR)': acc.openingBalance,
    'Total Income (INR)': acc.totalIncome,
    'Total Expense (INR)': acc.totalExpense,
    'Current Balance (INR)': acc.currentBalance,
  }));
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = [
    { wch: 20 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Account Summary');

  XLSX.writeFile(wb, `hisaap-ledger-${getTodayISO()}.xlsx`);
}

function normalizeHeaderKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, ' ')
    .trim();
}

function getFieldValue(
  row: Record<string, unknown>,
  aliases: string[]
): unknown {
  const entries = Object.entries(row);
  for (const alias of aliases) {
    const target = normalizeHeaderKey(alias);
    for (const [k, v] of entries) {
      if (normalizeHeaderKey(k) === target) {
        return v;
      }
    }
  }
  return undefined;
}

function parseExcelDate(val: unknown): string | null {
  if (typeof val === 'number' && Number.isFinite(val) && val > 1000) {
    const parsed = XLSX.SSF.parse_date_code(val);
    if (parsed && parsed.y && parsed.m && parsed.d) {
      const y = String(parsed.y).padStart(4, '0');
      const m = String(parsed.m).padStart(2, '0');
      const d = String(parsed.d).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val === 'string') {
    const s = val.trim();
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const isoPrefix = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoPrefix) {
      return `${isoPrefix[1]}-${isoPrefix[2].padStart(2, '0')}-${isoPrefix[3].padStart(2, '0')}`;
    }
    const dmy = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmy) {
      const day = Number(dmy[1]);
      const month = Number(dmy[2]);
      const year = Number(dmy[3]);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
    const parsedTime = Date.parse(s);
    if (!isNaN(parsedTime)) {
      const dt = new Date(parsedTime);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    }
  }
  return null;
}

function parseExcelAmount(val: unknown): number {
  if (typeof val === 'number') return Number.isFinite(val) ? val : NaN;
  if (typeof val === 'string') {
    const cleaned = val
      .replace(/[₹,\s]/g, '')
      .replace(/^(INR|Rs\.?)/i, '')
      .trim();
    if (!cleaned) return NaN;
    return Number(cleaned);
  }
  return NaN;
}

function parseTxType(val: unknown): TransactionType | null {
  if (typeof val !== 'string') return null;
  const s = val.trim().toLowerCase();
  if (
    s === 'income' ||
    s === 'credit' ||
    s === 'cr' ||
    s === '+' ||
    s === 'আয়' ||
    s === 'আয়'
  ) {
    return 'income';
  }
  if (
    s === 'expense' ||
    s === 'debit' ||
    s === 'dr' ||
    s === '-' ||
    s === '−' ||
    s === 'খৰচ'
  ) {
    return 'expense';
  }
  return null;
}

function parseLoanDirection(val: unknown): LoanDirection | null {
  if (typeof val !== 'string') return null;
  const s = val.trim().toLowerCase();
  if (
    s === 'borrowed' ||
    s === 'taken' ||
    s === 'loan taken' ||
    s === 'payable' ||
    s === 'ধাৰ লোৱা'
  ) {
    return 'borrowed';
  }
  if (
    s === 'lent' ||
    s === 'given' ||
    s === 'loan given' ||
    s === 'receivable' ||
    s === 'ধাৰ দিয়া'
  ) {
    return 'lent';
  }
  return null;
}

function isRowEmpty(row: Record<string, unknown>): boolean {
  return Object.values(row).every(
    (v) => v === undefined || v === null || String(v).trim() === ''
  );
}

export function parseExcelWorkbook(
  buffer: ArrayBuffer,
  fallbackSettings: FinanceSettings
): { valid: true; bundle: ExportBundle } | { valid: false; error: string } {
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(buffer, { type: 'array' });
  } catch {
    return {
      valid: false,
      error: 'Unable to read Excel file. Please choose a valid .xlsx, .xls, or .csv workbook.',
    };
  }

  if (!wb.SheetNames.length) {
    return { valid: false, error: 'The Excel workbook contains no sheets.' };
  }

  const txSheetName =
    wb.SheetNames.find((name) => normalizeHeaderKey(name).includes('transaction')) ||
    wb.SheetNames[0];
  const txSheet = wb.Sheets[txSheetName];
  const rawTxRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(txSheet, {
    defval: '',
  });

  const transactions: Transaction[] = [];
  for (let i = 0; i < rawTxRows.length; i++) {
    const row = rawTxRows[i];
    if (isRowEmpty(row)) continue;

    const rawDesc = getFieldValue(row, ['Description', 'Desc', 'Particulars', 'বিৱৰণ']);
    const description = typeof rawDesc === 'string' ? rawDesc.trim() : String(rawDesc ?? '').trim();
    const rawAmount = getFieldValue(row, ['Amount', 'Amount INR', 'পৰিমাণ']);
    const amount = parseExcelAmount(rawAmount);

    // Skip blank sample template rows generated on empty export
    if (
      amount === 0 &&
      description.toLowerCase().startsWith('sample entry')
    ) {
      continue;
    }

    const parsedDate = parseExcelDate(getFieldValue(row, ['Date', 'তারিখ', 'তাৰিখ']));
    const parsedType = parseTxType(getFieldValue(row, ['Type', 'ধৰণ']));

    if (!parsedDate) {
      return {
        valid: false,
        error: `Row ${i + 2} in "${txSheetName}" has an invalid or missing Date (expected YYYY-MM-DD or DD/MM/YYYY).`,
      };
    }
    if (!parsedType) {
      return {
        valid: false,
        error: `Row ${i + 2} in "${txSheetName}" has an invalid Type (expected Income or Expense).`,
      };
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return {
        valid: false,
        error: `Row ${i + 2} in "${txSheetName}" must have a positive Amount.`,
      };
    }
    if (!description) {
      return {
        valid: false,
        error: `Row ${i + 2} in "${txSheetName}" is missing a Description.`,
      };
    }

    const rawCategory = getFieldValue(row, ['Category', 'শ্ৰেণী']);
    const category =
      typeof rawCategory === 'string' && rawCategory.trim()
        ? rawCategory.trim()
        : 'General';

    const rawAccount = getFieldValue(row, ['Account', 'Payment Account', 'একাউণ্ট']);
    const account =
      typeof rawAccount === 'string' && rawAccount.trim()
        ? rawAccount.trim()
        : fallbackSettings.cashAccountName || 'Cash';

    const rawNotes = getFieldValue(row, ['Notes', 'Reference', 'টোকা']);
    const notes =
      typeof rawNotes === 'string' && rawNotes.trim() ? rawNotes.trim() : undefined;

    const rawLoanId = getFieldValue(row, ['Loan ID']);
    const loanId =
      typeof rawLoanId === 'string' && rawLoanId.trim() ? rawLoanId.trim() : undefined;

    const rawLoanAction = getFieldValue(row, ['Loan Action']);
    const loanAction =
      rawLoanAction === 'disbursement' || rawLoanAction === 'repayment'
        ? rawLoanAction
        : undefined;

    const rawId = getFieldValue(row, ['ID']);
    const id = typeof rawId === 'string' && rawId.trim() ? rawId.trim() : generateId('tx');

    const rawCreatedAt = getFieldValue(row, ['Created At']);
    const createdAt =
      typeof rawCreatedAt === 'string' && rawCreatedAt.trim()
        ? rawCreatedAt.trim()
        : new Date().toISOString();

    transactions.push({
      id,
      date: parsedDate,
      type: parsedType,
      category,
      description,
      amount: Math.round(amount * 100) / 100,
      account,
      notes,
      loanId,
      loanAction,
      createdAt,
    });
  }

  // Optional Loans sheet
  const loans: Loan[] = [];
  const loanSheetName = wb.SheetNames.find((name) =>
    normalizeHeaderKey(name).includes('loan')
  );
  if (loanSheetName) {
    const rawLoanRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      wb.Sheets[loanSheetName],
      { defval: '' }
    );
    for (let i = 0; i < rawLoanRows.length; i++) {
      const row = rawLoanRows[i];
      if (isRowEmpty(row)) continue;

      const rawTitle = getFieldValue(row, ['Title', 'Loan Title', 'শিৰোনাম']);
      const title = typeof rawTitle === 'string' ? rawTitle.trim() : String(rawTitle ?? '').trim();
      const rawPrincipal = getFieldValue(row, ['Principal', 'Principal INR', 'মূলধন']);
      const principal = parseExcelAmount(rawPrincipal);

      // Skip blank placeholder row
      if (!title && (!Number.isFinite(principal) || principal === 0)) {
        continue;
      }

      const direction = parseLoanDirection(getFieldValue(row, ['Direction', 'ধৰণ']));
      if (!direction || !Number.isFinite(principal) || principal <= 0) {
        return {
          valid: false,
          error: `Row ${i + 2} in "${loanSheetName}" has an invalid Direction or Principal amount.`,
        };
      }

      const rawCounterparty = getFieldValue(row, ['Counterparty', 'বিপৰীত পক্ষ']);
      const counterparty =
        typeof rawCounterparty === 'string' && rawCounterparty.trim()
          ? rawCounterparty.trim()
          : 'Unknown';

      const initialRepaid = Math.max(
        0,
        parseExcelAmount(getFieldValue(row, ['Initial Repaid', 'Prior Paid'])) || 0
      );
      const interestRate = Math.max(
        0,
        parseExcelAmount(getFieldValue(row, ['Interest Rate', 'Interest'])) || 0
      );
      const startDate =
        parseExcelDate(getFieldValue(row, ['Start Date'])) || getTodayISO();
      const dueDate = parseExcelDate(getFieldValue(row, ['Due Date'])) || '';
      const rawNotes = getFieldValue(row, ['Notes', 'টোকা']);
      const notes =
        typeof rawNotes === 'string' && rawNotes.trim() ? rawNotes.trim() : undefined;
      const rawId = getFieldValue(row, ['ID']);
      const id = typeof rawId === 'string' && rawId.trim() ? rawId.trim() : generateId('loan');

      loans.push({
        id,
        title: title || 'Untitled Loan',
        counterparty,
        direction,
        principalAmount: Math.round(principal * 100) / 100,
        initialRepaidAmount: Math.round(initialRepaid * 100) / 100,
        interestRate,
        startDate,
        dueDate,
        notes,
        createdAt: new Date().toISOString(),
      });
    }
  }

  if (transactions.length === 0 && loans.length === 0) {
    return {
      valid: false,
      error: 'No valid transactions or loans were found in the Excel file.',
    };
  }

  return {
    valid: true,
    bundle: {
      version: 3,
      app: 'Hisaap',
      exportedAt: new Date().toISOString(),
      settings: fallbackSettings,
      transactions,
      loans,
    },
  };
}
