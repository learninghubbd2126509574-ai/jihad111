import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Trash2,
  UserPlus,
  X,
  Info
} from 'lucide-react';
import CartoonAvatar from './CartoonAvatar';
import { STLMember, Member, Result, RankingMember, formatStlDisplayName, resolveTLConvertData } from './StlWiseResultSection';

interface StlAdminManagerProps {
  stlMembers: STLMember[];
  registeredUsers: Array<{ fullName: string; whatsapp: string; position: string; profilePic?: string }>;
  teamLeaders: Member[];
  leaderRanking?: RankingMember[];
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
  leaderRanking = [],
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
      await onAddSTL(newStlName.trim(), parseInt(newStlTarget, 10) || 0);
      setNewStlName('');
      setNewStlTarget('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fintech-card p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B4F9C] flex items-center justify-center text-white shrink-0">
            <Users size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                STL &amp; Team Leader Assignment
              </h3>
              <span className="text-xs font-semibold text-[#64748B] font-mono tabular-nums">
                ({allStls.length} STL)
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Assign one or more Team Leaders under each STL; TL converts auto-aggregate cleanly.
            </p>
          </div>
        </div>
      </div>

      {/* Info Notice Box */}
      <div className="p-3 rounded-xl bg-[#EEF5FF] border border-[#D6E6FF] flex items-start gap-2.5 text-xs text-[#1E3A8A]">
        <Info size={16} className="text-[#0B4F9C] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          Click <strong>Manage TLs</strong> to choose which Team Leaders report under each Senior Team Leader.
        </div>
      </div>

      {/* Add New STL */}
      <form onSubmit={handleAddSTL} className="flex gap-2 flex-wrap sm:flex-nowrap">
        <input
          type="text"
          value={newStlName}
          onChange={e => setNewStlName(e.target.value)}
          placeholder="New STL name..."
          className="flex-1 px-3.5 py-2.5 rounded-xl fintech-input text-xs sm:text-sm text-[#0F172A]"
        />
        <input
          type="number"
          value={newStlTarget}
          onChange={e => setNewStlTarget(e.target.value)}
          placeholder="Target"
          className="w-24 px-3 py-2.5 rounded-xl fintech-input text-xs sm:text-sm font-mono tabular-nums text-[#0F172A] text-center"
          min="0"
        />
        <button
          type="submit"
          disabled={isAdding || !newStlName.trim()}
          className="bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add STL</span>
        </button>
      </form>

      {/* STL List */}
      <div className="space-y-3">
        {allStls.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#64748B] rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
            No STL members registered yet.
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

            const totalConverts = assignedTLMembers.reduce((sum, tl) => {
              const data = resolveTLConvertData(tl.id, teamLeaders, leaderRanking, results, tl);
              return sum + data.convert;
            }, 0);

            const formattedName = formatStlDisplayName(stl.name);
            const currentEditing =
              editingTargets[stl.id] !== undefined ? editingTargets[stl.id] : stl.target?.toString() || '';

            return (
              <div
                key={stl.id}
                id={`admin-stl-item-${stl.id}`}
                className="rounded-xl p-4 border border-[#E5E7EB] bg-[#F8FAFC] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
                      <CartoonAvatar src={stl.profilePic} name={stl.name} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-[#0F172A] text-sm truncate">{formattedName}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-[#64748B] flex-wrap mt-0.5">
                        <span className="font-mono tabular-nums font-bold text-[#0B4F9C]">
                          {totalConverts} Convert
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{assignedTLMembers.length} TL</span>
                        {stl.target !== undefined && stl.target > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums text-[#047857] font-semibold">
                              Target {stl.target}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={currentEditing}
                        onChange={(e) => setEditingTargets(prev => ({ ...prev, [stl.id]: e.target.value }))}
                        placeholder="0"
                        className="w-14 fintech-input rounded-lg px-2 py-1 text-xs text-center font-mono tabular-nums text-[#0F172A]"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const tVal = parseInt(currentEditing, 10) || 0;
                          await onUpdateTarget(stl.id, tVal);
                        }}
                        className="px-2.5 py-1.5 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                    </div>

                    <button
                      type="button"
                      id={`btn-assign-tl-${stl.id}`}
                      onClick={() => onOpenAssignModal(stl)}
                      className="bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <UserPlus size={14} />
                      <span>Manage TLs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteSTL(stl.id)}
                      className="p-2 rounded-lg bg-white border border-[#E5E7EB] text-[#64748B] hover:text-[#DC2626] transition-colors cursor-pointer"
                      title="Delete STL"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Assigned TL Chips */}
                <div className="pt-2.5 border-t border-[#E5E7EB]">
                  <div className="text-[11px] font-semibold text-[#64748B] mb-2 flex items-center justify-between">
                    <span>Assigned Team Leaders</span>
                    <button
                      type="button"
                      onClick={() => onOpenAssignModal(stl)}
                      className="text-[#0B4F9C] font-bold hover:underline cursor-pointer"
                    >
                      + Edit
                    </button>
                  </div>

                  {assignedTLMembers.length === 0 ? (
                    <p className="text-xs text-[#94A3B8]">No Team Leaders assigned yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {assignedTLMembers.map(tl => {
                        const conv = resolveTLConvertData(tl.id, teamLeaders, leaderRanking, results, tl).convert;
                        return (
                          <div
                            key={tl.id}
                            className="px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-[#E5E7EB] text-xs bg-white text-[#0F172A]"
                          >
                            <span className="font-semibold">{tl.name}</span>
                            <span className="text-[11px] font-mono tabular-nums font-bold text-[#047857]">
                              {conv}
                            </span>
                            <button
                              type="button"
                              onClick={() => onRemoveTLFromSTL(stl.id, tl.id)}
                              className="text-[#94A3B8] hover:text-[#DC2626] p-0.5 rounded transition-colors cursor-pointer"
                              title={`Remove ${tl.name}`}
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
