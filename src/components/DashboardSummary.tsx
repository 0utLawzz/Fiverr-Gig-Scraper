import React, { useMemo } from 'react';
import { 
  DollarSign, 
  Star, 
  Tag, 
  Award, 
  Flame, 
  BarChart3
} from 'lucide-react';
import { FiverrGig } from '../types/scraper';

interface DashboardSummaryProps {
  gigs: FiverrGig[];
  selectedKeywordFilter?: string | null;
  onSelectKeyword?: (keyword: string | null) => void;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  gigs,
  selectedKeywordFilter,
  onSelectKeyword,
}) => {
  const metrics = useMemo(() => {
    if (gigs.length === 0) {
      return {
        avgPrice: 0,
        medianPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        avgRating: 0,
        totalReviews: 0,
        fiveStarRatio: 0,
        topKeywords: [],
        topRatedCount: 0,
        proCount: 0,
      };
    }

    const prices = gigs.map((g) => g.price).sort((a, b) => a - b);
    const sumPrice = prices.reduce((acc, p) => acc + p, 0);
    const avgPrice = sumPrice / gigs.length;
    const minPrice = prices[0];
    const maxPrice = prices[prices.length - 1];
    const mid = Math.floor(prices.length / 2);
    const medianPrice = prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;

    const ratings = gigs.map((g) => g.rating);
    const sumRating = ratings.reduce((acc, r) => acc + r, 0);
    const avgRating = sumRating / gigs.length;
    const totalReviews = gigs.reduce((acc, g) => acc + g.reviewCount, 0);
    const fiveStarCount = gigs.filter((g) => g.rating >= 4.95).length;
    const fiveStarRatio = Math.round((fiveStarCount / gigs.length) * 100);

    const keywordCounts: Record<string, number> = {};
    gigs.forEach((gig) => {
      gig.keywords.forEach((kw) => {
        const cleaned = kw.trim().toLowerCase();
        if (cleaned && cleaned.length > 2) {
          keywordCounts[cleaned] = (keywordCounts[cleaned] || 0) + 1;
        }
      });
    });

    const topKeywords = Object.entries(keywordCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    let topRatedCount = 0;
    let proCount = 0;
    gigs.forEach((gig) => {
      if (gig.sellerLevel === 'Top Rated') topRatedCount++;
      if (gig.sellerLevel === 'Pro Verified') proCount++;
    });

    return {
      avgPrice,
      medianPrice,
      minPrice,
      maxPrice,
      avgRating,
      totalReviews,
      fiveStarRatio,
      topKeywords,
      topRatedCount,
      proCount,
    };
  }, [gigs]);

  if (gigs.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-[#2D2D2D] rounded-2xl p-6 text-center text-[#2D2D2D]">
        <BarChart3 className="w-8 h-8 text-[#2D2D2D]/60 mx-auto mb-2" />
        <h4 className="font-hand text-2xl font-bold text-[#2D2D2D]">Dataset Summary Awaiting Records</h4>
        <p className="label-mono text-[11px] text-[#2D2D2D]/60 mt-1">
          Start scraping in the Sandbox or simulate lazy-loaded cards to see real-time pricing and keyword metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 4 Playful Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Average Price */}
        <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-4 shadow-[4px_4px_0_#2D2D2D] hover:shadow-[6px_6px_0_#00D37F] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="label-mono text-[#2D2D2D]">AVERAGE PRICE</span>
            <div className="w-7 h-7 rounded-lg bg-[#FFD23F] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center justify-center font-bold text-xs">
              <DollarSign className="w-4 h-4 text-[#2D2D2D]" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-hand text-3.5xl font-bold text-[#2D2D2D] leading-none">
              ${metrics.avgPrice.toFixed(2)}
            </span>
            <span className="font-code text-[11px] font-bold text-[#2D2D2D]/60">USD</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#2D2D2D]/15 flex items-center justify-between font-code text-[11px] text-[#2D2D2D]">
            <span>Median: <strong>${metrics.medianPrice.toFixed(0)}</strong></span>
            <span>Range: <strong className="text-[#00D37F]">${metrics.minPrice}</strong>-<strong className="text-[#00D37F]">${metrics.maxPrice}</strong></span>
          </div>
        </div>

        {/* Card 2: Average Rating */}
        <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-4 shadow-[4px_4px_0_#2D2D2D] hover:shadow-[6px_6px_0_#FFD23F] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="label-mono text-[#2D2D2D]">AVERAGE RATING</span>
            <div className="w-7 h-7 rounded-lg bg-[#00D37F] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center justify-center font-bold text-xs">
              <Star className="w-4 h-4 fill-[#2D2D2D] text-[#2D2D2D]" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-hand text-3.5xl font-bold text-[#2D2D2D] leading-none">
              ★ {metrics.avgRating.toFixed(2)}
            </span>
            <span className="font-code text-[11px] font-bold text-[#00D37F]">{metrics.fiveStarRatio}% 5★</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#2D2D2D]/15 flex items-center justify-between font-code text-[11px] text-[#2D2D2D]">
            <span>Total Reviews:</span>
            <strong>{metrics.totalReviews.toLocaleString()}</strong>
          </div>
        </div>

        {/* Card 3: Top Keyword */}
        <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-4 shadow-[4px_4px_0_#2D2D2D] hover:shadow-[6px_6px_0_#FFD23F] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="label-mono text-[#2D2D2D]">TOP KEYWORD</span>
            <div className="w-7 h-7 rounded-lg bg-[#FFD23F] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center justify-center font-bold text-xs">
              <Flame className="w-4 h-4 text-[#2D2D2D]" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 truncate">
            <span className="font-hand text-2.5xl font-bold text-[#2D2D2D] leading-none capitalize truncate">
              {metrics.topKeywords[0]?.name || 'N/A'}
            </span>
            {metrics.topKeywords[0] && (
              <span className="font-code text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00D37F] text-[#2D2D2D] border border-[#2D2D2D]">
                {metrics.topKeywords[0].count}x
              </span>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#2D2D2D]/15 flex items-center justify-between font-code text-[11px] text-[#2D2D2D]">
            <span>Unique Keywords:</span>
            <strong>{metrics.topKeywords.length}+ identified</strong>
          </div>
        </div>

        {/* Card 4: Market Tier Profile */}
        <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-4 shadow-[4px_4px_0_#2D2D2D] hover:shadow-[6px_6px_0_#00D37F] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="label-mono text-[#2D2D2D]">MARKET TIERS</span>
            <div className="w-7 h-7 rounded-lg bg-[#E6D5FF] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center justify-center font-bold text-xs">
              <Award className="w-4 h-4 text-[#2D2D2D]" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-hand text-3.5xl font-bold text-[#2D2D2D] leading-none">
              {gigs.length}
            </span>
            <span className="font-code text-[11px] font-bold text-[#2D2D2D]/70">Gigs In Scope</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#2D2D2D]/15 flex items-center justify-between font-code text-[11px] text-[#2D2D2D]">
            <span>Top Rated: <strong className="text-[#2D2D2D]">{metrics.topRatedCount}</strong></span>
            <span>Pro: <strong className="text-[#2D2D2D]">{metrics.proCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Top Keywords Strip */}
      <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-4 shadow-[5px_5px_0_rgba(45,45,45,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Tag className="w-4 h-4 text-[#00D37F]" />
          <span className="label-mono text-[#2D2D2D]">TOP PERFORMING KEYWORDS:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {metrics.topKeywords.map(({ name, count }) => {
            const isSelected = selectedKeywordFilter === name;
            return (
              <button
                key={name}
                onClick={() => onSelectKeyword && onSelectKeyword(isSelected ? null : name)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-code text-xs font-bold border-2 border-[#2D2D2D] transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFD23F] text-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] -translate-y-0.5'
                    : 'bg-[#FFFEF2] hover:bg-[#FFD23F]/30 text-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D]'
                }`}
                title={`Filter by '${name}'`}
              >
                <span>#{name}</span>
                <span className="px-1.5 py-0.2 rounded bg-white text-[#2D2D2D] border border-[#2D2D2D] text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}

          {selectedKeywordFilter && onSelectKeyword && (
            <button
              onClick={() => onSelectKeyword(null)}
              className="font-code text-xs text-[#FF6B6B] hover:underline font-bold ml-2 cursor-pointer"
            >
              [Clear Filter]
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
