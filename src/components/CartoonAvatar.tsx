import React, { useState } from 'react';

export type GenderType = 'male' | 'female' | 'auto';

// Deterministically detect gender from common Bengali/English names
export function detectGenderFromName(name?: string): 'male' | 'female' {
  if (!name) return 'male';
  const lower = name.toLowerCase().trim();

  // Common female name indicators in English/Bengali
  const femaleKeywords = [
    'akter', 'aktar', 'khatun', 'begum', 'sultana', 'jannat', 'fatema', 'fatima',
    'sadia', 'nusrat', 'mim', 'sumaiya', 'farzana', 'tania', 'marufa', 'poly',
    'ruma', 'sharmin', 'shirin', 'tasnim', 'moriyom', 'marium', 'aisha', 'marzia',
    'khadija', 'nasrin', 'rupa', 'sonia', 'nargis', 'sabina', 'priya', 'moni',
    'parvin', 'shila', 'shanta', 'mousumi', 'afroza', 'tahmina', 'rokeya', 'fahmida',
    'asma', 'salma', 'samia', 'fariha', 'anika', 'afia', 'rifa', 'sumi', 'panna',
    'eti', 'sheuly', 'shikha', 'tumpa', 'munni', 'mithila', 'urmi', 'bithi',
    'laboni', 'sohana', 'shohana', 'tamanna', 'suraiya', 'nadia', 'liza', 'lima',
    'rina', 'mina', 'shilpi', 'farhana', 'lubna', 'nazma', 'jesmin', 'jasmin',
    'hasina', 'khaleda', 'zannat', 'jannatul', 'ferdousi', 'moriom', 'meghla',
    'nipa', 'bristy', 'nodi', 'tripti', 'misti', 'pori', 'mumu', 'rima', 'dola',
    'shampa', 'setu', 'bina', 'papia', 'shathi', 'sathi', 'eva', 'mita', 'rita',
    'আক্তার', 'বেগম', 'খাতুন', 'সুলতানা', 'জান্নাত', 'ফাতিমা', 'সাদিয়া', 'নুসরাত',
    'মীম', 'মিম', 'সুমাইয়া', 'ফারজানা', 'তানিয়া', 'তানিয়া', 'রুমী', 'রুমা',
    'শারমিন', 'শিরিন', 'তাসনিম', 'মরিয়ম', 'আয়েশা', 'খাদিজা', 'নাসরিন', 'সোনিয়া',
    'পারভীন', 'শান্তা', 'মৌসুমী', 'আফরিন', 'ফারিহা', 'অনিকা', 'রিতা', 'মিতু',
    'লিজা', 'লীমা', 'রিমা', 'প্রিয়া', 'সাথী', 'মনি', 'পপি', 'রুবি', 'নাজমীন'
  ];

  for (const kw of femaleKeywords) {
    if (lower.includes(kw)) {
      return 'female';
    }
  }

  // Common male keywords
  const maleKeywords = [
    'md', 'mohammad', 'mohammed', 'ahmed', 'hossain', 'rahman', 'islam', 'hasan',
    'ali', 'uddin', 'khan', 'sheikh', 'chowdhury', 'mahmud', 'alam', 'haque',
    'mia', 'babu', 'rana', 'shohel', 'sohel', 'shakil', 'sakil', 'tanvir', 'arif',
    'sabbir', 'nahid', 'shuvo', 'suvo', 'imran', 'rakib', 'ashik', 'saiful',
    'kamrul', 'rubel', 'sohag', 'shohag', 'jahid', 'zillur', 'masud', 'alamin',
    'রাহমান', 'হোসেন', 'আহমেদ', 'হাসান', 'ইসলাম', 'খান', 'উদ্দিন', 'আলী',
    'সাকিব', 'রাকিব', 'তানভীর', 'ইমরান', 'আরিফ', 'রাব্বি', 'বাবু', 'সোহেল',
    'শাকিল', 'সোহাগ', 'শুভ', 'রুবেল', 'কামরুল', 'জাহিদ', 'মাসুদ'
  ];

  for (const kw of maleKeywords) {
    if (lower.includes(kw)) {
      return 'male';
    }
  }

  // Deterministic fallback based on name character codes
  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = (hash << 5) - hash + lower.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 2 === 0 ? 'male' : 'female';
}

