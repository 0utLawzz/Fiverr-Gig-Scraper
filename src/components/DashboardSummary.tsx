import React, { useMemo } from 'react';
import { 
  DollarSign, 
  Star, 
  Tag, 
  TrendingUp, 
  Award, 
  Users, 
  BarChart3, 
  Sparkles,
  ArrowUpRight,
  Flame,
  Filter
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
  // Compute analytics
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
        sellerLevels: {},
        topRatedCount: 0,
        proCount: 0,
      };
    }

    // Price calculations
    const prices = gigs.map((g) => g.price).sort((a, b) => a - b);
    const sumPrice = prices.reduce((acc, p) => acc + p, 0);
    const avgPrice = sumPrice / gigs.length;
    const minPrice = prices[0];
    const maxPrice = prices[prices.length - 1];
    const mid = Math.floor(prices.length / 2);
    const medianPrice = prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;

    // Rating & reviews calculations
    const ratings = gigs.map((g) => g.rating);
    const sumRating = ratings.reduce((acc, r) => acc + r, 0);
    const avgRating = sumRating / gigs.length;
    const totalReviews = gigs.reduce((acc, g) => acc + g.reviewCount, 0);
    const fiveStarCount = gigs.filter((g) => g.rating >= 4.95).length;
    const fiveStarRatio = Math.round((fiveStarCount / gigs.length) * 100);

    // Keyword frequency analysis
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

    // Seller levels distribution
    const sellerLevels: Record<string, number> = {};
    let topRatedCount = 0;
    let proCount = 0;
    gigs.forEach((gig) => {
      sellerLevels[gig.sellerLevel] = (sellerLevels[gig.sellerLevel] || 0) + 1;
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
      sellerLevels,
      topRatedCount,
      proCount,
    };
  }, [gigs]);

  if (gigs.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-400 text-xs">
        <BarChart3 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="font-semibold text-slate-300">Live Scraped Dataset Analytics</p>
        <p className="text-slate-500 mt-1">
          Start scraping or simulate cards in the sandbox to generate live pricing, rating, and keyword statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 4 Analytics Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Average Price */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Average Gig Price</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>

          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ${metrics.avgPrice.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-medium">USD</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div>
              <span>Median: </span>
              <strong className="text-slate-200">${metrics.medianPrice.toFixed(0)}</strong>
            </div>
            <div>
              <span>Range: </span>
              <strong className="text-emerald-400">${metrics.minPrice}</strong>
              <span className="text-slate-600"> - </span>
              <strong className="text-emerald-400">${metrics.maxPrice}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Average Rating */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Average Rating</span>
            <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Star className="w-4 h-4 fill-amber-400" />
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.avgRating.toFixed(2)}
            </span>
            <div className="flex items-center text-amber-400 text-xs">
              {'★'.repeat(5)}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div>
              <span>Reviews: </span>
              <strong className="text-slate-200">{metrics.totalReviews.toLocaleString()}</strong>
            </div>
            <div className="flex items-center text-emerald-400 font-semibold">
              <span>{metrics.fiveStarRatio}% 5-Star</span>
            </div>
          </div>
        </div>

        {/* Card 3: Top-Performing Keywords Header */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Primary Keyword</span>
            <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Flame className="w-4 h-4" />
            </span>
          </div>

          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate capitalize">
              {metrics.topKeywords[0]?.name || 'N/A'}
            </span>
            {metrics.topKeywords[0] && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                {metrics.topKeywords[0].count} gigs
              </span>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Unique Keywords:</span>
            <strong className="text-slate-200">{metrics.topKeywords.length}+</strong>
          </div>
        </div>

        {/* Card 4: Seller Tier Profile */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Market Tier Profile</span>
            <span className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Award className="w-4 h-4" />
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {gigs.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Gigs Monitored</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div>
              <span>Top Rated: </span>
              <strong className="text-amber-300 font-semibold">{metrics.topRatedCount}</strong>
            </div>
            <div>
              <span>Pro Verified: </span>
              <strong className="text-purple-300 font-semibold">{metrics.proCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Top Keywords Frequency Strip */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 shrink-0">
          <Tag className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Top Performing Keywords:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {metrics.topKeywords.map(({ name, count }) => {
            const isSelected = selectedKeywordFilter === name;
            return (
              <button
                key={name}
                onClick={() => onSelectKeyword && onSelectKeyword(isSelected ? null : name)}
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
                title={`Filter gigs tagged with '${name}'`}
              >
                <span>#{name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-700 text-emerald-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {selectedKeywordFilter && onSelectKeyword && (
            <button
              onClick={() => onSelectKeyword(null)}
              className="text-[11px] text-red-400 hover:text-red-300 ml-2 font-medium underline"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
