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
      className="fixed inset-0 z-50 bg-[#2D2D2D]/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-3 border-[#2D2D2D] rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-[12px_12px_0_#2D2D2D] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FFFEF2] border-b-2 border-[#2D2D2D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D37F] border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-[#2D2D2D]" />
            </div>
            <div>
              <h3 className="font-hand text-2xl font-bold text-[#2D2D2D] flex items-center gap-2">
                <span>Generated CSV Output</span>
                <span className="font-code text-xs px-2 py-0.5 rounded bg-white border border-[#2D2D2D]">
                  {filename}
                </span>
              </h3>
              <p className="label-mono text-[10px] text-[#2D2D2D]/70">
                {gigs.length} records • 13 columns • {(byteSize / 1024).toFixed(1)} KB • RFC 4180
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#FFD23F] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] text-xs font-bold text-[#2D2D2D] transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00D37F] stroke-[3]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={() => downloadCsvFile(gigs)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FFD23F] hover:bg-[#ffe066] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] active:translate-x-0.5 active:translate-y-0.5 text-xs font-extrabold uppercase font-sans text-[#2D2D2D] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Download File</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white hover:bg-[#FF6B6B] hover:text-white border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center justify-center text-[#2D2D2D] transition-colors ml-1"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Modal Code Area */}
        <div className="p-4 bg-[#FFFEF2] font-code text-xs overflow-auto flex-1 text-[#2D2D2D] leading-relaxed">
          <pre className="whitespace-pre-wrap">{csvContent}</pre>
        </div>
      </div>
    </div>
  );
};
