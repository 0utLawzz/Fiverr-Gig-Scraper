import React, { useState } from 'react';
import { 
  Download, 
  Layers, 
  Table, 
  Code2, 
  CheckCircle2, 
  Database,
  FileSpreadsheet,
  Zap,
  Sparkles
} from 'lucide-react';
import { downloadExtensionZipPackage } from '../utils/extensionBundle';

interface HeaderProps {
  activeTab: 'sandbox' | 'table' | 'code' | 'community';
  setActiveTab: (tab: 'sandbox' | 'table' | 'code' | 'community') => void;
  gigsCount: number;
  isScraping: boolean;
  onOpenSupabaseModal: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  gigsCount,
  isScraping,
  onOpenSupabaseModal,
  onOpenExportModal,
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadExtensionZipPackage();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate extension zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-[#2D2D2D] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Playful Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div 
              className="w-11 h-11 sm:w-12 sm:h-12 bg-[#00D37F] border-2 border-[#2D2D2D] shadow-[4px_4px_0_#2D2D2D] -rotate-3 rounded-lg flex items-center justify-center font-hand text-3xl font-black text-[#2D2D2D] shrink-0 hover:rotate-0 transition-transform cursor-pointer"
              title="Fiverr Scraper Studio"
            >
              fi
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-hand text-2xl sm:text-3.5xl font-bold tracking-tight text-[#2D2D2D] leading-none">
                  Fiverr Scraper Pro
                </h1>
                {isScraping ? (
                  <span className="flex items-center gap-1 font-code text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00D37F] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] animate-bounce">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D2D2D]"></span>
                    <span>SCRAPING LIVE</span>
                  </span>
                ) : (
                  <span className="hidden md:inline-flex items-center font-code text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFD23F] border border-[#2D2D2D] text-[#2D2D2D]">
                    v1.2
                  </span>
                )}
              </div>
              <p className="label-mono text-[10px] sm:text-[11px] text-[#2D2D2D]/70 mt-0.5">
                Manifest V3 • MutationObserver • Studio Edition
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Playful Ghost Buttons) */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'sandbox'
                  ? 'bg-[#FFD23F] text-[#2D2D2D] border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] -translate-y-0.5'
                  : 'text-[#2D2D2D] hover:bg-[#2D2D2D]/5 border-2 border-transparent hover:border-[#2D2D2D]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'table'
                  ? 'bg-[#00D37F] text-[#2D2D2D] border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] -translate-y-0.5'
                  : 'text-[#2D2D2D] hover:bg-[#2D2D2D]/5 border-2 border-transparent hover:border-[#2D2D2D]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Extracted</span>
              {gigsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#2D2D2D] text-white rounded-full text-[10px] font-code">
                  {gigsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`hidden md:flex px-3 py-1.5 rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all items-center gap-1.5 ${
                activeTab === 'community'
                  ? 'bg-[#FFD23F] text-[#2D2D2D] border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] -translate-y-0.5'
                  : 'text-[#2D2D2D] hover:bg-[#2D2D2D]/5 border-2 border-transparent hover:border-[#2D2D2D]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Git &amp; Docs</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`hidden lg:flex px-3 py-1.5 rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-[#FFD23F] text-[#2D2D2D] border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] -translate-y-0.5'
                  : 'text-[#2D2D2D] hover:bg-[#2D2D2D]/5 border-2 border-transparent hover:border-[#2D2D2D]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </nav>

          {/* Action Buttons: Supabase, Export & Download */}
          <div className="flex items-center gap-2">
            {/* Supabase Button */}
            <button
              onClick={onOpenSupabaseModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] hover:shadow-[4px_4px_0_#2D2D2D] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#2D2D2D] rounded-md text-xs font-bold text-[#2D2D2D] transition-all"
              title="Connect Supabase Database"
            >
              <span className="w-2 h-2 rounded-full bg-[#00D37F] border border-[#2D2D2D]"></span>
              <span className="font-code text-[11px]">SUPABASE</span>
            </button>

            {/* Export Menu Trigger */}
            <button
              onClick={onOpenExportModal}
              disabled={gigsCount === 0}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-white border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] hover:shadow-[4px_4px_0_#2D2D2D] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#2D2D2D] disabled:opacity-40 disabled:pointer-events-none rounded-md text-xs font-bold text-[#2D2D2D] transition-all"
              title="Export as CSV, Excel, or JSON"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#00D37F]" />
              <span className="font-code text-[11px]">EXPORT</span>
            </button>

            {/* Primary Action Button (Download Extension) */}
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 font-extrabold uppercase font-sans text-xs tracking-wider border-2 border-[#2D2D2D] rounded-md transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
                downloadSuccess
                  ? 'bg-[#00D37F] text-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D]'
                  : 'bg-[#FFD23F] hover:bg-[#ffe066] text-[#2D2D2D] shadow-[4px_4px_0_#2D2D2D]'
              }`}
              title="Download Chrome Extension (.zip)"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#2D2D2D]" />
                  <span>Downloaded!</span>
                </>
              ) : isZipping ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#2D2D2D] border-t-transparent rounded-full animate-spin"></div>
                  <span>Zipping...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#2D2D2D] stroke-[2.5]" />
                  <span className="hidden sm:inline">Download Extension</span>
                  <span className="sm:hidden">Get (.zip)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
