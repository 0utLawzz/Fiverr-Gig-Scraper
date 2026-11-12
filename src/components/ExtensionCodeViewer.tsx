import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  FolderArchive, 
  Chrome, 
  Layers, 
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { EXTENSION_FILES, downloadExtensionZipPackage } from '../utils/extensionBundle';

export const ExtensionCodeViewer: React.FC = () => {
  const [selectedFileName, setSelectedFileName] = useState('content.js');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const currentFile = EXTENSION_FILES.find((f) => f.name === selectedFileName) || EXTENSION_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadExtensionZipPackage();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Installation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                <Chrome className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-base font-bold text-white">
                Chrome Extension Ready for Unpacked Loading (Manifest V3)
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This extension is completely self-contained. It uses a modern{' '}
              <strong className="text-emerald-400">MutationObserver</strong> to automatically capture
              lazy-loaded cards as you scroll Fiverr search or category pages, injects an on-screen
              progress HUD, respects minimum rating and price range filters, and auto-downloads a
              timestamped CSV file once complete.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className={`flex items-center space-x-2.5 px-5 py-3 rounded-xl text-xs font-bold shadow-lg transition-all ${
                downloadSuccess
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Extension Downloaded (.zip)!</span>
                </>
              ) : isZipping ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating ZIP Package...</span>
                </>
              ) : (
                <>
                  <FolderArchive className="w-4 h-4 text-slate-950" />
                  <span>Download Chrome Extension (.zip)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3 Step Visual Installation Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] border border-emerald-500/30">
                1
              </span>
              <span>Extract the ZIP</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Download the ZIP package and unzip it into an empty folder on your computer (e.g.{' '}
              <code className="text-slate-300">fiverr-scraper</code>).
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] border border-emerald-500/30">
                2
              </span>
              <span>Open chrome://extensions</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              In Chrome or Brave, navigate to <code className="text-slate-300">chrome://extensions</code> and
              toggle <strong>Developer mode</strong> ON in the upper right.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] border border-emerald-500/30">
                3
              </span>
              <span>Click "Load unpacked"</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Click <strong>"Load unpacked"</strong>, select the unzipped directory, and navigate to any
              Fiverr page to begin scraping!
            </p>
          </div>
        </div>
      </div>

      {/* Code Browser */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* File Tabs */}
        <div className="bg-slate-950 border-b border-slate-800 flex items-center justify-between px-3 overflow-x-auto">
          <div className="flex items-center space-x-1 py-2">
            {EXTENSION_FILES.map((file) => (
              <button
                key={file.name}
                onClick={() => setSelectedFileName(file.name)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedFileName === file.name
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 shrink-0 py-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Description Header */}
        <div className="px-5 py-2.5 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{currentFile.description}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {currentFile.content.split('\n').length} lines
          </span>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed text-slate-300">
          <pre>
            <code>{currentFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
