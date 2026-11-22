import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  getHisaapLogoSvgMarkup,
  HisaapBrandLockup,
  HisaapLogoIcon,
  type HisaapLogoVariant,
  ProfileAssameseAvatarIcon,
} from '../components/HisaapIcons';
import { useLanguage } from '../contexts/LanguageContext';
import type {
  AccountSummary,
  ComputedLoan,
  ComputedTransaction,
  ExportBundle,
  FinanceSettings,
  ThemeMode,
  UserProfile,
} from '../types/finance';
import { formatCurrency, validateImportBundle } from '../utils/finance';

interface SettingsProps {
  profile: UserProfile;
  profileStorageError?: string;
  onUpdateProfile: (updates: Partial<UserProfile>) => boolean;
  onClearProfileError?: () => void;
  settings: FinanceSettings;
  computedLedger: ComputedTransaction[];
  computedLoans: ComputedLoan[];
  accountSummaries: AccountSummary[];
  transactionCount: number;
  loanCount: number;
  onUpdateSettings: (updates: Partial<FinanceSettings>) => void;
  onBuildExportBundle: () => ExportBundle;
  onImportBundle: (bundle: ExportBundle, mode: 'replace' | 'merge') => void;
  onClearAllData: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

async function resizeAvatarImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('INVALID_IMAGE_TYPE');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('IMAGE_TOO_LARGE');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.onload = () => {
        const maxDim = 224;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Unable to process image in browser.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        let dataUrl = canvas.toDataURL(outputType, 0.85);
        if (dataUrl.length > 350000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        }
        if (dataUrl.length > 350000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.55);
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const Settings: React.FC<SettingsProps> = ({
  profile,
  profileStorageError,
  onUpdateProfile,
  onClearProfileError,
  settings,
  computedLedger,
  computedLoans,
  accountSummaries,
  transactionCount,
  loanCount,
  onUpdateSettings,
  onBuildExportBundle,
  onImportBundle,
  onClearAllData,
}) => {
  const { t, language, setLanguage, formatText, translateAccount, translateCategory } =
    useLanguage();

  const [profileError, setProfileError] = useState('');
  const [autoSavedNotice, setAutoSavedNotice] = useState(false);
  const autoSaveTimerRef = useRef<number | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Ledger Setup Form State
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [openingBalance, setOpeningBalance] = useState(String(settings.openingBalance));
  const [cashAccountName, setCashAccountName] = useState(settings.cashAccountName);
  const [cashAccountBalance, setCashAccountBalance] = useState(
    String(settings.cashAccountBalance)
  );
  const [bankAccountName, setBankAccountName] = useState(settings.bankAccountName);
  const [bankAccountBalance, setBankAccountBalance] = useState(
    String(settings.bankAccountBalance)
  );
  const [upiAccountName, setUpiAccountName] = useState(settings.upiAccountName);
  const [upiAccountBalance, setUpiAccountBalance] = useState(
    String(settings.upiAccountBalance)
  );
  const [creditCardAccountName, setCreditCardAccountName] = useState(
    settings.creditCardAccountName
  );
  const [creditCardAccountBalance, setCreditCardAccountBalance] = useState(
    String(settings.creditCardAccountBalance)
  );
  const [setupSaved, setSetupSaved] = useState(false);

  const [newIncomeCategory, setNewIncomeCategory] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [newAccount, setNewAccount] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingImport, setPendingImport] = useState<{
    bundle: ExportBundle;
    source: 'json' | 'excel';
  } | null>(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setOwnerName(settings.ownerName);
    setOpeningBalance(String(settings.openingBalance));
    setCashAccountName(settings.cashAccountName);
    setCashAccountBalance(String(settings.cashAccountBalance));
    setBankAccountName(settings.bankAccountName);
    setBankAccountBalance(String(settings.bankAccountBalance));
    setUpiAccountName(settings.upiAccountName);
    setUpiAccountBalance(String(settings.upiAccountBalance));
    setCreditCardAccountName(settings.creditCardAccountName);
    setCreditCardAccountBalance(String(settings.creditCardAccountBalance));
  }, [
    settings.ownerName,
    settings.openingBalance,
    settings.cashAccountName,
    settings.cashAccountBalance,
    settings.bankAccountName,
    settings.bankAccountBalance,
    settings.upiAccountName,
    settings.upiAccountBalance,
    settings.creditCardAccountName,
    settings.creditCardAccountBalance,
  ]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const flashAutoSaved = () => {
    setAutoSavedNotice(true);
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = window.setTimeout(() => {
      setAutoSavedNotice(false);
    }, 2400);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setProfileError('');
    onClearProfileError?.();
    try {
      const processed = await resizeAvatarImage(file);
      const saved = onUpdateProfile({ avatarUrl: processed });
      if (saved) {
        flashAutoSaved();
      }
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'INVALID_IMAGE_TYPE') {
        setProfileError(t.settings.errInvalidImageType);
      } else if (code === 'IMAGE_TOO_LARGE') {
        setProfileError(t.settings.errImageTooLarge);
      } else {
        setProfileError(t.settings.errProfileFailed);
      }
    }
  };

