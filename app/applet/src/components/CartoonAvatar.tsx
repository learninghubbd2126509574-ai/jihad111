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
  return Math.abs(hash) % 4;
}

// 4 Japanese Anime Boy Avatars
function AnimeBoy1() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ab1Bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#bfdbfe" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#ab1Bg)" />
      <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#1e40af" />
      <polygon points="50,78 40,68 47,68" fill="#1d4ed8" />
      <polygon points="50,78 60,68 53,68" fill="#1d4ed8" />
      <path d="M47 78 L53 78 L52 90 L48 90 Z" fill="#ffffff" />
      <rect x="44" y="58" width="12" height="15" rx="3" fill="#fde68a" />
      <ellipse cx="50" cy="45" rx="20" ry="22" fill="#fef3c7" />
      <path d="M28 44 C26 24 36 15 50 15 C64 15 74 24 72 44 C72 32 66 22 56 22 C46 22 34 26 28 44 Z" fill="#0f172a" />
      <path d="M36 24 C45 18 58 19 66 27 C58 22 45 22 36 24 Z" fill="#334155" />
      <ellipse cx="40.5" cy="44" rx="3.5" ry="4.5" fill="#1e3a8a" />
      <ellipse cx="59.5" cy="44" rx="3.5" ry="4.5" fill="#1e3a8a" />
      <circle cx="41.5" cy="42.5" r="1.5" fill="#ffffff" />
      <circle cx="60.5" cy="42.5" r="1.5" fill="#ffffff" />
      <path d="M36 37 Q41 35 45 38" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M55 38 Q59 35 64 37" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M44 53 Q50 58 56 53" stroke="#b45309" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="35" cy="49" r="3" fill="#f87171" opacity="0.35" />
      <circle cx="65" cy="49" r="3" fill="#f87171" opacity="0.35" />
    </svg>
  );
}

function AnimeBoy2() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ab2Bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ccfbf1" />
          <stop offset="100%" stopColor="#99f6e4" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#ab2Bg)" />
      <path d="M20 100 C20 74 34 67 50 67 C66 67 80 74 80 100 Z" fill="#0f766e" />
      <path d="M38 67 Q50 82 62 67 Z" fill="#115e59" />
      <rect x="44" y="56" width="12" height="14" rx="3" fill="#fed7aa" />
      <ellipse cx="50" cy="44" rx="20" ry="21" fill="#fed7aa" />
      <path d="M28 42 C28 22 38 14 50 14 C62 14 72 22 72 42 C68 28 60 20 50 20 C40 20 32 28 28 42 Z" fill="#475569" />
      <path d="M35 22 C45 17 58 17 65 24 C55 19 45 19 35 22 Z" fill="#94a3b8" />
      <ellipse cx="41" cy="43" rx="3.2" ry="4" fill="#065f46" />
      <ellipse cx="59" cy="43" rx="3.2" ry="4" fill="#065f46" />
      <circle cx="42" cy="41.5" r="1.3" fill="#ffffff" />
      <circle cx="60" cy="41.5" r="1.3" fill="#ffffff" />
      <path d="M37 36 Q41 34 45.5 37" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M54.5 37 Q59 34 63 36" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M44 52 Q50 57 56 52" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="36" cy="49" r="2.5" fill="#f43f5e" opacity="0.3" />
      <circle cx="64" cy="49" r="2.5" fill="#f43f5e" opacity="0.3" />
    </svg>
  );
}

