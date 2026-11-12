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
import { CheckCircle2, AlertCircle, Info, Sparkles, Download } from 'lucide-react';

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
    // If starting fresh or re-starting
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

  // Dismiss auto-download toast after 6 seconds
  useEffect(() => {
    if (autoDownloadToast) {
      const timer = setTimeout(() => {
        setAutoDownloadToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [autoDownloadToast]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
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
        {/* Automatic CSV Download Toast */}
        {autoDownloadToast && (
          <div className="fixed top-20 right-5 z-50 bg-emerald-950 border border-emerald-500/80 rounded-2xl p-4 shadow-2xl flex items-center space-x-3 text-emerald-100 max-w-md animate-in slide-in-from-top-4 duration-300">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <Download className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-white text-sm">
                Dataset Exported Automatically!
              </div>
              <p className="text-emerald-300/80">
                Extracted <strong>{autoDownloadToast.count} gigs</strong>. Saved as{' '}
                <span className="font-mono text-emerald-300 font-semibold underline">
                  {autoDownloadToast.filename}
                </span>
              </p>
            </div>
            <button
              onClick={() => setAutoDownloadToast(null)}
              className="text-emerald-400 hover:text-white p-1 text-xs"
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
    </div>
  );
}