  const handleRemoveAvatar = () => {
    setProfileError('');
    onClearProfileError?.();
    if (onUpdateProfile({ avatarUrl: '' })) {
      flashAutoSaved();
    }
  };

  const handleProfileNameChange = (value: string) => {
    setProfileError('');
    onClearProfileError?.();
    onUpdateProfile({ name: value });
    onUpdateSettings({ ownerName: value.trim() });
    flashAutoSaved();
  };

  const handleProfileEmailChange = (value: string) => {
    setProfileError('');
    onClearProfileError?.();
    onUpdateProfile({ email: value });
    flashAutoSaved();
  };

  const handleAccountBalanceChange = (
    field: 'cash' | 'bank' | 'upi' | 'card',
    rawValue: string
  ) => {
    if (field === 'cash') setCashAccountBalance(rawValue);
    if (field === 'bank') setBankAccountBalance(rawValue);
    if (field === 'upi') setUpiAccountBalance(rawValue);
    if (field === 'card') setCreditCardAccountBalance(rawValue);

    const c = Number(field === 'cash' ? rawValue : cashAccountBalance) || 0;
    const b = Number(field === 'bank' ? rawValue : bankAccountBalance) || 0;
    const u = Number(field === 'upi' ? rawValue : upiAccountBalance) || 0;
    const cc = Number(field === 'card' ? rawValue : creditCardAccountBalance) || 0;
    setOpeningBalance(String(Math.round((c + b + u + cc) * 100) / 100));
  };

  const handleSaveSetup = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedOpening = Number(openingBalance);
    const parsedCash = Number(cashAccountBalance) || 0;
    const parsedBank = Number(bankAccountBalance) || 0;
    const parsedUpi = Number(upiAccountBalance) || 0;
    const parsedCard = Number(creditCardAccountBalance) || 0;

