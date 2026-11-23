import React, { useMemo, useState } from 'react';
import { Trophy, ChevronDown, ChevronUp, Users } from 'lucide-react';
import CartoonAvatar from './CartoonAvatar';

export interface STLMember {
  id: string;
  name: string;
  assignedTLs?: string[];
  createdAt?: any;
  whatsapp?: string;
  profilePic?: string;
  target?: number;
}

export interface Member {
  id: string;
  name: string;
  type: 'leader' | 'trainer' | 'counsellor';
  createdAt?: any;
  profilePic?: string;
  whatsapp?: string;
  score?: number;
  leads?: number;
}

export interface Result {
  id?: string;
  memberId: string;
  lead: number;
  convert: number;
  personalLead: number;
  submitted: boolean;
  updatedAt?: any;
  name?: string;
}

export interface RankingMember {
  id: string;
  name: string;
  score: number;
  leads: number;
  whatsapp?: string;
  profilePic?: string;
}

interface StlWiseResultSectionProps {
  stlMembers: STLMember[];
  registeredUsers?: Array<{ fullName: string; whatsapp: string; position: string; profilePic?: string; score?: number }>;
  teamLeaders: Member[];
  leaderRanking?: RankingMember[];
  results: Record<string, Result>;
}

export function formatStlDisplayName(name: string): string {
  const trimmed = name.trim();
  if (/^stl\b/i.test(trimmed)) {
    return trimmed;
  }
  return `STL ${trimmed}`;
}

const smallCapsMap: Record<string, string> = {
  'ᴀ': 'a', 'ʙ': 'b', 'ᴄ': 'c', 'ᴅ': 'd', 'ᴇ': 'e', 'ғ': 'f', 'ɢ': 'g', 'ʜ': 'h',
  'ɪ': 'i', 'ᴊ': 'j', 'ᴋ': 'k', 'ʟ': 'l', 'ᴍ': 'm', 'ɴ': 'n', 'ᴏ': 'o', 'ᴘ': 'p',
  'ǫ': 'q', 'ʀ': 'r', 's': 's', 'ᴛ': 't', 'ᴜ': 'u', 'ᴠ': 'v', 'ᴡ': 'w', 'x': 'x',
  'ʏ': 'y', 'ᴢ': 'z'
};

