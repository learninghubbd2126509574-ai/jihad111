import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Home, 
  ExternalLink, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  Sparkles,
  MessageCircle,
  Video,
  FileSpreadsheet,
  Globe,
  Wallet,
  ShieldAlert,
  Search
} from 'lucide-react';

export interface QuickLinkItem {
  id: string;
  name: string;
  url: string;
  category?: string;
  description?: string;
  color?: string;
}

interface QuickLinksModalProps {
  links: any[];
  onClose: () => void;
}

// Preset verified default resources to ensure the modal is always rich, beautiful, and functional
const DEFAULT_PRESET_LINKS: QuickLinkItem[] = [
  {
    id: 'preset-1',
    name: 'উইথড্র ও পেমেন্ট রিকুয়েস্ট পোর্টাল',
    url: 'https://withdraw-request.vercel.app/',
    category: 'পেমেন্ট ও উইথড্র',
    description: 'দৈনিক ও সাপ্তাহিক উইথড্র সাবমিট করার অফিসিয়াল পোর্টাল'
  },
  {
    id: 'preset-2',
    name: 'Unity Earning সাপোর্ট ও হেল্প গ্রুপ',
    url: 'https://chat.whatsapp.com/',
    category: 'কমিউনিটি',
    description: 'টিম লিডার এবং ট্রেনারদের অফিশিয়াল সাপোর্ট গ্রুপ'
  },
  {
    id: 'preset-3',
    name: 'কাজের ভিডিও টিউটোরিয়াল ও ট্রেইনিং ড্রাইভ',
    url: 'https://drive.google.com/',
    category: 'ট্রেইনিং ও রিসোর্স',
    description: 'নতুন কাজের নির্দেশিকা, ক্লাস রেকর্ডিং ও গাইডলাইন'
  },
  {
    id: 'preset-4',
    name: 'রেজাল্ট ও হিসাব শিট লাইভ ব্যাকআপ',
    url: 'https://docs.google.com/spreadsheets/',
    category: 'হিসাব শিট',
    description: 'সর্বশেষ টিম পারফরম্যান্স ও রেজাল্ট শিট ব্যাকআপ'
  },
  {
    id: 'preset-5',
    name: 'Unity Earning অফিশিয়াল ফেসবুক পেজ',
    url: 'https://facebook.com/',
    category: 'সোশ্যাল মিডিয়া',
    description: 'সকল জরুরি নোটিশ ও অফিশিয়াল আপডেট পাওয়ার পেজ'
  },
  {
    id: 'preset-6',
    name: 'জরুরি টেলিগ্রাম চ্যানেল ও নোটিশ বোর্ড',
    url: 'https://t.me/',
    category: 'নোটিশ ও আপডেট',
    description: 'লাইভ মিটিং ও ইভেন্ট নোটিফিকেশন চ্যানেল'
  }
];

// Color palette styles for uniform cards - each card has a distinct beautiful color
const COLOR_THEMES = [
  {
    bg: 'bg-blue-50/80',
    border: 'border-blue-200 hover:border-blue-400',
    iconBg: 'bg-blue-600 text-white',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25',
    pill: 'text-blue-700'
  },
  {
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-200 hover:border-emerald-400',
    iconBg: 'bg-emerald-600 text-white',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25',
    pill: 'text-emerald-700'
  },
  {
    bg: 'bg-purple-50/80',
    border: 'border-purple-200 hover:border-purple-400',
    iconBg: 'bg-purple-600 text-white',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    btn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25',
    pill: 'text-purple-700'
  },
  {
    bg: 'bg-amber-50/80',
    border: 'border-amber-200 hover:border-amber-400',
    iconBg: 'bg-amber-600 text-white',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/25',
    pill: 'text-amber-700'
  },
  {
    bg: 'bg-rose-50/80',
    border: 'border-rose-200 hover:border-rose-400',
    iconBg: 'bg-rose-600 text-white',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    btn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25',
    pill: 'text-rose-700'
  },
  {
    bg: 'bg-indigo-50/80',
    border: 'border-indigo-200 hover:border-indigo-400',
    iconBg: 'bg-indigo-600 text-white',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25',
    pill: 'text-indigo-700'
  },
  {
    bg: 'bg-teal-50/80',
    border: 'border-teal-200 hover:border-teal-400',
    iconBg: 'bg-teal-600 text-white',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    btn: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/25',
    pill: 'text-teal-700'
  },
  {
    bg: 'bg-cyan-50/80',
    border: 'border-cyan-200 hover:border-cyan-400',
    iconBg: 'bg-cyan-600 text-white',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    btn: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-500/25',
    pill: 'text-cyan-700'
  }
];

