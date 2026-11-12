import React, { useState } from 'react';
import { 
  Github, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  BookOpen, 
  Terminal, 
  Lightbulb, 
  Download, 
  Share2, 
  Database, 
  ShieldCheck, 
  CheckCircle2,
  FileText,
  Rocket,
  Code2,
  HelpCircle,
  TrendingUp,
  Cpu,
  Zap
} from 'lucide-react';
import { FiverrGig } from '../types/scraper';

interface CommunityHubProps {
  gigs: FiverrGig[];
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ gigs }) => {
  const [activeTab, setActiveTab] = useState<'metadata' | 'nocoder' | 'social' | 'suggestions' | 'files'>('metadata');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const REPO_SUGGESTIONS = [
    { name: 'fiverr-gig-scraper-pro', tag: 'Recommended' },
    { name: 'fiverr-scraper-extension', tag: 'Direct & Simple' },
    { name: 'fiverr-market-intelligence-scraper', tag: 'Enterprise / Analytics' },
  ];

  const REPO_DESCRIPTION =
    'Production-grade Chrome Extension (Manifest V3) & Analytics Studio to scrape Fiverr gig listings with MutationObserver lazy loading. Extracts 12+ data fields, filters by rating and price range, auto-exports to CSV/Excel/JSON, and syncs directly to Supabase. 100% client-side with 1-click Vercel deployment.';

  const REPO_TOPICS = [
    'fiverr-scraper',
    'chrome-extension',
    'web-scraping',
    'mutation-observer',
    'manifest-v3',
    'supabase',
    'vercel',
    'react',
    'tailwind',
    'market-research',
    'freelance-analytics',
    'typescript',
  ];

  const BADGES_MARKDOWN = `[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-emerald?style=for-the-badge&logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Supabase Ready](https://img.shields.io/badge/Supabase-Database%20Ready-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel Deploy](https://img.shields.io/badge/Vercel-Deploy%20Ready-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com)`;

  // Generate SVG social preview banner
  const downloadSocialBannerSvg = () => {
    const avgPrice = gigs.length > 0 ? (gigs.reduce((a, b) => a + b.price, 0) / gigs.length).toFixed(1) : '124.5';
    const totalGigs = gigs.length > 0 ? gigs.length : '150+';

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#061c16"/>
    </linearGradient>
    <linearGradient id="primary" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#14b8a6"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Grid accent dots -->
  <circle cx="1100" cy="100" r="140" fill="#10b981" opacity="0.08" filter="blur(40px)"/>
  <circle cx="150" cy="500" r="180" fill="#059669" opacity="0.08" filter="blur(50px)"/>

  <!-- Logo Pill -->
  <g transform="translate(100, 110)">
    <rect width="56" height="56" rx="16" fill="url(#primary)"/>
    <text x="28" y="38" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">fi</text>
    <text x="76" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="700" fill="#ffffff">Fiverr Gig Scraper Pro</text>
    <rect x="360" y="14" width="130" height="28" rx="14" fill="#10b981" opacity="0.15"/>
    <text x="425" y="32" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#34d399" text-anchor="middle">MANIFEST V3</text>
  </g>

  <!-- Big Title -->
  <text x="100" y="240" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="52" font-weight="800" fill="#f8fafc">
    Scrape, Analyze & Export
  </text>
  <text x="100" y="300" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="52" font-weight="800" fill="url(#primary)">
    Fiverr Gig Listings in Real-Time
  </text>

  <!-- Subtitle -->
  <text x="100" y="360" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="400" fill="#94a3b8">
    MutationObserver Lazy-Loader • 12+ Fields • Live Progress Bar • Auto CSV/Excel/JSON • Supabase Ready
  </text>

  <!-- Metric Badges -->
  <g transform="translate(100, 420)">
    <!-- Metric 1 -->
    <rect width="210" height="90" rx="18" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="24" y="36" font-family="sans-serif" font-size="12" font-weight="600" fill="#94a3b8">AVERAGE GIG PRICE</text>
    <text x="24" y="68" font-family="sans-serif" font-size="28" font-weight="800" fill="#34d399">$${avgPrice}</text>

    <!-- Metric 2 -->
    <g transform="translate(230, 0)">
      <rect width="210" height="90" rx="18" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="24" y="36" font-family="sans-serif" font-size="12" font-weight="600" fill="#94a3b8">SATISFACTION</text>
      <text x="24" y="68" font-family="sans-serif" font-size="28" font-weight="800" fill="#fbbf24">★ 4.9 / 5.0</text>
    </g>

    <!-- Metric 3 -->
    <g transform="translate(460, 0)">
      <rect width="210" height="90" rx="18" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="24" y="36" font-family="sans-serif" font-size="12" font-weight="600" fill="#94a3b8">DATA EXTRACTION</text>
      <text x="24" y="68" font-family="sans-serif" font-size="28" font-weight="800" fill="#f8fafc">12 Columns</text>
    </g>

    <!-- Metric 4 -->
    <g transform="translate(690, 0)">
      <rect width="240" height="90" rx="18" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="24" y="36" font-family="sans-serif" font-size="12" font-weight="600" fill="#94a3b8">EXPORTS &amp; SYNC</text>
      <text x="24" y="68" font-family="sans-serif" font-size="24" font-weight="800" fill="#38bdf8">CSV • Excel • Supabase</text>
    </g>
  </g>

  <!-- Footer -->
  <text x="100" y="575" font-family="sans-serif" font-size="14" font-weight="600" fill="#64748b">
    Open Source Community Edition • 100% Client-Side • MIT Licensed
  </text>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fiverr-scraper-social-preview.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-wrap gap-1.5 shadow-lg">
        <button
          onClick={() => setActiveTab('metadata')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'metadata'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Github className="w-3.5 h-3.5" />
          <span>GitHub Repo Standard</span>
        </button>

        <button
          onClick={() => setActiveTab('nocoder')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'nocoder'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Non-Coder 3-Click Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'social'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social Preview Banner</span>
        </button>

        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'suggestions'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Design Improvements & Suggestions</span>
        </button>
      </div>

      {/* TAB 1: GITHUB REPO METADATA */}
      {activeTab === 'metadata' && (
        <div className="space-y-6">
          {/* Repo Name Suggestions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Github className="w-4 h-4 text-emerald-400" />
              <span>Recommended GitHub Repository Names</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {REPO_SUGGESTIONS.map((repo, idx) => (
                <div
                  key={repo.name}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">
                      {repo.tag}
                    </span>
                    <code className="text-xs font-bold text-white font-mono">{repo.name}</code>
                  </div>

                  <button
                    onClick={() => copyToClipboard(repo.name, `name-${idx}`)}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    title="Copy repo name"
                  >
                    {copiedField === `name-${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Description & Topics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Description */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  GitHub About / Description
                </h4>
                <button
                  onClick={() => copyToClipboard(REPO_DESCRIPTION, 'desc')}
                  className="flex items-center space-x-1 text-xs text-emerald-400 hover:underline"
                >
                  {copiedField === 'desc' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Description</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                {REPO_DESCRIPTION}
              </div>
              <span className="text-[11px] text-slate-500">Length: {REPO_DESCRIPTION.length} characters (GitHub optimal limit is 350)</span>
            </div>

            {/* Topics */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  GitHub Topics / Tags
                </h4>
                <button
                  onClick={() => copyToClipboard(REPO_TOPICS.join(', '), 'topics')}
                  className="flex items-center space-x-1 text-xs text-emerald-400 hover:underline"
                >
                  {copiedField === 'topics' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied All</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Topics</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                {REPO_TOPICS.map((topic) => (
                  <span
                    key={topic}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 font-mono"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              <span className="text-[11px] text-slate-500">Paste these in your GitHub repository's "About &gt; Topics" section.</span>
            </div>
          </div>

          {/* Badges Markdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                README.md Badges (Shields.io)
              </h4>
              <button
                onClick={() => copyToClipboard(BADGES_MARKDOWN, 'badges')}
                className="flex items-center space-x-1 text-xs text-emerald-400 hover:underline"
              >
                {copiedField === 'badges' ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copied Badges</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-slate-950 font-mono text-xs rounded-xl border border-slate-800 text-slate-300 overflow-x-auto">
              <pre>{BADGES_MARKDOWN}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NON-CODER 3-CLICK GUIDE */}
      {activeTab === 'nocoder' && (
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Complete Non-Coder Guide: From Zero to Scraping in 2 Minutes</span>
            </div>
            <p className="text-xs text-slate-300">
              No programming knowledge, terminal commands, or API keys needed. Follow these 5 clear steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center space-x-2 text-white font-bold text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
                  1
                </span>
                <span>Download &amp; Extract the Extension</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click the bright green button <strong>"Download Chrome Extension (.zip)"</strong> in the top header. Once downloaded, double-click to unzip the folder to your desktop.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center space-x-2 text-white font-bold text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
                  2
                </span>
                <span>Load in Google Chrome / Brave / Edge</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open Chrome, type <code className="text-emerald-400">chrome://extensions</code> in the URL bar, turn on the <strong>Developer mode</strong> toggle in top-right, and click <strong>"Load unpacked"</strong>. Select the unzipped folder!
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center space-x-2 text-white font-bold text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
                  3
                </span>
                <span>Open Fiverr &amp; Search Anything</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Go to <a href="https://www.fiverr.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">Fiverr.com</a> and search for any service (e.g. <em>"logo design"</em>, <em>"python script"</em>, <em>"wordpress"</em>). Click the extension icon in your toolbar, choose your filters, and click <strong>Start Scraping</strong>.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center space-x-2 text-white font-bold text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
                  4
                </span>
                <span>Automatic Download in Excel or CSV</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sit back! The scraper automatically scrolls and uses a MutationObserver to grab lazy-loaded cards. When finished, your file automatically downloads to your Downloads folder!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SOCIAL PREVIEW BANNER */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">GitHub Social OpenGraph Preview Card (1200 x 630)</h3>
              <p className="text-xs text-slate-400">
                Matches the recommended standard dimensions for GitHub, Twitter Cards, and LinkedIn.
              </p>
            </div>

            <button
              onClick={downloadSocialBannerSvg}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Social Banner (.svg)</span>
            </button>
          </div>

          {/* Interactive Preview Canvas Box */}
          <div className="relative aspect-[1200/630] w-full rounded-2xl overflow-hidden border border-slate-700 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/70 p-6 sm:p-10 flex flex-col justify-between shadow-2xl">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg">
                  fi
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-extrabold text-white">Fiverr Gig Scraper Pro</h4>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">Manifest V3 • Auto Exporter</span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                100% Client-Side
              </span>
            </div>

            {/* Middle Main */}
            <div className="my-auto py-4 space-y-2">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Scrape, Analyze &amp; Export <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  Fiverr Gigs in Real-Time
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                MutationObserver Lazy-Loader • 12+ Fields Extracted • Rating &amp; Price Filters • Auto CSV, Excel, JSON Export • Supabase Ready
              </p>
            </div>

            {/* Bottom 4 Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
              <div className="bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-xl">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Average Price</div>
                <div className="text-base sm:text-lg font-bold text-emerald-400">
                  ${gigs.length > 0 ? (gigs.reduce((a, b) => a + b.price, 0) / gigs.length).toFixed(1) : '124.50'}
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-xl">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Quality Index</div>
                <div className="text-base sm:text-lg font-bold text-amber-400">★ 4.9 / 5.0</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-xl">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Fields Captured</div>
                <div className="text-base sm:text-lg font-bold text-white">12 Core Fields</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-xl">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Cloud Sync</div>
                <div className="text-base sm:text-lg font-bold text-sky-400">Supabase &amp; Vercel</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DESIGN IMPROVEMENTS & ROADMAP SUGGESTIONS */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Future Design Enhancements &amp; High-Value Feature Suggestions</span>
            </h3>
            <p className="text-xs text-slate-400">
              Here are 6 strategic innovations you can add to scale this project into a commercial SaaS product or leading open-source tool:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Innovation 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <Cpu className="w-4 h-4" />
                <span>1. AI Gig Title &amp; Keyword Generator (Gemini Powered)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Feed the top 10% highest-rated gigs from any niche into Gemini to generate high-ranking gig titles, optimized SEO tags, and competitive pricing recommendations.
              </p>
            </div>

            {/* Innovation 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs">
                <TrendingUp className="w-4 h-4" />
                <span>2. Competitor Price Elasticity &amp; Niche Saturation Score</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Add an automated niche saturation score (0 to 100) comparing review velocity vs. average gig price to reveal under-served, high-margin freelance niches.
              </p>
            </div>

            {/* Innovation 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-teal-400 font-bold text-xs">
                <Rocket className="w-4 h-4" />
                <span>3. Multi-Page Continuous Crawler</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automatically navigate across pages 1 through 10 on Fiverr with simulated human delays and random mouse pauses to extract 500+ gigs seamlessly.
              </p>
            </div>

            {/* Innovation 4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                <Zap className="w-4 h-4" />
                <span>4. Discord &amp; Telegram Webhook Alerts</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Notify buyers or agencies via webhook whenever a new gig with &lt; 24hr delivery or special discount pricing appears in a target category.
              </p>
            </div>

            {/* Innovation 5 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs">
                <Database className="w-4 h-4" />
                <span>5. Historical Price &amp; Review Velocity Tracking</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Store consecutive daily runs in Supabase to plot line charts showing which seller rankings are accelerating over time.
              </p>
            </div>

            {/* Innovation 6 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-pink-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>6. Human-Stealth Scroll Jitter &amp; Safe Mode</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Randomized micro-pauses (600ms – 1800ms) with non-linear scroll cubic bezier easing to avoid anti-bot captchas during heavy scraping sessions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
