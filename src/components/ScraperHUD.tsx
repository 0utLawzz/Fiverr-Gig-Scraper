import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ScraperStatus, ScrapeFilters } from '../types/scraper';

interface ScraperHUDProps {
  status: ScraperStatus;
  progress: number;
  extractedCount: number;
  filteredCount: number;
  mutationEventsCount: number;
  filters: ScrapeFilters;
  onStart: () => void;
  onPauseToggle: () => void;
  onStop: () => void;
  onExportCsv: () => void;
  onReset: () => void;
}

export const ScraperHUD: React.FC<ScraperHUDProps> = ({
  status,
  progress,
  extractedCount,
  filteredCount,
  mutationEventsCount,
  filters,
  onStart,
  onPauseToggle,
  onStop,
  onExportCsv,
  onReset,
}) => {
  const [minimized, setMinimized] = useState(false);

  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return (
          <span className="font-code text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#00D37F] border border-[#2D2D2D]"></span>
            <span>SCRAPING</span>
          </span>
        );
      case 'paused':
        return (
          <span className="font-code text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD23F] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2D2D2D]"></span>
            <span>PAUSED</span>
          </span>
        );
      case 'completed':
        return (
          <span className="font-code text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFEF2] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00D37F]"></span>
            <span>FINISHED</span>
          </span>
        );
      default:
        return (
          <span className="font-code text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-[#2D2D2D]">
            <span>READY</span>
          </span>
        );
    }
  };

  return (
    <aside 
      aria-label="Fiverr Scraper Live HUD"
      className="fixed bottom-5 right-5 z-40 w-84 sm:w-92 bg-[#00D37F] border-[3px] border-[#2D2D2D] rounded-2xl shadow-[10px_10px_0_#2D2D2D] p-4 text-[#2D2D2D] transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-end justify-between border-b-2 border-[#2D2D2D] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#FFD23F] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center justify-center font-hand text-xl font-bold">
            fi
          </div>
          <div>
            <h4 className="font-hand text-2.5xl leading-none font-bold text-[#2D2D2D]">
              Live HUD
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <button
            onClick={() => setMinimized(!minimized)}
            className="w-7 h-7 bg-white border-2 border-[#2D2D2D] rounded-md shadow-[2px_2px_0_#2D2D2D] flex items-center justify-center hover:bg-[#FFD23F] transition-colors"
            title={minimized ? 'Expand HUD' : 'Collapse HUD'}
          >
            {minimized ? <ChevronUp className="w-4 h-4 text-[#2D2D2D]" /> : <ChevronDown className="w-4 h-4 text-[#2D2D2D]" />}
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="space-y-3">
          {/* Progress Section */}
          <div>
            <div className="flex items-center justify-between font-code text-xs font-bold text-[#2D2D2D] mb-1">
              <span>PROGRESS</span>
              <span>
                {extractedCount} / {filters.targetCount} GIGS ({Math.min(100, Math.round(progress))}%)
              </span>
            </div>

            <div className="h-3.5 bg-white border-2 border-[#2D2D2D] rounded-full overflow-hidden shadow-[2px_2px_0_#2D2D2D] p-0.5">
              <div
                className="h-full bg-[#FFD23F] border-r-2 border-[#2D2D2D] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
          </div>

          {/* Stat Cards Triad */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white border-2 border-[#2D2D2D] rounded-xl p-2 text-center shadow-[2px_2px_0_#2D2D2D]">
              <span className="font-code text-[9px] uppercase font-bold text-[#2D2D2D]/70 block">COLLECTED</span>
              <span className="font-hand text-2xl font-bold text-[#2D2D2D] leading-none">{extractedCount}</span>
            </div>

            <div className="bg-white border-2 border-[#2D2D2D] rounded-xl p-2 text-center shadow-[2px_2px_0_#2D2D2D]">
              <span className="font-code text-[9px] uppercase font-bold text-[#2D2D2D]/70 block">FILTERED</span>
              <span className="font-hand text-2xl font-bold text-[#2D2D2D] leading-none">{filteredCount}</span>
            </div>

            <div className="bg-white border-2 border-[#2D2D2D] rounded-xl p-2 text-center shadow-[2px_2px_0_#2D2D2D]">
              <span className="font-code text-[9px] uppercase font-bold text-[#2D2D2D]/70 block">MUTATIONS</span>
              <span className="font-hand text-2xl font-bold text-[#2D2D2D] leading-none">{mutationEventsCount}</span>
            </div>
          </div>

          {/* Active Filter Pill */}
          <div className="bg-white border-2 border-[#2D2D2D] rounded-lg px-2.5 py-1.5 shadow-[2px_2px_0_#2D2D2D] flex items-center gap-1.5 font-code text-[11px] font-bold text-[#2D2D2D]">
            <Filter className="w-3.5 h-3.5 text-[#2D2D2D] shrink-0" />
            <div className="truncate">
              Min ★ <strong>{filters.minRating.toFixed(1)}</strong> • Price: <strong>${filters.minPrice} - ${filters.maxPrice >= 1000 ? '∞' : filters.maxPrice}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {status === 'idle' || status === 'completed' ? (
              <button
                onClick={onStart}
                className="py-2.5 px-3 bg-[#2D2D2D] hover:bg-[#1a1a1a] text-white font-extrabold uppercase font-sans text-xs tracking-wider rounded-lg border-2 border-[#2D2D2D] shadow-[3px_3px_0_#FFD23F] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{status === 'completed' ? 'Scrape Again' : 'Start Scrape'}</span>
              </button>
            ) : (
              <div className="flex gap-1.5">
                <button
                  onClick={onPauseToggle}
                  className="flex-1 py-2 px-2 bg-white hover:bg-[#FFD23F] text-[#2D2D2D] font-extrabold uppercase font-sans text-xs rounded-lg border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1 transition-all"
                >
                  {status === 'paused' ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onStop}
                  className="py-2 px-2.5 bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-bold rounded-lg border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] active:translate-x-0.5 active:translate-y-0.5"
                  title="Stop Scrape"
                >
                  <Square className="w-3 h-3 fill-current" />
                </button>
              </div>
            )}

            <button
              onClick={onExportCsv}
              disabled={extractedCount === 0}
              className="py-2.5 px-3 bg-[#FFD23F] hover:bg-[#ffe066] text-[#2D2D2D] font-extrabold uppercase font-sans text-xs tracking-wider rounded-lg border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#2D2D2D] stroke-[2.5]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