export function getAvatarVariantIndex(name?: string): number {
  if (!name) return 0;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 4; // 0, 1, 2, 3
}

// 4 Boy Cartoon SVG Avatars
function BoyAvatar1() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill="#dbeafe" />
      {/* Torso & Blue Shirt */}
      <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#2563eb" />
      {/* Collar */}
      <polygon points="50,78 40,68 47,68" fill="#1d4ed8" />
      <polygon points="50,78 60,68 53,68" fill="#1d4ed8" />
      {/* Neck */}
      <rect x="44" y="58" width="12" height="15" rx="3" fill="#fbcfe8" />
      <rect x="44" y="58" width="12" height="15" rx="3" fill="#fcd34d" opacity="0.6" />
      {/* Head */}
      <ellipse cx="50" cy="45" rx="20" ry="22" fill="#fde68a" />
      {/* Ears */}
      <circle cx="30" cy="46" r="4.5" fill="#fcd34d" />
      <circle cx="70" cy="46" r="4.5" fill="#fcd34d" />
      {/* Hair (Layered Modern Dark Hair) */}
      <path d="M28 42 C28 25 36 18 50 18 C64 18 72 25 72 42 C72 32 66 26 58 26 C52 26 48 30 42 27 C36 24 30 32 28 42 Z" fill="#1e293b" />
      <path d="M38 27 C45 22 55 24 64 29 C56 25 45 25 38 27 Z" fill="#334155" />
      {/* Eyebrows */}
      <path d="M37 38 Q42 36 46 38" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M54 38 Q58 36 63 38" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      <circle cx="41" cy="43" r="3" fill="#0f172a" />
      <circle cx="40" cy="42" r="1" fill="#ffffff" />
      <circle cx="59" cy="43" r="3" fill="#0f172a" />
      <circle cx="58" cy="42" r="1" fill="#ffffff" />
      {/* Cheerful Smile */}
      <path d="M43 51 Q50 57 57 51" stroke="#b45309" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Rosy Cheeks */}
      <circle cx="36" cy="48" r="3" fill="#f87171" opacity="0.4" />
      <circle cx="64" cy="48" r="3" fill="#f87171" opacity="0.4" />
    </svg>
  );
}

function BoyAvatar2() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill="#e0e7ff" />
      {/* Torso & Teal Hoodie */}
      <path d="M20 100 C20 74 34 67 50 67 C66 67 80 74 80 100 Z" fill="#0d9488" />
      {/* Hoodie Inner Neck */}
      <path d="M38 67 Q50 82 62 67 Z" fill="#0f766e" />
      {/* Neck */}
      <rect x="44" y="56" width="12" height="14" rx="3" fill="#fed7aa" />
      {/* Head */}
      <ellipse cx="50" cy="44" rx="20" ry="21" fill="#fed7aa" />
      {/* Ears */}
      <circle cx="29" cy="45" r="4.5" fill="#fdba74" />
      <circle cx="71" cy="45" r="4.5" fill="#fdba74" />
      {/* Hair (Spiky / Quiff) */}
      <path d="M28 40 C28 22 38 15 50 15 C56 12 66 18 72 35 C70 28 62 23 52 23 C44 23 35 28 28 40 Z" fill="#292524" />
      {/* Cool Glasses */}
      <rect x="35" y="38" width="13" height="11" rx="3" fill="none" stroke="#1e293b" strokeWidth="2" />
      <rect x="52" y="38" width="13" height="11" rx="3" fill="none" stroke="#1e293b" strokeWidth="2" />
      <line x1="48" y1="43" x2="52" y2="43" stroke="#1e293b" strokeWidth="2" />
      {/* Eyes through glasses */}
      <circle cx="41.5" cy="43.5" r="2.5" fill="#1e293b" />
      <circle cx="40.5" cy="42.5" r="0.8" fill="#ffffff" />
      <circle cx="58.5" cy="43.5" r="2.5" fill="#1e293b" />
      <circle cx="57.5" cy="42.5" r="0.8" fill="#ffffff" />
      {/* Smile */}
      <path d="M44 52 Q50 58 56 52" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="36" cy="49" r="2.5" fill="#fb923c" opacity="0.4" />
      <circle cx="64" cy="49" r="2.5" fill="#fb923c" opacity="0.4" />
    </svg>
  );
}

