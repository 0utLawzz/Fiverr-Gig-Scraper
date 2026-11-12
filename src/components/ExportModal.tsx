import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  FileText, 
  Code
} from 'lucide-react';
import { FiverrGig } from '../types/scraper';
import { exportDataset, ExportFormat, generateJsonContent, generateExcelXmlContent } from '../utils/multiFormatExporter';
import { generateCsvContent, getFilenameTimestamp } from '../utils/csvExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  gigs: FiverrGig[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  gigs,
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const timestamp = getFilenameTimestamp();
  const extensionMap: Record<ExportFormat, string> = {
    csv: 'csv',
    json: 'json',
    excel: 'xls',
  };
  const filename = `fiverr_gigs_${timestamp}.${extensionMap[format]}`;

  let previewContent = '';
  if (format === 'csv') {
    previewContent = generateCsvContent(gigs);
  } else if (format === 'json') {
    previewContent = generateJsonContent(gigs);
  } else {
    previewContent = generateExcelXmlContent(gigs);
  }

  const byteSize = new Blob([previewContent]).size;

  const handleDownload = () => {
    exportDataset(gigs, format);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewContent);
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FFFEF2] border-b-2 border-[#2D2D2D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD23F] border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] flex items-center justify-center">
              <Download className="w-5 h-5 text-[#2D2D2D] stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-hand text-2xl font-bold text-[#2D2D2D] flex items-center gap-2">
                <span>Export Dataset</span>
                <span className="font-code text-xs px-2 py-0.5 rounded-md bg-white border border-[#2D2D2D]">
                  {filename}
                </span>
              </h3>
              <p className="label-mono text-[10px] text-[#2D2D2D]/70">
                {gigs.length} records • {(byteSize / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white hover:bg-[#FF6B6B] hover:text-white border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center justify-center text-[#2D2D2D] transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="bg-white px-6 py-3 border-b-2 border-[#2D2D2D] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="label-mono text-[#2D2D2D]">FORMAT:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setFormat('csv')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-[#2D2D2D] transition-all cursor-pointer ${
                  format === 'csv'
                    ? 'bg-[#FFD23F] text-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] -translate-y-0.5'
                    : 'bg-[#FFFEF2] text-[#2D2D2D] hover:bg-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>CSV (.csv)</span>
              </button>

              <button
                onClick={() => setFormat('excel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-[#2D2D2D] transition-all cursor-pointer ${
                  format === 'excel'
                    ? 'bg-[#00D37F] text-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] -translate-y-0.5'
                    : 'bg-[#FFFEF2] text-[#2D2D2D] hover:bg-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel (.xls)</span>
              </button>

              <button
                onClick={() => setFormat('json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-[#2D2D2D] transition-all cursor-pointer ${
                  format === 'json'
                    ? 'bg-[#FFD23F] text-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] -translate-y-0.5'
                    : 'bg-[#FFFEF2] text-[#2D2D2D] hover:bg-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>JSON (.json)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FFFEF2] text-[#2D2D2D] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] rounded-lg text-xs font-bold transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00D37F] stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#00D37F] hover:bg-[#00ba70] text-[#2D2D2D] font-extrabold uppercase font-sans text-xs border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] active:translate-x-0.5 active:translate-y-0.5 rounded-lg transition-all"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Download {format.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-[#FFFEF2] font-code text-xs overflow-auto flex-1 text-[#2D2D2D] leading-relaxed max-h-[55vh]">
          <pre className="whitespace-pre-wrap">{previewContent}</pre>
        </div>
      </div>
    </div>
  );
};
