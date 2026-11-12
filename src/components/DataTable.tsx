import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Search, 
  Trash2, 
  ExternalLink, 
  Star, 
  FileSpreadsheet, 
  ArrowUpDown, 
  Eye, 
  Copy, 
  Check,
  Database
} from 'lucide-react';
import { FiverrGig } from '../types/scraper';
import { DashboardSummary } from './DashboardSummary';

interface DataTableProps {
  gigs: FiverrGig[];
  onClear: () => void;
  onOpenRawCsvModal: () => void;
  onOpenExportModal: () => void;
  onOpenSupabaseModal: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  gigs,
  onClear,
  onOpenRawCsvModal,
  onOpenExportModal,
  onOpenSupabaseModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof FiverrGig>('position');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const filteredAndSortedGigs = useMemo(() => {
    return gigs
      .filter((gig) => {
        if (selectedKeyword) {
          const matchesKw = gig.keywords.some(
            (k) => k.toLowerCase() === selectedKeyword.toLowerCase()
          );
          if (!matchesKw) return false;
        }

        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (
          gig.title.toLowerCase().includes(s) ||
          gig.sellerName.toLowerCase().includes(s) ||
          gig.sellerLevel.toLowerCase().includes(s) ||
          gig.keywords.some((k) => k.toLowerCase().includes(s)) ||
          gig.badges.some((b) => b.toLowerCase().includes(s))
        );
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [gigs, searchTerm, selectedKeyword, sortField, sortOrder]);

  const toggleSort = (field: keyof FiverrGig) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleCopyJson = (gig: FiverrGig) => {
    navigator.clipboard.writeText(JSON.stringify(gig, null, 2));
    setCopiedId(gig.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Analytics Dashboard Summary Cards */}
      <DashboardSummary
        gigs={gigs}
        selectedKeywordFilter={selectedKeyword}
        onSelectKeyword={(kw) => setSelectedKeyword(kw)}
      />

      {/* Top Toolbar */}
      <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[5px_5px_0_rgba(45,45,45,0.1)]">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search extracted gigs (title, seller, keyword)..."
              className="w-full pl-9 pr-4 py-2 bg-[#FFFEF2] border-2 border-[#2D2D2D] rounded-xl text-xs font-semibold text-[#2D2D2D] placeholder-[#2D2D2D]/50 shadow-[2px_2px_0_#2D2D2D] focus:shadow-[3px_3px_0_#FFD23F] outline-none transition-all"
            />
          </div>

          <span className="label-mono whitespace-nowrap text-[#2D2D2D]">
            Showing <strong>{filteredAndSortedGigs.length}</strong> of{' '}
            <strong className="text-[#00D37F]">{gigs.length}</strong> gigs
            {selectedKeyword && (
              <span className="ml-1 text-[#FFD23F] font-bold">
                (#{selectedKeyword})
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Format Selector Export Button */}
          <button
            onClick={onOpenExportModal}
            disabled={gigs.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFD23F] hover:bg-[#ffe066] disabled:opacity-40 disabled:pointer-events-none text-[#2D2D2D] text-xs font-extrabold uppercase font-sans tracking-wider border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            title="Export to CSV, Excel, or JSON"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Export (CSV / Excel / JSON)</span>
          </button>

          {/* Supabase Sync Button */}
          <button
            onClick={onOpenSupabaseModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFFEF2] border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] active:translate-x-0.5 active:translate-y-0.5 text-[#2D2D2D] text-xs font-bold transition-all cursor-pointer"
            title="Sync records to Supabase Database"
          >
            <span className="w-2 h-2 rounded-full bg-[#00D37F] border border-[#2D2D2D]"></span>
            <span className="font-code text-[11px]">SUPABASE SYNC</span>
          </button>

          <button
            onClick={onOpenRawCsvModal}
            disabled={gigs.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#FFFEF2] disabled:opacity-40 disabled:pointer-events-none border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] text-[#2D2D2D] text-xs font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00D37F]" />
            <span className="font-code text-[11px]">RAW CSV</span>
          </button>

          {gigs.length > 0 && (
            <button
              onClick={onClear}
              className="p-2 text-[#2D2D2D] hover:text-white hover:bg-[#FF6B6B] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] rounded-xl transition-all cursor-pointer"
              title="Clear all extracted records"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      {gigs.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#2D2D2D] rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD23F] border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] flex items-center justify-center mx-auto text-[#2D2D2D]">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="font-hand text-3xl font-bold text-[#2D2D2D]">No Gigs Extracted Yet</h3>
          <p className="label-mono text-xs text-[#2D2D2D]/60 max-w-md mx-auto">
            Switch to the <strong>Sandbox</strong> tab and click <strong>Start Scrape</strong>,
            or simulate lazy-loaded cards to test the MutationObserver live.
          </p>
        </div>
      ) : (
        <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl overflow-hidden shadow-[6px_6px_0_#2D2D2D]">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#FFFEF2] text-[#2D2D2D] sticky top-0 z-20 border-b-2 border-[#2D2D2D] font-code">
                <tr>
                  <th
                    onClick={() => toggleSort('position')}
                    className="py-3 px-3.5 cursor-pointer hover:bg-[#FFD23F]/20"
                  >
                    <div className="flex items-center gap-1 font-bold">
                      <span>POS</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 font-bold">IMAGE</th>
                  <th className="py-3 px-4 min-w-[220px] font-bold">TITLE</th>
                  <th className="py-3 px-3 font-bold">SELLER &amp; LEVEL</th>
                  <th
                    onClick={() => toggleSort('rating')}
                    className="py-3 px-3 cursor-pointer hover:bg-[#FFD23F]/20 font-bold"
                  >
                    <div className="flex items-center gap-1">
                      <span>RATING</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('reviewCount')}
                    className="py-3 px-3 cursor-pointer hover:bg-[#FFD23F]/20 font-bold"
                  >
                    <div className="flex items-center gap-1">
                      <span>REVIEWS</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('price')}
                    className="py-3 px-3 cursor-pointer hover:bg-[#FFD23F]/20 font-bold"
                  >
                    <div className="flex items-center gap-1">
                      <span>PRICE</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 font-bold">DELIVERY</th>
                  <th className="py-3 px-3 font-bold">BADGES</th>
                  <th className="py-3 px-3 font-bold">KEYWORDS</th>
                  <th className="py-3 px-3 font-bold">TIMESTAMP</th>
                  <th className="py-3 px-3 text-right font-bold">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y border-t border-[#2D2D2D]/15 divide-[#2D2D2D]/10 text-[#2D2D2D]">
                {filteredAndSortedGigs.map((gig) => (
                  <tr key={gig.id} className="hover:bg-[#FFD23F]/10 transition-colors">
                    {/* Position */}
                    <td className="py-3 px-3.5 font-hand text-xl font-bold text-[#2D2D2D]">
                      #{gig.position}
                    </td>

                    {/* Thumbnail */}
                    <td className="py-3 px-3">
                      <button
                        onClick={() => setPreviewImage({ url: gig.imageUrl, title: gig.title })}
                        className="relative group w-12 h-8 rounded-lg overflow-hidden bg-white border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] cursor-pointer block"
                        title="Click to view full image"
                      >
                        <img
                          src={gig.imageUrl}
                          alt={gig.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-3 h-3 text-white" />
                        </div>
                      </button>
                    </td>

                    {/* Title & URL */}
                    <td className="py-3 px-4 font-bold text-[#2D2D2D] max-w-xs">
                      <a
                        href={gig.gigUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#00D37F] hover:underline transition-colors line-clamp-2 flex items-center gap-1 group"
                        title={gig.title}
                      >
                        <span>{gig.title}</span>
                        <ExternalLink className="w-3 h-3 text-[#2D2D2D]/40 group-hover:text-[#00D37F] shrink-0" />
                      </a>
                    </td>

                    {/* Seller & Level */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-code text-xs font-bold text-[#2D2D2D]">{gig.sellerName}</div>
                      <span className="font-code text-[10px] px-1.5 py-0.2 rounded bg-white border border-[#2D2D2D] font-medium mt-0.5 inline-block">
                        {gig.sellerLevel}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-code font-bold text-[#00D37F]">
                        <Star className="w-3.5 h-3.5 fill-[#FFD23F] text-[#2D2D2D]" />
                        <span className="text-[#2D2D2D]">{gig.rating.toFixed(1)}</span>
                      </div>
                    </td>

                    {/* Review Count */}
                    <td className="py-3 px-3 font-code text-xs text-[#2D2D2D]/70 whitespace-nowrap font-medium">
                      {gig.reviewCount.toLocaleString()}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-hand text-2xl font-bold text-[#00D37F]">
                        {gig.currency}{gig.price}
                      </span>
                    </td>

                    {/* Delivery Time */}
                    <td className="py-3 px-3 text-[#2D2D2D] font-code text-xs whitespace-nowrap font-medium">
                      {gig.deliveryTime}
                    </td>

                    {/* Badges */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {gig.badges.length > 0 ? (
                          gig.badges.map((b) => (
                            <span
                              key={b}
                              className="text-[9px] font-code font-bold px-1.5 py-0.5 rounded bg-[#FFD23F] text-[#2D2D2D] border border-[#2D2D2D]"
                            >
                              {b}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#2D2D2D]/40 font-code">—</span>
                        )}
                      </div>
                    </td>

                    {/* Keywords */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {gig.keywords.slice(0, 3).map((k) => (
                          <span
                            key={k}
                            className="text-[9px] font-code font-medium px-1.5 py-0.5 rounded bg-[#FFFEF2] text-[#2D2D2D] border border-[#2D2D2D]"
                          >
                            #{k}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-3 font-code text-[#2D2D2D]/60 text-[10px] whitespace-nowrap">
                      {new Date(gig.timestamp).toLocaleTimeString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleCopyJson(gig)}
                        className="p-1.5 text-[#2D2D2D] hover:bg-[#FFD23F] border border-[#2D2D2D] rounded-md transition-all shadow-[1px_1px_0_#2D2D2D]"
                        title="Copy record as JSON"
                      >
                        {copiedId === gig.id ? (
                          <Check className="w-3.5 h-3.5 text-[#00D37F] stroke-[3]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-[#2D2D2D]/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-3 border-[#2D2D2D] rounded-2xl max-w-lg w-full overflow-hidden shadow-[12px_12px_0_#2D2D2D] cursor-default"
          >
            <div className="relative aspect-video w-full bg-[#E5E5E5] border-b-2 border-[#2D2D2D]">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex items-center justify-between">
              <p className="text-xs font-bold text-[#2D2D2D] line-clamp-2">
                {previewImage.title}
              </p>
              <button
                onClick={() => setPreviewImage(null)}
                className="px-3 py-1.5 bg-[#FFD23F] hover:bg-[#ffe066] border-2 border-[#2D2D2D] text-[#2D2D2D] font-code text-xs font-bold rounded-lg shadow-[2px_2px_0_#2D2D2D] active:translate-x-0.5 active:translate-y-0.5 ml-3"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
