/**
 * Authentication and normalization helpers
 * Ensures support for Bengali mobile keyboards, spaces, and diverse phone number formats.
 */

export function toEnglishDigits(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return '';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  let s = String(str);
  for (let i = 0; i < 10; i++) {
    s = s.split(bnDigits[i]).join(String(i));
  }
  return s;
}

export function normalizePhoneNumber(input: string | null | undefined): string {
  if (!input) return '';
  const eng = toEnglishDigits(input);
  return eng.trim().replace(/\s+/g, '');
}

export function getCleanDigits(input: string | null | undefined): string {
  if (!input) return '';
  const eng = toEnglishDigits(input);
  return eng.replace(/[^0-9]/g, '');
}

/**
 * Generates an array of common phone number variations for Bangladesh numbers
 * e.g. 01712345678, +8801712345678, 8801712345678, 1712345678
 */
export function generatePhoneCandidates(input: string | null | undefined): string[] {
  if (!input) return [];
  const raw = String(input).trim();
  const eng = toEnglishDigits(raw);
  const digits = eng.replace(/[^0-9]/g, '');
  
  const set = new Set<string>();
  if (raw) set.add(raw);
  if (eng) set.add(eng);
  if (digits) set.add(digits);

  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    set.add(`0${last10}`);
    set.add(`+880${last10}`);
    set.add(`880${last10}`);
    set.add(last10);
  }

  return Array.from(set);
}

/**
 * Robust password comparison that accounts for:
 * - Bengali keypad digits vs standard English digits (e.g. ১২৩৪৫ vs 12345)
 * - Number type in DB vs string in input (e.g. 1234 vs "1234")
 * - Trailing or leading whitespaces
 */
export function comparePasswords(
  inputPass: string | number | null | undefined, 
  storedPass: string | number | null | undefined
): boolean {
  if (inputPass === null || inputPass === undefined || storedPass === null || storedPass === undefined) {
    return false;
  }

  const rawInput = String(inputPass).trim();
  const rawStored = String(storedPass).trim();

  // Direct match
  if (rawInput === rawStored) return true;

  // Bengali digit normalized match
  const engInput = toEnglishDigits(rawInput);
  const engStored = toEnglishDigits(rawStored);
  if (engInput === engStored) return true;

  // Case insensitive match
  if (engInput.toLowerCase() === engStored.toLowerCase()) return true;

  return false;
}
