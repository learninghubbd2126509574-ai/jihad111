import React, { useState } from 'react';
import { Delete, ArrowUp, X, Check, Eye, EyeOff, Smartphone, Lock, Space, ChevronDown, Save } from 'lucide-react';

interface PhoneKeypadProps {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
  title?: string;
  savedAccounts: { whatsapp: string, password: string }[];
  onSaveAccount: () => void;
  onDeleteSavedAccount: (w: string, e: React.MouseEvent) => void;
  onSelectAccount?: (acc: { whatsapp: string, password: string }) => void;
}

export function PhoneKeypad({ value, onChange, onClose, title = "WhatsApp / Phone Number", savedAccounts, onSaveAccount, onDeleteSavedAccount, onSelectAccount }: PhoneKeypadProps) {
  const handleKeyClick = (key: string) => {
    if (value.length < 15) {
      onChange(value + key);
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const keypadButtons = [
    { num: '1', letters: '' },
    { num: '2', letters: 'ABC' },
    { num: '3', letters: 'DEF' },
    { num: '4', letters: 'GHI' },
    { num: '5', letters: 'JKL' },
    { num: '6', letters: 'MNO' },
    { num: '7', letters: 'PQRS' },
    { num: '8', letters: 'TUV' },
    { num: '9', letters: 'WXYZ' },
    { num: 'clear', letters: '' },
    { num: '0', letters: '+' },
    { num: 'backspace', letters: '' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-[3px] z-[9998] transition-opacity animate-fade-in"
      />

      {/* Bottom Docked Keypad Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[9999] flex justify-center pointer-events-none animate-slide-up">
        <div className="w-full max-w-md bg-slate-900 border-t-2 border-blue-500/80 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] rounded-t-3xl p-3 sm:p-4 pb-6 sm:pb-8 backdrop-blur-xl pointer-events-auto select-none">
          
          {/* TOP LIVE INPUT DISPLAY SCREEN */}
          <div className="mb-3 bg-slate-950 rounded-2xl p-3 border border-slate-700/80 shadow-inner">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-blue-400">
                <Smartphone size={14} />
                <span className="text-[11px] font-bold uppercase tracking-wider">{title}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  {value.length} Digits
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg hover:bg-slate-750 cursor-pointer"
                  title="Close"
                >
                  <ChevronDown size={15} />
                </button>
              </div>
            </div>

            {/* Big Active Live Number Box */}
            <div className="flex items-center justify-between bg-slate-900/90 rounded-xl px-3.5 py-2.5 border border-slate-700 min-h-[46px]">
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar flex-1 mr-2">
                {value ? (
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-wider">
                    {value}
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-slate-500">
                    Type phone number...
                  </span>
                )}
                {/* Blinking Cursor */}
                <span className="inline-block w-0.5 h-6 bg-blue-400 animate-pulse" />
              </div>

              <div className="flex items-center gap-2">
                {value.length >= 10 && (
                  <button
                    type="button"
                    onClick={onSaveAccount}
                    className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors cursor-pointer"
                    title="Save Account"
                  >
                    <Save size={16} />
                  </button>
                )}
                {value && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Saved Accounts Row */}
            {savedAccounts.length > 0 && (
              <div className="mt-2 flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                {savedAccounts.map((acc, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (onSelectAccount) {
                        onSelectAccount(acc);
                      } else {
                        onChange(acc.whatsapp);
                      }
                    }}
                    className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700 hover:border-blue-500 cursor-pointer rounded-lg px-2 py-1 text-[10px] font-bold text-slate-300 shrink-0 transition-all"
                  >
                    <span className="font-mono">{acc.whatsapp}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSavedAccount(acc.whatsapp, e);
                      }}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Keypad Grid Layout */}
          <div className="grid grid-cols-3 gap-2">
            {keypadButtons.map((btn) => {
              if (btn.num === 'clear') {
                return (
                  <button
                    key="clear"
                    type="button"
                    onClick={handleClear}
                    className="h-12 sm:h-13 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 active:bg-rose-800/80 text-rose-300 font-bold text-xs uppercase tracking-wider border border-rose-900/50 transition-all flex flex-col items-center justify-center active:scale-95 shadow-sm cursor-pointer"
                  >
                    <span>Clear</span>
                    <span className="text-[9px] text-rose-400/80 font-normal">Reset</span>
                  </button>
                );
              }
              if (btn.num === 'backspace') {
                return (
                  <button
                    key="backspace"
                    type="button"
                    onClick={handleBackspace}
                    className="h-12 sm:h-13 rounded-2xl bg-amber-950/40 hover:bg-amber-900/60 active:bg-amber-800/80 text-amber-300 border border-amber-900/50 transition-all flex flex-col items-center justify-center active:scale-95 shadow-sm cursor-pointer"
                  >
                    <Delete size={20} />
                    <span className="text-[9px] text-amber-400/80 font-normal">Delete</span>
                  </button>
                );
              }
              return (
                <button
                  key={btn.num}
                  type="button"
                  onClick={() => handleKeyClick(btn.num)}
                  className="h-12 sm:h-13 rounded-2xl bg-slate-800 hover:bg-blue-600 active:bg-blue-700 text-white border border-slate-700 hover:border-blue-400 transition-all flex flex-col items-center justify-center active:scale-95 shadow-sm cursor-pointer group"
                >
                  <span className="text-xl sm:text-2xl font-black font-mono leading-none">{btn.num}</span>
                  {btn.letters && (
                    <span className="text-[8px] font-bold text-slate-400 group-hover:text-blue-200 tracking-widest mt-0.5">
                      {btn.letters}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Done Confirmation Button */}
          <div className="mt-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Check size={16} />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

interface PasswordKeyboardProps {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
  title?: string;
  savedAccounts: { whatsapp: string, password: string }[];
  onSaveAccount: () => void;
  onDeleteSavedAccount: (w: string, e: React.MouseEvent) => void;
  onSelectAccount?: (acc: { whatsapp: string, password: string }) => void;
}

export function PasswordKeyboard({ value, onChange, onClose, title = "Password Virtual Keyboard", savedAccounts, onSaveAccount, onDeleteSavedAccount, onSelectAccount }: PasswordKeyboardProps) {
  // Default to numeric (123) layout as requested
  const [layoutMode, setLayoutMode] = useState<'num' | 'abc' | 'ABC' | 'sym'>('num');
  const [showPlainPassword, setShowPlainPassword] = useState(true);

  const handleCharClick = (char: string) => {
    onChange(value + char);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const handleSpace = () => {
    onChange(value + ' ');
  };

  const numRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  const qwertyLower = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  const qwertyUpper = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  const symbols1 = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['@', '#', '$', '%', '&', '*', '-', '+', '(', ')'],
    ['!', '"', "'", ':', ';', '/', '?', ',', '.']
  ];

  const symbols2 = [
    ['~', '`', '|', '\\', '<', '>', '=', '[', ']', '{'],
    ['}', '€', '£', '¥', '§', '°', '^', '_', '•', '∆'],
    ['©', '®', '™', '✓', '★', '¶', '¿', '¡']
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-[3px] z-[9998] transition-opacity animate-fade-in"
      />

      {/* Bottom Docked Keyboard Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[9999] flex justify-center pointer-events-none animate-slide-up">
        <div className="w-full max-w-lg bg-slate-900 border-t-2 border-blue-500/80 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] rounded-t-3xl p-2.5 sm:p-3.5 pb-6 sm:pb-8 backdrop-blur-xl pointer-events-auto select-none">
          
          {/* TOP LIVE INPUT DISPLAY SCREEN */}
          <div className="mb-2 bg-slate-950 rounded-2xl p-2.5 border border-slate-700/80 shadow-inner">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <div className="flex items-center gap-1.5 text-blue-400">
                <Lock size={13} />
                <span className="text-[11px] font-bold uppercase tracking-wider">{title}</span>
              </div>

              {/* Mode switch tabs: 123 is first/primary */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLayoutMode('num')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                    layoutMode === 'num'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  123
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('abc')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                    layoutMode === 'abc'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  abc
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('ABC')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                    layoutMode === 'ABC'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  ABC
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('sym')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                    layoutMode === 'sym'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  ?#$
                </button>
              </div>
            </div>

            {/* Live Password Box with show/hide eye toggle */}
            <div className="flex items-center justify-between bg-slate-900/95 rounded-xl px-3 py-2 border border-slate-700 min-h-[42px]">
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar flex-1 mr-2">
                {value ? (
                  <span className="text-lg sm:text-xl font-bold font-mono text-blue-300 tracking-wider">
                    {showPlainPassword ? value : '•'.repeat(value.length)}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-500">
                    Type password...
                  </span>
                )}
                {/* Blinking Cursor */}
                <span className="inline-block w-0.5 h-5 bg-blue-400 animate-pulse" />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {value.length > 0 && (
                  <button
                    type="button"
                    onClick={onSaveAccount}
                    className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors cursor-pointer"
                    title="Save Account"
                  >
                    <Save size={16} />
                  </button>
                )}
                {value && (
                  <button
                    type="button"
                    onClick={() => setShowPlainPassword(!showPlainPassword)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title={showPlainPassword ? "Hide password" : "Show password"}
                  >
                    {showPlainPassword ? <EyeOff size={14} className="text-amber-400" /> : <Eye size={14} className="text-blue-400" />}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                >
                  <Check size={13} />
                  <span>Done</span>
                </button>
              </div>
            </div>
            
            {/* Saved Accounts Row */}
            {savedAccounts.length > 0 && (
              <div className="mt-2 flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                {savedAccounts.map((acc, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (onSelectAccount) {
                        onSelectAccount(acc);
                      } else {
                        onChange(acc.password);
                      }
                    }}
                    className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700 hover:border-blue-500 cursor-pointer rounded-lg px-2 py-1 text-[10px] font-bold text-slate-300 shrink-0 transition-all"
                  >
                    <span className="font-mono">{acc.whatsapp}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSavedAccount(acc.whatsapp, e);
                      }}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DEFAULT NUMERIC 123 LAYOUT */}
          {layoutMode === 'num' && (
            <div className="space-y-1.5 pt-1">
              <div className="grid grid-cols-4 gap-1.5">
                {['1', '2', '3', '+', '4', '5', '6', '-', '7', '8', '9', '*', '.', '0', '#', '/'].map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleCharClick(k)}
                    className="h-10 sm:h-11 rounded-xl bg-slate-800 hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-lg font-mono border border-slate-700 transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-xs"
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div className="flex justify-center items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 h-9 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="flex-1 h-9 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-amber-400 border border-slate-700 flex items-center justify-center active:scale-95 cursor-pointer gap-1"
                >
                  <Delete size={16} />
                  <span className="text-xs font-bold">Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('abc')}
                  className="px-4 h-9 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <span>ABC</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Check size={14} />
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}

          {/* LOWERCASE ABC LAYOUT */}
          {layoutMode === 'abc' && (
            <div className="space-y-1">
              {/* Number bar on top */}
              <div className="flex justify-center gap-1">
                {numRow.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleCharClick(d)}
                    className="flex-1 max-w-[42px] h-8 rounded-lg bg-slate-800/90 hover:bg-blue-600 text-slate-200 hover:text-white font-bold text-xs font-mono border border-slate-700/80 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Row 1: q w e r t y u i o p */}
              <div className="flex justify-center gap-1">
                {qwertyLower[0].map(letter => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleCharClick(letter)}
                    className="flex-1 max-w-[42px] h-9 sm:h-10 rounded-lg bg-slate-800 hover:bg-blue-600 text-white font-bold text-sm sm:text-base border border-slate-700 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {/* Row 2: a s d f g h j k l */}
              <div className="flex justify-center gap-1 px-3">
                {qwertyLower[1].map(letter => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleCharClick(letter)}
                    className="flex-1 max-w-[42px] h-9 sm:h-10 rounded-lg bg-slate-800 hover:bg-blue-600 text-white font-bold text-sm sm:text-base border border-slate-700 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {/* Row 3: Shift / z x c v b n m / Backspace */}
              <div className="flex justify-center items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLayoutMode('ABC')}
                  className="px-3 h-9 sm:h-10 rounded-lg font-bold text-xs bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 flex items-center justify-center gap-1 cursor-pointer transition-all"
                  title="Uppercase"
                >
                  <ArrowUp size={14} />
                  <span className="text-[10px]">ABC</span>
                </button>

                {qwertyLower[2].map(letter => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleCharClick(letter)}
                    className="flex-1 max-w-[42px] h-9 sm:h-10 rounded-lg bg-slate-800 hover:bg-blue-600 text-white font-bold text-sm sm:text-base border border-slate-700 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                  >
                    {letter}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleBackspace}
                  className="px-3 h-9 sm:h-10 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-400 border border-slate-700 flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  <Delete size={16} />
                </button>
              </div>

              {/* Bottom Row */}
              <div className="flex justify-center items-center gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 h-8.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleCharClick('@')}
                  className="px-3 h-8.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  @
                </button>
                <button
                  type="button"
                  onClick={handleSpace}
                  className="flex-1 h-8.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Space size={13} />
                  <span>space</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCharClick('.')}
                  className="px-3 h-8.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  .
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 h-8.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Check size={13} />
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}

          {/* UPPERCASE ABC LAYOUT */}
          {layoutMode === 'ABC' && (
            <div className="space-y-1">
              {/* Number bar on top */}
              <div className="flex justify-center gap-1">
                {numRow.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleCharClick(d)}
                    className="flex-1 max-w-[42px] h-8 rounded-lg bg-slate-800/90 hover:bg-blue-600 text-slate-200 hover:text-white font-bold text-xs font-mono border border-slate-700/80 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Row 1: Q W E R T Y U I O P */}
              <div className="flex justify-center gap-1">
                {qwertyUpper[0].map(letter => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleCharClick(letter)}
                    className="flex-1 max-w-[42px] h-9 sm:h-10 rounded-lg bg-slate-800 hover:bg-blue-600 text-white font-bold text-sm sm:text-base border border-slate-700 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {/* Row 2: A S D F G H J K L */}
              <div className="flex justify-center gap-1 px-3">
                {qwertyUpper[1].map(letter => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleCharClick(letter)}
                    className="flex-1 max-w-[42px] h-9 sm:h-10 rounded-lg bg-slate-800 hover:bg-blue-600 text-white font-bold text-sm sm:text-base border border-slate-700 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {/* Row 3: Shift / Z X C V B N M / Backspace */}
              <div className="flex justify-center items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLayoutMode('abc')}
                  className="px-3 h-9 sm:h-10 rounded-lg font-bold text-xs bg-amber-500 text-slate-950 border border-amber-400 flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                  title="Lowercase"
                >
                  <ArrowUp size={14} strokeWidth={3} />
                  <span className="text-[10px]">abc</span>
                </button>

                {qwertyUpper[2].map(letter => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleCharClick(letter)}
                    className="flex-1 max-w-[42px] h-9 sm:h-10 rounded-lg bg-slate-800 hover:bg-blue-600 text-white font-bold text-sm sm:text-base border border-slate-700 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                  >
                    {letter}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleBackspace}
                  className="px-3 h-9 sm:h-10 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-400 border border-slate-700 flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  <Delete size={16} />
                </button>
              </div>

              {/* Bottom Row */}
              <div className="flex justify-center items-center gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 h-8.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleCharClick('_')}
                  className="px-3 h-8.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  _
                </button>
                <button
                  type="button"
                  onClick={handleSpace}
                  className="flex-1 h-8.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Space size={13} />
                  <span>SPACE</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCharClick('#')}
                  className="px-3 h-8.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  #
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 h-8.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Check size={13} />
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}

          {/* SYMBOLS ?#$ LAYOUT */}
          {layoutMode === 'sym' && (
            <div className="space-y-1">
              {symbols1.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-center gap-1">
                  {row.map(sym => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => handleCharClick(sym)}
                      className="flex-1 max-w-[42px] h-8.5 sm:h-9.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-white font-bold text-sm sm:text-base font-mono border border-slate-700 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              ))}

              {symbols2[0].slice(0, 8).map(sym => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleCharClick(sym)}
                  className="flex-1 max-w-[42px] h-8.5 sm:h-9.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-white font-bold text-sm sm:text-base font-mono border border-slate-700 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  {sym}
                </button>
              ))}

              {/* Bottom Row */}
              <div className="flex justify-center items-center gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 h-8.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="px-4 h-8.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-400 border border-slate-700 flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  <Delete size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleSpace}
                  className="flex-1 h-8.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Space size={13} />
                  <span>space</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 h-8.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Check size={13} />
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
