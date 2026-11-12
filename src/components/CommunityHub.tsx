import React, { useState } from 'react';
import { 
  Github, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Download, 
  Share2, 
  Database, 
  ShieldCheck, 
  CheckCircle2,
  Rocket,
  Cpu,
  Zap,
  TrendingUp
} from 'lucide-react';
import { FiverrGig } from '../types/scraper';

interface CommunityHubProps {
  gigs: FiverrGig[];
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ gigs }) => {
  const [activeTab, setActiveTab] = useState<'metadata' | 'nocoder' | 'social' | 'suggestions'>('metadata');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const REPO_SUGGESTIONS = [
    { name: 'fiverr-gig-scraper-pro', tag: 'Recommended' },
    { name: 'fiverr-scraper-extension', tag: 'Direct & Simple' },
    { name: 'fiverr-market-intelligence-scraper', tag: 'Enterprise Analytics' },
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

  const BADGES_MARKDOWN = `[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-00D37F?style=for-the-badge&logo=google-chrome&logoColor=2D2D2D)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Supabase Ready](https://img.shields.io/badge/Supabase-Database%20Ready-FFD23F?style=for-the-badge&logo=supabase&logoColor=2D2D2D)](https://supabase.com)
[![Vercel Deploy](https://img.shields.io/badge/Vercel-Deploy%20Ready-2D2D2D?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)`;

  const downloadSocialBannerSvg = () => {
    const avgPrice = gigs.length > 0 ? (gigs.reduce((a, b) => a + b.price, 0) / gigs.length).toFixed(1) : '124.5';

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="#FFFEF2"/>
  <rect x="20" y="20" width="1160" height="590" rx="24" fill="#ffffff" stroke="#2D2D2D" stroke-width="4"/>
  
  <!-- Offset hard shadow block -->
  <rect x="100" y="90" width="60" height="60" rx="12" fill="#00D37F" stroke="#2D2D2D" stroke-width="3"/>
  <text x="130" y="132" font-family="'Gaegu', cursive, sans-serif" font-size="38" font-weight="900" fill="#2D2D2D" text-anchor="middle">fi</text>

  <text x="180" y="132" font-family="'Gaegu', cursive, sans-serif" font-size="44" font-weight="700" fill="#2D2D2D">Fiverr Scraper Pro</text>
  <rect x="520" y="102" width="140" height="34" rx="6" fill="#FFD23F" stroke="#2D2D2D" stroke-width="2"/>
  <text x="590" y="125" font-family="'Space Mono', monospace" font-size="14" font-weight="700" fill="#2D2D2D" text-anchor="middle">MANIFEST V3</text>

  <!-- Big Title -->
  <text x="100" y="230" font-family="'Gaegu', cursive, sans-serif" font-size="64" font-weight="700" fill="#2D2D2D">
    Scrape, Analyze &amp; Export
  </text>
  <text x="100" y="300" font-family="'Gaegu', cursive, sans-serif" font-size="64" font-weight="700" fill="#00D37F">
    Fiverr Gig Listings in Real-Time
  </text>

  <!-- Subtitle -->
  <text x="100" y="365" font-family="'Inter', sans-serif" font-size="22" font-weight="600" fill="#2D2D2D">
    MutationObserver Lazy-Loader • 12+ Fields Extracted • Auto CSV/Excel/JSON • Supabase Ready
  </text>

  <!-- Metric Badges -->
  <g transform="translate(100, 420)">
    <rect width="220" height="110" rx="16" fill="#FFFEF2" stroke="#2D2D2D" stroke-width="3"/>
    <text x="24" y="42" font-family="'Space Mono', monospace" font-size="12" font-weight="700" fill="#2D2D2D">AVG PRICE</text>
    <text x="24" y="85" font-family="'Gaegu', cursive" font-size="42" font-weight="900" fill="#00D37F">$${avgPrice}</text>

    <g transform="translate(245, 0)">
      <rect width="220" height="110" rx="16" fill="#FFFEF2" stroke="#2D2D2D" stroke-width="3"/>
      <text x="24" y="42" font-family="'Space Mono', monospace" font-size="12" font-weight="700" fill="#2D2D2D">RATING</text>
      <text x="24" y="85" font-family="'Gaegu', cursive" font-size="42" font-weight="900" fill="#FFD23F">★ 4.9 / 5.0</text>
    </g>

    <g transform="translate(490, 0)">
      <rect width="220" height="110" rx="16" fill="#FFFEF2" stroke="#2D2D2D" stroke-width="3"/>
      <text x="24" y="42" font-family="'Space Mono', monospace" font-size="12" font-weight="700" fill="#2D2D2D">DATA EXTRACTION</text>
      <text x="24" y="85" font-family="'Gaegu', cursive" font-size="42" font-weight="900" fill="#2D2D2D">12 Fields</text>
    </g>

    <g transform="translate(735, 0)">
      <rect width="240" height="110" rx="16" fill="#FFD23F" stroke="#2D2D2D" stroke-width="3"/>
      <text x="24" y="42" font-family="'Space Mono', monospace" font-size="12" font-weight="700" fill="#2D2D2D">CLOUD DATABASE</text>
      <text x="24" y="85" font-family="'Gaegu', cursive" font-size="34" font-weight="900" fill="#2D2D2D">Supabase &amp; Vercel</text>
    </g>
  </g>
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
    <div className="space-y-6 pb-28">
      {/* Top Navigation Strip */}
      <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-2 flex flex-wrap gap-2 shadow-[4px_4px_0_#2D2D2D]">
        <button
          onClick={() => setActiveTab('metadata')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-sans uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'metadata'
              ? 'bg-[#FFD23F] text-[#2D2D2D] border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] -translate-y-0.5'
              : 'text-[#2D2D2D] hover:bg-[#FFFEF2]'
          }`}
        >
          <Github className="w-3.5 h-3.5" />
          <span>GitHub Standard</span>
        </button>

        <button
          onClick={() => setActiveTab('nocoder')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-sans uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'nocoder'
              ? 'bg-[#00D37F] text-[#2D2D2D] border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] -translate-y-0.5'
              : 'text-[#2D2D2D] hover:bg-[#FFFEF2]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Non-Coder 3-Click Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-sans uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'social'
              ? 'bg-[#FFD23F] text-[#2D2D2D] border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] -translate-y-0.5'
              : 'text-[#2D2D2D] hover:bg-[#FFFEF2]'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social Preview Banner</span>
        </button>

        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-sans uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'suggestions'
              ? 'bg-[#FFD23F] text-[#2D2D2D] border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] -translate-y-0.5'
              : 'text-[#2D2D2D] hover:bg-[#FFFEF2]'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-[#2D2D2D]" />
          <span>Design Roadmap</span>
        </button>
      </div>

      {/* TAB 1: GITHUB REPO METADATA */}
      {activeTab === 'metadata' && (
        <div className="space-y-6">
          {/* Repo Name Suggestions */}
          <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-5 shadow-[5px_5px_0_rgba(45,45,45,0.1)] space-y-4">
            <h3 className="font-hand text-2xl font-bold text-[#2D2D2D] flex items-center gap-2">
              <Github className="w-5 h-5 text-[#2D2D2D]" />
              <span>Recommended GitHub Repository Names</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {REPO_SUGGESTIONS.map((repo, idx) => (
                <div
                  key={repo.name}
                  className="bg-[#FFFEF2] p-3.5 rounded-xl border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center justify-between"
                >
                  <div>
                    <span className="font-code text-[10px] uppercase font-bold text-[#00D37F] block mb-0.5">
                      {repo.tag}
                    </span>
                    <code className="font-code text-xs font-bold text-[#2D2D2D]">{repo.name}</code>
                  </div>

                  <button
                    onClick={() => copyToClipboard(repo.name, `name-${idx}`)}
                    className="p-1.5 text-[#2D2D2D] hover:bg-[#FFD23F] border border-[#2D2D2D] rounded transition-colors shadow-[1px_1px_0_#2D2D2D]"
                    title="Copy name"
                  >
                    {copiedField === `name-${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-[#00D37F]" />
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
            <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-5 shadow-[5px_5px_0_rgba(45,45,45,0.1)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="label-mono text-[#2D2D2D]">GitHub About / Description</span>
                <button
                  onClick={() => copyToClipboard(REPO_DESCRIPTION, 'desc')}
                  className="font-code text-xs text-[#00D37F] hover:underline font-bold"
                >
                  {copiedField === 'desc' ? 'Copied!' : 'Copy Text'}
                </button>
              </div>

              <div className="p-3.5 bg-[#FFFEF2] rounded-xl border-2 border-[#2D2D2D] text-xs text-[#2D2D2D] leading-relaxed font-sans shadow-[2px_2px_0_#2D2D2D]">
                {REPO_DESCRIPTION}
              </div>
            </div>

            <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-5 shadow-[5px_5px_0_rgba(45,45,45,0.1)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="label-mono text-[#2D2D2D]">GitHub Topics / Tags</span>
                <button
                  onClick={() => copyToClipboard(REPO_TOPICS.join(', '), 'topics')}
                  className="font-code text-xs text-[#00D37F] hover:underline font-bold"
                >
                  {copiedField === 'topics' ? 'Copied!' : 'Copy All'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 p-3.5 bg-[#FFFEF2] rounded-xl border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D]">
                {REPO_TOPICS.map((topic) => (
                  <span
                    key={topic}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white text-[#2D2D2D] border border-[#2D2D2D] font-code font-bold"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Badges Markdown */}
          <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-5 shadow-[5px_5px_0_rgba(45,45,45,0.1)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="label-mono text-[#2D2D2D]">README Badges (Shields.io)</span>
              <button
                onClick={() => copyToClipboard(BADGES_MARKDOWN, 'badges')}
                className="font-code text-xs text-[#00D37F] hover:underline font-bold"
              >
                {copiedField === 'badges' ? 'Copied Badges!' : 'Copy Markdown'}
              </button>
            </div>

            <div className="p-3 bg-[#FFFEF2] font-code text-xs rounded-xl border-2 border-[#2D2D2D] text-[#2D2D2D] overflow-x-auto shadow-[2px_2px_0_#2D2D2D]">
              <pre>{BADGES_MARKDOWN}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NON-CODER 3-CLICK GUIDE */}
      {activeTab === 'nocoder' && (
        <div className="space-y-5">
          <div className="bg-[#FFD23F] border-2 border-[#2D2D2D] rounded-2xl p-5 shadow-[4px_4px_0_#2D2D2D]">
            <h3 className="font-hand text-3xl font-bold text-[#2D2D2D] mb-1">
              Complete Non-Coder Guide: From Zero to Scraping in 2 Minutes
            </h3>
            <p className="text-xs text-[#2D2D2D] font-sans">
              No programming knowledge, terminal commands, or API keys needed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-5 shadow-[4px_4px_0_#2D2D2D] space-y-2">
              <div className="flex items-center gap-2 text-[#2D2D2D] font-bold text-xs">
                <span className="w-6 h-6 rounded-full bg-[#00D37F] border border-[#2D2D2D] text-[#2D2D2D] flex items-center justify-center font-hand text-base">
                  1
                </span>
                <span className="font-sans text-sm font-bold">Download &amp; Extract the Extension</span>
              </div>
              <p className="text-xs text-[#2D2D2D]/80 leading-relaxed font-sans">
                Click the yellow <strong>"Download Extension (.zip)"</strong> button in the header. Once downloaded, double-click to unzip the folder to your desktop.
              </p>
            </div>

            <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-5 shadow-[4px_4px_0_#2D2D2D] space-y-2">
              <div className="flex items-center gap-2 text-[#2D2D2D] font-bold text-xs">
                <span className="w-6 h-6 rounded-full bg-[#FFD23F] border border-[#2D2D2D] text-[#2D2D2D] flex items-center justify-center font-hand text-base">
                  2
                </span>
                <span className="font-sans text-sm font-bold">Load in Google Chrome / Brave</span>
              </div>
              <p className="text-xs text-[#2D2D2D]/80 leading-relaxed font-sans">
                Open Chrome, navigate to <code className="bg-[#FFFEF2] px-1 py-0.5 rounded border border-[#2D2D2D] font-code">chrome://extensions</code>, enable <strong>Developer mode</strong> in the top right, and click <strong>"Load unpacked"</strong>. Select the unzipped folder!
              </p>
            </div>

            <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-5 shadow-[4px_4px_0_#2D2D2D] space-y-2">
              <div className="flex items-center gap-2 text-[#2D2D2D] font-bold text-xs">
                <span className="w-6 h-6 rounded-full bg-[#00D37F] border border-[#2D2D2D] text-[#2D2D2D] flex items-center justify-center font-hand text-base">
                  3
                </span>
                <span className="font-sans text-sm font-bold">Search Fiverr &amp; Launch</span>
              </div>
              <p className="text-xs text-[#2D2D2D]/80 leading-relaxed font-sans">
                Navigate to any Fiverr search page, click the extension icon in your Chrome toolbar, set your filters, and click <strong>Start Scraping</strong>.
              </p>
            </div>

            <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-5 shadow-[4px_4px_0_#2D2D2D] space-y-2">
              <div className="flex items-center gap-2 text-[#2D2D2D] font-bold text-xs">
                <span className="w-6 h-6 rounded-full bg-[#FFD23F] border border-[#2D2D2D] text-[#2D2D2D] flex items-center justify-center font-hand text-base">
                  4
                </span>
                <span className="font-sans text-sm font-bold">Auto-Download CSV / Excel</span>
              </div>
              <p className="text-xs text-[#2D2D2D]/80 leading-relaxed font-sans">
                The on-screen HUD displays a live progress bar as it captures lazy-loaded cards with MutationObserver, and automatically downloads the dataset once complete.
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
              <h3 className="font-hand text-3xl font-bold text-[#2D2D2D]">GitHub Social OpenGraph Preview</h3>
              <p className="label-mono text-xs text-[#2D2D2D]/70">
                1200 x 630 px standard dimension banner
              </p>
            </div>

            <button
              onClick={downloadSocialBannerSvg}
              className="flex items-center gap-2 px-4 py-2 bg-[#FFD23F] hover:bg-[#ffe066] text-[#2D2D2D] font-extrabold uppercase font-sans text-xs border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] rounded-xl cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Export Social Banner (.svg)</span>
            </button>
          </div>

          <div className="relative aspect-[1200/630] w-full rounded-2xl overflow-hidden border-3 border-[#2D2D2D] bg-[#FFFEF2] p-8 flex flex-col justify-between shadow-[8px_8px_0_#2D2D2D]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#00D37F] border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] flex items-center justify-center font-hand text-3xl font-black text-[#2D2D2D] -rotate-3">
                  fi
                </div>
                <div>
                  <h4 className="font-hand text-2xl font-bold text-[#2D2D2D]">Fiverr Scraper Pro</h4>
                  <span className="font-code text-xs text-[#00D37F] font-bold">Manifest V3 • Auto Exporter</span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-md font-code text-xs font-bold bg-[#FFD23F] border border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D]">
                100% Client-Side
              </span>
            </div>

            <div className="my-auto py-4 space-y-2">
              <h2 className="font-hand text-4xl sm:text-5.5xl font-bold text-[#2D2D2D] leading-none">
                Scrape, Analyze &amp; Export <br />
                <span className="text-[#00D37F]">Fiverr Gigs in Real-Time</span>
              </h2>
              <p className="font-sans text-sm text-[#2D2D2D]/80 font-medium">
                MutationObserver Lazy-Loader • 12+ Fields Extracted • Auto CSV, Excel, JSON • Supabase Ready
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white border-2 border-[#2D2D2D] p-3 rounded-xl shadow-[2px_2px_0_#2D2D2D]">
                <div className="label-mono text-[9px]">AVG PRICE</div>
                <div className="font-hand text-2xl font-bold text-[#00D37F]">$124.50</div>
              </div>
              <div className="bg-white border-2 border-[#2D2D2D] p-3 rounded-xl shadow-[2px_2px_0_#2D2D2D]">
                <div className="label-mono text-[9px]">RATING</div>
                <div className="font-hand text-2xl font-bold text-[#FFD23F]">★ 4.9 / 5.0</div>
              </div>
              <div className="bg-white border-2 border-[#2D2D2D] p-3 rounded-xl shadow-[2px_2px_0_#2D2D2D]">
                <div className="label-mono text-[9px]">DATA EXTRACTION</div>
                <div className="font-hand text-2xl font-bold text-[#2D2D2D]">12 Fields</div>
              </div>
              <div className="bg-[#FFD23F] border-2 border-[#2D2D2D] p-3 rounded-xl shadow-[2px_2px_0_#2D2D2D]">
                <div className="label-mono text-[9px]">DATABASE SYNC</div>
                <div className="font-hand text-xl font-bold text-[#2D2D2D]">Supabase Ready</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DESIGN IMPROVEMENTS & ROADMAP */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-5 shadow-[4px_4px_0_#2D2D2D]">
            <h3 className="font-hand text-3xl font-bold text-[#2D2D2D] flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#FFD23F]" />
              <span>Future Design Enhancements &amp; Roadmap</span>
            </h3>
            <p className="label-mono text-xs text-[#2D2D2D]/70 mt-1">
              Key strategic ideas to scale this project into a commercial SaaS:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-4 shadow-[4px_4px_0_rgba(45,45,45,0.1)] space-y-1">
              <span className="font-code text-xs font-bold text-[#00D37F]">1. AI TITLE &amp; TAG OPTIMIZER</span>
              <p className="text-xs text-[#2D2D2D] leading-relaxed">
                Feed the top 10% highest-rated gigs into Gemini to generate high-ranking gig titles, optimized SEO tags, and competitive pricing.
              </p>
            </div>

            <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-4 shadow-[4px_4px_0_rgba(45,45,45,0.1)] space-y-1">
              <span className="font-code text-xs font-bold text-[#FFD23F]">2. NICHE SATURATION INDEX</span>
              <p className="text-xs text-[#2D2D2D] leading-relaxed">
                Add an automated saturation score comparing review velocity vs. average gig price to reveal underserved freelance niches.
              </p>
            </div>

            <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-4 shadow-[4px_4px_0_rgba(45,45,45,0.1)] space-y-1">
              <span className="font-code text-xs font-bold text-[#00D37F]">3. MULTI-PAGE CONTINUOUS CRAWLER</span>
              <p className="text-xs text-[#2D2D2D] leading-relaxed">
                Automatically navigate across pages 1 through 10 on Fiverr with simulated human delays to extract 500+ gigs seamlessly.
              </p>
            </div>

            <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-4 shadow-[4px_4px_0_rgba(45,45,45,0.1)] space-y-1">
              <span className="font-code text-xs font-bold text-[#FFD23F]">4. WEBHOOK ALERTS (DISCORD / TELEGRAM)</span>
              <p className="text-xs text-[#2D2D2D] leading-relaxed">
                Notify buyers or agencies via webhook whenever a new gig with 24h delivery or special discount pricing appears.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