export const QuickLinksModal: React.FC<QuickLinksModalProps> = ({ links, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Merge database quickLinks with presets if none exist, or prioritize custom ones
  const allLinks = React.useMemo(() => {
    if (links && links.length > 0) {
      // Map custom links
      const customList = links.map(l => ({
        id: l.id,
        name: l.name,
        url: l.url,
        category: 'কাস্টম লিংক',
        description: l.url.replace(/^https?:\/\//, '')
      }));

      // Combine with presets avoiding duplicate URLs
      const existingUrls = new Set(customList.map(c => c.url.toLowerCase().trim()));
      const filteredPresets = DEFAULT_PRESET_LINKS.filter(p => !existingUrls.has(p.url.toLowerCase().trim()));
      return [...customList, ...filteredPresets];
    }
    return DEFAULT_PRESET_LINKS;
  }, [links]);

  const filteredLinks = React.useMemo(() => {
    if (!searchQuery.trim()) return allLinks;
    const q = searchQuery.toLowerCase().trim();
    return allLinks.filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.url.toLowerCase().includes(q) || 
      (l.category && l.category.toLowerCase().includes(q))
    );
  }, [allLinks, searchQuery]);

  const handleCopy = (url: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6">
      {/* Soft blurred background overlay */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
      />

      <motion.div 
        initial={{ y: 30, opacity: 0, scale: 0.95 }} 
        animate={{ y: 0, opacity: 1, scale: 1 }} 
        exit={{ y: 30, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative bg-[#f8fafc] border border-slate-200/90 rounded-3xl p-5 sm:p-7 max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Accent top gradient bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600" />
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl neu-btn-primary flex items-center justify-center text-white shadow-md">
              <Home size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  জরুরি লিংক ও রিসোর্স হাব
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Quick Access
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                প্রয়োজনীয় প্ল্যাটফর্ম, গ্রুপ ও ফাইলগুলোর শর্টকাট
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="w-9 h-9 rounded-xl neu-btn text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all active:scale-95 shrink-0"
            title="বন্ধ করুন"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search / Filter Bar */}
        <div className="my-3.5 relative shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="লিংক বা ক্যাটাগরি খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Beautiful Patterned Grid of Equal Cards with Distinct Colors */}
        <div className="overflow-y-auto pr-1 pb-3 custom-scrollbar flex-1">
          {filteredLinks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 italic text-slate-500 text-xs">
              কোনো লিংক পাওয়া যায়নি...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              {filteredLinks.map((link, idx) => {
                const theme = COLOR_THEMES[idx % COLOR_THEMES.length];
                const isCopied = copiedId === link.id;

                return (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`group relative p-3.5 sm:p-4 rounded-2xl border ${theme.border} ${theme.bg} transition-all duration-200 hover:shadow-md flex flex-col justify-between`}
                  >
                    <div>
                      {/* Card Top: Icon & Category Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme.iconBg} shadow-sm shrink-0`}>
                          <LinkIcon size={17} />
                        </div>
                        {link.category && (
                          <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-bold border ${theme.badge}`}>
                            {link.category}
                          </span>
                        )}
                      </div>

                      {/* Card Title & Description */}
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
                        {link.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 font-medium">
                        {link.description || link.url.replace(/^https?:\/\//, '')}
                      </p>
                    </div>

                    {/* Bottom Actions: Open & Copy Link */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleCopy(link.url, link.id, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-all text-[11px] flex items-center gap-1 font-medium"
                        title="লিংক কপি করুন"
                      >
                        {isCopied ? (
                          <>
                            <Check size={13} className="text-emerald-600" />
                            <span className="text-emerald-700 text-[10px] font-bold">কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span className="text-[10px]">কপি</span>
                          </>
                        )}
                      </button>

                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${theme.btn}`}
                      >
                        <span>ওপেন করুন</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info & close */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <p className="text-[10px] text-slate-500 font-medium">
            💡 মোট {filteredLinks.length}টি প্রয়োজনীয় লিংক তালিকাভুক্ত
          </p>
          <button 
            type="button"
            onClick={onClose}
            className="neu-btn text-slate-700 font-bold px-4 py-1.5 rounded-xl text-xs hover:text-slate-900 active:scale-95 transition-all"
          >
            বন্ধ করুন
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuickLinksModal;
