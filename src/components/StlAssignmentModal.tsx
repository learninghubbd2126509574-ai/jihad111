import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Check, 
  Users, 
  CheckSquare, 
  Square, 
  Sparkles, 
  AlertCircle,
  Save,
  UserCheck
} from 'lucide-react';
import CartoonAvatar from './CartoonAvatar';
import { STLMember, Member, Result, RankingMember, formatStlDisplayName, resolveTLConvertData } from './StlWiseResultSection';

interface StlAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  stl: STLMember | null;
  allStls: STLMember[];
  teamLeaders: Member[];
  leaderRanking?: RankingMember[];
  results: Record<string, Result>;
  onSave: (stlId: string, assignedTlIds: string[]) => Promise<void>;
}

export default function StlAssignmentModal({
  isOpen,
  onClose,
  stl,
  allStls,
  teamLeaders,
  leaderRanking = [],
  results,
  onSave
}: StlAssignmentModalProps) {
  if (!isOpen || !stl) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTlIds, setSelectedTlIds] = useState<string[]>(() => {
    return stl.assignedTLs || [];
  });
  const [isSaving, setIsSaving] = useState(false);

  // Map to find which STL currently holds each TL
  const tlToStlMap = useMemo(() => {
    const map = new Map<string, { stlId: string; stlName: string }>();
    allStls.forEach(otherStl => {
      (otherStl.assignedTLs || []).forEach(tlId => {
        map.set(tlId, {
          stlId: otherStl.id,
          stlName: formatStlDisplayName(otherStl.name)
        });
      });
    });
    return map;
  }, [allStls]);

  // Filtered Team Leaders list by search query
  const filteredLeaders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return teamLeaders;
    return teamLeaders.filter(tl => 
      tl.name.toLowerCase().includes(q) || 
      (tl.whatsapp && tl.whatsapp.includes(q))
    );
  }, [teamLeaders, searchQuery]);

  // Total converts of currently selected TLs
  const currentTotalConvert = useMemo(() => {
    return selectedTlIds.reduce((sum, tlId) => {
      const data = resolveTLConvertData(tlId, teamLeaders, leaderRanking, results);
      return sum + data.convert;
    }, 0);
  }, [selectedTlIds, results, teamLeaders, leaderRanking]);

  const toggleTL = (tlId: string) => {
    setSelectedTlIds(prev => {
      if (prev.includes(tlId)) {
        return prev.filter(id => id !== tlId);
      } else {
        return [...prev, tlId];
      }
    });
  };

  const handleSelectAll = () => {
    const allIds = teamLeaders.map(t => t.id);
    setSelectedTlIds(allIds);
  };

  const handleClearAll = () => {
    setSelectedTlIds([]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(stl.id, selectedTlIds);
      onClose();
    } catch (err) {
      console.error('Failed to save assignments:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const formattedStlName = formatStlDisplayName(stl.name);

  return (
    <div 
      className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#dce7f4] border border-blue-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-blue-200/80 bg-white/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl neu-btn-primary flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <Users size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-[#090d16] truncate">
                {formattedStlName} এ TL এসাইন
              </h3>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                টিম লিডারদের সিলেক্ট করুন (Convert যোগ হবে)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl neu-card-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-blue-50/70 border-b border-blue-200/70 flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <UserCheck size={15} className="text-blue-600" />
            <span>সিলেক্টেড: </span>
            <span className="neu-card-sm px-2 py-0.5 rounded-md text-blue-700 font-black">
              {selectedTlIds.length} জন TL
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Sparkles size={14} className="text-amber-500" />
            <span>STL Convert হবে: </span>
            <span className="neu-card-sm px-2.5 py-0.5 rounded-md text-emerald-700 font-black bg-emerald-50">
              {currentTotalConvert} Convert
            </span>
          </div>
        </div>

        {/* Search Bar & Quick Toggles */}
        <div className="p-3 sm:p-4 border-b border-blue-200/60 bg-[#e7eff8] space-y-2.5">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="টিম লিডারের নাম দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 rounded-xl neu-inset bg-white/70 border border-blue-200 text-xs text-[#090d16] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">
              মোট TL: {teamLeaders.length} জন
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-blue-700 font-bold hover:underline"
              >
                সব সিলেক্ট
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-red-600 font-bold hover:underline"
              >
                সব মুছুন
              </button>
            </div>
          </div>
        </div>

        {/* TL List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 custom-scrollbar max-h-[380px]">
          {filteredLeaders.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 italic">
              কোনো টিম লিডার পাওয়া যায়নি
            </div>
          ) : (
            filteredLeaders.map(tl => {
              const isSelected = selectedTlIds.includes(tl.id);
              const otherStl = tlToStlMap.get(tl.id);
              const isUnderAnotherStl = otherStl && otherStl.stlId !== stl.id;
              const tlData = resolveTLConvertData(tl.id, teamLeaders, leaderRanking, results, tl);
              const converts = tlData.convert;

              return (
                <div
                  key={tl.id}
                  onClick={() => toggleTL(tl.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                    isSelected 
                      ? 'neu-card bg-blue-50/90 border-blue-400 ring-1 ring-blue-300' 
                      : 'neu-card-sm bg-white/70 border-slate-200/80 hover:border-blue-200'
                  }`}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                >
                  {/* Left info & Checkbox */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check size={14} />}
                    </div>

                    <div className="w-8 h-8 rounded-xl overflow-hidden neu-card-sm flex items-center justify-center flex-shrink-0 border border-blue-200/80">
                      <CartoonAvatar src={tl.profilePic} name={tl.name} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-black text-[#090d16] text-xs sm:text-sm tracking-tight truncate">
                        {tl.name}
                      </div>
                      
                      {/* Subtitle / Status */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        {isUnderAnotherStl && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            বর্তমানে {otherStl.stlName}-এ আছে
                          </span>
                        )}
                        {isSelected && !isUnderAnotherStl && (
                          <span className="text-[9px] font-bold text-blue-700">
                            ✓ এই STL-এ যুক্ত
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right convert score */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400">
                      Convert
                    </div>
                    <div className="text-xs sm:text-sm font-black text-emerald-700">
                      {converts}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-blue-200/80 bg-white/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="neu-btn px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
          >
            বাতিল
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="neu-btn-primary text-white font-black px-6 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            <Save size={15} />
            <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'এসাইনমেন্ট সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