export function normalizeName(name: string): string {
  if (!name) return '';
  let s = name.toLowerCase();
  s = s.split('').map(c => smallCapsMap[c] || c).join('');
  return s
    .replace(/^(tl|stl|team leader|team trainer|trainer|senior tl|sr\.?\s*tl)\s+/i, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface TLConvertData {
  id: string;
  name: string;
  convert: number;
  submitted: boolean;
}

export function resolveTLConvertData(
  idOrName: string,
  teamLeaders: Member[],
  leaderRanking: RankingMember[] = [],
  results: Record<string, Result> = {},
  knownMember?: Member
): TLConvertData {
  const rawTarget = (knownMember?.name || idOrName || '').trim();
  const cleanTarget = normalizeName(rawTarget);
  const targetId = knownMember?.id || idOrName;

  const member = knownMember || teamLeaders.find(m =>
    m.id === targetId || (cleanTarget && normalizeName(m.name) === cleanTarget)
  );
  let resolvedName = member?.name || knownMember?.name || idOrName;

  let rankingScore: number | null = null;
  const rankItem = leaderRanking.find(r => {
    if (r.id === targetId || (member && r.id === member.id)) return true;
    const rClean = normalizeName(r.name);
    return Boolean(cleanTarget && rClean && rClean === cleanTarget);
  });
  if (rankItem && rankItem.score !== undefined && rankItem.score !== null) {
    rankingScore = Number(rankItem.score) || 0;
    if (rankItem.name) resolvedName = rankItem.name;
  }

  let resultConvert: number | null = null;
  let submitted = false;
  const directResult = results[targetId] || (member ? results[member.id] : undefined);
  if (directResult && directResult.convert !== undefined && directResult.convert !== null) {
    resultConvert = Number(directResult.convert) || 0;
    submitted = Boolean(directResult.submitted);
    if (directResult.name) resolvedName = directResult.name;
  } else {
    const foundInResults = Object.values(results).find(r => {
      if (r.memberId === targetId || (member && r.memberId === member.id)) return true;
      const rClean = normalizeName((r as any).name || '');
      return Boolean(cleanTarget && rClean && rClean === cleanTarget);
    });
    if (foundInResults && foundInResults.convert !== undefined && foundInResults.convert !== null) {
      resultConvert = Number(foundInResults.convert) || 0;
      submitted = Boolean(foundInResults.submitted);
      if ((foundInResults as any).name) resolvedName = (foundInResults as any).name;
    }
  }

  const finalConvert = rankingScore !== null ? rankingScore : (resultConvert !== null ? resultConvert : 0);

  return {
    id: member?.id || targetId,
    name: resolvedName,
    convert: finalConvert,
    submitted: submitted || finalConvert > 0
  };
}

export default function StlWiseResultSection({
  stlMembers,
  registeredUsers = [],
  teamLeaders,
  leaderRanking = [],
  results
}: StlWiseResultSectionProps) {
  const [expandedStlId, setExpandedStlId] = useState<string | null>(null);

  const allStls = useMemo(() => {
    const map = new Map<string, STLMember>();

    stlMembers.forEach(s => {
      const key = normalizeName(s.name);
      if (key) {
        map.set(key, s);
      }
    });

    registeredUsers
      .filter(u => u.position === 'STL' || u.position === 'Senior Team Leader')
      .forEach(u => {
        const key = normalizeName(u.fullName);
        if (key && !map.has(key)) {
          map.set(key, {
            id: `user-${u.whatsapp}`,
            name: u.fullName,
            assignedTLs: [],
            whatsapp: u.whatsapp,
            profilePic: u.profilePic
          });
        }
      });

    return Array.from(map.values());
  }, [stlMembers, registeredUsers]);

  const stlStatsList = useMemo(() => {
    return allStls.map(stl => {
      const assignedIds = stl.assignedTLs || [];
      let totalConvert = 0;
      const seenTLNames = new Set<string>();
      const tlDetails: Array<{ id: string; name: string; convert: number; submitted: boolean }> = [];

      assignedIds.forEach((idOrName, idx) => {
        const cleanIdOrName = normalizeName(idOrName);
        const member = teamLeaders.find(
          m => m.id === idOrName || normalizeName(m.name) === cleanIdOrName
        );

        const data = resolveTLConvertData(idOrName, teamLeaders, leaderRanking, results, member);
        const nameKey = normalizeName(data.name || idOrName);

        if (!seenTLNames.has(nameKey)) {
          seenTLNames.add(nameKey);
          totalConvert += data.convert;
          tlDetails.push({
            id: member?.id || idOrName || String(idx),
            name: data.name,
            convert: data.convert,
            submitted: data.submitted
          });
        }
      });

      const formattedName = formatStlDisplayName(stl.name);

      return {
        stl,
        formattedName,
        totalConvert,
        assignedCount: tlDetails.length,
        tlDetails
      };
    });
  }, [allStls, teamLeaders, leaderRanking, results]);

  const sortedStlStats = useMemo(() => {
    return [...stlStatsList].sort((a, b) => {
      if (b.totalConvert !== a.totalConvert) {
        return b.totalConvert - a.totalConvert;
      }
      return a.formattedName.localeCompare(b.formattedName);
    });
  }, [stlStatsList]);

  const maxConvert = useMemo(() => {
    const highest = Math.max(...sortedStlStats.map(s => s.totalConvert), 1);
    return highest > 0 ? highest : 1;
  }, [sortedStlStats]);

  const grandTotalAllStls = useMemo(() => {
    return sortedStlStats.reduce((sum, s) => sum + s.totalConvert, 0);
  }, [sortedStlStats]);

  const toggleExpand = (id: string) => {
    setExpandedStlId(prev => prev === id ? null : id);
  };

  const getPerformanceTier = (convert: number, rankIndex: number) => {
    if (convert >= 15 || (convert > 0 && rankIndex === 0)) {
      return {
        label: 'High',
        textClass: 'text-[#047857]',
        barClass: 'bg-[#047857]'
      };
    } else if (convert > 0) {
      return {
        label: 'Moderate',
        textClass: 'text-[#0B4F9C]',
        barClass: 'bg-[#0B4F9C]'
      };
    }
    return {
      label: 'Zero',
      textClass: 'text-[#B45309]',
      barClass: 'bg-[#D97706]'
    };
  };

  return (
    <section
      id="stl-wise-result-section"
      className="fintech-card p-4 sm:p-5 mb-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#EEF5FF] border border-[#D6E6FF] flex items-center justify-center text-[#0B4F9C] shrink-0">
            <Trophy size={17} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-[#0F172A] tracking-tight truncate">
              STL Live Converts
            </h2>
            <p className="text-[11px] text-[#64748B] truncate">
              Automated convert totals across assigned Team Leaders
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="block text-[11px] text-[#64748B] font-medium">Grand Total</span>
          <span className="text-base font-bold text-[#047857] font-mono tabular-nums">
            {grandTotalAllStls} <span className="text-xs font-sans font-semibold">Convert</span>
          </span>
        </div>
      </div>

      {/* List */}
      {sortedStlStats.length === 0 ? (
        <div className="rounded-xl p-6 text-center bg-[#F4F6F9] border border-[#E5E7EB]">
          <p className="text-xs font-semibold text-[#64748B]">No STL members found</p>
        </div>
      ) : (
        <div className="divide-y divide-[#E5E7EB]">
          {sortedStlStats.map((item, index) => {
            const stlId = item.stl.id || String(index);
            const isExpanded = expandedStlId === stlId;
            const perf = getPerformanceTier(item.totalConvert, index);

            const targetConvert = item.stl.target || 0;
            const hasTarget = targetConvert > 0;
            const rawRatio = hasTarget ? Math.round((item.totalConvert / targetConvert) * 100) : 0;
            const progressRatio = hasTarget ? Math.min(rawRatio, 100) : 0;
            const graphPercent = hasTarget
              ? progressRatio
              : Math.max(Math.round((item.totalConvert / maxConvert) * 100), item.totalConvert > 0 ? 8 : 2);

            return (
              <div key={stlId} className="py-3 first:pt-0 last:pb-0">
                <div
                  onClick={() => item.assignedCount > 0 && toggleExpand(stlId)}
                  className={`flex items-center justify-between gap-3 ${item.assignedCount > 0 ? 'cursor-pointer select-none' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-6 text-center text-xs font-bold font-mono tabular-nums text-[#64748B] shrink-0">
                      #{index + 1}
                    </span>

                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#F4F6F9] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                      <CartoonAvatar src={item.stl.profilePic} name={item.stl.name} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-bold text-[#0F172A] truncate">
                          {item.formattedName}
                        </span>
                        {item.assignedCount > 0 && (
                          <span className="text-[#64748B] shrink-0">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </div>

                      {/* Unboxed Metadata */}
                      <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] flex-wrap mt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <Users size={11} />
                          {item.assignedCount} TL
                        </span>
                        {hasTarget && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums text-[#0F172A] font-medium">
                              Target {item.totalConvert}/{targetConvert} ({rawRatio}%)
                            </span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className={`font-semibold ${perf.textClass}`}>{perf.label}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-2 mt-1.5 max-w-[200px]">
                        <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${perf.barClass} transition-all duration-300`}
                            style={{ width: `${graphPercent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono tabular-nums text-[#64748B]">
                          {hasTarget ? `${rawRatio}%` : `${graphPercent}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Total */}
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-bold font-mono tabular-nums ${perf.textClass}`}>
                      {item.totalConvert}
                    </span>
                    <span className="block text-[10px] text-[#64748B] font-medium">Convert</span>
                  </div>
                </div>

                {/* Expanded TL Details */}
                {isExpanded && item.tlDetails.length > 0 && (
                  <div className="mt-3 ml-8 p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] font-semibold">
                      <span>Assigned Team Leaders</span>
                      <span className="font-mono tabular-nums text-[#047857]">
                        {item.tlDetails.map(t => t.convert).join(' + ')} = {item.totalConvert}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {item.tlDetails.map((tl, i) => (
                        <div
                          key={tl.id || i}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs"
                        >
                          <span className="font-medium text-[#0F172A] truncate">
                            {tl.name}
                          </span>
                          <span className="font-mono tabular-nums font-bold text-[#047857] shrink-0 ml-2">
                            {tl.convert}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
