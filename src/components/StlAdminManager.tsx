import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  UserPlus, 
  UserCheck, 
  Sparkles, 
  Check, 
  X,
  ShieldCheck,
  TrendingUp,
  Info
} from 'lucide-react';
import CartoonAvatar from './CartoonAvatar';
import { STLMember, Member, Result, formatStlDisplayName } from './StlWiseResultSection';

interface StlAdminManagerProps {
  stlMembers: STLMember[];
  registeredUsers: Array<{ fullName: string; whatsapp: string; position: string; profilePic?: string }>;
  teamLeaders: Member[];
  results: Record<string, Result>;
  onAddSTL: (name: string, target?: number) => Promise<void>;
  onDeleteSTL: (id: string) => Promise<void>;
  onOpenAssignModal: (stl: STLMember) => void;
  onRemoveTLFromSTL: (stlId: string, tlId: string) => Promise<void>;
  onUpdateTarget: (id: string, target: number) => Promise<void>;
}

export default function StlAdminManager({
  stlMembers,
  registeredUsers,
  teamLeaders,
  results,
  onAddSTL,
  onDeleteSTL,
  onOpenAssignModal,
  onRemoveTLFromSTL,
  onUpdateTarget
}: StlAdminManagerProps) {
  const [newStlName, setNewStlName] = useState('');
  const [newStlTarget, setNewStlTarget] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTargets, setEditingTargets] = useState<Record<string, string>>({});

  // Consolidated list of all registered STLs
  const allStls = useMemo(() => {
    const map = new Map<string, STLMember>();
    stlMembers.forEach(s => {
      map.set(s.name.trim().toLowerCase(), s);
    });

    registeredUsers
      .filter(u => u.position === 'STL' || u.position === 'Senior Team Leader')
      .forEach(u => {
        const key = u.fullName.trim().toLowerCase();
        if (!map.has(key)) {
          const matchedStl = stlMembers.find(s => s.name.trim().toLowerCase() === key);
          map.set(key, {
            id: `user-${u.whatsapp}`,
            name: u.fullName,
            assignedTLs: [],
            whatsapp: u.whatsapp,
            profilePic: u.profilePic,
            target: matchedStl?.target || 0
          });
        }
      });

    return Array.from(map.values());
  }, [stlMembers, registeredUsers]);

  // Lookup map for TLs
  const tlLookup = useMemo(() => {
    const map = new Map<string, Member>();
    teamLeaders.forEach(tl => {
      map.set(tl.id, tl);
      map.set(tl.name.trim().toLowerCase(), tl);
    });
    return map;
  }, [teamLeaders]);

  const handleAddSTL = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStlName.trim()) return;
    setIsAdding(true);
    try {
      await onAddSTL(newStlName.trim(), parseInt(newStlTarget) || 0);
      setNewStlName('');
      setNewStlTarget('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-[#dce7f4] border border-blue-200/90 rounded-3xl p-4 sm:p-6 shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-blue-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl neu-btn-primary flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Users size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#090d16] tracking-tight">
                STL ও Team Leader এসাইনমেন্ট
              </h3>
              <span className="neu-card-sm text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                {allStls.length} STL
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
              প্রতিটি STL এর (+) অপশনে ক্লিক করে এক বা একাধিক TL যুক্ত করুন। TL কনভার্ট স্বয়ংক্রিয়ভাবে STL-এ যোগ হবে।
            </p>
          </div>
        </div>
      </div>

      {/* Info Notice Box */}
      <div className="mb-5 p-3 sm:p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200/90 flex items-start gap-2.5 text-xs text-slate-700">
        <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-blue-950">নিয়মাবলী:</strong> কোন TL কোন STL এর অধীনে থাকবে, তা এখান থেকে (+) বাটনে ক্লিক করে এসাইন করুন। TL দের সাবমিট করা Convert সংখ্যা স্বয়ংক্রিয়ভাবে ওই STL এর রেজাল্টে (
          <code className="text-blue-800 font-bold bg-blue-100/70 px-1 py-0.5 rounded">• STL Name • X Convert</code>
          ) যোগ হবে।
        </div>
      </div>

      {/* Add New STL Input */}
      <form onSubmit={handleAddSTL} className="mb-6 flex gap-2 flex-wrap sm:flex-nowrap">
        <input
          type="text"
          value={newStlName}
          onChange={e => setNewStlName(e.target.value)}
          placeholder="নতুন STL এর নাম লিখুন (যেমন: Jihad)..."
          className="flex-1 px-4 py-2.5 rounded-2xl neu-inset bg-white/80 border border-blue-200 text-xs sm:text-sm text-[#090d16] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="number"
          value={newStlTarget}
          onChange={e => setNewStlTarget(e.target.value)}
          placeholder="টার্গেট (0)"
          className="w-24 px-3 py-2.5 rounded-2xl neu-inset bg-white/80 border border-blue-200 text-xs sm:text-sm text-[#090d16] text-center placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          min="0"
        />
        <button
          type="submit"
          disabled={isAdding || !newStlName.trim()}
          className="neu-btn-primary text-white font-black px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50 shadow-md"
        >
          <Plus size={16} />
          <span>STL যোগ</span>
        </button>
      </form>

      {/* STL List */}
      <div className="space-y-3.5">
        {allStls.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 italic neu-inset rounded-2xl bg-white/40">
            বর্তমানে কোনো STL নিবন্ধিত নেই। উপরে নতুন STL যোগ করুন।
          </div>
        ) : (
          allStls.map(stl => {
            const assignedIds = stl.assignedTLs || [];
            const assignedTLMembers: Member[] = [];
            const seenIds = new Set<string>();

            assignedIds.forEach(idOrName => {
              const member = tlLookup.get(idOrName) || tlLookup.get(idOrName.trim().toLowerCase());
              if (member && !seenIds.has(member.id)) {
                seenIds.add(member.id);
                assignedTLMembers.push(member);
              }
            });

            // Calculate converts of assigned TLs
            const totalConverts = assignedTLMembers.reduce((sum, tl) => {
              const res = results[tl.id];
              if (res && res.convert != null) {
                return sum + (Number(res.convert) || 0);
              }
              const found = Object.values(results).find(r => 
                r.memberId === tl.id || 
                ((r as any).name && (r as any).name.trim().toLowerCase() === tl.name.trim().toLowerCase())
              );
              return sum + (Number(found?.convert) || 0);
            }, 0);

            const formattedName = formatStlDisplayName(stl.name);
            const currentEditing = editingTargets[stl.id] !== undefined ? editingTargets[stl.id] : (stl.target?.toString() || '');

            return (
              <div
                key={stl.id}
                id={`admin-stl-item-${stl.id}`}
                className="neu-card rounded-2xl p-4 sm:p-5 border border-blue-200/80 bg-white/85 shadow-sm transition-all hover:border-blue-300"
              >
                {/* STL Name & Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden neu-card-sm flex items-center justify-center border border-blue-200/80 flex-shrink-0">
                      <CartoonAvatar src={stl.profilePic} name={stl.name} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-[#090d16] text-sm sm:text-base tracking-tight truncate">
                          {formattedName}
                        </span>
                        <span className="neu-card-sm text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-md">
                          • {totalConverts} Convert
                        </span>
                        {stl.target !== undefined && stl.target > 0 ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-mono font-bold flex items-center gap-1 shadow-2xs">
                            🎯 টার্গেট: {stl.target}
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic font-medium">টার্গেট নেই</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {assignedTLMembers.length} জন Team Leader যুক্ত আছেন
                      </p>
                    </div>
                  </div>

                  {/* Actions: (+) Assign / Manage & Delete */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap sm:flex-nowrap">
                    {/* Inline Target Input and Save */}
                    <div className="flex items-center gap-1.5 mr-1.5">
                      <input 
                        type="number"
                        value={currentEditing}
                        onChange={(e) => setEditingTargets(prev => ({ ...prev, [stl.id]: e.target.value }))}
                        placeholder="0"
                        className="w-14 bg-white border border-blue-200 rounded-xl px-2 py-1 text-xs text-center font-mono outline-none focus:border-blue-500 text-slate-800 shadow-2xs"
                        min="0"
                      />
                      <button 
                        onClick={async () => {
                          const tVal = parseInt(currentEditing) || 0;
                          await onUpdateTarget(stl.id, tVal);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg transition-colors active:scale-95 shadow-xs"
                        title="Save Target"
                      >
                        Save
                      </button>
                    </div>

                    {/* The prominent (+) Add/Manage TLs Button as specifically requested */}
                    <button
                      type="button"
                      id={`btn-assign-tl-${stl.id}`}
                      onClick={() => onOpenAssignModal(stl)}
                      className="neu-btn-primary text-white font-black px-3 sm:px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 active:scale-95 shadow-md transition-all whitespace-nowrap"
                      title="TL যুক্ত বা পরিবর্তন করুন"
                    >
                      <UserPlus size={15} />
                      <span>(+) TL পরিচালনা</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteSTL(stl.id)}
                      className="p-2 rounded-xl neu-card-sm text-slate-400 hover:text-red-600 transition-colors"
                      title="STL মুছুন"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Assigned TL Chips */}
                <div className="pt-2.5 border-t border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                    <span>এসাইন করা টিম লিডারগণ:</span>
                    <button
                      type="button"
                      onClick={() => onOpenAssignModal(stl)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      + TL পরিবর্তন
                    </button>
                  </div>

                  {assignedTLMembers.length === 0 ? (
                    <div className="text-xs text-slate-400 italic py-1">
                      কোনো TL এসাইন করা হয়নি। উপরে <strong>(+) TL পরিচালনা</strong> বাটনে ক্লিক করে যুক্ত করুন।
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {assignedTLMembers.map(tl => {
                        const conv = results[tl.id]?.convert || 0;
                        return (
                          <div
                            key={tl.id}
                            className="neu-card-sm px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-blue-200/90 text-xs bg-white text-slate-800"
                          >
                            <span className="font-bold text-[#090d16]">{tl.name}</span>
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                              {conv}c
                            </span>
                            <button
                              type="button"
                              onClick={() => onRemoveTLFromSTL(stl.id, tl.id)}
                              className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors"
                              title={`${tl.name} কে এই STL থেকে রিমুভ করুন`}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
