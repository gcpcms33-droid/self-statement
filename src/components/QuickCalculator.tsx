import React, { useCallback, useEffect, useState } from 'react';
import { Calculator, Check, Delete, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type CalcOperator = '+' | '-' | '×' | '÷';

interface QuickCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onUseResult: (amount: number) => void;
}

function roundCalc(val: number): number {
  return Math.round((val + Number.EPSILON) * 1000000) / 1000000;
}

function formatNumberString(num: number): string {
  const rounded = roundCalc(num);
  if (!Number.isFinite(rounded)) return '0';
  return String(rounded);
}

function formatINRDisplay(raw: string): string {
  const n = Number(raw);
  if (!Number.isFinite(n)) return '₹0';
  const hasTrailingDot = raw.endsWith('.');
  const decimalPart = raw.includes('.') ? raw.split('.')[1] : '';
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: Math.min(2, decimalPart.length),
    maximumFractionDigits: 2,
  }).format(n);
  return hasTrailingDot && !formatted.includes('.') ? `${formatted}.` : formatted;
}

function evaluatePair(a: number, b: number, op: CalcOperator): number | null {
  switch (op) {
    case '+':
      return roundCalc(a + b);
    case '-':
      return roundCalc(a - b);
    case '×':
      return roundCalc(a * b);
    case '÷':
      if (b === 0) return null;
      return roundCalc(a / b);
  }
}

