import React, { useRef, useState } from 'react';
import { Download, FileText, Image as ImageIcon, Loader2, Eye, CheckCircle2, Trophy, X } from 'lucide-react';
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
    setStatusMessage('Preparing high-resolution PDF document...');
    setSuccessNotice('');
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `Unity_Earning_Monthly_Performance_Report_${dateStr}.pdf`;

      await generateRankingPdf({
        element: captureRef.current,
        fileName,
        onProgress: (status) => setStatusMessage(status)
      });

      setSuccessNotice('PDF report downloaded successfully!');
      setTimeout(() => setSuccessNotice(''), 6000);
    } catch (error) {
      console.error('Error exporting ranking PDF:', error);
    } finally {
      setIsExportingPdf(false);
      setStatusMessage('');
    }
  };

  const handleDownloadPng = async () => {
    if (!captureRef.current) return;

    setIsExportingPng(true);
    setStatusMessage('Rendering high-resolution PNG image...');
    setSuccessNotice('');
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `Unity_Earning_Ranking_${dateStr}.png`;

      await generateRankingImage({
        element: captureRef.current,
        fileName,
        onProgress: (status) => setStatusMessage(status)
      });

      setSuccessNotice('PNG image downloaded successfully!');
      setTimeout(() => setSuccessNotice(''), 6000);
    } catch (error) {
      console.error('Error exporting ranking PNG:', error);
    } finally {
      setIsExportingPng(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="fintech-card p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B4F9C] flex items-center justify-center text-white shrink-0">
            <Trophy size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Official Ranking &amp; PDF Report</h3>
            <p className="text-xs text-[#64748B]">
              Download A4 reports formatted for Telegram and WhatsApp sharing
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold text-[#64748B] font-mono tabular-nums self-start sm:self-auto">
          {leaderRanking.length} Leaders · {trainerRanking.length} Trainers
        </div>
      </div>

      {successNotice && (
        <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center gap-2.5 text-xs font-bold">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-[#EEF5FF] border border-[#D6E6FF] text-[#0B4F9C] flex items-center gap-2.5 text-xs font-bold">
          <Loader2 size={18} className="shrink-0 animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PDF Card */}
        <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#D6E6FF] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[#0B4F9C]">
              <FileText size={18} />
              <h4 className="text-sm font-bold text-[#0F172A]">Monthly Performance PDF Report</h4>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Export a clean A4 PDF report featuring the official organization logo and verified standings.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf || isExportingPng}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#0B4F9C] hover:bg-[#094182] text-white rounded-xl font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowPreview(true)}
              title="Preview Report"
              className="p-3 bg-white hover:bg-[#F4F6F9] text-[#334155] rounded-xl font-bold transition-colors border border-[#E5E7EB] cursor-pointer"
            >
              <Eye size={16} />
            </button>
          </div>
        </div>

        {/* PNG Card */}
        <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[#047857]">
              <ImageIcon size={18} />
              <h4 className="text-sm font-bold text-[#0F172A]">High-Resolution Image (PNG)</h4>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Download a crisp PNG snapshot for quick sharing across social channels and team chats.
            </p>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExportingPdf || isExportingPng}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-[#F4F6F9] text-[#0F172A] rounded-xl font-bold text-xs transition-colors border border-[#E5E7EB] disabled:opacity-50 cursor-pointer"
            >
              {isExportingPng ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Download PNG</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/55"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white border border-[#E5E7EB] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#EEF5FF] text-[#0B4F9C]">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">Performance Report Preview</h3>
                  <p className="text-xs text-[#64748B]">Official A4 Document</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isExportingPdf}
                  className="py-2 px-3.5 bg-[#0B4F9C] hover:bg-[#094182] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={14} />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  aria-label="Close preview"
                  className="p-2 bg-white hover:bg-[#F4F6F9] border border-[#E5E7EB] text-[#64748B] rounded-xl transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 flex justify-center bg-[#F4F6F9] custom-scrollbar">
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
      )}

      {/* Hidden high-res template for export */}
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
