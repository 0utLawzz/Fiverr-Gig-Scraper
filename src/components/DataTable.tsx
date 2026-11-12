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
  Filter
} from 'lucide-react';
import { FiverrGig } from '../types/scraper';
import { downloadCsvFile } from '../utils/csvExporter';
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
        // Keyword filter check
        if (selectedKeyword) {
          const matchesKw = gig.keywords.some(
            (k) => k.toLowerCase() === selectedKeyword.toLowerCase()
          );
          if (!matchesKw) return false;
        }

        // Search term check
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
    <div className="space-y-6">
      {/* Analytics Dashboard Summary Cards */}
      <DashboardSummary
        gigs={gigs}
        selectedKeywordFilter={selectedKeyword}
        onSelectKeyword={(kw) => setSelectedKeyword(kw)}
      />

      {/* Top Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in extracted gigs (title, seller, keyword)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <span className="text-xs text-slate-400 whitespace-nowrap">
            Showing <strong className="text-white">{filteredAndSortedGigs.length}</strong> of{' '}
            <strong className="text-emerald-400">{gigs.length}</strong> gigs
            {selectedKeyword && (
              <span className="ml-1 text-emerald-400">
                (filtered by #{selectedKeyword})
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Format Selector Export Button */}
          <button
            onClick={onOpenExportModal}
            disabled={gigs.length === 0}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            title="Export to CSV, Excel, or JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export (CSV / Excel / JSON)</span>
          </button>

          {/* Supabase Sync Button */}
          <button
            onClick={onOpenSupabaseModal}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            title="Sync records to Supabase Database"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Supabase Sync</span>
          </button>

          <button
            onClick={onOpenRawCsvModal}
            disabled={gigs.length === 0}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
            <span>Raw CSV</span>
          </button>

          {gigs.length > 0 && (
            <button
              onClick={onClear}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="Clear all extracted records"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      {gigs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Gigs Extracted Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Head to the <strong>Fiverr Sandbox</strong> tab and click <strong>Start Scrape</strong>,
            or simulate lazy-loaded cards to test the MutationObserver parser.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/90 text-slate-400 sticky top-0 z-20 backdrop-blur-md border-b border-slate-800">
                <tr>
                  <th
                    onClick={() => toggleSort('position')}
                    className="py-3 px-3.5 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Pos</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Thumbnail</th>
                  <th className="py-3 px-4 min-w-[220px]">Title</th>
                  <th className="py-3 px-3">Seller & Level</th>
                  <th
                    onClick={() => toggleSort('rating')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Rating</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('reviewCount')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Reviews</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('price')}
                    className="py-3 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Price</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Delivery</th>
                  <th className="py-3 px-3">Badges</th>
                  <th className="py-3 px-3">Keywords</th>
                  <th className="py-3 px-3">Extracted At</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredAndSortedGigs.map((gig) => (
                  <tr key={gig.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Position */}
                    <td className="py-3 px-3.5 font-bold text-emerald-400">#{gig.position}</td>

                    {/* Thumbnail */}
                    <td className="py-3 px-3">
                      <button
                        onClick={() => setPreviewImage({ url: gig.imageUrl, title: gig.title })}
                        className="relative group w-12 h-8 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 cursor-pointer block"
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
                    <td className="py-3 px-4 font-medium text-white max-w-xs">
                      <a
                        href={gig.gigUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-emerald-400 transition-colors line-clamp-2 flex items-center gap-1 group"
                        title={gig.title}
                      >
                        <span>{gig.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </a>
                    </td>

                    {/* Seller & Level */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-200">{gig.sellerName}</div>
                      <span className="text-[10px] text-slate-400 font-medium">{gig.sellerLevel}</span>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1 font-bold text-white">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{gig.rating.toFixed(1)}</span>
                      </div>
                    </td>

                    {/* Review Count */}
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap font-medium">
                      {gig.reviewCount.toLocaleString()}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 font-bold text-emerald-400 whitespace-nowrap">
                      {gig.currency}{gig.price}
                    </td>

                    {/* Delivery Time */}
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap font-medium">
                      {gig.deliveryTime}
                    </td>

                    {/* Badges */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {gig.badges.length > 0 ? (
                          gig.badges.map((b) => (
                            <span
                              key={b}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                            >
                              {b}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </div>
                    </td>

                    {/* Keywords */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {gig.keywords.slice(0, 3).map((k) => (
                          <span
                            key={k}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-3 text-slate-400 text-[10px] whitespace-nowrap">
                      {new Date(gig.timestamp).toLocaleTimeString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleCopyJson(gig)}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title="Copy record as JSON"
                      >
                        {copiedId === gig.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl cursor-default"
          >
            <div className="relative aspect-video w-full bg-slate-950">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex items-center justify-between">
              <p className="text-xs text-slate-300 font-medium line-clamp-2">
                {previewImage.title}
              </p>
              <button
                onClick={() => setPreviewImage(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg ml-3"
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