function BoyAvatar3() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill="#fef3c7" />
      {/* Torso & Sporty Jacket */}
      <path d="M20 100 C20 74 34 68 50 68 C66 68 80 74 80 100 Z" fill="#ea580c" />
      <path d="M46 68 L46 100 L54 100 L54 68 Z" fill="#c2410c" />
      {/* Neck */}
      <rect x="44" y="58" width="12" height="14" rx="3" fill="#fed7aa" />
      {/* Head */}
      <ellipse cx="50" cy="46" rx="19.5" ry="20.5" fill="#fde68a" />
      {/* Ears */}
      <circle cx="30" cy="47" r="4.5" fill="#fcd34d" />
      <circle cx="70" cy="47" r="4.5" fill="#fcd34d" />
      {/* Baseball Cap */}
      <path d="M28 39 C28 24 38 18 50 18 C62 18 72 24 72 39 Z" fill="#1e3a8a" />
      <path d="M25 38 C32 36 68 36 78 38 C75 42 65 42 25 38 Z" fill="#172554" />
      <circle cx="50" cy="18" r="2.5" fill="#3b82f6" />
      {/* Eyes */}
      <circle cx="41" cy="45" r="2.8" fill="#0f172a" />
      <circle cx="40" cy="44" r="0.9" fill="#ffffff" />
      <circle cx="59" cy="45" r="2.8" fill="#0f172a" />
      <circle cx="58" cy="44" r="0.9" fill="#ffffff" />
      {/* Smile with teeth */}
      <path d="M42 53 Q50 61 58 53 Z" fill="#b45309" />
      <path d="M44 54 Q50 57 56 54 Z" fill="#ffffff" />
    </svg>
  );
}

function BoyAvatar4() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill="#ccfbf1" />
      {/* Torso & Formal Polo/Shirt */}
      <path d="M20 100 C20 74 34 68 50 68 C66 68 80 74 80 100 Z" fill="#4338ca" />
      {/* White Collar & Tie */}
      <polygon points="50,72 43,68 48,84" fill="#ffffff" />
      <polygon points="50,72 57,68 52,84" fill="#ffffff" />
      <polygon points="50,74 47,88 50,96 53,88" fill="#f59e0b" />
      {/* Neck */}
      <rect x="44" y="58" width="12" height="14" rx="3" fill="#fed7aa" />
      {/* Head */}
      <ellipse cx="50" cy="45" rx="19.5" ry="21" fill="#fde68a" />
      {/* Ears */}
      <circle cx="30" cy="46" r="4.5" fill="#fcd34d" />
      <circle cx="70" cy="46" r="4.5" fill="#fcd34d" />
      {/* Classic Parted Hair */}
      <path d="M28 41 C28 25 35 18 50 18 C65 18 72 25 72 41 C70 32 64 26 50 25 C40 25 34 30 28 41 Z" fill="#171717" />
      {/* Eyebrows */}
      <path d="M37 39 Q42 37 46 39" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M54 39 Q58 37 63 39" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      <circle cx="41" cy="44" r="2.8" fill="#0f172a" />
      <circle cx="40" cy="43" r="0.9" fill="#ffffff" />
      <circle cx="59" cy="44" r="2.8" fill="#0f172a" />
      <circle cx="58" cy="43" r="0.9" fill="#ffffff" />
      {/* Smile */}
      <path d="M44 52 Q50 57 56 52" stroke="#b45309" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Cheeks */}
      <circle cx="36" cy="49" r="2.8" fill="#f87171" opacity="0.35" />
      <circle cx="64" cy="49" r="2.8" fill="#f87171" opacity="0.35" />
    </svg>
  );
}

