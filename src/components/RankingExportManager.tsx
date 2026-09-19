import React, { useRef, useState } from 'react';
import { Download, FileImage, Loader2, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import RankingExportTemplate from './RankingExportTemplate';

interface RankingMember {
  id: string;
  name: string;
  score: number;
  leads?: number;
  createdAt: any;
}

interface RankingExportManagerProps {
  leaderRanking: RankingMember[];
  trainerRanking: RankingMember[];
  customLogo?: string;
}

const RankingExportManager: React.FC<RankingExportManagerProps> = ({ 
  leaderRanking, 
  trainerRanking, 
  customLogo 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!captureRef.current) return;
    
    setIsExporting(true);
    try {
      // Need to make sure the hidden element is properly rendered before capture
      // html2canvas sometimes needs a small delay or specific options for hidden elements
      const canvas = await html2canvas(captureRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: '#e0e9f4',
        logging: false,
        onclone: (clonedDoc) => {
          // Fix for html2canvas oklch parsing error
          // We remove any oklch color functions from the cloned document's styles
          const styles = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styles.length; i++) {
            const style = styles[i];
            if (style.innerHTML.includes('oklch')) {
              // Replace oklch with a fallback color (e.g., transparent or black)
              // This prevents html2canvas from crashing while parsing the stylesheet
              style.innerHTML = style.innerHTML.replace(/oklch\([^)]+\)/g, 'rgba(0,0,0,0.1)');
            }
          }

          const element = clonedDoc.querySelector('.ranking-capture-area') as HTMLElement;
          if (element) {
            element.style.left = '0';
            element.style.position = 'relative';
          }
        }
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = image;
      link.download = `Unity_Earning_Ranking_${date}.png`;
      link.click();
    } catch (error) {
      console.error('Error exporting ranking:', error);
      alert('Failed to generate ranking image.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-accent/10 text-blue-accent rounded-2xl">
          <FileImage size={24} />
        </div>
        <div>
          <h3 className="text-lg font-black text-white">Ranking Report Hub</h3>
          <p className="text-[10px] text-muted-main/60 font-bold uppercase tracking-widest">Generate Official Ranking Documents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black text-white mb-2">Visual Performance Export</h4>
            <p className="text-xs text-muted-main/70 leading-relaxed font-medium">
              Create a professionally styled image of the current Team Leader and Trainer rankings. Perfect for sharing on social media or community groups.
            </p>
          </div>
          
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="mt-6 flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Generating Image...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Download Ranking Image</span>
              </>
            )}
          </button>
        </div>

        <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col justify-between opacity-60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest mb-3">
              Coming Soon
            </div>
            <h4 className="text-sm font-black text-white mb-2">PDF Detailed Analytics</h4>
            <p className="text-xs text-muted-main/70 leading-relaxed font-medium">
              Generate a comprehensive PDF report with individual performance metrics, growth charts, and historical comparisons.
            </p>
          </div>
          <button disabled className="mt-6 flex items-center justify-center gap-2 w-full py-4 bg-white/5 text-muted-main rounded-2xl font-black text-sm cursor-not-allowed">
            Locked
          </button>
        </div>
      </div>

      {/* Hidden template for capture */}
      <RankingExportTemplate 
        ref={captureRef}
        leaderRanking={leaderRanking}
        trainerRanking={trainerRanking}
        customLogo={customLogo}
      />
    </div>
  );
};

export default RankingExportManager;