function AnimeBoy3() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ab3Bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#ab3Bg)" />
      <path d="M20 100 C20 74 34 68 50 68 C66 68 80 74 80 100 Z" fill="#c2410c" />
      <path d="M46 68 L46 100 L54 100 L54 68 Z" fill="#9a3412" />
      <rect x="44" y="58" width="12" height="14" rx="3" fill="#fed7aa" />
      <ellipse cx="50" cy="46" rx="19.5" ry="20.5" fill="#fde68a" />
      <path d="M28 40 C28 22 38 14 50 14 C62 14 72 22 72 40 C70 26 62 18 50 18 C38 18 30 26 28 40 Z" fill="#b45309" />
      <path d="M35 20 C45 15 58 15 65 22 C55 18 45 18 35 20 Z" fill="#f59e0b" />
      <ellipse cx="41" cy="45" rx="3.2" ry="4" fill="#78350f" />
      <ellipse cx="59" cy="45" rx="3.2" ry="4" fill="#78350f" />
      <circle cx="42" cy="43.5" r="1.3" fill="#ffffff" />
      <circle cx="60" cy="43.5" r="1.3" fill="#ffffff" />
      <path d="M37 38 Q41 36 45 38.5" stroke="#451a03" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M55 38.5 Q59 36 63 38" stroke="#451a03" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M43 53 Q50 60 57 53 Z" fill="#78350f" />
      <path d="M45 54 Q50 57 55 54 Z" fill="#ffffff" />
    </svg>
  );
}

function AnimeBoy4() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ab4Bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="100%" stopColor="#ddd6fe" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#ab4Bg)" />
      <path d="M20 100 C20 74 34 68 50 68 C66 68 80 74 80 100 Z" fill="#6d28d9" />
      <polygon points="50,72 42,68 47,84" fill="#ffffff" />
      <polygon points="50,72 58,68 53,84" fill="#ffffff" />
      <polygon points="50,75 48,90 50,96 52,90" fill="#f43f5e" />
      <rect x="44" y="58" width="12" height="14" rx="3" fill="#fed7aa" />
      <ellipse cx="50" cy="45" rx="19.5" ry="21" fill="#fed7aa" />
      <path d="M28 41 C28 24 36 16 50 16 C64 16 72 24 72 41 C70 28 62 20 50 20 C38 20 30 28 28 41 Z" fill="#312e81" />
      <path d="M35 21 C45 17 58 17 65 23 C55 19 45 19 35 21 Z" fill="#4f46e5" />
      <ellipse cx="41" cy="44" rx="3.2" ry="4" fill="#3b0764" />
      <ellipse cx="59" cy="44" rx="3.2" ry="4" fill="#3b0764" />
      <circle cx="42" cy="42.5" r="1.3" fill="#ffffff" />
      <circle cx="60" cy="42.5" r="1.3" fill="#ffffff" />
      <path d="M37 38 Q41 36 45 38.5" stroke="#1e1b4b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M55 38.5 Q59 36 63 38" stroke="#1e1b4b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M44 52 Q50 57 56 52" stroke="#581c87" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="36" cy="48" r="2.8" fill="#f43f5e" opacity="0.35" />
      <circle cx="64" cy="48" r="2.8" fill="#f43f5e" opacity="0.35" />
    </svg>
  );
}

// 4 Japanese Anime Girl Avatars
function AnimeGirl1() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ag1Bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fce7f3" />
          <stop offset="100%" stopColor="#fbcfe8" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#ag1Bg)" />
      <ellipse cx="68" cy="36" rx="9" ry="17" fill="#831843" transform="rotate(25 68 36)" />
      <circle cx="63" cy="27" r="4.5" fill="#ec4899" />
      <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#db2777" />
      <path d="M42 68 Q50 78 58 68 Z" fill="#fce7f3" />
      <rect x="44" y="58" width="12" height="14" rx="3" fill="#fed7aa" />
      <ellipse cx="50" cy="45" rx="19" ry="20.5" fill="#fef3c7" />
      <path d="M29 42 C29 23 38 17 50 17 C62 17 71 23 71 42 C67 28 58 24 48 24 C38 24 33 28 29 42 Z" fill="#831843" />
      <path d="M35 22 C45 17 58 17 65 24 C55 19 45 19 35 22 Z" fill="#db2777" />
      <ellipse cx="41" cy="44" rx="3.5" ry="4.5" fill="#9d174d" />
      <ellipse cx="59" cy="44" rx="3.5" ry="4.5" fill="#9d174d" />
      <circle cx="42" cy="42.5" r="1.4" fill="#ffffff" />
      <circle cx="60" cy="42.5" r="1.4" fill="#ffffff" />
      <path d="M37 38 Q41 36 45 38.5" stroke="#831843" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M55 38.5 Q59 36 63 38" stroke="#831843" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M44 52 Q50 58 56 52" stroke="#be123c" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx="35" cy="49" r="3.5" fill="#fb7185" opacity="0.5" />
      <circle cx="65" cy="49" r="3.5" fill="#fb7185" opacity="0.5" />
    </svg>
  );
}