// 4 Girl Cartoon SVG Avatars
function GirlAvatar1() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill="#fce7f3" />
      {/* Hair Behind (Ponytail) */}
      <ellipse cx="68" cy="36" rx="9" ry="16" fill="#1e1b4b" transform="rotate(25 68 36)" />
      <circle cx="63" cy="27" r="4.5" fill="#ec4899" />
      {/* Torso & Pink Top */}
      <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#ec4899" />
      <path d="M42 68 Q50 78 58 68 Z" fill="#fce7f3" />
      {/* Neck */}
      <rect x="44" y="58" width="12" height="14" rx="3" fill="#fed7aa" />
      {/* Head */}
      <ellipse cx="50" cy="45" rx="19" ry="20.5" fill="#fde68a" />
      {/* Ears with Pearl Earrings */}
      <circle cx="31" cy="46" r="4" fill="#fcd34d" />
      <circle cx="31" cy="49" r="1.5" fill="#ffffff" />
      <circle cx="69" cy="46" r="4" fill="#fcd34d" />
      <circle cx="69" cy="49" r="1.5" fill="#ffffff" />
      {/* Front Hair with bangs & clip */}
      <path d="M29 42 C29 24 38 18 50 18 C62 18 71 24 71 42 C67 30 58 26 48 26 C38 26 33 32 29 42 Z" fill="#1e1b4b" />
      <circle cx="37" cy="28" r="3.5" fill="#f43f5e" />
      {/* Eyelashes & Eyes */}
      <path d="M37 39 Q41 37 45 39" stroke="#831843" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M55 39 Q59 37 63 39" stroke="#831843" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="41" cy="44" r="3" fill="#0f172a" />
      <circle cx="40" cy="43" r="1.1" fill="#ffffff" />
      <circle cx="42.2" cy="45.5" r="0.6" fill="#ffffff" />
      <circle cx="59" cy="44" r="3" fill="#0f172a" />
      <circle cx="58" cy="43" r="1.1" fill="#ffffff" />
      <circle cx="60.2" cy="45.5" r="0.6" fill="#ffffff" />
      {/* Sweet Smile */}
      <path d="M44 52 Q50 58 56 52" stroke="#be123c" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Cheerful Rosy Cheeks */}
      <circle cx="35" cy="49" r="3.5" fill="#fb7185" opacity="0.45" />
      <circle cx="65" cy="49" r="3.5" fill="#fb7185" opacity="0.45" />
    </svg>
  );
}

function GirlAvatar2() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill="#e0f2fe" />
      {/* Hijab / Scarf Outer Drapes */}
      <path d="M18 100 C18 72 32 64 50 64 C68 64 82 72 82 100 Z" fill="#0284c7" />
      {/* Head Hijab Wrap */}
      <ellipse cx="50" cy="44" rx="24" ry="27" fill="#0284c7" />
      {/* Inner Scarf Trim (Soft Teal) */}
      <ellipse cx="50" cy="45" rx="17.5" ry="21" fill="#38bdf8" />
      {/* Face Cutout */}
      <ellipse cx="50" cy="46" rx="15" ry="18" fill="#fde68a" />
      {/* Hijab Pin/Brooch */}
      <circle cx="50" cy="65" r="3" fill="#facc15" />
      <circle cx="50" cy="65" r="1.5" fill="#ffffff" />
      {/* Eyebrows */}
      <path d="M39 40 Q43 38 46 40" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M54 40 Q57 38 61 40" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Kind, expressive eyes */}
      <circle cx="42" cy="45" r="2.8" fill="#0f172a" />
      <circle cx="41" cy="44" r="1" fill="#ffffff" />
      <circle cx="58" cy="45" r="2.8" fill="#0f172a" />
      <circle cx="57" cy="44" r="1" fill="#ffffff" />
      {/* Gentle smile */}
      <path d="M45 53 Q50 58 55 53" stroke="#b45309" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Cheeks */}
      <circle cx="37" cy="50" r="3" fill="#f43f5e" opacity="0.35" />
      <circle cx="63" cy="50" r="3" fill="#f43f5e" opacity="0.35" />
    </svg>
  );
}

