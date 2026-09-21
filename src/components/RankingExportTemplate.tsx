import React, { forwardRef } from 'react';
import { ShieldCheck, Award, Crown, CheckCircle2, Calendar, Clock, FileCheck } from 'lucide-react';

export interface RankingMember {
  id: string;
  name: string;
  score: number;
  leads?: number;
  createdAt?: any;
}

interface RankingExportTemplateProps {
  leaderRanking: RankingMember[];
  trainerRanking: RankingMember[];
  customLogo?: string;
  title?: string;
  subtitle?: string;
  monthName?: string;
  isPreview?: boolean;
}

const RankingExportTemplate = forwardRef<HTMLDivElement, RankingExportTemplateProps>(({ 
  leaderRanking, 
  trainerRanking, 
  customLogo,
  monthName,
  isPreview = false
}, ref) => {
  const today = new Date();
  const currentMonth = monthName || today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Format Date and Time clearly (e.g., 21 September 2026, 01:15 PM)
  const formattedDate = today.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  const formattedTime = today.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });

  // Sort ALL members strictly by score descending (NO Slicing, every single member is included!)
  const sortedLeaders = [...leaderRanking].sort((a, b) => (b.score || 0) - (a.score || 0));
  const sortedTrainers = [...trainerRanking].sort((a, b) => (b.score || 0) - (a.score || 0));

  // Common Header for both pages
  const renderHeader = (pageNumber: number, roleTitle: string, roleColor: 'blue' | 'green') => (
    <div style={{ marginBottom: '10px' }}>
      {/* Top Accent Strip */}
      <div 
        style={{ 
          height: '4px', 
          width: '100%', 
          borderRadius: '3px 3px 0 0',
          background: roleColor === 'blue' 
            ? 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #38bdf8 100%)' 
            : 'linear-gradient(90deg, #065f46 0%, #059669 50%, #34d399 100%)',
          marginBottom: '8px'
        }} 
      />

      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        {/* Logo & Company Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{ 
              width: '44px', 
              height: '44px', 
              backgroundColor: '#f8fafc', 
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3px',
              boxSizing: 'border-box'
            }}
          >
            {customLogo ? (
              <img src={customLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
            ) : (
              <span style={{ fontWeight: 900, fontSize: '18px', color: '#1e3a8a', letterSpacing: '-0.5px' }}>UE</span>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '19px', fontWeight: 900, color: '#0f2b5c', margin: 0, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                Unity Earning
              </h1>
              <span 
                style={{ 
                  fontSize: '8px', 
                  fontWeight: 800, 
                  backgroundColor: roleColor === 'blue' ? '#dbeafe' : '#d1fae5', 
                  color: roleColor === 'blue' ? '#1d4ed8' : '#047857', 
                  padding: '2px 7px', 
                  borderRadius: '5px', 
                  textTransform: 'uppercase',
                  border: roleColor === 'blue' ? '1px solid #bfdbfe' : '1px solid #a7f3d0'
                }}
              >
                Official Performance Record
              </span>
            </div>
            <p style={{ fontSize: '9.5px', fontWeight: 700, color: '#475569', margin: '2px 0 0 0', letterSpacing: '0.2px' }}>
              {roleTitle} • E-Learning & Skills Development Platform
            </p>
          </div>
        </div>
        
        {/* Document Status & Month */}
        <div 
          style={{ 
            textAlign: 'right',
            padding: '5px 12px',
            borderRadius: '9px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', marginBottom: '1px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span style={{ fontSize: '8px', fontWeight: 900, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Verified Board
            </span>
          </div>
          <div style={{ fontSize: '11.5px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
            {currentMonth}
          </div>
          <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#1e3a8a', marginTop: '1px' }}>
            Page {pageNumber} of 2
          </div>
        </div>
      </div>
    </div>
  );

  // Thinner, More Compact Admin Authorization & System Footer (NO "Official Seal" phrase)
  const renderBottomSection = (pageNumber: number, roleColor: 'blue' | 'green') => (
    <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
      {/* Sleek Admin Signature & System Card */}
      <div 
        style={{ 
          padding: '8px 16px',
          borderRadius: '11px',
          backgroundColor: '#ffffff',
          border: '1.5px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          boxSizing: 'border-box'
        }}
      >
        {/* 1. Created by Unity Earning (Clean, professional, NO "Official Seal") */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1.1 }}>
          <div 
            style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '9px', 
              border: `1.5px solid ${roleColor === 'blue' ? '#bfdbfe' : '#a7f3d0'}`, 
              backgroundColor: roleColor === 'blue' ? '#eff6ff' : '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={18} style={{ color: roleColor === 'blue' ? '#1e3a8a' : '#047857' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#0f172a' }}>
                Created by Unity Earning
              </span>
              <CheckCircle2 size={12} style={{ color: '#059669' }} />
            </div>
            <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#475569', marginTop: '1px' }}>
              Official System by Unity Earning
            </div>
            <div style={{ fontSize: '7.5px', fontWeight: 600, color: '#64748b', marginTop: '1px' }}>
              Authorized Performance & Merit Evaluation Record
            </div>
          </div>
        </div>

        {/* 2. Generation Date and Time Stamp */}
        <div 
          style={{ 
            flex: 1, 
            textAlign: 'center', 
            borderLeft: '1px solid #e2e8f0', 
            borderRight: '1px solid #e2e8f0', 
            padding: '0 10px' 
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            <FileCheck size={11} style={{ color: '#059669' }} />
            <span>Generated & Authenticated</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '2px', color: '#0f172a' }}>
            <Calendar size={11} style={{ color: '#1e3a8a' }} />
            <span style={{ fontSize: '9.5px', fontWeight: 800 }}>{formattedDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '1px', color: '#64748b' }}>
            <Clock size={10} style={{ color: '#d97706' }} />
            <span style={{ fontSize: '8.5px', fontWeight: 700 }}>Time: {formattedTime}</span>
          </div>
        </div>

        {/* 3. Executive Director & Admin Signature */}
        <div style={{ flex: 1, textAlign: 'center', paddingLeft: '10px' }}>
          <div style={{ height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span 
              style={{ 
                fontFamily: "'Brush Script MT', 'Dancing Script', 'Caveat', 'Segoe Script', cursive, Georgia, serif", 
                fontWeight: 700, 
                fontSize: '22px', 
                color: '#1e3a8a', 
                letterSpacing: '1px',
                lineHeight: 1
              }}
            >
              Jihadul Islam
            </span>
          </div>
          <div style={{ backgroundColor: '#1e3a8a', width: '100px', height: '1.5px', margin: '2px auto' }} />
          <div style={{ color: '#0f172a', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.6px', lineHeight: 1 }}>
            Jihadul Islam
          </div>
          <div style={{ color: '#64748b', fontSize: '7.5px', fontWeight: 700, marginTop: '1px' }}>
            Executive Director & Admin • Unity Earning
          </div>
        </div>
      </div>

      {/* Sleek Sub-Footer Bar */}
      <div 
        style={{ 
          marginTop: '6px',
          padding: '5px 12px',
          borderRadius: '8px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: roleColor === 'blue' ? '#1e40af' : '#047857' }}>
          <span style={{ fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Official Performance Record • Unity Earning
          </span>
        </div>

        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '7.5px', fontWeight: 600 }}>
          Generated on {formattedDate} at {formattedTime}
        </div>

        <div style={{ textAlign: 'right', color: '#0f172a', fontSize: '8.5px', fontWeight: 800 }}>
          Page {pageNumber} of 2
        </div>
      </div>
    </div>
  );

  // Helper to render individual ranking row
  // CRITICAL FIX: NEVER clip, hide, cut off, or partially display any name.
  // NO overflow: hidden! If name is long, auto-wraps to 2 lines and increases row height!
  const renderRow = (
    member: RankingMember, 
    rankIndex: number, 
    roleType: 'leader' | 'trainer',
    isCompactTwoCol: boolean
  ) => {
    const isTop1 = rankIndex === 0;
    const isTop2 = rankIndex === 1;
    const isTop3 = rankIndex === 2;

    const rankBg = roleType === 'leader'
      ? (isTop1 ? '#f59e0b' : isTop2 ? '#64748b' : isTop3 ? '#ea580c' : '#f1f5f9')
      : (isTop1 ? '#059669' : isTop2 ? '#0284c7' : isTop3 ? '#0d9488' : '#f1f5f9');

    const rankColor = isTop1 || isTop2 || isTop3 ? '#ffffff' : '#334155';
    const rowBg = rankIndex % 2 === 0 ? '#ffffff' : '#f8fafc';
    const borderColor = isTop1 
      ? (roleType === 'leader' ? '#fde68a' : '#a7f3d0') 
      : '#e2e8f0';

    return (
      <div 
        key={member.id || rankIndex}
        className="ranking-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isCompactTwoCol ? '6px 10px' : '7px 14px',
          minHeight: isCompactTwoCol ? '34px' : '40px',
          height: 'auto',
          borderRadius: '8px',
          backgroundColor: rowBg,
          border: `1px solid ${borderColor}`,
          marginBottom: isCompactTwoCol ? '4px' : '5px',
          boxSizing: 'border-box',
          overflow: 'visible'
        }}
      >
        {/* Left: Rank Badge + Name */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isCompactTwoCol ? '8px' : '12px', 
            flex: 1, 
            minWidth: 0, 
            paddingRight: '10px',
            overflow: 'visible'
          }}
        >
          {/* Rank Number Badge */}
          <div 
            style={{
              width: isCompactTwoCol ? '24px' : '28px',
              height: isCompactTwoCol ? '24px' : '28px',
              borderRadius: '6px',
              backgroundColor: rankBg,
              color: rankColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: isCompactTwoCol ? '10px' : '11.5px',
              flexShrink: 0
            }}
          >
            {rankIndex + 1}
          </div>

          {/* Name Container: Auto-wrapping, NO overflow hidden, NO ellipsis! */}
          <div 
            style={{ 
              flex: 1, 
              minWidth: 0, 
              overflow: 'visible',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <div 
              className="ranking-name-text"
              style={{ 
                fontSize: isCompactTwoCol ? '11px' : '12.5px', 
                fontWeight: 800, 
                color: '#0f172a', 
                lineHeight: 1.35,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                overflow: 'visible',
                margin: 0,
                padding: 0
              }}
            >
              {member.name}
            </div>
            {isTop1 && (
              <div style={{ marginTop: '1px', lineHeight: 1 }}>
                <span 
                  style={{ 
                    fontSize: '7.5px', 
                    fontWeight: 800, 
                    color: roleType === 'leader' ? '#b45309' : '#047857', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    display: 'inline-block'
                  }}
                >
                  ★ #1 Top {roleType === 'leader' ? 'Leader' : 'Trainer'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Converts Score Badge */}
        <div 
          style={{ 
            backgroundColor: roleType === 'leader' ? '#eff6ff' : '#ecfdf5', 
            border: roleType === 'leader' ? '1px solid #bfdbfe' : '1px solid #a7f3d0', 
            borderRadius: '6px', 
            padding: isCompactTwoCol ? '3px 8px' : '3px 10px', 
            textAlign: 'center',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0
          }}
        >
          <span 
            style={{ 
              fontSize: isCompactTwoCol ? '11.5px' : '13px', 
              fontWeight: 900, 
              color: roleType === 'leader' ? '#1e3a8a' : '#047857', 
              lineHeight: 1 
            }}
          >
            {member.score.toLocaleString()}
          </span>
          <span 
            style={{ 
              fontSize: '7.5px', 
              fontWeight: 800, 
              color: roleType === 'leader' ? '#3b82f6' : '#059669', 
              textTransform: 'uppercase' 
            }}
          >
            Converts
          </span>
        </div>
      </div>
    );
  };

  // Render a complete list for either leaders or trainers
  // Automatically arranges into 2 columns if member count > 15 so that ALL fit on 1 page!
  const renderMemberList = (members: RankingMember[], roleType: 'leader' | 'trainer') => {
    if (members.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '13px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          No performance records available for this period.
        </div>
      );
    }

    const useTwoColumns = members.length > 15;

    if (!useTwoColumns) {
      // Single Column Table (Fits up to 15 members comfortably)
      return (
        <div>
          {/* Header Row */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: roleType === 'leader' ? '#1e3a8a' : '#065f46',
              color: '#ffffff',
              fontSize: '9.5px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '28px', textAlign: 'center' }}>Rank</span>
              <span>{roleType === 'leader' ? 'Team Leader Name' : 'Team Trainer Name'}</span>
            </div>
            <span>Confirmed Converts</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {members.map((member, idx) => renderRow(member, idx, roleType, false))}
          </div>
        </div>
      );
    }

    // 2-Column Grid (Fits up to 36-40 members on a single page)
    const midPoint = Math.ceil(members.length / 2);
    const col1 = members.slice(0, midPoint);
    const col2 = members.slice(midPoint);

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Column 1 */}
        <div>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '5px 10px',
              borderRadius: '7px',
              backgroundColor: roleType === 'leader' ? '#1e3a8a' : '#065f46',
              color: '#ffffff',
              fontSize: '8.5px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              marginBottom: '5px'
            }}
          >
            <span>Rank & Name</span>
            <span>Converts</span>
          </div>
          {col1.map((member, i) => renderRow(member, i, roleType, true))}
        </div>

        {/* Column 2 */}
        <div>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '5px 10px',
              borderRadius: '7px',
              backgroundColor: roleType === 'leader' ? '#1e3a8a' : '#065f46',
              color: '#ffffff',
              fontSize: '8.5px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              marginBottom: '5px'
            }}
          >
            <span>Rank & Name</span>
            <span>Converts</span>
          </div>
          {col2.map((member, i) => renderRow(member, midPoint + i, roleType, true))}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={ref}
      style={{ 
        position: isPreview ? 'relative' : 'absolute',
        left: isPreview ? 0 : '-9999px', 
        top: 0,
        backgroundColor: isPreview ? 'transparent' : '#f1f5f9',
        padding: isPreview ? '0' : '20px',
        boxSizing: 'border-box'
      }}
      className="ranking-capture-area"
    >
      {/* ========================================================================= */}
      {/* PAGE 1: ALL TEAM LEADERS CONVERTS & RANKINGS (Strictly on Page 1)         */}
      {/* ========================================================================= */}
      <div 
        className="ranking-pdf-page"
        id="ranking-page-1"
        style={{
          width: '800px',
          height: '1131px',
          minHeight: '1131px',
          maxHeight: '1131px',
          padding: '24px 28px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          fontFamily: "'Segoe UI', Roboto, 'Hind Siliguri', 'Kalpurush', 'SolaimanLipi', -apple-system, BlinkMacSystemFont, sans-serif",
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          marginBottom: '30px',
          border: '1.5px solid #cbd5e1'
        }}
      >
        <div>
          {/* Header for Page 1 */}
          {renderHeader(1, "Team Leaders Performance Board", "blue")}

          {/* Simple Clean Banner */}
          <div 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              marginBottom: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Crown size={17} style={{ color: '#d97706' }} />
              <div>
                <h2 style={{ fontSize: '14.5px', fontWeight: 900, color: '#1e3a8a', margin: 0, letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
                  Team Leaders Performance Ranking
                </h2>
                <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#475569', marginTop: '1px' }}>
                  Ranked from Rank 1 to all active leaders based on validated converts
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '7px', textAlign: 'right' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#1e40af' }}>
                Total: {sortedLeaders.length} Leaders
              </span>
            </div>
          </div>

          {/* All Team Leaders List (All fit on this page, names wrap without clipping) */}
          {renderMemberList(sortedLeaders, 'leader')}
        </div>

        {/* Bottom Section: Compact Admin Authorization & Footer */}
        {renderBottomSection(1, 'blue')}
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: ALL TEAM TRAINERS CONVERTS & RANKINGS (Strictly on Page 2)        */}
      {/* ========================================================================= */}
      <div 
        className="ranking-pdf-page"
        id="ranking-page-2"
        style={{
          width: '800px',
          height: '1131px',
          minHeight: '1131px',
          maxHeight: '1131px',
          padding: '24px 28px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          fontFamily: "'Segoe UI', Roboto, 'Hind Siliguri', 'Kalpurush', 'SolaimanLipi', -apple-system, BlinkMacSystemFont, sans-serif",
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          marginBottom: '30px',
          border: '1.5px solid #cbd5e1'
        }}
      >
        <div>
          {/* Header for Page 2 */}
          {renderHeader(2, "Team Trainers Performance Board", "green")}

          {/* Simple Clean Banner */}
          <div 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              border: '1.5px solid #a7f3d0',
              marginBottom: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={17} style={{ color: '#047857' }} />
              <div>
                <h2 style={{ fontSize: '14.5px', fontWeight: 900, color: '#065f46', margin: 0, letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
                  Team Trainers Performance Ranking
                </h2>
                <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#475569', marginTop: '1px' }}>
                  Ranked from Rank 1 to all active trainers based on validated converts
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '7px', textAlign: 'right' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#047857' }}>
                Total: {sortedTrainers.length} Trainers
              </span>
            </div>
          </div>

          {/* All Team Trainers List (All fit on this page, names wrap without clipping) */}
          {renderMemberList(sortedTrainers, 'trainer')}
        </div>

        {/* Bottom Section: Compact Admin Authorization & Footer */}
        {renderBottomSection(2, 'green')}
      </div>
    </div>
  );
});

RankingExportTemplate.displayName = 'RankingExportTemplate';

export default RankingExportTemplate;
