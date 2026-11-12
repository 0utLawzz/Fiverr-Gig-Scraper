import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FiverrSandbox } from './components/FiverrSandbox';
import { DataTable } from './components/DataTable';
import { ExtensionCodeViewer } from './components/ExtensionCodeViewer';
import { ScraperHUD } from './components/ScraperHUD';
import { RawCsvModal } from './components/RawCsvModal';
import { ExportModal } from './components/ExportModal';
import { SupabaseModal } from './components/SupabaseModal';
import { CommunityHub } from './components/CommunityHub';
import { FiverrGig, ScrapeFilters, ScraperStatus } from './types/scraper';
import { downloadCsvFile } from './utils/csvExporter';
import { Download, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'table' | 'code' | 'community'>('sandbox');
  const [scrapedGigs, setScrapedGigs] = useState<FiverrGig[]>([]);
  const [scrapedIds, setScrapedIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<ScraperStatus>('idle');
  const [filteredCount, setFilteredCount] = useState<number>(0);
  const [mutationEventsCount, setMutationEventsCount] = useState<number>(0);
  const [isRawCsvModalOpen, setIsRawCsvModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [autoDownloadToast, setAutoDownloadToast] = useState<{ filename: string; count: number } | null>(null);

  const [filters, setFilters] = useState<ScrapeFilters>({
    minRating: 4.5,
    minPrice: 0,
    maxPrice: 500,
    targetCount: 20,
    autoDownloadCsv: true,
    scrollSpeed: 'medium',
  });

  const progress = filters.targetCount > 0
    ? (scrapedGigs.length / filters.targetCount) * 100
    : 0;

  // Handler when a gig is captured by the MutationObserver
  const handleGigScraped = useCallback(
    (gig: FiverrGig) => {
      setScrapedGigs((prev) => {
        if (prev.some((g) => g.id === gig.id)) return prev;

        const updated = [
          ...prev,
          {
            ...gig,
            position: prev.length + 1,
            timestamp: new Date().toISOString(),
          },
        ];

        setScrapedIds((ids) => new Set(ids).add(gig.id));

        // Check if target reached
        if (updated.length >= filters.targetCount && status === 'running') {
          setStatus('completed');
          if (filters.autoDownloadCsv) {
            const { filename } = downloadCsvFile(updated);
            setAutoDownloadToast({ filename, count: updated.length });
          }
        }

        return updated;
      });
    },
    [filters.targetCount, filters.autoDownloadCsv, status]
  );

  const handleFilterRejection = useCallback(() => {
    setFilteredCount((c) => c + 1);
  }, []);

  const handleMutationEvent = useCallback((count: number) => {
    setMutationEventsCount((c) => c + count);
  }, []);

  const handleStart = () => {
    if (status === 'completed' || status === 'idle') {
      setScrapedGigs([]);
      setScrapedIds(new Set());
      setFilteredCount(0);
      setMutationEventsCount(0);
    }
    setStatus('running');
  };

  const handlePauseToggle = () => {
    if (status === 'running') {
      setStatus('paused');
    } else if (status === 'paused') {
      setStatus('running');
    }
  };

  const handleStop = () => {
    setStatus('idle');
  };

  const handleExportTrigger = () => {
    setIsExportModalOpen(true);
  };

  const handleClear = () => {
    setScrapedGigs([]);
    setScrapedIds(new Set());
    setFilteredCount(0);
    setMutationEventsCount(0);
    setStatus('idle');
  };

  useEffect(() => {
    if (autoDownloadToast) {
      const timer = setTimeout(() => {
        setAutoDownloadToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [autoDownloadToast]);

  return (
    <div className="min-h-screen bg-[#FFFEF2] text-[#2D2D2D] flex flex-col font-sans selection:bg-[#FFD23F] selection:text-[#2D2D2D]">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gigsCount={scrapedGigs.length}
        isScraping={status === 'running'}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Automatic Download Toast */}
        {autoDownloadToast && (
          <div className="fixed top-24 right-6 z-50 bg-[#00D37F] border-3 border-[#2D2D2D] rounded-2xl p-4 shadow-[8px_8px_0_#2D2D2D] flex items-center gap-3 text-[#2D2D2D] max-w-md animate-in slide-in-from-top-4 duration-300">
            <div className="w-10 h-10 rounded-xl bg-[#FFD23F] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-[#2D2D2D] stroke-[2.5]" />
            </div>
            <div className="flex-1 text-xs font-sans">
              <div className="font-hand text-xl font-bold leading-tight">
                Dataset Exported Automatically!
              </div>
              <p className="font-code text-[11px] text-[#2D2D2D]/90 mt-0.5">
                Extracted <strong>{autoDownloadToast.count} gigs</strong>. Saved as{' '}
                <span className="underline font-bold">{autoDownloadToast.filename}</span>
              </p>
            </div>
            <button
              onClick={() => setAutoDownloadToast(null)}
              className="w-7 h-7 bg-white hover:bg-[#FF6B6B] hover:text-white border-2 border-[#2D2D2D] shadow-[1px_1px_0_#2D2D2D] rounded-lg font-bold flex items-center justify-center text-xs transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* View Routing */}
        {activeTab === 'sandbox' && (
          <FiverrSandbox
            filters={filters}
            setFilters={setFilters}
            status={status}
            onGigScraped={handleGigScraped}
            onFilterRejection={handleFilterRejection}
            onMutationEvent={handleMutationEvent}
            scrapedIds={scrapedIds}
          />
        )}

        {activeTab === 'table' && (
          <DataTable
            gigs={scrapedGigs}
            onClear={handleClear}
            onOpenRawCsvModal={() => setIsRawCsvModalOpen(true)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          />
        )}

        {activeTab === 'community' && <CommunityHub gigs={scrapedGigs} />}

        {activeTab === 'code' && <ExtensionCodeViewer />}
      </main>

      {/* Floating Scraper HUD */}
      <ScraperHUD
        status={status}
        progress={progress}
        extractedCount={scrapedGigs.length}
        filteredCount={filteredCount}
        mutationEventsCount={mutationEventsCount}
        filters={filters}
        onStart={handleStart}
        onPauseToggle={handlePauseToggle}
        onStop={handleStop}
        onExportCsv={handleExportTrigger}
        onReset={handleClear}
      />

      {/* Format Selector Export Modal (CSV, Excel, JSON) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        gigs={scrapedGigs}
      />

      {/* Raw CSV Modal */}
      <RawCsvModal
        isOpen={isRawCsvModalOpen}
        onClose={() => setIsRawCsvModalOpen(false)}
        gigs={scrapedGigs}
      />

      {/* Supabase Integration & Sync Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        gigs={scrapedGigs}
      />

      {/* Playful Charm Footer */}
      <footer className="border-t-2 border-[#2D2D2D] bg-white py-3.5 px-6 flex flex-col sm:flex-row justify-between items-center gap-2 label-mono text-[#2D2D2D] mt-auto">
        <span>[ Status: Connected ]</span>
        <span>Designed for High Performance Scraping • 2026</span>
        <div className="flex gap-4">
          <span>Supabase Sync: ON</span>
          <span>Build 1.2.0</span>
        </div>
      </footer>
    </div>
  );
}