    const cleanOwner = ownerName.trim();
    onUpdateSettings({
      ownerName: cleanOwner,
      currency: 'INR',
      locale: 'en-IN',
      openingBalance: Number.isFinite(parsedOpening)
        ? Math.round(parsedOpening * 100) / 100
        : 0,
      cashAccountName: cashAccountName.trim() || 'Cash',
      cashAccountBalance: Math.round(parsedCash * 100) / 100,
      bankAccountName: bankAccountName.trim() || 'Bank',
      bankAccountBalance: Math.round(parsedBank * 100) / 100,
      upiAccountName: upiAccountName.trim() || 'UPI',
      upiAccountBalance: Math.round(parsedUpi * 100) / 100,
      creditCardAccountName: creditCardAccountName.trim() || 'Credit Card',
      creditCardAccountBalance: Math.round(parsedCard * 100) / 100,
    });
    if (cleanOwner && !profile.name.trim()) {
      onUpdateProfile({ name: cleanOwner });
    }
    setSetupSaved(true);
    setTimeout(() => setSetupSaved(false), 2500);
  };

  const handleThemeChange = (theme: ThemeMode) => {
    onUpdateSettings({ theme });
    flashAutoSaved();
  };

  const handleLanguagePreference = (lang: 'as' | 'en') => {
    setLanguage(lang);
    flashAutoSaved();
  };

  const handleAddCategory = (kind: 'income' | 'expense') => {
    const raw = kind === 'income' ? newIncomeCategory.trim() : newExpenseCategory.trim();
    if (!raw) return;
    if (kind === 'income') {
      if (!settings.incomeCategories.includes(raw)) {
        onUpdateSettings({ incomeCategories: [...settings.incomeCategories, raw] });
      }
      setNewIncomeCategory('');
    } else {
      if (!settings.expenseCategories.includes(raw)) {
        onUpdateSettings({ expenseCategories: [...settings.expenseCategories, raw] });
      }
      setNewExpenseCategory('');
    }
  };

  const handleRemoveCategory = (kind: 'income' | 'expense', name: string) => {
    if (kind === 'income') {
      if (settings.incomeCategories.length <= 1) return;
      onUpdateSettings({
        incomeCategories: settings.incomeCategories.filter((c) => c !== name),
      });
    } else {
      if (settings.expenseCategories.length <= 1) return;
      onUpdateSettings({
        expenseCategories: settings.expenseCategories.filter((c) => c !== name),
      });
    }
  };

  const handleAddAccount = () => {
    const raw = newAccount.trim();
    if (!raw || settings.accounts.includes(raw)) return;
    onUpdateSettings({ accounts: [...settings.accounts, raw] });
    setNewAccount('');
  };

  const handleRemoveAccount = (acc: string) => {
    if (settings.accounts.length <= 1) return;
    onUpdateSettings({ accounts: settings.accounts.filter((a) => a !== acc) });
  };

  const handleExportJson = () => {
    setImportError('');
    setImportSuccess('');
    const bundle: ExportBundle = {
      ...onBuildExportBundle(),
      profile,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hisaap-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setImportSuccess(
      formatText(t.settings.jsonExportSuccess, {
        txCount: transactionCount,
        loanCount,
      })
    );
  };

  const handleExportExcel = async () => {
    setImportError('');
    setImportSuccess('');
    try {
      const { exportLedgerToExcel } = await import('../utils/excel');
      exportLedgerToExcel({
        ledger: computedLedger,
        loans: computedLoans,
        accountSummaries,
        settings,
      });
      setImportSuccess(
        formatText(t.settings.excelExportSuccess, {
          txCount: transactionCount,
          loanCount,
        })
      );
    } catch {
      setImportError(t.settings.excelParseError);
    }
  };

  const handleDownloadLogoSvg = (
    logoVariant: HisaapLogoVariant,
    themeMode: 'light' | 'dark'
  ) => {
    const svgMarkup = getHisaapLogoSvgMarkup(logoVariant, themeMode);
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hisaap-${logoVariant}-${themeMode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    setImportSuccess('');
    setPendingImport(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const result = validateImportBundle(parsed, settings);
        if (result.valid === false) {
          setImportError(result.error);
        } else {
          setPendingImport({ bundle: result.bundle, source: 'json' });
        }
      } catch {
        setImportError(t.settings.jsonParseError);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExcelSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    setImportSuccess('');
    setPendingImport(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const [{ parseExcelWorkbook }, buffer] = await Promise.all([
        import('../utils/excel'),
        file.arrayBuffer(),
      ]);
      const result = parseExcelWorkbook(buffer, settings);
      if (result.valid === false) {
        setImportError(result.error);
      } else {
        setPendingImport({ bundle: result.bundle, source: 'excel' });
      }
    } catch {
      setImportError(t.settings.excelParseError);
    }
  };

  const applyPendingImport = (mode: 'replace' | 'merge') => {
    if (!pendingImport) return;
    const { bundle, source } = pendingImport;
    onImportBundle(bundle, mode);
    if (mode === 'replace') {
      if (source === 'json') {
        setOwnerName(bundle.settings.ownerName);
        setOpeningBalance(String(bundle.settings.openingBalance));
        setCashAccountName(bundle.settings.cashAccountName);
        setCashAccountBalance(String(bundle.settings.cashAccountBalance));
        setBankAccountName(bundle.settings.bankAccountName);
        setBankAccountBalance(String(bundle.settings.bankAccountBalance));
        setUpiAccountName(bundle.settings.upiAccountName);
        setUpiAccountBalance(String(bundle.settings.upiAccountBalance));
        setCreditCardAccountName(bundle.settings.creditCardAccountName);
        setCreditCardAccountBalance(String(bundle.settings.creditCardAccountBalance));
        if (bundle.profile) {
          onUpdateProfile(bundle.profile);
        }
      }
    }
    setImportSuccess(
      formatText(t.settings.importSuccessSummary, {
        txCount: bundle.transactions.length,
        loanCount: bundle.loans.length,
        mode: mode === 'replace' ? t.settings.replacedMode : t.settings.mergedMode,
      })
    );
    setPendingImport(null);
  };

  const displayName =
    profile.name.trim() || settings.ownerName.trim() || t.common.personalAccount;
  const initials = getInitials(profile.name.trim() || settings.ownerName.trim());
  const resolvedStorageError =
    profileStorageError === 'STORAGE_QUOTA_EXCEEDED'
      ? t.settings.errStorageQuota
      : profileStorageError || '';
  const activeProfileError = profileError || resolvedStorageError;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Local Profile & Preferences (Auto-Saved to Local Storage) */}
      <section className="hisaap-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <HisaapLogoIcon variant="app-icon" className="w-9 h-9 shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-[#263238] dark:text-slate-50">
                {t.settings.editProfileTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.settings.editProfileSubtitle}
              </p>
            </div>
          </div>
          {autoSavedNotice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F6A3C] dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.settings.autoSaved}</span>
            </span>
          )}
        </div>

        <div className="pt-5 space-y-6">
          {activeProfileError && (
            <div
              role="alert"
              className="px-4 py-3 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl"
            >
              {activeProfileError}
            </div>
          )}

          {/* Avatar Row */}
          <div className="flex flex-wrap items-center gap-5">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={displayName}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-[#D4A017]/60 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#263238] dark:bg-slate-100 text-white dark:text-[#263238] text-lg font-semibold flex items-center justify-center shrink-0 ring-2 ring-[#D4A017]/50">
                {initials || <ProfileAssameseAvatarIcon className="w-7 h-7" />}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#263238] text-white hover:bg-[#1B2429] dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{profile.avatarUrl ? t.settings.changePhoto : t.settings.uploadPhoto}</span>
                </button>
                {profile.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-3 py-2 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                  >
                    {t.settings.removePhoto}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.settings.photoHint}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.settings.fullName}
              </label>
              <input
                id="profile-name"
                type="text"
                placeholder={t.settings.fullNamePlaceholder}
                value={profile.name}
                onChange={(e) => handleProfileNameChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#263238]/30 dark:focus:ring-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.settings.emailAddress}
              </label>
              <input
                id="profile-email"
                type="email"
                placeholder={t.settings.emailPlaceholder}
                value={profile.email}
                onChange={(e) => handleProfileEmailChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#263238]/30 dark:focus:ring-slate-500"
              />
            </div>
          </div>

          {/* Language Preference & Theme Preference */}
          <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t.settings.languagePreferenceLabel}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.settings.languagePreferenceHint}
                </div>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => handleLanguagePreference('as')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    language === 'as'
                      ? 'bg-[#263238] text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {t.common.assameseLabel}
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguagePreference('en')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    language === 'en'
                      ? 'bg-[#263238] text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {t.common.englishLabel}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t.settings.themePreferenceLabel}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.settings.themePreferenceHint}
                </div>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
                {(['light', 'dark'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleThemeChange(mode)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      settings.theme === mode
                        ? 'bg-[#263238] text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {mode === 'light' ? t.settings.themeLight : t.settings.themeDark}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Indian Finance Setup: Opening Balance & Cash / Bank / UPI / Credit Card */}
      <section className="hisaap-card rounded-2xl p-6">
        <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <h2 className="text-base font-semibold text-[#263238] dark:text-slate-50">
            {t.settings.accountSetupTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.settings.accountSetupSubtitle}
          </p>
        </div>

        <form onSubmit={handleSaveSetup} className="pt-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="set-owner"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.settings.accountHolderLabel}
              </label>
              <input
                id="set-owner"
                type="text"
                placeholder={t.settings.accountHolderPlaceholder}
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="set-currency"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.settings.currencyLocale}
              </label>
              <input
                id="set-currency"
                type="text"
                readOnly
                value="INR (₹) · en-IN"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-700 dark:text-slate-300"
              />
            </div>

            <div>
              <label
                htmlFor="set-opening"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.settings.openingBalanceLabel}
              </label>
              <input
                id="set-opening"
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-mono tabular-nums text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="set-cash-bal"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                {t.settings.cashAccountHeader}
              </label>
              <input
                id="set-cash-name"
                type="text"
                aria-label={t.settings.cashAccountHeader}
                value={cashAccountName}
                onChange={(e) => setCashAccountName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              />
              <input
                id="set-cash-bal"
                type="number"
                step="0.01"
                placeholder={t.settings.openingAmountPlaceholder}
                value={cashAccountBalance}
                onChange={(e) => handleAccountBalanceChange('cash', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-mono tabular-nums text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="set-bank-bal"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                {t.settings.bankAccountHeader}
              </label>
              <input
                id="set-bank-name"
                type="text"
                aria-label={t.settings.bankAccountHeader}
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              />
              <input
                id="set-bank-bal"
                type="number"
                step="0.01"
                placeholder={t.settings.openingAmountPlaceholder}
                value={bankAccountBalance}
                onChange={(e) => handleAccountBalanceChange('bank', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-mono tabular-nums text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="set-upi-bal"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                {t.settings.upiAccountHeader}
              </label>
              <input
                id="set-upi-name"
                type="text"
                aria-label={t.settings.upiAccountHeader}
                value={upiAccountName}
                onChange={(e) => setUpiAccountName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              />
              <input
                id="set-upi-bal"
                type="number"
                step="0.01"
                placeholder={t.settings.openingAmountPlaceholder}
                value={upiAccountBalance}
                onChange={(e) => handleAccountBalanceChange('upi', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-mono tabular-nums text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="set-card-bal"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                {t.settings.creditCardAccountHeader}
              </label>
              <input
                id="set-card-name"
                type="text"
                aria-label={t.settings.creditCardAccountHeader}
                value={creditCardAccountName}
                onChange={(e) => setCreditCardAccountName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              />
              <input
                id="set-card-bal"
                type="number"
                step="0.01"
                placeholder={t.settings.openingAmountPlaceholder}
                value={creditCardAccountBalance}
                onChange={(e) => handleAccountBalanceChange('card', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-mono tabular-nums text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.settings.currentOpeningBalance}{' '}
              <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                {formatCurrency(settings.openingBalance, settings.currency, settings.locale)}
              </span>
            </span>
            <div className="flex items-center gap-3">
              {setupSaved && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0F6A3C] dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t.common.saved}
                </span>
              )}
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium bg-[#263238] text-white hover:bg-[#1B2429] dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl transition-colors"
              >
                {t.settings.saveSetup}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Backup & Restore (JSON + Excel) */}
      <section className="hisaap-card rounded-2xl p-6 space-y-6">
        <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <h2 className="text-base font-semibold text-[#263238] dark:text-slate-50">
            {t.settings.exportImportTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.settings.exportImportSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Backup to JSON */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {t.settings.exportFullBackup}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {formatText(t.settings.exportDescription, {
                txCount: transactionCount,
                loanCount,
              })}
            </p>
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#263238] text-white hover:bg-[#1B2429] dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.settings.exportJsonBackup}</span>
            </button>
          </div>

          {/* Restore from JSON */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {t.settings.importFromJson}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.settings.importDescription}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.settings.chooseJsonFile}</span>
            </button>
          </div>

          {/* Export Excel */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {t.settings.exportExcelTitle}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.settings.exportExcelDescription}
            </p>
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#0F6A3C] text-white hover:bg-[#0B532F] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t.settings.exportExcelButton}</span>
            </button>
          </div>

          {/* Import Excel */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {t.settings.importExcelTitle}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.settings.importExcelDescription}
            </p>
            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              onChange={handleExcelSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => excelInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.settings.importExcelButton}</span>
            </button>
          </div>
        </div>

        {importError && (
          <div className="px-4 py-3 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl">
            {importError}
          </div>
        )}

        {importSuccess && (
          <div className="px-4 py-3 text-xs font-medium text-[#0F6A3C] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl">
            {importSuccess}
          </div>
        )}

        {pendingImport && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {t.settings.readyToImport}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              {formatText(
                pendingImport.source === 'excel'
                  ? t.settings.validatedExcelSummary
                  : t.settings.validatedBackupSummary,
                {
                  txCount: pendingImport.bundle.transactions.length,
                  loanCount: pendingImport.bundle.loans.length,
                }
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => applyPendingImport('replace')}
                className="px-3 py-1.5 text-xs font-medium bg-[#263238] text-white hover:bg-[#1B2429] dark:bg-slate-100 dark:text-slate-900 rounded-xl"
              >
                {t.settings.replaceExistingData}
              </button>
              <button
                type="button"
                onClick={() => applyPendingImport('merge')}
                className="px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-xl"
              >
                {t.settings.mergeWithExisting}
              </button>
              <button
                type="button"
                onClick={() => setPendingImport(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:underline"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Categories & Accounts */}
      <section className="hisaap-card rounded-2xl p-6 space-y-6">
        <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <h2 className="text-base font-semibold text-[#263238] dark:text-slate-50">
            {t.settings.categoriesAccountsTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.settings.categoriesAccountsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Expense Categories */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {t.settings.expenseCategories}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder={t.settings.addCategoryPlaceholder}
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory('expense');
                  }
                }}
                className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <button
                type="button"
                onClick={() => handleAddCategory('expense')}
                aria-label={t.settings.expenseCategories}
                className="p-2 bg-[#263238] text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-52 overflow-y-auto text-xs">
              {settings.expenseCategories.map((cat) => (
                <li key={cat} className="py-1.5 flex items-center justify-between gap-2">
                  <span className="text-slate-700 dark:text-slate-300 truncate">
                    {translateCategory(cat)}
                  </span>
                  {settings.expenseCategories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory('expense', cat)}
                      aria-label={`${t.common.delete} ${cat}`}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Income Categories */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {t.settings.incomeCategories}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder={t.settings.addCategoryPlaceholder}
                value={newIncomeCategory}
                onChange={(e) => setNewIncomeCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory('income');
                  }
                }}
                className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <button
                type="button"
                onClick={() => handleAddCategory('income')}
                aria-label={t.settings.incomeCategories}
                className="p-2 bg-[#263238] text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-52 overflow-y-auto text-xs">
              {settings.incomeCategories.map((cat) => (
                <li key={cat} className="py-1.5 flex items-center justify-between gap-2">
                  <span className="text-slate-700 dark:text-slate-300 truncate">
                    {translateCategory(cat)}
                  </span>
                  {settings.incomeCategories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory('income', cat)}
                      aria-label={`${t.common.delete} ${cat}`}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Accounts */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {t.settings.paymentAccounts}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder={t.settings.addAccountPlaceholder}
                value={newAccount}
                onChange={(e) => setNewAccount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAccount();
                  }
                }}
                className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddAccount}
                aria-label={t.settings.paymentAccounts}
                className="p-2 bg-[#263238] text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-52 overflow-y-auto text-xs">
              {settings.accounts.map((acc) => (
                <li key={acc} className="py-1.5 flex items-center justify-between gap-2">
                  <span className="text-slate-700 dark:text-slate-300 truncate">
                    {translateAccount(acc)}
                  </span>
                  {settings.accounts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAccount(acc)}
                      aria-label={`${t.common.delete} ${acc}`}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Brand Identity & Scalable Light/Dark Logo Kit */}
      <section className="hisaap-card rounded-2xl p-6 space-y-5">
        <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <h2 className="text-base font-semibold text-[#263238] dark:text-slate-50">
            {t.settings.brandIdentityTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.settings.brandIdentitySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Light Theme Logo Card */}
          <div className="rounded-2xl bg-[#F8F9FA] border border-slate-200 p-5 flex flex-col items-center justify-between gap-4">
            <div className="text-[11px] font-medium text-slate-600 self-start">
              {t.settings.lightLogoLabel}
            </div>
            <HisaapBrandLockup
              layout="stacked"
              variant="app-icon"
              theme="light"
              title={t.common.brandTitle}
              englishName="Hisaap"
              tagline={t.common.tagline}
              iconClassName="w-16 h-16 drop-shadow-sm"
              titleClassName="mt-3 text-xl font-bold tracking-tight text-[#0F6A3C] flex items-baseline justify-center gap-2"
              taglineClassName="mt-0.5 text-xs font-medium text-slate-600"
            />
            <button
              type="button"
              onClick={() => handleDownloadLogoSvg('app-icon', 'light')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#0F6A3C] text-white hover:bg-[#0B532F] rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.settings.downloadLightSvg}</span>
            </button>
          </div>

          {/* Dark Theme Logo Card */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 flex flex-col items-center justify-between gap-4">
            <div className="text-[11px] font-medium text-slate-400 self-start">
              {t.settings.darkLogoLabel}
            </div>
            <HisaapBrandLockup
              layout="stacked"
              variant="app-icon"
              theme="dark"
              title={t.common.brandTitle}
              englishName="Hisaap"
              tagline={t.common.tagline}
              iconClassName="w-16 h-16 drop-shadow-sm"
              titleClassName="mt-3 text-xl font-bold tracking-tight text-white flex items-baseline justify-center gap-2"
              taglineClassName="mt-0.5 text-xs font-medium text-slate-300"
            />
            <button
              type="button"
              onClick={() => handleDownloadLogoSvg('app-icon', 'dark')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#D4A017] text-slate-950 hover:bg-[#C19012] rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.settings.downloadDarkSvg}</span>
            </button>
          </div>
        </div>

        {/* 4 Official Logo Versions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {(
            [
              { variant: 'app-icon', label: t.settings.appIconVersionLabel, sizeClass: 'w-12 h-12' },
              { variant: 'sidebar', label: t.settings.sidebarVersionLabel, sizeClass: 'w-11 h-11' },
              { variant: 'splash', label: t.settings.splashVersionLabel, sizeClass: 'w-12 h-12' },
              { variant: 'favicon', label: t.settings.faviconVersionLabel, sizeClass: 'w-9 h-9' },
            ] as const
          ).map((item) => (
            <div
              key={item.variant}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 flex flex-col items-center justify-between gap-3 text-center"
            >
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                {item.label}
              </span>
              <div className="h-14 flex items-center justify-center">
                <HisaapLogoIcon variant={item.variant} className={item.sizeClass} />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDownloadLogoSvg(item.variant, 'light')}
                  className="px-2 py-1 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  {t.settings.themeLight} SVG
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadLogoSvg(item.variant, 'dark')}
                  className="px-2 py-1 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  {t.settings.themeDark} SVG
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workspace Clear Controls */}
      <section className="hisaap-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#263238] dark:text-slate-50">
              {t.settings.clearDataTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.settings.clearDataSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {confirmClear ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-red-700 dark:text-red-400 font-medium">
                  {t.settings.confirmClearQuestion}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClearAllData();
                    setOpeningBalance('0');
                    setCashAccountBalance('0');
                    setBankAccountBalance('0');
                    setUpiAccountBalance('0');
                    setCreditCardAccountBalance('0');
                    setConfirmClear(false);
                  }}
                  className="px-3 py-1.5 font-medium bg-red-600 text-white hover:bg-red-700 rounded-xl"
                >
                  {t.settings.confirmClearButton}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1.5 text-slate-500 hover:underline"
                >
                  {t.common.cancel}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.settings.clearAllDataButton}</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
