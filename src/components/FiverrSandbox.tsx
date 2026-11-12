import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Star, 
  Clock, 
  Tag, 
  Check, 
  ExternalLink, 
  Eye, 
  Sparkles, 
  TrendingUp, 
  RefreshCw,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { FiverrGig, ScrapeFilters, ScraperStatus } from '../types/scraper';
import { MOCK_CATEGORIES, FiverrCategory } from '../data/mockFiverrData';

interface FiverrSandboxProps {
  filters: ScrapeFilters;
  setFilters: React.Dispatch<React.SetStateAction<ScrapeFilters>>;
  status: ScraperStatus;
  onGigScraped: (gig: FiverrGig) => void;
  onFilterRejection: () => void;
  onMutationEvent: (count: number) => void;
  scrapedIds: Set<string>;
}

export const FiverrSandbox: React.FC<FiverrSandboxProps> = ({
  filters,
  setFilters,
  status,
  onGigScraped,
  onFilterRejection,
  onMutationEvent,
  scrapedIds,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FiverrCategory>(MOCK_CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState(MOCK_CATEGORIES[0].query);
  const [visibleGigs, setVisibleGigs] = useState<FiverrGig[]>([]);
  const [showConfig, setShowConfig] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  // Initialize with initial batch of cards from selected category
  useEffect(() => {
    // Start with first 4 gigs visible, remaining will be lazy-loaded
    setVisibleGigs(selectedCategory.gigs.slice(0, 4));
  }, [selectedCategory]);

  // Set up real MutationObserver on the results container
  useEffect(() => {
    if (!containerRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new MutationObserver((mutations) => {
      onMutationEvent(mutations.length);

      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              const card = el.matches('.gig-card-layout') ? el : el.querySelector('.gig-card-layout');
              if (card) {
                const gigId = card.getAttribute('data-gig-id');
                if (gigId) {
                  // Find gig data from category
                  const fullGig = selectedCategory.gigs.find((g) => g.id === gigId);
                  if (fullGig) {
                    // Check filters
                    if (fullGig.rating < filters.minRating || fullGig.price < filters.minPrice || fullGig.price > filters.maxPrice) {
                      onFilterRejection();
                    } else {
                      onGigScraped(fullGig);
                    }
                  }
                }
              }
            }
          });
        }
      }
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [selectedCategory, filters, onGigScraped, onFilterRejection, onMutationEvent]);

  // Handle active scraping auto-scroll simulation
  useEffect(() => {
    if (status !== 'running') return;

    const intervalDelays = {
      slow: 1400,
      medium: 850,
      fast: 450,
    };
    const delay = intervalDelays[filters.scrollSpeed] || 850;

    const timer = setInterval(() => {
      setVisibleGigs((prev) => {
        if (prev.length >= selectedCategory.gigs.length) {
          // If we reached end of current category, generate additional dynamic gigs
          const nextIndex = prev.length + 1;
          const template = selectedCategory.gigs[nextIndex % selectedCategory.gigs.length];
          const dynamicGig: FiverrGig = {
            ...template,
            id: `gig-lazy-${Date.now()}-${nextIndex}`,
            position: nextIndex,
            title: `${template.title} (Batch #${nextIndex})`,
            rating: Number((4.3 + Math.random() * 0.7).toFixed(1)),
            price: Math.round(template.price * (0.8 + Math.random() * 0.6)),
            reviewCount: Math.round(template.reviewCount * (0.7 + Math.random() * 0.8)),
            timestamp: new Date().toISOString(),
          };
          return [...prev, dynamicGig];
        } else {
          return selectedCategory.gigs.slice(0, prev.length + 2);
        }
      });
    }, delay);

    return () => clearInterval(timer);
  }, [status, filters.scrollSpeed, selectedCategory]);

  const handleSimulateLazyLoad = () => {
    setVisibleGigs((prev) => {
      const nextIndex = prev.length + 1;
      const template = selectedCategory.gigs[nextIndex % selectedCategory.gigs.length];
      const dynamicGig: FiverrGig = {
        ...template,
        id: `gig-lazy-manual-${Date.now()}`,
        position: nextIndex,
        title: `${template.title} [Dynamic Lazy Card]`,
        rating: Number((4.5 + Math.random() * 0.5).toFixed(1)),
        price: Math.round(30 + Math.random() * 250),
        timestamp: new Date().toISOString(),
      };
      return [...prev, dynamicGig];
    });
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Mock Fiverr Search Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Query Bar */}
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Simulate Fiverr search query e.g. 'ai web developer', 'logo design'..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {MOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchQuery(cat.query);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory.id === cat.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filter & Scraper Parameter Drawer */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scraper Parameters & Filtering Rules</span>
            </div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-xs text-emerald-400 hover:underline"
            >
              {showConfig ? 'Hide Controls' : 'Show Controls'}
            </button>
          </div>

          {showConfig && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Target Count */}
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                <div className="flex justify-between items-center text-slate-300 font-medium">
                  <span>Target Gigs to Scrape</span>
                  <span className="text-emerald-400 font-bold">{filters.targetCount} gigs</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={filters.targetCount}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, targetCount: parseInt(e.target.value, 10) }))
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Min Rating Filter */}
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                <div className="flex justify-between items-center text-slate-300 font-medium">
                  <span>Minimum Rating Filter</span>
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{filters.minRating.toFixed(1)}</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5.0"
                  step="0.1"
                  value={filters.minRating}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, minRating: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Price Range Filter */}
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                <div className="flex justify-between items-center text-slate-300 font-medium">
                  <span>Price Range ($ USD)</span>
                  <span className="text-emerald-400 font-bold">
                    ${filters.minPrice} - ${filters.maxPrice >= 1000 ? 'Any' : `$${filters.maxPrice}`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min $"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minPrice: Math.max(0, parseInt(e.target.value, 10) || 0),
                      }))
                    }
                    className="w-1/2 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white"
                  />
                  <span className="text-slate-500">to</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max $"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxPrice: Math.max(0, parseInt(e.target.value, 10) || 999999),
                      }))
                    }
                    className="w-1/2 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white"
                  />
                </div>
              </div>

              {/* Auto Download & Speed */}
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between">
                <label className="flex items-center space-x-2 text-slate-200 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={filters.autoDownloadCsv}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, autoDownloadCsv: e.target.checked }))
                    }
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span className="font-semibold text-emerald-400">Auto Download CSV</span>
                </label>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Scroll Simulation:</span>
                  <select
                    value={filters.scrollSpeed}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        scrollSpeed: e.target.value as 'slow' | 'medium' | 'fast',
                      }))
                    }
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-[11px]"
                  >
                    <option value="medium">Medium (850ms)</option>
                    <option value="slow">Slow & Safe (1.4s)</option>
                    <option value="fast">Fast (450ms)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MutationObserver Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 rounded-xl p-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <div>
            <span className="text-xs font-bold text-white">Live DOM MutationObserver: Active</span>
            <span className="text-xs text-slate-400 ml-2">
              Listening for card injections & lazy loads on container <code className="text-emerald-400">#fiverr-sandbox-results</code>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSimulateLazyLoad}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
            title="Simulate lazy-loaded cards dynamically injected into DOM"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulate Lazy Load Card</span>
          </button>
        </div>
      </div>

      {/* Simulated Fiverr Results Grid */}
      <div
        id="fiverr-sandbox-results"
        ref={containerRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        {visibleGigs.map((gig, index) => {
          const isCollected = scrapedIds.has(gig.id);
          const isFilteredOut =
            gig.rating < filters.minRating ||
            gig.price < filters.minPrice ||
            gig.price > filters.maxPrice;

          return (
            <div
              key={gig.id}
              data-gig-id={gig.id}
              className={`gig-card-layout relative bg-slate-900 rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col ${
                isCollected
                  ? 'border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                  : isFilteredOut
                  ? 'border-amber-500/30 opacity-70'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Image & Badges Container */}
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                <img
                  src={gig.imageUrl}
                  alt={gig.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />

                {/* Scraper Status Badge on Card */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-700">
                    Pos #{index + 1}
                  </span>

                  {isCollected && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-slate-950 flex items-center space-x-1 shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Extracted</span>
                    </span>
                  )}

                  {!isCollected && isFilteredOut && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/90 text-slate-950">
                      Filtered Out
                    </span>
                  )}
                </div>

                {/* Delivery Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{gig.deliveryTime}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                {/* Seller Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center font-bold text-[10px] text-white">
                      {gig.sellerName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="seller-name text-xs font-semibold text-slate-200">
                      {gig.sellerName}
                    </span>
                  </div>

                  {/* Level Badge */}
                  <span
                    className={`seller-level text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      gig.sellerLevel === 'Top Rated'
                        ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                        : gig.sellerLevel === 'Pro Verified'
                        ? 'bg-purple-400/10 text-purple-300 border border-purple-400/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {gig.sellerLevel}
                  </span>
                </div>

                {/* Gig Title */}
                <h3 className="gig-card-title text-xs font-medium text-slate-100 line-clamp-2 hover:text-emerald-400 transition-colors leading-snug">
                  {gig.title}
                </h3>

                {/* Badges & Tags */}
                {gig.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {gig.badges.map((b) => (
                      <span
                        key={b}
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}

                {/* Rating & Review Count */}
                <div className="flex items-center space-x-1.5 text-xs text-slate-300 pt-1 border-t border-slate-800/80">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-white">{gig.rating.toFixed(1)}</span>
                  <span className="text-slate-500">({gig.reviewCount.toLocaleString()})</span>
                </div>

                {/* Footer: Price */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">Starting at</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {gig.currency}{gig.price}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
