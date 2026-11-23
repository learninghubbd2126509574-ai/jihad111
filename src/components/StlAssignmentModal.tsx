import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Check,
  Users,
  Save,
  UserCheck,
  TrendingUp
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTlIds, setSelectedTlIds] = useState<string[]>(() => stl?.assignedTLs || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && stl) {
      setSelectedTlIds(stl.assignedTLs || []);
      setSearchQuery('');
    }
  }, [isOpen, stl]);

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

  const filteredLeaders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return teamLeaders;
    return teamLeaders.filter(tl =>
      tl.name.toLowerCase().includes(q) ||
      (tl.whatsapp && tl.whatsapp.includes(q))
    );
  }, [teamLeaders, searchQuery]);

  const currentTotalConvert = useMemo(() => {
    return selectedTlIds.reduce((sum, tlId) => {
      const data = resolveTLConvertData(tlId, teamLeaders, leaderRanking, results);
      return sum + data.convert;
    }, 0);
  }, [selectedTlIds, results, teamLeaders, leaderRanking]);

  if (!isOpen || !stl) return null;

  const toggleTL = (tlId: string) => {
    setSelectedTlIds(prev =>
      prev.includes(tlId) ? prev.filter(id => id !== tlId) : [...prev, tlId]
    );
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
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/45 modal-fade"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] modal-scale"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#0B4F9C] flex items-center justify-center text-white shrink-0">
              <Users size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#0F172A] truncate">
                {formattedStlName} — TL Assignment
              </h3>
              <p className="text-xs text-[#64748B] truncate">
                Select Team Leaders to assign
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg bg-white border border-[#E5E7EB] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Summary Banner */}
        <div className="px-5 py-3 bg-[#EEF5FF] border-b border-[#D6E6FF] flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
            <UserCheck size={15} className="text-[#0B4F9C]" />
            <span>Selected:</span>
            <span className="font-mono tabular-nums font-bold text-[#0B4F9C]">
              {selectedTlIds.length} TL
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
            <TrendingUp size={15} className="text-[#047857]" />
            <span>Total Convert:</span>
            <span className="font-mono tabular-nums font-bold text-[#047857]">
              {currentTotalConvert} Convert
            </span>
          </div>
        </div>

        {/* Search & Quick Toggles */}
        <div className="p-4 border-b border-[#E5E7EB] bg-white space-y-2.5">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Team Leader by name..."
              className="w-full pl-9 pr-9 py-2 rounded-xl fintech-input text-xs text-[#0F172A]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748B] font-medium">
              Total TLs: <strong className="font-mono tabular-nums text-[#0F172A]">{teamLeaders.length}</strong>
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedTlIds(teamLeaders.map(t => t.id))}
                className="text-[#0B4F9C] font-bold hover:underline cursor-pointer"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelectedTlIds([])}
                className="text-[#DC2626] font-bold hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* TL List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar max-h-[360px] bg-[#F8FAFC]">
          {filteredLeaders.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#64748B]">
              No Team Leaders found
            </div>
          ) : (
            filteredLeaders.map(tl => {
              const isSelected = selectedTlIds.includes(tl.id);
              const otherStl = tlToStlMap.get(tl.id);
              const isUnderAnotherStl = otherStl && otherStl.stlId !== stl.id;
              const converts = resolveTLConvertData(tl.id, teamLeaders, leaderRanking, results, tl).convert;

              return (
                <div
                  key={tl.id}
                  onClick={() => toggleTL(tl.id)}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer select-none flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#EEF5FF] border-[#0B4F9C]'
                      : 'bg-white border-[#E5E7EB] hover:border-[#CBD5E1]'
                  }`}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#0B4F9C] text-white' : 'border border-[#CBD5E1] bg-white'
                      }`}
                    >
                      {isSelected && <Check size={13} />}
                    </div>

                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#F4F6F9] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                      <CartoonAvatar src={tl.profilePic} name={tl.name} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[#0F172A] text-sm truncate">
                        {tl.name}
                      </div>
                      {isUnderAnotherStl && (
                        <p className="text-[11px] font-medium text-[#B45309]">
                          Currently assigned to {otherStl.stlName}
                        </p>
                      )}
                      {isSelected && !isUnderAnotherStl && (
                        <p className="text-[11px] font-medium text-[#0B4F9C]">
                          Assigned to this STL
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-semibold text-[#64748B]">Convert</div>
                    <div className="text-sm font-bold font-mono tabular-nums text-[#047857]">
                      {converts}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E7EB] bg-white flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#F4F6F9] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-xs font-bold text-[#334155] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save size={15} />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
