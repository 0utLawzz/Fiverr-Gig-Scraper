import React, { useState } from 'react';
import { 
  Download, 
  Layers, 
  Table, 
  Code2, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  Zap
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
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-white text-base">
              fi
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">
                  Fiverr Gig Scraper Pro
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Manifest V3
                </span>
                {isScraping && (
                  <span className="flex items-center space-x-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Scraping Live</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                MutationObserver • 12+ Fields • CSV/Excel/JSON • Supabase & Vercel Ready
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'sandbox'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'table'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Extracted Gigs</span>
              {gigsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-400/20 text-emerald-300 rounded-full text-[10px]">
                  {gigsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'community'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Git & Community</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'code'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Extension Code</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Supabase Button */}
            <button
              onClick={onOpenSupabaseModal}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              title="Connect to Supabase and sync extracted gigs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Supabase</span>
            </button>

            {/* Export Menu Button */}
            <button
              onClick={onOpenExportModal}
              disabled={gigsCount === 0}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              title="Export to CSV, Excel, or JSON"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Export</span>
            </button>

            {/* Download Extension Zip */}
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all ${
                downloadSuccess
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold active:scale-95'
              }`}
              title="Download unpacked Chrome Extension as a ZIP ready to load into chrome://extensions"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Extension Downloaded!</span>
                </>
              ) : isZipping ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Zipping...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-950" />
                  <span className="hidden sm:inline">Download Extension (.zip)</span>
                  <span className="sm:hidden">Download (.zip)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