function GirlAvatar3() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill="#ede9fe" />
      {/* Hair Buns on top */}
      <circle cx="32" cy="24" r="9" fill="#312e81" />
      <circle cx="68" cy="24" r="9" fill="#312e81" />
      {/* Torso & Lavender/Purple Outfit */}
      <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#7c3aed" />
      {/* Neck */}
      <rect x="44" y="58" width="12" height="14" rx="3" fill="#fed7aa" />
      {/* Head */}
      <ellipse cx="50" cy="45" rx="19" ry="20" fill="#fde68a" />
      {/* Ears */}
      <circle cx="31" cy="46" r="4" fill="#fcd34d" />
      <circle cx="69" cy="46" r="4" fill="#fcd34d" />
      {/* Hair Bangs */}
      <path d="M30 40 C30 25 38 20 50 20 C62 20 70 25 70 40 C66 30 58 27 50 27 C42 27 34 30 30 40 Z" fill="#312e81" />
      {/* Round Glasses */}
      <circle cx="41" cy="43.5" r="6.5" fill="none" stroke="#6d28d9" strokeWidth="1.8" />
      <circle cx="59" cy="43.5" r="6.5" fill="none" stroke="#6d28d9" strokeWidth="1.8" />
      <line x1="47.5" y1="43.5" x2="52.5" y2="43.5" stroke="#6d28d9" strokeWidth="1.8" />
      {/* Eyes */}
      <circle cx="41" cy="43.5" r="2.8" fill="#0f172a" />
      <circle cx="40" cy="42.5" r="1" fill="#ffffff" />
      <circle cx="59" cy="43.5" r="2.8" fill="#0f172a" />
      <circle cx="58" cy="42.5" r="1" fill="#ffffff" />
      {/* Cheerful Smile */}
      <path d="M44 53 Q50 59 56 53" stroke="#b45309" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Rosy Cheeks */}
      <circle cx="34" cy="49" r="3" fill="#ec4899" opacity="0.45" />
      <circle cx="66" cy="49" r="3" fill="#ec4899" opacity="0.45" />
    </svg>
  );
}

function GirlAvatar4() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill="#fef08a" />
      {/* Wavy long hair back */}
      <path d="M25 45 C20 60 22 80 27 90 C32 85 30 65 32 55 Z" fill="#451a03" />
      <path d="M75 45 C80 60 78 80 73 90 C68 85 70 65 68 55 Z" fill="#451a03" />
      {/* Torso & Sunny Coral Top */}
      <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#059669" />
      {/* Neck */}
      <rect x="44" y="58" width="12" height="14" rx="3" fill="#fed7aa" />
      {/* Head */}
      <ellipse cx="50" cy="45" rx="19" ry="20" fill="#fde68a" />
      {/* Ears with flower earring */}
      <circle cx="31" cy="46" r="4" fill="#fcd34d" />
      <circle cx="69" cy="46" r="4" fill="#fcd34d" />
      {/* Hair (Wavy Shoulder Length) */}
      <path d="M28 42 C28 24 38 18 50 18 C62 18 72 24 72 42 C68 29 58 26 48 26 C38 26 32 31 28 42 Z" fill="#451a03" />
      {/* Sunflower hairpin */}
      <circle cx="65" cy="30" r="4.5" fill="#f59e0b" />
      <circle cx="65" cy="30" r="2" fill="#78350f" />
      {/* Eyelashes & Eyes */}
      <path d="M37 39 Q41 37 45 39" stroke="#78350f" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M55 39 Q59 37 63 39" stroke="#78350f" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="41" cy="44" r="2.8" fill="#0f172a" />
      <circle cx="40" cy="43" r="1" fill="#ffffff" />
      <circle cx="59" cy="44" r="2.8" fill="#0f172a" />
      <circle cx="58" cy="43" r="1" fill="#ffffff" />
      {/* Sweet Smile */}
      <path d="M43 52 Q50 58 57 52" stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx="35" cy="49" r="3" fill="#f87171" opacity="0.4" />
      <circle cx="65" cy="49" r="3" fill="#f87171" opacity="0.4" />
    </svg>
  );
}

