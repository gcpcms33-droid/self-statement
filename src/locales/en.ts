export interface TranslationKeys {
  common: {
    appName: string;
    brandTitle: string;
    tagline: string;
    workspace: string;
    addTransaction: string;
    addShort: string;
    income: string;
    expense: string;
    net: string;
    date: string;
    description: string;
    category: string;
    account: string;
    amount: string;
    runningBalance: string;
    actions: string;
    notes: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    duplicate: string;
    close: string;
    saved: string;
    all: string;
    previous: string;
    next: string;
    rows: string;
    share: string;
    total: string;
    none: string;
    personalAccount: string;
    englishLabel: string;
    assameseLabel: string;
    languageSwitchAria: string;
  };
  nav: {
    dashboard: string;
    transactions: string;
    loans: string;
    reports: string;
    settings: string;
    netLedgerBalance: string;
    openMenu: string;
    closeMenu: string;
    openProfileMenu: string;
    profile: string;
    editProfile: string;
    calculator: string;
  };
  dashboard: {
    currentBalance: string;
    totalIncome: string;
    totalExpense: string;
    netLoanPosition: string;
    openingBalanceLabel: string;
    openingLabel: string;
    entriesCount: string;
    creditEntriesCount: string;
    debitEntriesCount: string;
    savedPercent: string;
    payableLabel: string;
    activeCount: string;
    activeLoansCount: string;
    setupTitle: string;
    setupSubtitle: string;
    openingBalanceInput: string;
    openingBalanceHint: string;
    cashDefaultLabel: string;
    bankLabel: string;
    upiLabel: string;
    creditCardLabel: string;
    savedOpeningBalance: string;
    setupSaved: string;
    saveSetup: string;
    emptyCardTitle: string;
    emptyCardDesc: string;
    logFirstTransaction: string;
    importJsonBackup: string;
    openShort: string;
    incomeVsExpensesTitle: string;
    incomeVsExpensesSubtitle: string;
    runningBalanceTrendTitle: string;
    runningBalanceTrendSubtitle: string;
    recentEntriesTitle: string;
    recentEntriesSubtitle: string;
    fullPassbook: string;
    expenseAllocationTitle: string;
    expenseAllocationSubtitle: string;
    reportsLink: string;
    noExpensesRecorded: string;
    activeLoansTracked: string;
    viewSummarySuffix: string;
  };
  transactions: {
    title: string;
    subtitle: string;
    filteredCredits: string;
    filteredDebits: string;
    filteredNet: string;
    exportCsv: string;
    searchPlaceholder: string;
    allCategories: string;
    allMonths: string;
    newestFirst: string;
    oldestFirst: string;
    noTransactionsYet: string;
    noMatchingTransactions: string;
    emptyHint: string;
    filterEmptyHint: string;
    clearFilters: string;
    loanLinkedEntry: string;
    editTitle: string;
    duplicateTitle: string;
    deleteTitle: string;
    showingCount: string;
    perPage: string;
    showAll: string;
    pageLabel: string;
    rowsPerPageAria: string;
  };
  loans: {
    loanGiven: string;
    loanTaken: string;
    availedPayableCard: string;
    givenReceivableCard: string;
    totalPrincipal: string;
    netLoanPosition: string;
    receivablesMinusPayables: string;
    trackedAgreements: string;
    activeSettledSummary: string;
    allLoans: string;
    loanTakenFilter: string;
    loanGivenFilter: string;
    settled: string;
    active: string;
    overdue: string;
    addLoan: string;
    repaymentChartTitle: string;
    repaymentChartSubtitle: string;
    repaid: string;
    remaining: string;
    noLoansYet: string;
    noMatchingLoans: string;
    emptyHint: string;
    startedLabel: string;
    dueLabel: string;
    interestPerAnnum: string;
    principal: string;
    recordPayment: string;
    historyCount: string;
    linkedEntriesTitle: string;
    noLinkedEntries: string;
    roleCol: string;
    roleRepayment: string;
    roleDisbursement: string;
  };
  reports: {
    monthlyReport: string;
    yearlyReport: string;
    selectMonth: string;
    selectYear: string;
    exportReportJson: string;
    yearPrefix: string;
    periodIncome: string;
    periodExpenses: string;
    netCashflow: string;
    savingsRateVolume: string;
    transactionsRecorded: string;
    dailyCashflowTitle: string;
    yearlyCashflowTitle: string;
    dailyCashflowSubtitle: string;
    yearlyCashflowSubtitle: string;
    dayLabel: string;
    netMonthlyCashflowTitle: string;
    netMonthlyCashflowSubtitle: string;
    spendingShareTitle: string;
    spendingShareSubtitle: string;
    noExpensesInPeriod: string;
    yearlySummaryTitle: string;
    monthCol: string;
    transactionsCol: string;
    incomeCol: string;
    expensesCol: string;
    netCashflowCol: string;
    expenseBreakdownTitle: string;
    incomeBreakdownTitle: string;
    noExpenseEntriesPeriod: string;
    noIncomeEntriesPeriod: string;
  };
  settings: {
    editProfileTitle: string;
    editProfileSubtitle: string;
    changePhoto: string;
    uploadPhoto: string;
    removePhoto: string;
    photoHint: string;
    fullName: string;
    fullNamePlaceholder: string;
    emailAddress: string;
    emailPlaceholder: string;
    languagePreferenceLabel: string;
    languagePreferenceHint: string;
    themePreferenceLabel: string;
    themePreferenceHint: string;
    autoSaved: string;
    errProfileFailed: string;
    errInvalidImageType: string;
    errImageTooLarge: string;
    errStorageQuota: string;
    accountSetupTitle: string;
    accountSetupSubtitle: string;
    themeLight: string;
    themeDark: string;
    accountHolderLabel: string;
    accountHolderPlaceholder: string;
    currencyLocale: string;
    openingBalanceLabel: string;
    cashAccountHeader: string;
    bankAccountHeader: string;
    upiAccountHeader: string;
    creditCardAccountHeader: string;
    openingAmountPlaceholder: string;
    currentOpeningBalance: string;
    saveSetup: string;
    exportImportTitle: string;
    exportImportSubtitle: string;
    exportFullBackup: string;
    exportDescription: string;
    exportJsonBackup: string;
    importFromJson: string;
    importDescription: string;
    chooseJsonFile: string;
    exportExcelTitle: string;
    exportExcelDescription: string;
    exportExcelButton: string;
    importExcelTitle: string;
    importExcelDescription: string;
    importExcelButton: string;
    excelExportSuccess: string;
    jsonExportSuccess: string;
    excelParseError: string;
    jsonParseError: string;
    readyToImport: string;
    validatedBackupSummary: string;
    validatedExcelSummary: string;
    replaceExistingData: string;
    mergeWithExisting: string;
    importSuccessSummary: string;
    replacedMode: string;
    mergedMode: string;
    categoriesAccountsTitle: string;
    categoriesAccountsSubtitle: string;
    expenseCategories: string;
    incomeCategories: string;
    paymentAccounts: string;
    addCategoryPlaceholder: string;
    addAccountPlaceholder: string;
    clearDataTitle: string;
    clearDataSubtitle: string;
    confirmClearQuestion: string;
    confirmClearButton: string;
    clearAllDataButton: string;
    brandIdentityTitle: string;
    brandIdentitySubtitle: string;
    appIconVersionLabel: string;
    sidebarVersionLabel: string;
    splashVersionLabel: string;
    faviconVersionLabel: string;
    lightLogoLabel: string;
    darkLogoLabel: string;
    downloadLightSvg: string;
    downloadDarkSvg: string;
  };
  modals: {
    editTransaction: string;
    newTransaction: string;
    transactionSubtitle: string;
    transactionType: string;
    expenseButton: string;
    incomeButton: string;
    dateSameAllowed: string;
    amountInr: string;
    descriptionPlaceholder: string;
    linkToLoanOptional: string;
    loanEntryRole: string;
    roleRepaymentOption: string;
    roleDisbursementOption: string;
    notesReferenceOptional: string;
    notesReferencePlaceholder: string;
    saveAndAddAnother: string;
    updateTransaction: string;
    saveTransaction: string;
    errInvalidDate: string;
    errPositiveAmount: string;
    errMissingDescription: string;
    savedReadyNext: string;
    editLoanRecord: string;
    addLoanRecord: string;
    loanDirection: string;
    loanTakenOption: string;
    loanGivenOption: string;
    loanTitle: string;
    loanTitlePlaceholder: string;
    counterparty: string;
    counterpartyPlaceholder: string;
    principalInr: string;
    priorPaid: string;
    interestPercent: string;
    startDate: string;
    targetDueDateOptional: string;
    alsoRecordPrincipal: string;
    ledgerAccount: string;
    notesOptional: string;
    loanNotesPlaceholder: string;
    updateLoan: string;
    saveLoan: string;
    errLoanTitleCounterparty: string;
    errPositivePrincipal: string;
    errNegativePriorPaid: string;
    recordLoanPayment: string;
    remainingPrincipal: string;
    paymentDate: string;
    repayNotesPlaceholder: string;
    repayLedgerNoteBorrowed: string;
    repayLedgerNoteLent: string;
    postPayment: string;
    errPositivePayment: string;
  };
  calculator: {
    title: string;
    subtitle: string;
    useResult: string;
    backspace: string;
    divideByZero: string;
    positiveAmountHint: string;
    openCalculator: string;
  };
  accounts: Record<string, string>;
  categories: Record<string, string>;
}

