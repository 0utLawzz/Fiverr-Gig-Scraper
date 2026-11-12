import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Filter, 
  Activity, 
  FileSpreadsheet,
  RotateCcw
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
          <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Scraping Live</span>
          </span>
        );
      case 'paused':
        return (
          <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Paused</span>
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Finished</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-700 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Ready</span>
          </span>
        );
    }
  };

  return (
    <aside 
      aria-label="Fiverr Scraper HUD"
      className="fixed bottom-5 right-5 z-30 w-80 sm:w-88 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl text-white overflow-hidden transition-all duration-300"
    >
      {/* HUD Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700/60">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-xs">
            fi
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
              <span>Fiverr Scraper HUD</span>
            </h4>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          <button
            onClick={() => setMinimized(!minimized)}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-700/50 transition-colors"
            title={minimized ? 'Expand HUD' : 'Collapse HUD'}
          >
            {minimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="p-4 space-y-3.5 text-xs">
          {/* Real-time Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 font-medium">Progress</span>
              <span className="text-slate-200 font-bold">
                {extractedCount} / {filters.targetCount} gigs ({Math.min(100, Math.round(progress))}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Triad */}
          <div className="grid grid-cols-3 gap-2 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 text-center">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Extracted</span>
              <span className="text-base font-bold text-emerald-400">{extractedCount}</span>
            </div>
            <div className="flex flex-col border-x border-slate-700">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Filtered Out</span>
              <span className="text-base font-bold text-amber-400">{filteredCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Mutations</span>
              <span className="text-base font-bold text-indigo-400">{mutationEventsCount}</span>
            </div>
          </div>

          {/* Active Filter Pill */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-300 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <Filter className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="truncate">
              Min ★ <span className="text-emerald-400 font-semibold">{filters.minRating.toFixed(1)}</span> • Price:{' '}
              <span className="text-emerald-400 font-semibold">
                ${filters.minPrice} - ${filters.maxPrice >= 1000 ? '∞' : filters.maxPrice}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pt-1">
            {status === 'idle' || status === 'completed' ? (
              <button
                onClick={onStart}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold rounded-xl shadow-md transition-all text-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{status === 'completed' ? 'Scrape Again' : 'Start Scrape'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onPauseToggle}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 px-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all text-xs"
                >
                  {status === 'paused' ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pause</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onStop}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 px-2 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-xl transition-all text-xs"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              </>
            )}

            <button
              onClick={onExportCsv}
              disabled={extractedCount === 0}
              className="flex items-center space-x-1 py-2 px-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold rounded-xl transition-all text-xs"
              title="Download RFC 4180 CSV with timestamp"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            {extractedCount > 0 && status !== 'running' && (
              <button
                onClick={onReset}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                title="Reset Scraped Data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