export const CARTOON_AVATAR_LIST = [
  { id: 'boy-1', label: 'স্মার্ট বয় ১', gender: 'male', component: BoyAvatar1 },
  { id: 'boy-2', label: 'কুল চশমা বয়', gender: 'male', component: BoyAvatar2 },
  { id: 'boy-3', label: 'স্পোর্টি বয়', gender: 'male', component: BoyAvatar3 },
  { id: 'boy-4', label: 'প্রফেশনাল বয়', gender: 'male', component: BoyAvatar4 },
  { id: 'girl-1', label: 'স্মার্ট গার্ল ১', gender: 'female', component: GirlAvatar1 },
  { id: 'girl-2', label: 'হিজাব গার্ল', gender: 'female', component: GirlAvatar2 },
  { id: 'girl-3', label: 'চশমা গার্ল', gender: 'female', component: GirlAvatar3 },
  { id: 'girl-4', label: 'হাস্যোজ্জ্বল গার্ল', gender: 'female', component: GirlAvatar4 },
] as const;

export function renderCartoonSvg(gender: 'male' | 'female', variant: number) {
  const v = Math.abs(variant) % 4;
  if (gender === 'female') {
    switch (v) {
      case 0: return <GirlAvatar1 />;
      case 1: return <GirlAvatar2 />;
      case 2: return <GirlAvatar3 />;
      case 3: return <GirlAvatar4 />;
      default: return <GirlAvatar1 />;
    }
  } else {
    switch (v) {
      case 0: return <BoyAvatar1 />;
      case 1: return <BoyAvatar2 />;
      case 2: return <BoyAvatar3 />;
      case 3: return <BoyAvatar4 />;
      default: return <BoyAvatar1 />;
    }
  }
}

interface CartoonAvatarProps {
  src?: string | null;
  name?: string;
  gender?: GenderType;
  className?: string;
  alt?: string;
}

export const CartoonAvatar: React.FC<CartoonAvatarProps> = ({
  src,
  name,
  gender = 'auto',
  className = '',
  alt = 'Avatar'
}) => {
  const [loadError, setLoadError] = useState(false);

  // If a cartoon avatar ID was explicitly selected (e.g. "cartoon:boy-1")
  if (src && src.startsWith('cartoon:')) {
    const cartoonId = src.replace('cartoon:', '');
    const found = CARTOON_AVATAR_LIST.find(c => c.id === cartoonId);
    if (found) {
      const Comp = found.component;
      return (
        <div className={`w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}>
          <Comp />
        </div>
      );
    }
  }

  // If a real profile picture (URL or base64) exists and hasn't errored out
  if (src && !loadError && (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/'))) {
    return (
      <img
        src={src}
        alt={alt || name || 'User Profile'}
        className={`w-full h-full object-cover select-none ${className}`}
        referrerPolicy="no-referrer"
        onError={() => setLoadError(true)}
      />
    );
  }

  // Fallback: Automatic friendly Boy/Girl Cartoon Avatar based on Name
  const resolvedGender: 'male' | 'female' = 
    (gender === 'male' || gender === 'female') ? gender : detectGenderFromName(name);
  const variantIndex = getAvatarVariantIndex(name);

  return (
    <div className={`w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}>
      {renderCartoonSvg(resolvedGender, variantIndex)}
    </div>
  );
};

export default CartoonAvatar;