export const en: TranslationKeys = {
  common: {
    appName: 'হিচাপ (Hisaap)',
    brandTitle: 'হিচাপ (Hisaap)',
    tagline: 'Smart Money. Simple Hisaap.',
    workspace: 'Workspace',
    addTransaction: 'Add Transaction',
    addShort: 'Add',
    income: 'Income',
    expense: 'Expense',
    net: 'Net',
    date: 'Date',
    description: 'Description',
    category: 'Category',
    account: 'Account',
    amount: 'Amount',
    runningBalance: 'Running Balance',
    actions: 'Actions',
    notes: 'Notes',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    duplicate: 'Duplicate',
    close: 'Close',
    saved: 'Saved',
    all: 'All',
    previous: 'Previous',
    next: 'Next',
    rows: 'Rows',
    share: 'Share',
    total: 'Total',
    none: 'None',
    personalAccount: 'Personal Account',
    englishLabel: 'English',
    assameseLabel: 'অসমীয়া',
    languageSwitchAria: 'Switch application language',
  },
  nav: {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    loans: 'Loan Summary',
    reports: 'Reports',
    settings: 'Settings',
    netLedgerBalance: 'Net Ledger Balance',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    openProfileMenu: 'Open profile menu',
    profile: 'Profile',
    editProfile: 'Profile & Settings',
    calculator: 'Quick Calculator',
  },
  dashboard: {
    currentBalance: 'Current Balance',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expense',
    netLoanPosition: 'Net Loan Position',
    openingBalanceLabel: 'Opening balance · 0 passbook entries',
    openingLabel: 'Opening',
    entriesCount: '{count} entries',
    creditEntriesCount: '{count} credit entries',
    debitEntriesCount: '{count} debits',
    savedPercent: '{percent}% saved',
    payableLabel: 'Payable',
    activeCount: '{count} active',
    activeLoansCount: '{count} active loans',
    setupTitle: 'Indian Finance Account Setup',
    setupSubtitle:
      'Configure your Opening Balance and starting balances for Cash (default), Bank, UPI, and Credit Card in INR (₹).',
    openingBalanceInput: 'Opening Balance (₹ INR)',
    openingBalanceHint:
      'Auto-updates when you enter Cash, Bank, UPI, or Credit Card balances below, or enter a combined opening balance directly.',
    cashDefaultLabel: 'Cash (Default) · ₹',
    bankLabel: 'Bank · ₹',
    upiLabel: 'UPI · ₹',
    creditCardLabel: 'Credit Card · ₹',
    savedOpeningBalance: 'Saved opening balance:',
    setupSaved: 'Setup Saved',
    saveSetup: 'Save Setup',
    emptyCardTitle: 'Start Recording Your Passbook',
    emptyCardDesc:
      'Your ledger starts clean with zero sample transactions. Log transactions across Cash, Bank, UPI, or Credit Card with chronological running balances in INR (₹).',
    logFirstTransaction: 'Log First Transaction',
    importJsonBackup: 'Import JSON Backup',
    openShort: 'Open',
    incomeVsExpensesTitle: 'Income vs Expenses (INR)',
    incomeVsExpensesSubtitle: 'Monthly cash inflow against outflow across recent periods',
    runningBalanceTrendTitle: 'Running Balance Trend',
    runningBalanceTrendSubtitle: 'End-of-month passbook balance progression in ₹',
    recentEntriesTitle: 'Recent Passbook Entries',
    recentEntriesSubtitle: 'One transaction per row with chronological running balance',
    fullPassbook: 'Full Passbook',
    expenseAllocationTitle: 'Expense Allocation',
    expenseAllocationSubtitle: 'Top categories across all recorded debits',
    reportsLink: 'Reports',
    noExpensesRecorded: 'No expense entries recorded yet.',
    activeLoansTracked: 'Active Loans Tracked',
    viewSummarySuffix: '{count} active · View Summary',
  },
  transactions: {
    title: 'Passbook & Transaction Ledger',
    subtitle:
      'One transaction per row · Multiple entries allowed on any date · Chronological running balance (₹)',
    filteredCredits: 'Filtered Credits',
    filteredDebits: 'Filtered Debits',
    filteredNet: 'Filtered Net',
    exportCsv: 'Export CSV',
    searchPlaceholder: 'Search description, category, account, or notes...',
    allCategories: 'All Categories',
    allMonths: 'All Months',
    newestFirst: 'Newest First',
    oldestFirst: 'Oldest First',
    noTransactionsYet: 'No transactions recorded yet',
    noMatchingTransactions: 'No transactions match your current filters',
    emptyHint: 'Add your first transaction to begin building your chronological ledger.',
    filterEmptyHint: 'Adjust your search query, type filter, or selected month.',
    clearFilters: 'Clear Filters',
    loanLinkedEntry: 'Loan-linked entry',
    editTitle: 'Edit transaction',
    duplicateTitle: 'Duplicate row (same date allowed)',
    deleteTitle: 'Delete transaction',
    showingCount: 'Showing {visible} of {total} transactions',
    perPage: '{count} / page',
    showAll: 'Show All ({total})',
    pageLabel: 'Page {page} / {total}',
    rowsPerPageAria: 'Rows per page',
  },
  loans: {
    loanGiven: 'Loan Given',
    loanTaken: 'Loan Taken',
    availedPayableCard: 'Loan Taken Remaining (Payable)',
    givenReceivableCard: 'Loan Given Remaining (Receivable)',
    totalPrincipal: 'Total principal',
    netLoanPosition: 'Net Loan Position',
    receivablesMinusPayables: 'Receivables minus payables',
    trackedAgreements: 'Tracked Agreements',
    activeSettledSummary: '{active} active · {settled} settled',
    allLoans: 'All Loans',
    loanTakenFilter: 'Loan Taken (Payable)',
    loanGivenFilter: 'Loan Given (Receivable)',
    settled: 'Settled',
    active: 'Active',
    overdue: 'Overdue',
    addLoan: 'Add Loan',
    repaymentChartTitle: 'Repayment Progress by Loan',
    repaymentChartSubtitle: 'Repaid principal vs remaining balance across tracked loan records',
    repaid: 'Repaid',
    remaining: 'Remaining',
    noLoansYet: 'No loans tracked yet',
    noMatchingLoans: 'No loans match this filter',
    emptyHint:
      'Add borrowed obligations or money lent out to monitor repayment progress and link installments directly to your transaction ledger.',
    startedLabel: 'Started',
    dueLabel: 'Due',
    interestPerAnnum: '{rate}% p.a.',
    principal: 'Principal',
    recordPayment: 'Record Payment',
    historyCount: 'History ({count})',
    linkedEntriesTitle: 'Linked Ledger Entries',
    noLinkedEntries:
      'No ledger entries linked yet. Use "Record Payment" to post an installment.',
    roleCol: 'Role',
    roleRepayment: 'Repayment',
    roleDisbursement: 'Disbursement',
  },
  reports: {
    monthlyReport: 'Monthly Report',
    yearlyReport: 'Yearly Report',
    selectMonth: 'Select month',
    selectYear: 'Select year',
    exportReportJson: 'Export Report JSON',
    yearPrefix: 'Year',
    periodIncome: '{period} Income',
    periodExpenses: '{period} Expenses',
    netCashflow: 'Net Cashflow',
    savingsRateVolume: 'Savings Rate & Volume',
    transactionsRecorded: '{count} transactions recorded',
    dailyCashflowTitle: 'Daily Cashflow — {period}',
    yearlyCashflowTitle: 'Monthly Income vs Expenses — {year}',
    dailyCashflowSubtitle: 'Day-by-day credits and debits across the selected month',
    yearlyCashflowSubtitle: '12-month comparative cashflow breakdown',
    dayLabel: 'Day',
    netMonthlyCashflowTitle: 'Net Monthly Cashflow',
    netMonthlyCashflowSubtitle: 'Surplus or deficit trajectory across {year}',
    spendingShareTitle: 'Spending Share — {period}',
    spendingShareSubtitle: 'Expense distribution by category',
    noExpensesInPeriod: 'No expenses recorded in {period}.',
    yearlySummaryTitle: '{year} Monthly Ledger Summary',
    monthCol: 'Month',
    transactionsCol: 'Transactions',
    incomeCol: 'Income',
    expensesCol: 'Expenses',
    netCashflowCol: 'Net Cashflow',
    expenseBreakdownTitle: 'Expense Breakdown — {period}',
    incomeBreakdownTitle: 'Income Breakdown — {period}',
    noExpenseEntriesPeriod: 'No expense entries in this period.',
    noIncomeEntriesPeriod: 'No income entries in this period.',
  },
  settings: {
    editProfileTitle: 'Profile & Preferences',
    editProfileSubtitle:
      'Upload your profile photo, set your display name, email, language, and theme preference. Everything saves locally and automatically.',
    changePhoto: 'Change Photo',
    uploadPhoto: 'Upload Photo',
    removePhoto: 'Remove Photo',
    photoHint: 'PNG, JPG, WebP, or GIF. Automatically resized and saved locally.',
    fullName: 'Full Name',
    fullNamePlaceholder: 'e.g., Aarav Sharma',
    emailAddress: 'Email Address (Optional)',
    emailPlaceholder: 'name@example.com',
    languagePreferenceLabel: 'Language Preference',
    languagePreferenceHint: 'Switch instantly between Assamese and English',
    themePreferenceLabel: 'Theme Preference',
    themePreferenceHint: 'Choose Light (Soft White) or Dark mode',
    autoSaved: 'Saved automatically',
    errProfileFailed: 'Failed to process profile photo.',
    errInvalidImageType: 'Please choose a valid image file (PNG, JPG, WebP, or GIF).',
    errImageTooLarge: 'Image file must be smaller than 10 MB.',
    errStorageQuota: 'Browser storage limit reached. Please try a smaller profile photo.',
    accountSetupTitle: 'Account & Opening Balance Setup',
    accountSetupSubtitle:
      'Indian Finance System (INR ₹ · en-IN). Default account is Cash alongside Bank, UPI, and Credit Card.',
    themeLight: 'Light',
    themeDark: 'Dark',
    accountHolderLabel: 'Account Holder Label',
    accountHolderPlaceholder: 'Your Name',
    currencyLocale: 'Currency & Locale',
    openingBalanceLabel: 'Opening Balance (₹)',
    cashAccountHeader: 'Cash (Default)',
    bankAccountHeader: 'Bank',
    upiAccountHeader: 'UPI',
    creditCardAccountHeader: 'Credit Card',
    openingAmountPlaceholder: 'Opening ₹',
    currentOpeningBalance: 'Current opening balance:',
    saveSetup: 'Save Setup',
    exportImportTitle: 'Backup & Restore',
    exportImportSubtitle:
      'Your ledger, loans, and profile are stored locally on your device. Back up or restore anytime via JSON or Excel—no cloud account required.',
    exportFullBackup: 'Backup to JSON',
    exportDescription:
      'Downloads a complete .json backup with {txCount} transactions, {loanCount} loans, settings, and profile.',
    exportJsonBackup: 'Backup to JSON',
    importFromJson: 'Restore from JSON',
    importDescription:
      'Choose a Hisaap .json backup file to validate and replace or merge with your current ledger.',
    chooseJsonFile: 'Restore from JSON',
    exportExcelTitle: 'Export Excel',
    exportExcelDescription:
      'Exports an .xlsx workbook containing Transactions, Loans, and Account Summary sheets for spreadsheet review.',
    exportExcelButton: 'Export Excel (.xlsx)',
    importExcelTitle: 'Import Excel',
    importExcelDescription:
      'Upload an .xlsx, .xls, or .csv spreadsheet with Date, Type, Category, Description, Account, and Amount columns.',
    importExcelButton: 'Import Excel (.xlsx)',
    excelExportSuccess: 'Excel workbook exported ({txCount} transactions, {loanCount} loans).',
    jsonExportSuccess: 'JSON backup downloaded ({txCount} transactions, {loanCount} loans).',
    excelParseError: 'Unable to read the selected Excel file.',
    jsonParseError: 'Unable to parse JSON file. Ensure it is a valid UTF-8 JSON backup.',
    readyToImport: 'Ready to Restore / Import',
    validatedBackupSummary: 'JSON validated: {txCount} transactions and {loanCount} loans (INR ₹).',
    validatedExcelSummary: 'Excel validated: {txCount} transactions and {loanCount} loans (INR ₹).',
    replaceExistingData: 'Replace Existing Data',
    mergeWithExisting: 'Merge with Existing',
    importSuccessSummary: 'Restored {txCount} transactions and {loanCount} loans ({mode}).',
    replacedMode: 'replaced existing data',
    mergedMode: 'merged with existing data',
    categoriesAccountsTitle: 'Categories & Payment Accounts',
    categoriesAccountsSubtitle:
      'Customize the dropdown lists available when logging passbook entries.',
    expenseCategories: 'Expense Categories',
    incomeCategories: 'Income Categories',
    paymentAccounts: 'Payment Accounts',
    addCategoryPlaceholder: 'Add category',
    addAccountPlaceholder: 'Add account (e.g., HDFC Bank)',
    clearDataTitle: 'Clear Ledger Data',
    clearDataSubtitle:
      'Remove all transactions, loans, and reset opening balances back to ₹0.00.',
    confirmClearQuestion: 'Delete all transactions & loans?',
    confirmClearButton: 'Confirm Clear',
    clearAllDataButton: 'Clear All Data',
    brandIdentityTitle: 'Brand Identity & Logo Assets',
    brandIdentitySubtitle:
      'Precision Assam Green & Luxury Gold SVG logo system with a hidden "H" forged inside the conical Jaapi geometry—crafted for mobile apps, Play Store, and web.',
    appIconVersionLabel: 'App Icon Version',
    sidebarVersionLabel: 'Sidebar Logo Version',
    splashVersionLabel: 'Splash Screen Version',
    faviconVersionLabel: 'Favicon Version',
    lightLogoLabel: 'Light Theme SVG (Assam Green)',
    darkLogoLabel: 'Dark Theme SVG (Deep Emerald)',
    downloadLightSvg: 'Download Light SVG',
    downloadDarkSvg: 'Download Dark SVG',
  },
  modals: {
    editTransaction: 'Edit Transaction',
    newTransaction: 'New Transaction',
    transactionSubtitle:
      'Each entry creates one ledger row and recalculates chronological running balances.',
    transactionType: 'Transaction Type',
    expenseButton: 'Expense (−)',
    incomeButton: 'Income (+)',
    dateSameAllowed: 'Date (same date allowed multiple times)',
    amountInr: 'Amount (₹ INR)',
    descriptionPlaceholder: 'e.g., Kirana Groceries, House Rent, or Client Invoice #104',
    linkToLoanOptional: 'Link to Loan (Optional)',
    loanEntryRole: 'Loan Entry Role',
    roleRepaymentOption: 'Repayment / Installment',
    roleDisbursementOption: 'Initial Disbursement',
    notesReferenceOptional: 'Notes / Reference (Optional)',
    notesReferencePlaceholder: 'UPI UTR, NEFT/IMPS ref, or voucher note',
    saveAndAddAnother: 'Save & Add Another',
    updateTransaction: 'Update Transaction',
    saveTransaction: 'Save Transaction',
    errInvalidDate: 'Please select a valid date.',
    errPositiveAmount: 'Amount must be greater than zero.',
    errMissingDescription: 'Please enter a transaction description.',
    savedReadyNext: 'Saved {amount} on {date}. Ready for next entry.',
    editLoanRecord: 'Edit Loan Record',
    addLoanRecord: 'Add Loan Record',
    loanDirection: 'Loan Direction',
    loanTakenOption: 'Loan Taken (I Owe)',
    loanGivenOption: 'Loan Given (Owed to Me)',
    loanTitle: 'Loan Title',
    loanTitlePlaceholder: 'e.g., Vehicle Loan or Personal Advance',
    counterparty: 'Counterparty (Lender / Borrower)',
    counterpartyPlaceholder: 'e.g., SBI, HDFC Bank, or Rahul Sharma',
    principalInr: 'Principal (₹ INR)',
    priorPaid: 'Prior Paid (₹)',
    interestPercent: 'Interest (% p.a.)',
    startDate: 'Start Date',
    targetDueDateOptional: 'Target Due Date (Optional)',
    alsoRecordPrincipal: 'Also record principal in passbook ledger ({action})',
    ledgerAccount: 'Ledger Account',
    notesOptional: 'Notes (Optional)',
    loanNotesPlaceholder: 'EMI schedule or agreement notes',
    updateLoan: 'Update Loan',
    saveLoan: 'Save Loan',
    errLoanTitleCounterparty: 'Please provide both a loan title and counterparty.',
    errPositivePrincipal: 'Principal amount must be greater than zero.',
    errNegativePriorPaid: 'Initial repaid amount cannot be negative.',
    recordLoanPayment: 'Record Loan Payment',
    remainingPrincipal: 'Remaining Principal',
    paymentDate: 'Payment Date',
    repayNotesPlaceholder: 'UPI ref, NEFT/IMPS note, or EMI number',
    repayLedgerNoteBorrowed:
      'This will create an Expense (Loan EMI / Repayment) row in your transaction ledger and update your running balance.',
    repayLedgerNoteLent:
      'This will create an Income (Loan Recovery Received) row in your transaction ledger and update your running balance.',
    postPayment: 'Post Payment',
    errPositivePayment: 'Payment amount must be greater than zero.',
  },
  calculator: {
    title: 'Quick Calculator',
    subtitle: 'INR (₹) arithmetic & GST %',
    useResult: 'Use Result',
    backspace: 'Backspace',
    divideByZero: 'Cannot divide by zero',
    positiveAmountHint: 'Result must be greater than ₹0',
    openCalculator: 'Open Quick Calculator',
  },
  accounts: {
    Cash: 'Cash',
    Bank: 'Bank',
    UPI: 'UPI',
    'Credit Card': 'Credit Card',
  },
  categories: {
    Salary: 'Salary',
    'Business / Freelance': 'Business / Freelance',
    'Bank Interest & Dividends': 'Bank Interest & Dividends',
    'Rental Income': 'Rental Income',
    'Loan Recovery Received': 'Loan Recovery Received',
    'Loan Availed': 'Loan Availed',
    'Cashback & Refund': 'Cashback & Refund',
    'Other Income': 'Other Income',
    'House Rent': 'House Rent',
    'Kirana & Groceries': 'Kirana & Groceries',
    'Dining & Tea/Coffee': 'Dining & Tea/Coffee',
    'Electricity & Utility Bills': 'Electricity & Utility Bills',
    'Fuel & Metro/Transit': 'Fuel & Metro/Transit',
    'Mobile & Broadband': 'Mobile & Broadband',
    'Medical & Pharmacy': 'Medical & Pharmacy',
    Shopping: 'Shopping',
    'Loan EMI / Repayment': 'Loan EMI / Repayment',
    'Loan Disbursed': 'Loan Disbursed',
    Travel: 'Travel',
    'Other Expense': 'Other Expense',
  },
};