export const QuickCalculator: React.FC<QuickCalculatorProps> = ({
  isOpen,
  onClose,
  onUseResult,
}) => {
  const { t } = useLanguage();
  const [displayValue, setDisplayValue] = useState('0');
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<CalcOperator | null>(null);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [expressionText, setExpressionText] = useState('');
  const [errorText, setErrorText] = useState('');

  const handleClear = useCallback(() => {
    setDisplayValue('0');
    setStoredValue(null);
    setPendingOp(null);
    setWaitingForNext(false);
    setExpressionText('');
    setErrorText('');
  }, []);

  const handleDigit = useCallback(
    (digit: string) => {
      setErrorText('');
      if (waitingForNext) {
        const nextVal = digit === '00' ? '0' : digit;
        setDisplayValue(nextVal);
        setWaitingForNext(false);
        return;
      }
      setDisplayValue((prev) => {
        if (prev === '0') {
          if (digit === '0' || digit === '00') return '0';
          return digit;
        }
        if (prev.length + digit.length > 14) return prev;
        return `${prev}${digit}`;
      });
    },
    [waitingForNext]
  );

  const handleDecimal = useCallback(() => {
    setErrorText('');
    if (waitingForNext) {
      setDisplayValue('0.');
      setWaitingForNext(false);
      return;
    }
    setDisplayValue((prev) => (prev.includes('.') ? prev : `${prev}.`));
  }, [waitingForNext]);

  const handleBackspace = useCallback(() => {
    setErrorText('');
    if (waitingForNext) return;
    setDisplayValue((prev) => {
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith('-'))) {
        return '0';
      }
      return prev.slice(0, -1);
    });
  }, [waitingForNext]);

  const handleOperator = useCallback(
    (nextOp: CalcOperator) => {
      setErrorText('');
      const current = Number(displayValue);
      if (!Number.isFinite(current)) return;

      if (storedValue !== null && pendingOp && !waitingForNext) {
        const computed = evaluatePair(storedValue, current, pendingOp);
        if (computed === null) {
          setErrorText(t.calculator.divideByZero);
          setStoredValue(null);
          setPendingOp(null);
          setWaitingForNext(true);
          setExpressionText('');
          return;
        }
        const computedStr = formatNumberString(computed);
        setDisplayValue(computedStr);
        setStoredValue(computed);
        setExpressionText(
          `${new Intl.NumberFormat('en-IN').format(computed)} ${nextOp}`
        );
      } else {
        setStoredValue(current);
        setExpressionText(
          `${new Intl.NumberFormat('en-IN').format(current)} ${nextOp}`
        );
      }

      setPendingOp(nextOp);
      setWaitingForNext(true);
    },
    [displayValue, pendingOp, storedValue, waitingForNext, t.calculator.divideByZero]
  );

  const handlePercentage = useCallback(() => {
    setErrorText('');
    const current = Number(displayValue);
    if (!Number.isFinite(current)) return;

    let pctValue: number;
    if (storedValue !== null && (pendingOp === '+' || pendingOp === '-')) {
      pctValue = roundCalc((storedValue * current) / 100);
    } else {
      pctValue = roundCalc(current / 100);
    }
    setDisplayValue(formatNumberString(pctValue));
    setWaitingForNext(false);
  }, [displayValue, pendingOp, storedValue]);

  const computeCurrentResult = useCallback((): number | null => {
    const current = Number(displayValue);
    if (!Number.isFinite(current)) return null;

    if (storedValue !== null && pendingOp && !waitingForNext) {
      const computed = evaluatePair(storedValue, current, pendingOp);
      if (computed === null) {
        setErrorText(t.calculator.divideByZero);
        return null;
      }
      setExpressionText(
        `${new Intl.NumberFormat('en-IN').format(storedValue)} ${pendingOp} ${new Intl.NumberFormat('en-IN').format(current)} =`
      );
      setDisplayValue(formatNumberString(computed));
      setStoredValue(null);
      setPendingOp(null);
      setWaitingForNext(true);
      return computed;
    }

    return current;
  }, [displayValue, pendingOp, storedValue, waitingForNext, t.calculator.divideByZero]);

  const handleEquals = useCallback(() => {
    setErrorText('');
    computeCurrentResult();
  }, [computeCurrentResult]);

  const handleUseResultClick = () => {
    setErrorText('');
    const result = computeCurrentResult();
    if (result === null) return;

    const cleanAmount = Math.round(result * 100) / 100;
    if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
      setErrorText(t.calculator.positiveAmountHint);
      return;
    }
    onUseResult(cleanAmount);
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Escape') {
          onClose();
        }
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleDecimal();
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('-');
      } else if (e.key === '*') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === '%') {
        e.preventDefault();
        handlePercentage();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    isOpen,
    onClose,
    handleDigit,
    handleDecimal,
    handleOperator,
    handlePercentage,
    handleEquals,
    handleBackspace,
  ]);

  const liveResultPreview = (() => {
    const cur = Number(displayValue);
    if (!Number.isFinite(cur)) return null;
    if (storedValue !== null && pendingOp && !waitingForNext) {
      return evaluatePair(storedValue, cur, pendingOp);
    }
    return cur;
  })();

  const formattedDisplay = formatINRDisplay(displayValue);

  return (
    <aside
      aria-label={t.calculator.title}
      aria-hidden={!isOpen}
      className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[60] sm:w-[338px] max-w-[380px] mx-auto sm:mx-0 max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-[#0F6A3C]/20 dark:border-[#D4A017]/25 shadow-2xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        isOpen
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
      }`}
    >
      {/* Top Assam Green & Gold Hairline */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0F6A3C] via-[#D4A017] to-[#0F6A3C]" />

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-[#0F6A3C] dark:bg-[#093D22] text-[#FCE38A] ring-1 ring-[#D4A017]/50 flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#0F6A3C] dark:text-slate-100 truncate">
              {t.calculator.title}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {t.calculator.subtitle}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          tabIndex={isOpen ? 0 : -1}
          aria-label={t.common.close}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* INR Display */}
      <div className="p-4 space-y-3">
        <div className="rounded-xl p-3.5 bg-gradient-to-br from-[#0F6A3C]/8 via-white/70 to-[#D4A017]/10 dark:from-[#093D22]/80 dark:via-slate-950/80 dark:to-[#D4A017]/10 border border-[#0F6A3C]/15 dark:border-[#D4A017]/25">
          <div className="min-h-[18px] text-right text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 truncate">
            {expressionText ||
              (liveResultPreview !== null && storedValue !== null && !waitingForNext
                ? `= ${formatINRDisplay(formatNumberString(liveResultPreview))}`
                : 'INR (₹)')}
          </div>
          <div className="mt-1 text-right text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-50 truncate">
            {formattedDisplay}
          </div>
          {errorText && (
            <div className="mt-1.5 text-right text-[11px] font-medium text-red-600 dark:text-red-400">
              {errorText}
            </div>
          )}
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            onClick={handleClear}
            className="h-11 rounded-xl text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-900/60 transition-colors"
          >
            AC
          </button>
          <button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            onClick={handleBackspace}
            aria-label={t.calculator.backspace}
            className="h-11 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            onClick={handlePercentage}
            className="h-11 rounded-xl text-sm font-semibold bg-[#D4A017]/15 text-[#9A7005] hover:bg-[#D4A017]/25 dark:bg-[#D4A017]/20 dark:text-[#FCE38A] dark:hover:bg-[#D4A017]/30 transition-colors"
          >
            %
          </button>
          <button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            onClick={() => handleOperator('÷')}
            className={`h-11 rounded-xl text-base font-semibold transition-colors ${
              pendingOp === '÷' && waitingForNext
                ? 'bg-[#D4A017] text-slate-950'
                : 'bg-[#0F6A3C]/12 text-[#0F6A3C] hover:bg-[#0F6A3C]/20 dark:bg-emerald-950/80 dark:text-emerald-300 dark:hover:bg-emerald-900/80'
            }`}
          >
            ÷
          </button>

          {['7', '8', '9'].map((d) => (
            <button
              key={d}
              type="button"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => handleDigit(d)}
              className="h-11 rounded-xl text-sm font-semibold font-mono tabular-nums bg-white/90 hover:bg-slate-50 border border-slate-200/80 text-slate-900 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700 dark:text-slate-100 transition-colors"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            onClick={() => handleOperator('×')}
            className={`h-11 rounded-xl text-base font-semibold transition-colors ${
              pendingOp === '×' && waitingForNext
                ? 'bg-[#D4A017] text-slate-950'
                : 'bg-[#0F6A3C]/12 text-[#0F6A3C] hover:bg-[#0F6A3C]/20 dark:bg-emerald-950/80 dark:text-emerald-300 dark:hover:bg-emerald-900/80'
            }`}
          >
            ×
          </button>

          {['4', '5', '6'].map((d) => (
            <button
              key={d}
              type="button"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => handleDigit(d)}
              className="h-11 rounded-xl text-sm font-semibold font-mono tabular-nums bg-white/90 hover:bg-slate-50 border border-slate-200/80 text-slate-900 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700 dark:text-slate-100 transition-colors"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            onClick={() => handleOperator('-')}
            className={`h-11 rounded-xl text-base font-semibold transition-colors ${
              pendingOp === '-' && waitingForNext
                ? 'bg-[#D4A017] text-slate-950'
                : 'bg-[#0F6A3C]/12 text-[#0F6A3C] hover:bg-[#0F6A3C]/20 dark:bg-emerald-950/80 dark:text-emerald-300 dark:hover:bg-emerald-900/80'
            }`}
          >
            −
          </button>

          {['1', '2', '3'].map((d) => (
            <button
              key={d}
              type="button"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => handleDigit(d)}
              className="h-11 rounded-xl text-sm font-semibold font-mono tabular-nums bg-white/90 hover:bg-slate-50 border border-slate-200/80 text-slate-900 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700 dark:text-slate-100 transition-colors"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            onClick={() => handleOperator('+')}
            className={`h-11 rounded-xl text-base font-semibold transition-colors ${
              pendingOp === '+' && waitingForNext
                ? 'bg-[#D4A017] text-slate-950'
                : 'bg-[#0F6A3C]/12 text-[#0F6A3C] hover:bg-[#0F6A3C]/20 dark:bg-emerald-950/80 dark:text-emerald-300 dark:hover:bg-emerald-900/80'
            }`}
          >
            +
          </button>

          <button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            onClick={() => handleDigit('0')}
            className="h-11 rounded-xl text-sm font-semibold font-mono tabular-nums bg-white/90 hover:bg-slate-50 border border-slate-200/80 text-slate-900 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700 dark:text-slate-100 transition-colors"
          >
            0
          </button>
          <button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            onClick={() => handleDigit('00')}
            className="h-11 rounded-xl text-sm font-semibold font-mono tabular-nums bg-white/90 hover:bg-slate-50 border border-slate-200/80 text-slate-900 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700 dark:text-slate-100 transition-colors"
          >
            00
          </button>
          <button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            onClick={handleDecimal}
            className="h-11 rounded-xl text-base font-bold font-mono bg-white/90 hover:bg-slate-50 border border-slate-200/80 text-slate-900 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700 dark:text-slate-100 transition-colors"
          >
            .
          </button>
          <button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            onClick={handleEquals}
            className="h-11 rounded-xl text-base font-bold bg-[#D4A017] text-slate-950 hover:bg-[#C19012] transition-colors shadow-xs"
          >
            =
          </button>
        </div>

        {/* Use Result CTA */}
        <button
          type="button"
          tabIndex={isOpen ? 0 : -1}
          onClick={handleUseResultClick}
          className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#0F6A3C] text-white hover:bg-[#0B532F] dark:bg-emerald-600 dark:hover:bg-emerald-500 ring-1 ring-[#D4A017]/50 flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Check className="w-4 h-4 text-[#FCE38A] shrink-0" />
          <span>{t.calculator.useResult}</span>
        </button>
      </div>
    </aside>
  );
};
