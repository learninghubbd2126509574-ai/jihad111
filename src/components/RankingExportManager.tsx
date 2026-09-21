import React, { useRef, useState } from 'react';
import { Download, FileText, Image as ImageIcon, Loader2, Eye, CheckCircle2, Sparkles, Shield, Trophy } from 'lucide-react';
import RankingExportTemplate, { RankingMember } from './RankingExportTemplate';
import { generateRankingPdf, generateRankingImage } from '../utils/exportRankingPdf';

interface RankingExportManagerProps {
  leaderRanking: RankingMember[];
  trainerRanking: RankingMember[];
  customLogo?: string;
  monthName?: string;
}

const RankingExportManager: React.FC<RankingExportManagerProps> = ({ 
  leaderRanking, 
  trainerRanking, 
  customLogo,
  monthName
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string>('');
  
  const captureRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!captureRef.current) return;
    
    setIsExportingPdf(true);
    setStatusMessage('Preparing high-definition PDF document...');
    setSuccessNotice('');
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `Unity_Earning_Monthly_Performance_Report_${dateStr}.pdf`;
      
      await generateRankingPdf({
        element: captureRef.current,
        fileName,
        onProgress: (status) => setStatusMessage(status)
      });
      
      setSuccessNotice('PDF Report downloaded successfully! Ready to share in groups.');
      setTimeout(() => setSuccessNotice(''), 6000);
    } catch (error) {
      console.error('Error exporting ranking PDF:', error);
      alert('Failed to generate PDF document. Please try again.');
    } finally {
      setIsExportingPdf(false);
      setStatusMessage('');
    }
  };

  const handleDownloadPng = async () => {
    if (!captureRef.current) return;
    
    setIsExportingPng(true);
    setStatusMessage('Rendering high-resolution image...');
    setSuccessNotice('');
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `Unity_Earning_Ranking_${dateStr}.png`;
      
      await generateRankingImage({
        element: captureRef.current,
        fileName,
        onProgress: (status) => setStatusMessage(status)
      });
      
      setSuccessNotice('High-Res PNG image downloaded successfully!');
      setTimeout(() => setSuccessNotice(''), 6000);
    } catch (error) {
      console.error('Error exporting ranking PNG:', error);
      alert('Failed to generate ranking image.');
    } finally {
      setIsExportingPng(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="p-6 sm:p-7 bg-[#1e293b]/70 rounded-[32px] border border-blue-500/20 shadow-2xl relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/10 blur-[90px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Trophy size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white tracking-tight">Official Ranking & Performance PDF Hub</h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
                PRO PDF
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Generate & download high-resolution Neumorphic PDF reports for Telegram & WhatsApp groups
            </p>
          </div>
        </div>

        {/* Live Records Count */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{leaderRanking.length} Leaders • {trainerRanking.length} Trainers</span>
        </div>
      </div>

      {/* Success Notice */}
      {successNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-sm font-bold animate-fadeIn">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Status Progress */}
      {statusMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-200 flex items-center gap-3 text-sm font-bold animate-fadeIn">
          <Loader2 size={20} className="shrink-0 animate-spin text-blue-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
        
        {/* PDF Report Card (PRIMARY) */}
        <div className="p-6 rounded-[28px] bg-gradient-to-br from-blue-950/40 via-[#0f172a]/60 to-slate-900/60 border border-blue-400/30 flex flex-col justify-between shadow-xl relative group hover:border-blue-400/50 transition-all">
          <div className="absolute -top-3 right-6 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
            Recommended
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-2.5 text-blue-400">
              <FileText size={20} />
              <h4 className="text-base font-black text-white">Monthly Performance PDF Report</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Exports an official executive PDF document featuring crisp Neumorphic card styling, company header, authorized signature seal, and complete Leader & Trainer rankings.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-400" /> Vector Sharp Text
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1">
                <Shield size={12} className="text-emerald-400" /> Official Seal & Header
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                A4 Standard Layout
              </span>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf || isExportingPng}
              className="flex-1 flex items-center justify-center gap-2.5 py-4 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Generating PDF Report...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>ডাউনলোড PDF রিপোর্ট</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowPreview(true)}
              title="Preview Report"
              className="p-4 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-bold transition-all border border-white/10 active:scale-95 cursor-pointer"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>

        {/* High-Res PNG Card */}
        <div className="p-6 rounded-[28px] bg-white/[0.03] border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5 text-indigo-400">
              <ImageIcon size={20} />
              <h4 className="text-base font-black text-white">High-Resolution Image (PNG)</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Create a standalone 300+ DPI PNG image optimized for quick photo sharing on social media, Facebook feeds, or chat attachments.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                3X Ultra Sharp Scale
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                Direct PNG File
              </span>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleDownloadPng}
              disabled={isExportingPdf || isExportingPng}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-5 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-black text-sm transition-all border border-white/10 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isExportingPng ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Rendering Image...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Download Image (PNG)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0f172a] border border-white/20 rounded-[32px] max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Monthly Performance Report Preview</h3>
                  <p className="text-xs text-slate-400">Neumorphic Document Layout</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isExportingPdf}
                  className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Scrollable Preview Area */}
            <div className="flex-1 overflow-auto p-6 flex justify-center bg-slate-950/80 custom-scrollbar">
              <div className="origin-top scale-[0.8] sm:scale-[0.9] lg:scale-100 transition-transform">
                {/* Visible Render of Template for user preview */}
                <div style={{ width: '800px', pointerEvents: 'none' }}>
                  <RankingExportTemplate 
                    leaderRanking={leaderRanking}
                    trainerRanking={trainerRanking}
                    customLogo={customLogo}
                    monthName={monthName}
                    isPreview={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden high-res template node for HTML2Canvas capture */}
      <RankingExportTemplate 
        ref={captureRef}
        leaderRanking={leaderRanking}
        trainerRanking={trainerRanking}
        customLogo={customLogo}
        monthName={monthName}
      />
    </div>
  );
};

export default RankingExportManager;
