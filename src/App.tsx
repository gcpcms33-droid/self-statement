import { useCallback, useState } from 'react';
import { Layout } from './components/Layout';
import { LoanModal, RepaymentModal } from './components/LoanModal';
import { QuickCalculator } from './components/QuickCalculator';
import { SplashScreen } from './components/SplashScreen';
import { TransactionModal } from './components/TransactionModal';
import { useFinanceStore } from './hooks/useFinanceStore';
import { useProfile } from './hooks/useProfile';
import { Dashboard } from './pages/Dashboard';
import { LoanSummary } from './pages/LoanSummary';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Transactions } from './pages/Transactions';
import type { ComputedLoan, Loan, PageId, Transaction } from './types/finance';
import { formatCurrency } from './utils/finance';

export default function App() {
  const {
    profile,
    updateProfile,
    storageError: profileStorageError,
    clearStorageError: clearProfileStorageError,
  } = useProfile();

  const {
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
  } = useFinanceStore();

  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  // Transaction modal state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Loan modal state
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [repayingLoan, setRepayingLoan] = useState<ComputedLoan | null>(null);

  // Quick Calculator state & auto-fill handoff
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [txPrefillAmount, setTxPrefillAmount] = useState<{
    amount: number;
    nonce: number;
  } | null>(null);
  const [loanPrefillAmount, setLoanPrefillAmount] = useState<{
    amount: number;
    nonce: number;
  } | null>(null);
  const [repayPrefillAmount, setRepayPrefillAmount] = useState<{
    amount: number;
    nonce: number;
  } | null>(null);

  const currentBalance =
    computedLedger.length > 0
      ? computedLedger[computedLedger.length - 1].runningBalance
      : settings.openingBalance;

  const openNewTransaction = () => {
    setEditingTx(null);
    setTxPrefillAmount(null);
    setTxModalOpen(true);
  };

  const openEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setTxPrefillAmount(null);
    setTxModalOpen(true);
  };

  const handleUseCalculatorResult = useCallback(
    (amount: number) => {
      const payload = { amount, nonce: Date.now() };
      if (txModalOpen) {
        setTxPrefillAmount(payload);
      } else if (repayingLoan) {
        setRepayPrefillAmount(payload);
      } else if (loanModalOpen) {
        setLoanPrefillAmount(payload);
      } else {
        setEditingTx(null);
        setTxPrefillAmount(payload);
        setTxModalOpen(true);
      }
      setCalculatorOpen(false);
    },
    [txModalOpen, repayingLoan, loanModalOpen]
  );

  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      updateTransaction(existingId, data);
    } else {
      addTransaction(data);
    }
  };

  const openNewLoan = () => {
    setEditingLoan(null);
    setLoanModalOpen(true);
  };

  const openEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setLoanModalOpen(true);
  };

  const handleSaveLoan = (
    data: Omit<Loan, 'id' | 'createdAt'>,
    existingId?: string,
    postDisbursement?: boolean,
    disbursementAccount?: string
  ) => {
    if (existingId) {
      updateLoan(existingId, data);
    } else {
      addLoan(data, postDisbursement, disbursementAccount);
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Layout
      activePage={activePage}
      onNavigate={setActivePage}
      onOpenNewTransaction={openNewTransaction}
      calculatorOpen={calculatorOpen}
      onToggleCalculator={() => setCalculatorOpen((prev) => !prev)}
      profile={profile}
      ownerName={settings.ownerName}
      currentBalanceFormatted={formatCurrency(
        currentBalance,
        settings.currency,
        settings.locale
      )}
    >
      {activePage === 'dashboard' && (
        <Dashboard
          ledger={computedLedger}
          loans={computedLoans}
          accountSummaries={accountSummaries}
          settings={settings}
          onUpdateSettings={updateSettings}
          onNavigate={setActivePage}
          onOpenNewTransaction={openNewTransaction}
        />
      )}

      {activePage === 'transactions' && (
        <Transactions
          ledger={computedLedger}
          settings={settings}
          onAddNew={openNewTransaction}
          onEdit={openEditTransaction}
          onDuplicate={duplicateTransaction}
          onDelete={deleteTransaction}
        />
      )}

      {activePage === 'loans' && (
        <LoanSummary
          loans={computedLoans}
          settings={settings}
          onAddLoan={openNewLoan}
          onEditLoan={openEditLoan}
          onDeleteLoan={deleteLoan}
          onRecordPayment={(loan) => setRepayingLoan(loan)}
        />
      )}

      {activePage === 'reports' && (
        <Reports ledger={computedLedger} settings={settings} />
      )}

      {activePage === 'settings' && (
        <Settings
          profile={profile}
          profileStorageError={profileStorageError}
          onUpdateProfile={updateProfile}
          onClearProfileError={clearProfileStorageError}
          settings={settings}
          computedLedger={computedLedger}
          computedLoans={computedLoans}
          accountSummaries={accountSummaries}
          transactionCount={transactions.length}
          loanCount={loans.length}
          onUpdateSettings={updateSettings}
          onBuildExportBundle={buildExportBundle}
          onImportBundle={importBundle}
          onClearAllData={clearAllData}
        />
      )}

      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => {
          setTxModalOpen(false);
          setEditingTx(null);
          setTxPrefillAmount(null);
        }}
        editingTransaction={editingTx}
        prefilledAmount={txPrefillAmount}
        onOpenCalculator={() => setCalculatorOpen(true)}
        settings={settings}
        loans={computedLoans}
        onSave={handleSaveTransaction}
      />

      <LoanModal
        isOpen={loanModalOpen}
        onClose={() => {
          setLoanModalOpen(false);
          setEditingLoan(null);
          setLoanPrefillAmount(null);
        }}
        editingLoan={editingLoan}
        prefilledAmount={loanPrefillAmount}
        settings={settings}
        onSave={handleSaveLoan}
      />

      <RepaymentModal
        loan={repayingLoan}
        onClose={() => {
          setRepayingLoan(null);
          setRepayPrefillAmount(null);
        }}
        prefilledAmount={repayPrefillAmount}
        settings={settings}
        onRecord={recordLoanRepayment}
      />
    </Layout>
    <QuickCalculator
      isOpen={calculatorOpen}
      onClose={() => setCalculatorOpen(false)}
      onUseResult={handleUseCalculatorResult}
    />
    </>
  );
}
