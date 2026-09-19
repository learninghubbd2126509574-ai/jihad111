import React, { forwardRef } from 'react';
import { ShieldCheck, Globe, Mail } from 'lucide-react';

interface RankingMember {
  id: string;
  name: string;
  score: number;
  leads?: number;
  createdAt: any;
}

interface RankingExportTemplateProps {
  leaderRanking: RankingMember[];
  trainerRanking: RankingMember[];
  customLogo?: string;
}

const RankingExportTemplate = forwardRef<HTMLDivElement, RankingExportTemplateProps>(({ 
  leaderRanking, 
  trainerRanking, 
  customLogo 
}, ref) => {
  const today = new Date();
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

  // Sort by score descending
  const sortedLeaders = [...leaderRanking].sort((a, b) => b.score - a.score).slice(0, 20); // Limit to top 20 to fit perfectly
  const sortedTrainers = [...trainerRanking].sort((a, b) => b.score - a.score).slice(0, 20); // Limit to top 20 to fit perfectly

  // Soft Neumorphic Theme Colors (Light Blue-Grey)
  const baseBg = '#e0e9f4';
  const shadowDark = '#beccde';
  const shadowLight = '#ffffff';

  return (
    <div 
      ref={ref}
      style={{ 
        width: '450px', 
        height: '750px', // Standard mobile/Instagram-friendly frame
        padding: '16px',
        backgroundColor: baseBg,
        color: '#090d16',
        fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif",
        position: 'absolute',
        left: '-9999px', 
        top: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden'
      }}
      className="ranking-capture-area"
    >
      {/* Neumorphic Header Container */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 30px',
          borderRadius: '24px',
          backgroundColor: baseBg,
          boxShadow: `8px 8px 16px ${shadowDark}, -8px -8px 16px ${shadowLight}`,
          marginBottom: '25px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div 
            style={{ 
              width: '55px', 
              height: '55px', 
              backgroundColor: baseBg, 
              borderRadius: '16px',
              boxShadow: `inset 3px 3px 6px ${shadowDark}, inset -3px -3px 6px ${shadowLight}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              boxSizing: 'border-box'
            }}
          >
            {customLogo ? (
              <img src={customLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontWeight: 900, fontSize: '18px', color: '#1d4ed8' }}>UN</span>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1d4ed8', margin: 0, letterSpacing: '-0.5px', lineHeight: 1 }}>
              Unity Earning
            </h1>
            <p style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', margin: '4px 0 0 0', uppercase: 'true', letterSpacing: '2px' } as any}>
              E-LEARNING PLATFORM
            </p>
          </div>
        </div>
        
        <div 
          style={{ 
            textAlign: 'right',
            padding: '10px 20px',
            borderRadius: '16px',
            boxShadow: `inset 3px 3px 6px ${shadowDark}, inset -3px -3px 6px ${shadowLight}`,
          }}
        >
          <p style={{ fontSize: '8px', fontWeight: 900, color: '#64748b', margin: 0, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Official Document</p>
          <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#090d16', margin: '2px 0 0 0', textTransform: 'uppercase' }}>Performance Ranking</h2>
        </div>
      </div>

      {/* Main Title - Neumorphic Bevel */}
      <div 
        style={{ 
          textAlign: 'center', 
          marginBottom: '25px',
          padding: '15px',
          borderRadius: '24px',
          boxShadow: `inset 4px 4px 8px ${shadowDark}, inset -4px -4px 8px ${shadowLight}`,
        }}
      >
        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#090d16', margin: 0, letterSpacing: '-0.5px' }}>
          Team Leader & Trainer Ranking
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              backgroundColor: baseBg, 
              padding: '4px 14px', 
              borderRadius: '20px', 
              fontSize: '10px', 
              fontWeight: 900, 
              color: '#059669',
              boxShadow: `3px 3px 6px ${shadowDark}, -3px -3px 6px ${shadowLight}`,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            <div style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }} />
            Live Convert Analytics
          </div>
        </div>
      </div>

      {/* Columns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', flex: 1, overflow: 'hidden', marginBottom: '25px' }}>
        
        {/* Team Leaders Column */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              marginBottom: '15px', 
              padding: '10px 15px',
              borderRadius: '16px',
              boxShadow: `4px 4px 8px ${shadowDark}, -4px -4px 8px ${shadowLight}`,
            }}
          >
            <ShieldCheck size={18} style={{ color: '#1d4ed8' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#090d16', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Team Leaders</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
            {sortedLeaders.map((member, idx) => {
              const isTop3 = idx < 3;
              const top3Bg = idx === 0 ? '#fef3c7' : idx === 1 ? '#f1f5f9' : '#ffedd5';
              const top3Text = idx === 0 ? '#d97706' : idx === 1 ? '#475569' : '#ca8a04';
              const top3ShadowDark = idx === 0 ? '#f59e0b33' : idx === 1 ? '#cbd5e1a0' : '#ea580c33';

              return (
                <div 
                  key={member.id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '8px 12px', 
                    borderRadius: '16px', 
                    backgroundColor: isTop3 ? top3Bg : baseBg,
                    border: isTop3 ? `1px solid ${idx === 0 ? '#fde68a' : idx === 1 ? '#e2e8f0' : '#fed7aa'}` : 'none',
                    boxShadow: isTop3 
                      ? `4px 4px 8px ${top3ShadowDark}, -4px -4px 8px ${shadowLight}`
                      : `3px 3px 6px ${shadowDark}, -3px -3px 6px ${shadowLight}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <div 
                      style={{ 
                        width: '26px', 
                        height: '26px', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '11px', 
                        fontWeight: 900,
                        backgroundColor: isTop3 ? '#ffffff' : baseBg,
                        color: isTop3 ? top3Text : '#64748b',
                        boxShadow: isTop3 ? 'none' : `inset 2px 2px 4px ${shadowDark}, inset -2px -2px 4px ${shadowLight}`
                      }}
                    >
                      #{idx + 1}
                    </div>
                    <span 
                      style={{ 
                        fontSize: '12px', 
                        fontWeight: isTop3 ? 800 : 600, 
                        color: isTop3 ? '#090d16' : '#1e293b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {member.name}
                    </span>
                  </div>
                  <div 
                    style={{ 
                      fontSize: '13px', 
                      fontWeight: 900, 
                      color: isTop3 ? top3Text : '#1d4ed8',
                      paddingLeft: '10px'
                    }}
                  >
                    {member.score}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Trainers Column */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              marginBottom: '15px', 
              padding: '10px 15px',
              borderRadius: '16px',
              boxShadow: `4px 4px 8px ${shadowDark}, -4px -4px 8px ${shadowLight}`,
            }}
          >
            <Globe size={18} style={{ color: '#059669' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#090d16', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Team Trainers</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
            {sortedTrainers.map((member, idx) => {
              const isTop3 = idx < 3;
              const top3Bg = idx === 0 ? '#fef3c7' : idx === 1 ? '#f1f5f9' : '#ffedd5';
              const top3Text = idx === 0 ? '#d97706' : idx === 1 ? '#475569' : '#ca8a04';
              const top3ShadowDark = idx === 0 ? '#f59e0b33' : idx === 1 ? '#cbd5e1a0' : '#ea580c33';

              return (
                <div 
                  key={member.id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '8px 12px', 
                    borderRadius: '16px', 
                    backgroundColor: isTop3 ? top3Bg : baseBg,
                    border: isTop3 ? `1px solid ${idx === 0 ? '#fde68a' : idx === 1 ? '#e2e8f0' : '#fed7aa'}` : 'none',
                    boxShadow: isTop3 
                      ? `4px 4px 8px ${top3ShadowDark}, -4px -4px 8px ${shadowLight}`
                      : `3px 3px 6px ${shadowDark}, -3px -3px 6px ${shadowLight}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <div 
                      style={{ 
                        width: '26px', 
                        height: '26px', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '11px', 
                        fontWeight: 900,
                        backgroundColor: isTop3 ? '#ffffff' : baseBg,
                        color: isTop3 ? top3Text : '#64748b',
                        boxShadow: isTop3 ? 'none' : `inset 2px 2px 4px ${shadowDark}, inset -2px -2px 4px ${shadowLight}`
                      }}
                    >
                      #{idx + 1}
                    </div>
                    <span 
                      style={{ 
                        fontSize: '12px', 
                        fontWeight: isTop3 ? 800 : 600, 
                        color: isTop3 ? '#090d16' : '#1e293b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {member.name}
                    </span>
                  </div>
                  <div 
                    style={{ 
                      fontSize: '13px', 
                      fontWeight: 900, 
                      color: isTop3 ? top3Text : '#059669',
                      paddingLeft: '10px'
                    }}
                  >
                    {member.score}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Neumorphic Footer */}
      <div 
        style={{ 
          padding: '20px 30px',
          borderRadius: '24px',
          backgroundColor: baseBg,
          boxShadow: `8px 8px 16px ${shadowDark}, -8px -8px 16px ${shadowLight}`,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}
      >
        <div>
          <div style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <ShieldCheck size={14} strokeWidth={3} />
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Verified System Report</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '9px', fontWeight: 700, margin: 0 }}>
            Generated: <span style={{ color: '#090d16' }}>{formattedDate}</span> at <span style={{ color: '#090d16' }}>{formattedTime}</span>
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '2px' }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontStyle: 'italic', fontSize: '18px', color: '#090d16' }}>
              Jihadul Islam
            </span>
          </div>
          <div style={{ backgroundColor: '#cbd5e1', width: '120px', height: '1.5px', margin: '4px auto' }} />
          <p style={{ color: '#64748b', fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Authorized Signature</p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#090d16', fontWeight: 900, fontSize: '11px', marginBottom: '2px' }}>
            www.unityearning.com
          </div>
          <div style={{ color: '#64748b', fontWeight: 700, fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
            <Mail size={10} />
            <span>support@unityearning.com</span>
          </div>
        </div>
      </div>
    </div>
  );
});

RankingExportTemplate.displayName = 'RankingExportTemplate';

export default RankingExportTemplate;
