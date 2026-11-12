import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Check, 
  ExternalLink, 
  PlusCircle,
  Activity,
  SlidersHorizontal,
  Sparkles
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
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  // Initialize with initial batch of cards from selected category
  useEffect(() => {
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
                  const fullGig = selectedCategory.gigs.find((g) => g.id === gigId);
                  if (fullGig) {
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
        title: `${template.title} [Dynamic Card]`,
        rating: Number((4.5 + Math.random() * 0.5).toFixed(1)),
        price: Math.round(30 + Math.random() * 250),
        timestamp: new Date().toISOString(),
      };
      return [...prev, dynamicGig];
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-28">
      {/* Sidebar: Query Sandbox & Scraper Rules (Variation 5 Layout) */}
      <section className="lg:col-span-4 xl:col-span-3 space-y-4">
        {/* Card 1: Query Sandbox */}
        <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-5 shadow-[5px_5px_0_rgba(45,45,45,0.1)] space-y-3">
          <span className="label-mono block text-[#2D2D2D]">Query Sandbox</span>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. ai web app developer"
              className="w-full px-3.5 py-2.5 bg-white border-2 border-[#2D2D2D] rounded-xl text-sm font-semibold text-[#2D2D2D] outline-none shadow-[2px_2px_0_#2D2D2D] focus:shadow-[4px_4px_0_#FFD23F] transition-all"
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center label-mono">
              <span>Limit:</span>
              <strong className="text-[#00D37F] text-xs">{filters.targetCount} GIGS</strong>
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
              className="w-full accent-[#00D37F] cursor-pointer"
            />
          </div>
        </div>

        {/* Card 2: Scraper Rules */}
        <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-5 shadow-[5px_5px_0_rgba(45,45,45,0.1)] space-y-4">
          <span className="label-mono block text-[#2D2D2D]">Scraper Rules</span>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center label-mono">
              <span>Min Rating:</span>
              <strong className="text-[#00D37F] text-xs">★ {filters.minRating.toFixed(1)}</strong>
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
              className="w-full accent-[#00D37F] cursor-pointer"
            />
          </div>

          <div>
            <span className="label-mono block mb-1">Price Range ($ USD)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="label-mono text-[9px] block mb-0.5">Min $</span>
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      minPrice: Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-white border-2 border-[#2D2D2D] rounded-lg text-xs font-bold text-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] outline-none"
                />
              </div>

              <div>
                <span className="label-mono text-[9px] block mb-0.5">Max $</span>
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxPrice: Math.max(0, parseInt(e.target.value, 10) || 999999),
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-white border-2 border-[#2D2D2D] rounded-lg text-xs font-bold text-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] outline-none"
                />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-[#2D2D2D]/10">
            <input
              type="checkbox"
              checked={filters.autoDownloadCsv}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, autoDownloadCsv: e.target.checked }))
              }
              className="w-4 h-4 accent-[#00D37F] rounded cursor-pointer"
            />
            <span className="text-xs font-bold text-[#2D2D2D]">Auto Download CSV</span>
          </label>
        </div>

        {/* Card 3: Observer Logs (Playful Yellow Dashed Card) */}
        <div className="bg-[#FFD23F] border-2 border-dashed border-[#2D2D2D] rounded-2xl p-5 shadow-[4px_4px_0_#2D2D2D] space-y-2">
          <div className="flex items-center justify-between">
            <span className="label-mono text-[#2D2D2D]">Observer Logs</span>
            <span className="w-2 h-2 rounded-full bg-[#00D37F] border border-[#2D2D2D] animate-ping"></span>
          </div>

          <p className="text-xs font-mono font-medium text-[#2D2D2D] leading-relaxed">
            MutationObserver Active: listening for <code className="bg-white/80 px-1 py-0.5 rounded border border-[#2D2D2D]">#fiverr-sandbox-results</code> card injections...
          </p>

          <button
            onClick={handleSimulateLazyLoad}
            className="w-full mt-2 py-2 px-3 bg-white hover:bg-[#FFFEF2] text-[#2D2D2D] border-2 border-[#2D2D2D] rounded-xl font-bold font-sans text-xs uppercase tracking-wider shadow-[3px_3px_0_#2D2D2D] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#00D37F] stroke-[2.5]" />
            <span>Simulate Lazy Card</span>
          </button>
        </div>
      </section>

      {/* Content Area: Categories & Simulated Fiverr Grid */}
      <section className="lg:col-span-8 xl:col-span-9 space-y-4">
        {/* Category Pills */}
        <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-3 shadow-[4px_4px_0_rgba(45,45,45,0.08)] flex items-center gap-2 overflow-x-auto">
          <span className="label-mono text-[10px] text-[#2D2D2D] shrink-0 pl-1">Category:</span>
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat);
                setSearchQuery(cat.query);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans whitespace-nowrap border-2 border-[#2D2D2D] transition-all cursor-pointer ${
                selectedCategory.id === cat.id
                  ? 'bg-[#00D37F] text-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] -translate-y-0.5'
                  : 'bg-white hover:bg-[#FFFEF2] text-[#2D2D2D] hover:shadow-[2px_2px_0_#2D2D2D]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results Grid with Playful Gig Cards */}
        <div
          id="fiverr-sandbox-results"
          ref={containerRef}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
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
                className={`gig-card-layout bg-white border-2 border-[#2D2D2D] rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:rotate-[0.5deg] ${
                  isCollected
                    ? 'shadow-[6px_6px_0_#00D37F] ring-2 ring-[#00D37F]'
                    : isFilteredOut
                    ? 'opacity-60 shadow-[3px_3px_0_#FF6B6B]'
                    : 'shadow-[5px_5px_0_rgba(45,45,45,0.1)] hover:shadow-[7px_7px_0_#FFD23F]'
                }`}
              >
                {/* Image */}
                <div className="relative aspect-video w-full bg-[#E5E5E5] border-b-2 border-[#2D2D2D] overflow-hidden">
                  <img
                    src={gig.imageUrl}
                    alt={gig.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />

                  {/* Badges on Image */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                    <span className="px-2 py-0.5 rounded-md font-code text-[10px] font-bold bg-white text-[#2D2D2D] border border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D]">
                      #{index + 1}
                    </span>

                    {isCollected && (
                      <span className="px-2 py-0.5 rounded-md font-code text-[10px] font-bold bg-[#00D37F] text-[#2D2D2D] border border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>EXTRACTED</span>
                      </span>
                    )}

                    {!isCollected && isFilteredOut && (
                      <span className="px-2 py-0.5 rounded-md font-code text-[10px] font-bold bg-[#FFD23F] text-[#2D2D2D] border border-[#2D2D2D]">
                        FILTERED
                      </span>
                    )}
                  </div>

                  {/* Delivery Pill */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md font-code text-[10px] font-bold bg-white text-[#2D2D2D] border border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-[#00D37F]" />
                    <span>{gig.deliveryTime}</span>
                  </div>
                </div>

                {/* Gig Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  {/* Seller Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#2D2D2D] border border-[#2D2D2D] text-white flex items-center justify-center font-code text-[9px] font-bold">
                        {gig.sellerName.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-code text-[11px] font-bold text-[#2D2D2D]">
                        {gig.sellerName}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-code font-bold px-2 py-0.5 rounded-md border border-[#2D2D2D] ${
                        gig.sellerLevel === 'Top Rated'
                          ? 'bg-[#FFD23F] text-[#2D2D2D]'
                          : gig.sellerLevel === 'Pro Verified'
                          ? 'bg-[#E6D5FF] text-[#2D2D2D]'
                          : 'bg-[#FFFEF2] text-[#2D2D2D]'
                      }`}
                    >
                      {gig.sellerLevel}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xs sm:text-sm font-bold text-[#2D2D2D] line-clamp-2 leading-snug">
                    {gig.title}
                  </h3>

                  {/* Badges / Keywords */}
                  {gig.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {gig.keywords.slice(0, 3).map((kw) => (
                        <span
                          key={kw}
                          className="px-1.5 py-0.5 rounded font-code text-[9px] font-semibold bg-[#2D2D2D]/5 text-[#2D2D2D] border border-[#2D2D2D]/20 uppercase"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Rating & Price Footer */}
                  <div className="pt-2 border-t-2 border-[#2D2D2D]/10 flex items-center justify-between">
                    <div className="flex items-center gap-1 font-code text-xs font-bold text-[#00D37F]">
                      <Star className="w-3.5 h-3.5 fill-[#FFD23F] text-[#2D2D2D]" />
                      <span className="text-[#2D2D2D]">{gig.rating.toFixed(1)}</span>
                      <span className="text-[#2D2D2D]/60 text-[11px]">({gig.reviewCount})</span>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="label-mono text-[9px] text-[#2D2D2D]/60">FROM</span>
                      <span className="font-hand text-2xl font-bold text-[#00D37F] leading-none">
                        {gig.currency}{gig.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