function AnimeGirl2() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ag2Bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#ag2Bg)" />
      <path d="M18 100 C18 72 32 64 50 64 C68 64 82 72 82 100 Z" fill="#0284c7" />
      <ellipse cx="50" cy="44" rx="24" ry="27" fill="#0284c7" />
      <ellipse cx="50" cy="45" rx="17.5" ry="21" fill="#38bdf8" />
      <ellipse cx="50" cy="46" rx="15" ry="18" fill="#fef3c7" />
      <circle cx="50" cy="65" r="3" fill="#facc15" />
      <ellipse cx="42" cy="45" rx="3.2" ry="4" fill="#0369a1" />
      <ellipse cx="58" cy="45" rx="3.2" ry="4" fill="#0369a1" />
      <circle cx="43" cy="43.5" r="1.3" fill="#ffffff" />
      <circle cx="59" cy="43.5" r="1.3" fill="#ffffff" />
      <path d="M38 40 Q42 38 46 40" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M54 40 Q58 38 62 40" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M45 53 Q50 58 55 53" stroke="#b45309" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="37" cy="50" r="3" fill="#f43f5e" opacity="0.4" />
      <circle cx="63" cy="50" r="3" fill="#f43f5e" opacity="0.4" />
    </svg>
  );
}

function AnimeGirl3() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ag3Bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3e8ff" />
          <stop offset="100%" stopColor="#e9d5ff" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#ag3Bg)" />
      <circle cx="31" cy="24" r="9" fill="#581c87" />
      <circle cx="69" cy="24" r="9" fill="#581c87" />
      <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#7c3aed" />
      <rect x="44" y="58" width="12" height="14" rx="3" fill="#fed7aa" />
      <ellipse cx="50" cy="45" rx="19" ry="20" fill="#fef3c7" />
      <path d="M30 40 C30 24 38 19 50 19 C62 19 70 24 70 40 C66 28 58 26 50 26 C42 26 34 28 30 40 Z" fill="#581c87" />
      <circle cx="41" cy="43.5" r="6.5" fill="none" stroke="#7c3aed" strokeWidth="1.8" />
      <circle cx="59" cy="43.5" r="6.5" fill="none" stroke="#7c3aed" strokeWidth="1.8" />
      <line x1="47.5" y1="43.5" x2="52.5" y2="43.5" stroke="#7c3aed" strokeWidth="1.8" />
      <ellipse cx="41" cy="43.5" rx="3" ry="3.8" fill="#4c1d95" />
      <ellipse cx="59" cy="43.5" rx="3" ry="3.8" fill="#4c1d95" />
      <circle cx="42" cy="42" r="1.2" fill="#ffffff" />
      <circle cx="60" cy="42" r="1.2" fill="#ffffff" />
      <path d="M44 53 Q50 59 56 53" stroke="#b45309" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="34" cy="49" r="3" fill="#ec4899" opacity="0.45" />
      <circle cx="66" cy="49" r="3" fill="#ec4899" opacity="0.45" />
    </svg>
  );
}

function AnimeGirl4() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ag4Bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#ag4Bg)" />
      <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#059669" />
      <rect x="44" y="58" width="12" height="14" rx="3" fill="#fed7aa" />
      <ellipse cx="50" cy="45" rx="19" ry="20" fill="#fef3c7" />
      <path d="M28 42 C28 24 38 18 50 18 C62 18 72 24 72 42 C68 28 58 26 48 26 C38 26 32 30 28 42 Z" fill="#78350f" />
      <circle cx="65" cy="30" r="4.5" fill="#f59e0b" />
      <circle cx="65" cy="30" r="2" fill="#78350f" />
      <ellipse cx="41" cy="44" rx="3.2" ry="4" fill="#065f46" />
      <ellipse cx="59" cy="44" rx="3.2" ry="4" fill="#065f46" />
      <circle cx="42" cy="42.5" r="1.3" fill="#ffffff" />
      <circle cx="60" cy="42.5" r="1.3" fill="#ffffff" />
      <path d="M37 39 Q41 37 45 39.5" stroke="#78350f" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M55 39.5 Q59 37 63 39" stroke="#78350f" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M43 52 Q50 58 57 52" stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx="35" cy="49" r="3" fill="#f87171" opacity="0.4" />
      <circle cx="65" cy="49" r="3" fill="#f87171" opacity="0.4" />
    </svg>
  );
}

