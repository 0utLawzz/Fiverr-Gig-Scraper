import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  FileText, 
  Code, 
  Sparkles,
  Info
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Export Dataset</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {filename}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {gigs.length} gigs ready for export • {(byteSize / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="bg-slate-950/80 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Format:</span>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setFormat('csv')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  format === 'csv'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>CSV (.csv)</span>
              </button>

              <button
                onClick={() => setFormat('excel')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  format === 'excel'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel (.xls / .xlsx)</span>
              </button>

              <button
                onClick={() => setFormat('json')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  format === 'json'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>JSON (.json)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Content</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-lg text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {format.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* Preview Code View */}
        <div className="p-4 bg-slate-950 font-mono text-xs overflow-auto flex-1 text-slate-300 leading-relaxed max-h-[55vh]">
          <pre className="whitespace-pre-wrap">{previewContent}</pre>
        </div>
      </div>
    </div>
  );
};
