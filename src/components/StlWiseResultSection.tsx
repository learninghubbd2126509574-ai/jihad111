import React, { useMemo, useState } from 'react';
import { Trophy, ChevronDown, ChevronUp, Users, Activity } from 'lucide-react';
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

// Utility to normalize names by removing TL/STL prefixes, punctuation, and extra whitespace
function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(tl|stl|team leader|team trainer|trainer|senior tl|sr\.?\s*tl)\s+/i, '')
    .replace(/[^a-z0-9\u0980-\u09FF\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function StlWiseResultSection({
  stlMembers,
  registeredUsers = [],
  teamLeaders,
  leaderRanking = [],
  results
}: StlWiseResultSectionProps) {
  const [expandedStlId, setExpandedStlId] = useState<string | null>(null);

  // Consolidated list of all registered STLs in the company (from stlMembers + registeredUsers)
  const allStls = useMemo(() => {
    const map = new Map<string, STLMember>();
    
    // 1. From stlMembers collection
    stlMembers.forEach(s => {
      const key = normalizeName(s.name);
      if (key) {
        map.set(key, s);
      }
    });

    // 2. From registered users where position is STL
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

  // Comprehensive map of TL convert scores combining results, leaderRanking, registeredUsers & members
  const findTLConvertData = useMemo(() => {
    return (idOrName: string, knownMember?: Member) => {
      const rawTarget = (knownMember?.name || idOrName || '').trim();
      const cleanTarget = normalizeName(rawTarget);
      const targetId = knownMember?.id || idOrName;

      let convert = 0;
      let submitted = false;
      let resolvedName = knownMember?.name || idOrName;

      // 1. Check direct results by memberId or doc ID
      if (results[targetId] && results[targetId].convert != null) {
        convert = Number(results[targetId].convert) || 0;
        submitted = Boolean(results[targetId].submitted);
        if (results[targetId].name) resolvedName = results[targetId].name!;
      } else {
        // Search results by name match
        const foundInResults = Object.values(results).find(r => {
          if (r.memberId === targetId) return true;
          const rClean = normalizeName((r as any).name || '');
          return rClean && (rClean === cleanTarget || rClean.includes(cleanTarget) || cleanTarget.includes(rClean));
        });
        if (foundInResults && foundInResults.convert != null) {
          convert = Number(foundInResults.convert) || 0;
          submitted = Boolean(foundInResults.submitted);
          if ((foundInResults as any).name) resolvedName = (foundInResults as any).name;
        }
      }

      // 2. Check published score from leaderRanking
      let rankingScore = 0;
      const rankItem = leaderRanking.find(r => {
        if (r.id === targetId) return true;
        const rClean = normalizeName(r.name);
        return rClean && (rClean === cleanTarget || rClean.includes(cleanTarget) || cleanTarget.includes(rClean));
      });
      if (rankItem) {
        rankingScore = Number(rankItem.score) || 0;
        if (!resolvedName || resolvedName === idOrName) resolvedName = rankItem.name;
      }

      // 3. Check registeredUsers scores
      let userScore = 0;
      const userItem = registeredUsers.find(u => {
        const uClean = normalizeName(u.fullName);
        return uClean && (uClean === cleanTarget || uClean.includes(cleanTarget) || cleanTarget.includes(uClean));
      });
      if (userItem && userItem.score != null) {
        userScore = Number(userItem.score) || 0;
        if (!resolvedName || resolvedName === idOrName) resolvedName = userItem.fullName;
      }

      // 4. Check manual roster member score
      let memberScore = knownMember?.score || 0;
      if (!memberScore) {
        const mItem = teamLeaders.find(m => {
          if (m.id === targetId) return true;
          const mClean = normalizeName(m.name);
          return mClean && (mClean === cleanTarget || mClean.includes(cleanTarget) || cleanTarget.includes(mClean));
        });
        if (mItem?.score) {
          memberScore = Number(mItem.score) || 0;
          if (!resolvedName || resolvedName === idOrName) resolvedName = mItem.name;
        }
      }

      const finalConvert = Math.max(convert, rankingScore, userScore, memberScore);

      return {
        name: resolvedName,
        convert: finalConvert,
        submitted: submitted || finalConvert > 0
      };
    };
  }, [results, leaderRanking, registeredUsers, teamLeaders]);

  // Compute stats for each STL: total converts sum from assigned TLs with detailed breakdown
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

        const data = findTLConvertData(idOrName, member);
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
  }, [allStls, teamLeaders, findTLConvertData]);

  // Sort STLs descending by totalConvert
  const sortedStlStats = useMemo(() => {
    return [...stlStatsList].sort((a, b) => {
      if (b.totalConvert !== a.totalConvert) {
        return b.totalConvert - a.totalConvert;
      }
      return a.formattedName.localeCompare(b.formattedName);
    });
  }, [stlStatsList]);

  // Maximum convert value to calculate relative graph fill width
  const maxConvert = useMemo(() => {
    const highest = Math.max(...sortedStlStats.map(s => s.totalConvert), 1);
    return highest > 0 ? highest : 1;
  }, [sortedStlStats]);

  // Grand Total of All STLs combined
  const grandTotalAllStls = useMemo(() => {
    return sortedStlStats.reduce((sum, s) => sum + s.totalConvert, 0);
  }, [sortedStlStats]);

  const toggleExpand = (id: string) => {
    setExpandedStlId(prev => prev === id ? null : id);
  };

  // Helper to determine performance level, color & side graph
  const getPerformanceTier = (convert: number, rankIndex: number) => {
    if (convert >= 15 || (convert > 0 && rankIndex === 0)) {
      return {
        tier: 'good',
        label: 'Good',
        borderClass: 'border-l-emerald-500 bg-emerald-500',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
        graphFill: 'bg-gradient-to-r from-emerald-400 to-teal-500',
        dotColor: 'bg-emerald-500',
        tagText: 'উচ্চ পারফর্মেন্স',
        tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
      };
    } else if (convert > 0) {
      return {
        tier: 'medium',
        label: 'Medium',
        borderClass: 'border-l-amber-400 bg-amber-400',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/90',
        graphFill: 'bg-gradient-to-r from-amber-400 to-yellow-500',
        dotColor: 'bg-amber-500',
        tagText: 'মাঝারি',
        tagColor: 'text-amber-700 bg-amber-50 border-amber-200'
      };
    } else {
      return {
        tier: 'low',
        label: 'Low',
        borderClass: 'border-l-rose-400 bg-rose-400',
        badgeBg: 'bg-rose-50 text-rose-800 border-rose-200/90',
        graphFill: 'bg-gradient-to-r from-rose-400 to-red-400',
        dotColor: 'bg-rose-500',
        tagText: 'শূন্য/কম',
        tagColor: 'text-rose-700 bg-rose-50 border-rose-200'
      };
    }
  };

  return (
    <section 
      id="stl-wise-result-section" 
      className="neu-card rounded-2xl p-3 sm:p-4 mb-4 relative overflow-hidden border border-blue-200/90 shadow-xs bg-linear-to-b from-white/95 to-[#f4f8fd]/90 animate-fade-in"
    >
      {/* Compact Section Header with Grand Total Badge */}
      <div className="flex items-center justify-between gap-2.5 mb-2.5 pb-2 border-b border-blue-100/80">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7.5 h-7.5 neu-btn-primary rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-2xs">
            <Trophy size={15} className="text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight whitespace-nowrap">
                STL Live Convert
              </h2>
              <span className="px-1.5 py-0.2 rounded-md text-[8px] font-black bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                Live Sum
              </span>
            </div>
            <p className="text-slate-400 text-[9px] truncate">
              টিম লিডারদের লাইভ কনভার্টের স্বয়ংক্রিয় যোগফল ও গ্রাফ
            </p>
          </div>
        </div>

        {/* Company Grand Total Badge */}
        <div className="flex items-center gap-1.5 neu-card-sm px-2.5 py-1 rounded-xl border border-emerald-200/90 bg-emerald-50/90 flex-shrink-0 shadow-2xs">
          <span className="text-[9px] font-black text-emerald-800 uppercase tracking-tight hidden sm:inline">
            সর্বমোট:
          </span>
          <span className="text-xs sm:text-sm font-black text-emerald-800 font-mono">
            {grandTotalAllStls} <span className="text-[10px] font-bold font-sans">Convert</span>
          </span>
        </div>
      </div>

      {/* Content - Slim, Elegant Card List with Side Indicator Line & Micro Graph */}
      <div>
        {sortedStlStats.length === 0 ? (
          <div className="neu-card-sm rounded-xl p-4 text-center border border-blue-200/60 bg-blue-50/30">
            <p className="text-xs font-bold text-slate-600">কোনো STL সদস্য পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {sortedStlStats.map((item, index) => {
              const stlId = item.stl.id || String(index);
              const isExpanded = expandedStlId === stlId;
              const perf = getPerformanceTier(item.totalConvert, index);
              
              const targetConvert = item.stl.target || 0;
              const hasTarget = targetConvert > 0;
              const rawRatio = hasTarget ? Math.round((item.totalConvert / targetConvert) * 100) : 0;
              const progressRatio = hasTarget ? Math.min(rawRatio, 100) : 0;
              const graphPercent = hasTarget ? progressRatio : Math.max(Math.round((item.totalConvert / maxConvert) * 100), item.totalConvert > 0 ? 8 : 2);

              return (
                <div
                  key={stlId}
                  className={`neu-card-sm rounded-xl p-2 sm:p-2.5 border border-blue-200/70 bg-white/95 transition-all hover:border-blue-300 shadow-2xs relative overflow-hidden pl-3`}
                >
                  {/* Left Side Performance Indicator Line */}
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-[4px] ${perf.borderClass} transition-colors duration-300`} 
                    title={`Performance: ${perf.label}`}
                  />

                  {/* Slim Main Row */}
                  <div 
                    onClick={() => item.assignedCount > 0 && toggleExpand(stlId)}
                    className={`flex items-center justify-between gap-2 ${item.assignedCount > 0 ? 'cursor-pointer select-none' : ''}`}
                  >
                    {/* Rank, Avatar, & STL Info */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Rank Badge */}
                      <span className="w-5 h-5 rounded-lg neu-card-sm flex items-center justify-center text-[10px] font-black text-blue-800 flex-shrink-0 border border-blue-100">
                        {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>

                      {/* Avatar */}
                      <div className="w-6.5 h-6.5 rounded-lg overflow-hidden neu-card-sm flex items-center justify-center flex-shrink-0 border border-blue-200/70">
                        <CartoonAvatar src={item.stl.profilePic} name={item.stl.name} />
                      </div>

                      {/* STL Name & Compact Badge inline */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate max-w-[130px] sm:max-w-[190px]">
                            {item.formattedName}
                          </span>

                          {/* Minimal TL Pill */}
                          {item.assignedCount > 0 ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 text-[9px] font-bold border border-blue-100 whitespace-nowrap">
                              <Users size={8.5} />
                              {item.assignedCount} TL
                              <span className="text-slate-400 ml-0.5">
                                {isExpanded ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[8px] text-slate-400">
                              (0 TL)
                            </span>
                          )}

                          {/* Target Badge */}
                          {hasTarget && (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black font-mono flex items-center gap-1 shadow-2xs whitespace-nowrap">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              🎯 {item.totalConvert}/{targetConvert} ({rawRatio}%)
                            </span>
                          )}

                          {/* Performance Tag Pill */}
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-md border ${perf.tagColor} hidden sm:inline-flex items-center gap-0.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${perf.dotColor}`} />
                            {perf.label}
                          </span>
                        </div>

                        {/* Micro Progress / Performance Graph Bar (Ultra-slim) */}
                        <div className="flex items-center gap-1.5 mt-1 pr-2">
                          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 max-w-[140px] sm:max-w-[180px]">
                            <div 
                              className={`h-full rounded-full ${perf.graphFill} transition-all duration-500`}
                              style={{ width: `${graphPercent}%` }}
                            />
                          </div>
                          <span className="text-[8px] font-bold font-mono text-slate-400">
                            {hasTarget ? `${rawRatio}%` : `${graphPercent}%`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Convert Count Badge - Slim & Color-Coded */}
                    <div className="flex-shrink-0">
                      <div className={`neu-card-sm px-2 py-0.8 sm:px-2.5 sm:py-1 rounded-lg border flex items-center gap-1 shadow-2xs ${perf.badgeBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${perf.dotColor} animate-pulse flex-shrink-0`} />
                        <span className="text-[11px] sm:text-xs font-black font-mono whitespace-nowrap">
                          {item.totalConvert} Convert
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Expanded Breakdown */}
                  {isExpanded && item.tlDetails.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-blue-100/70 animate-fade-in space-y-1.5">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>TL তালিকা ও হিসাব:</span>
                        <span className="text-emerald-700 font-black font-mono">
                          {item.tlDetails.map(t => t.convert).join(' + ')} = {item.totalConvert}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {item.tlDetails.map((tl, i) => (
                          <div 
                            key={tl.id || i}
                            className="flex items-center justify-between px-2 py-1 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px]"
                          >
                            <span className="font-semibold text-slate-700 truncate">
                              • {tl.name}
                            </span>
                            <span className="font-mono font-black text-emerald-700 flex-shrink-0 ml-2 text-[10px]">
                              {tl.convert} Convert
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
      </div>
    </section>
  );
}