export const CARTOON_AVATAR_LIST = [
  { id: 'anime-boy-1', label: 'Anime Boy Blue', gender: 'male', component: AnimeBoy1 },
  { id: 'anime-boy-2', label: 'Anime Boy Teal', gender: 'male', component: AnimeBoy2 },
  { id: 'anime-boy-3', label: 'Anime Boy Blond', gender: 'male', component: AnimeBoy3 },
  { id: 'anime-boy-4', label: 'Anime Boy Purple', gender: 'male', component: AnimeBoy4 },
  { id: 'anime-girl-1', label: 'Anime Girl Pink', gender: 'female', component: AnimeGirl1 },
  { id: 'anime-girl-2', label: 'Anime Girl Hijab', gender: 'female', component: AnimeGirl2 },
  { id: 'anime-girl-3', label: 'Anime Girl Glasses', gender: 'female', component: AnimeGirl3 },
  { id: 'anime-girl-4', label: 'Anime Girl Honey', gender: 'female', component: AnimeGirl4 },
] as const;

export function renderCartoonSvg(gender: 'male' | 'female', variant: number) {
  const v = Math.abs(variant) % 4;
  if (gender === 'female') {
    switch (v) {
      case 0: return <AnimeGirl1 />;
      case 1: return <AnimeGirl2 />;
      case 2: return <AnimeGirl3 />;
      case 3: return <AnimeGirl4 />;
      default: return <AnimeGirl1 />;
    }
  } else {
    switch (v) {
      case 0: return <AnimeBoy1 />;
      case 1: return <AnimeBoy2 />;
      case 2: return <AnimeBoy3 />;
      case 3: return <AnimeBoy4 />;
      default: return <AnimeBoy1 />;
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

  // Normalize old or stored avatar strings (e.g. "boy-1", "girl-1", "cartoon:boy-1") to new anime avatars
  let cleanSrc = src;
  if (cleanSrc && !cleanSrc.includes(':') && (cleanSrc.startsWith('boy-') || cleanSrc.startsWith('girl-'))) {
    cleanSrc = `cartoon:anime-${cleanSrc}`;
  } else if (cleanSrc && cleanSrc.startsWith('cartoon:')) {
    const id = cleanSrc.replace('cartoon:', '');
    if (id.startsWith('boy-') || id.startsWith('girl-')) {
      cleanSrc = `cartoon:anime-${id}`;
    }
  }

  if (cleanSrc && cleanSrc.startsWith('cartoon:')) {
    const cartoonId = cleanSrc.replace('cartoon:', '');
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
  if (cleanSrc && !loadError && (cleanSrc.startsWith('data:') || cleanSrc.startsWith('http://') || cleanSrc.startsWith('https://') || cleanSrc.startsWith('/'))) {
    return (
      <img
        src={cleanSrc}
        alt={alt || name || 'User Profile'}
        className={`block w-full h-full object-cover select-none ${className}`}
        referrerPolicy="no-referrer"
        onError={() => setLoadError(true)}
      />
    );
  }

  // Fallback: Automatic friendly Boy/Girl Japanese Anime Avatar based on Name
  const resolvedGender: 'male' | 'female' = 
    (gender === 'male' || gender === 'female') ? gender : detectGenderFromName(name);
  const variantIndex = getAvatarVariantIndex(name);

  return (
    <div className={`w-full h-full select-none overflow-hidden ${className}`}>
      {renderCartoonSvg(resolvedGender, variantIndex)}
    </div>
  );
};

export default CartoonAvatar;
