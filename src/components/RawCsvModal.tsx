import React, { useState } from 'react';
import { X, Copy, Check, Download, FileSpreadsheet } from 'lucide-react';
import { FiverrGig } from '../types/scraper';
import { generateCsvContent, getFilenameTimestamp, downloadCsvFile } from '../utils/csvExporter';

interface RawCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  gigs: FiverrGig[];
}

export const RawCsvModal: React.FC<RawCsvModalProps> = ({
  isOpen,
  onClose,
  gigs,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const csvContent = generateCsvContent(gigs);
  const timestamp = getFilenameTimestamp();
  const filename = `fiverr_gigs_${timestamp}.csv`;
  const byteSize = new Blob([csvContent]).size;

  const handleCopy = () => {
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Generated CSV Output</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {filename}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {gigs.length} records • 13 columns • {(byteSize / 1024).toFixed(1)} KB • RFC 4180 format
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy CSV</span>
                </>
              )}
            </button>

            <button
              onClick={() => downloadCsvFile(gigs)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Code Area */}
        <div className="p-4 bg-slate-950 font-mono text-xs overflow-auto flex-1 text-slate-300 leading-relaxed">
          <pre className="whitespace-pre-wrap">{csvContent}</pre>
        </div>
      </div>
    </div>
  );
};
