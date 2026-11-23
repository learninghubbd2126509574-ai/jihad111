import React, { useState, useEffect } from 'react';
import {
  Delete,
  X,
  Check,
  Eye,
  EyeOff,
  Smartphone,
  Lock,
  Save,
  ClipboardPaste,
} from 'lucide-react';

interface KeypadProps {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
  title?: string;
  savedAccounts: { whatsapp: string; password: string }[];
  onSaveAccount: () => void;
  onDeleteSavedAccount: (w: string, e: React.MouseEvent) => void;
  onSelectAccount?: (acc: { whatsapp: string; password: string }) => void;
}

const NUMERIC_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace'] as const;

interface SharedNumericPadProps extends KeypadProps {
  mode: 'phone' | 'password';
  maxLength?: number;
}

function SharedNumericPad({
  mode,
  value,
  onChange,
  onClose,
  title,
  savedAccounts,
  onSaveAccount,
  onDeleteSavedAccount,
  onSelectAccount,
  maxLength = 32,
}: SharedNumericPadProps) {
  const [showPlainPassword, setShowPlainPassword] = useState(true);

  const isPhone = mode === 'phone';
  const resolvedTitle = title || (isPhone ? 'WhatsApp / Phone Number' : 'Access Password');

  const handleDigit = (digit: string) => {
    if (value.length < maxLength) {
      onChange(value + digit);
    }
  };

  const handleBackspace = () => onChange(value.slice(0, -1));
  const handleClear = () => onChange('');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.replace(/[^0-9]/g, '');
      if (cleaned) {
        onChange((value + cleaned).slice(0, maxLength));
      }
    } catch (err) {
      console.warn('Failed to read clipboard', err);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        if (value.length < maxLength) onChange(value + e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onChange(value.slice(0, -1));
      } else if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [value, maxLength, onChange, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0F172A]/45 z-[9998] animate-fade-in"
      />

      <div className="fixed inset-x-0 bottom-0 z-[9999] flex justify-center pointer-events-none animate-slide-up">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[420px] bg-white border border-b-0 border-[#E5E7EB] shadow-[0_-14px_38px_rgba(15,23,42,0.14)] rounded-t-3xl px-4 pt-3 pb-6 pointer-events-auto select-none"
        >
          {/* Sheet Handle */}
          <div className="w-10 h-1 rounded-full bg-[#CBD5E1] mx-auto mb-3" />

          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#EEF5FF] text-[#0B4F9C] flex items-center justify-center shrink-0">
                {isPhone ? <Smartphone size={14} strokeWidth={2} /> : <Lock size={14} strokeWidth={2} />}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] truncate">
                {resolvedTitle}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-[#64748B] font-mono tabular-nums font-semibold">
                {value.length} {value.length === 1 ? 'digit' : 'digits'}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close keypad"
                className="w-7 h-7 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Digital Readout Screen */}
          <div className="mb-3 bg-[#F8FAFC] rounded-2xl px-3.5 py-3 border border-[#CBD5E1] focus-within:border-[#0B4F9C] flex items-center justify-between gap-2 min-h-[54px]">
            <div className="flex items-center overflow-x-auto custom-scrollbar flex-1 min-w-0">
              {value ? (
                <span className="text-[22px] font-bold font-mono tabular-nums text-[#0F172A] tracking-[0.14em] leading-none">
                  {isPhone || showPlainPassword ? value : '•'.repeat(value.length)}
                </span>
              ) : (
                <span className="text-sm font-medium text-[#94A3B8]">
                  {isPhone ? 'Enter phone digits (0–9)...' : 'Enter PIN / password digits...'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handlePaste}
                className="w-8 h-8 rounded-lg bg-white hover:bg-[#EEF5FF] border border-[#E2E8F0] text-[#0B4F9C] flex items-center justify-center transition-colors cursor-pointer"
                title="Paste numeric digits"
              >
                <ClipboardPaste size={14} />
              </button>

              {(isPhone ? value.length >= 10 : value.length > 0) && (
                <button
                  type="button"
                  onClick={onSaveAccount}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-[#ECFDF5] border border-[#E2E8F0] text-[#047857] flex items-center justify-center transition-colors cursor-pointer"
                  title="Save Credentials"
                >
                  <Save size={14} />
                </button>
              )}

              {!isPhone && value && (
                <button
                  type="button"
                  onClick={() => setShowPlainPassword((prev) => !prev)}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] flex items-center justify-center transition-colors cursor-pointer"
                  title={showPlainPassword ? 'Hide password' : 'Show password'}
                >
                  {showPlainPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
            </div>
          </div>

          {/* Saved Accounts Quick Autofill */}
          {savedAccounts.length > 0 && (
            <div className="mb-3 flex gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
              {savedAccounts.map((acc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (onSelectAccount) onSelectAccount(acc);
                    else onChange(isPhone ? acc.whatsapp : acc.password);
                  }}
                  className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0B4F9C] cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[#0F172A] shrink-0 transition-colors"
                >
                  <span className="font-mono tabular-nums">{acc.whatsapp}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSavedAccount(acc.whatsapp, e);
                    }}
                    className="text-[#94A3B8] hover:text-[#DC2626] p-0.5"
                    aria-label="Remove saved account"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tactile Key Well (Strictly 1–0 Digits) */}
          <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-2xl p-2.5">
            <div className="grid grid-cols-3 gap-2">
              {NUMERIC_KEYS.map((key) => {
                if (key === 'clear') {
                  return (
                    <button
                      key="clear"
                      type="button"
                      onClick={handleClear}
                      className="h-12 sm:h-[52px] rounded-xl bg-white hover:bg-[#FEF2F2] text-[#DC2626] font-bold text-[11px] uppercase tracking-wider border border-[#E2E8F0] hover:border-[#FECACA] shadow-[0_2px_0_#CBD5E1] active:translate-y-[1px] active:shadow-none transition-all duration-100 flex items-center justify-center cursor-pointer"
                    >
                      Clear
                    </button>
                  );
                }

                if (key === 'backspace') {
                  return (
                    <button
                      key="backspace"
                      type="button"
                      onClick={handleBackspace}
                      aria-label="Delete"
                      className="h-12 sm:h-[52px] rounded-xl bg-white hover:bg-[#F8FAFC] text-[#334155] hover:text-[#0F172A] border border-[#E2E8F0] shadow-[0_2px_0_#CBD5E1] active:translate-y-[1px] active:shadow-none transition-all duration-100 flex items-center justify-center cursor-pointer"
                    >
                      <Delete size={20} strokeWidth={1.85} />
                    </button>
                  );
                }

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleDigit(key)}
                    className="h-12 sm:h-[52px] rounded-xl bg-white hover:bg-[#EEF5FF] active:bg-[#0B4F9C] text-[#0F172A] hover:text-[#0B4F9C] active:text-white border border-[#E2E8F0] hover:border-[#93C5FD] shadow-[0_2px_0_#CBD5E1] active:translate-y-[1px] active:shadow-none transition-all duration-100 flex items-center justify-center cursor-pointer"
                  >
                    <span className="text-[22px] font-bold font-mono tabular-nums leading-none">
                      {key}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Confirm Action */}
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 mt-3 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all duration-150 cursor-pointer"
          >
            <Check size={16} strokeWidth={2.5} />
            <span>Done</span>
          </button>
        </div>
      </div>
    </>
  );
}

export function PhoneKeypad(props: KeypadProps) {
  return <SharedNumericPad {...props} mode="phone" maxLength={15} />;
}

export function PasswordKeyboard(props: KeypadProps) {
  return <SharedNumericPad {...props} mode="password" maxLength={32} />;
}
