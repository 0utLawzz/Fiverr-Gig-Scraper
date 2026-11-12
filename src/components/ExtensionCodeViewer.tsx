import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  FolderArchive, 
  Chrome, 
  CheckCircle2, 
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
    <div className="space-y-6 pb-28">
      {/* Installation Banner */}
      <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl p-6 shadow-[6px_6px_0_#FFD23F] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#FFD23F] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] flex items-center justify-center font-bold text-xs">
                <Chrome className="w-4 h-4 text-[#2D2D2D]" />
              </span>
              <h2 className="font-hand text-3xl font-bold text-[#2D2D2D] leading-none">
                Chrome Extension Unpacked Source (Manifest V3)
              </h2>
            </div>
            <p className="text-xs text-[#2D2D2D] leading-relaxed font-sans">
              Self-contained extension with active <strong>MutationObserver</strong> for lazy-loaded Fiverr cards, floating mint progress HUD, rating and price filters, and multi-format exports.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-extrabold uppercase font-sans tracking-wider border-2 border-[#2D2D2D] shadow-[4px_4px_0_#2D2D2D] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer transition-all ${
                downloadSuccess
                  ? 'bg-[#00D37F] text-[#2D2D2D]'
                  : 'bg-[#FFD23F] hover:bg-[#ffe066] text-[#2D2D2D]'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#2D2D2D]" />
                  <span>Downloaded (.zip)!</span>
                </>
              ) : isZipping ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#2D2D2D] border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating ZIP...</span>
                </>
              ) : (
                <>
                  <FolderArchive className="w-4 h-4 text-[#2D2D2D]" />
                  <span>Download Extension (.zip)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3 Step Visual Installation Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-2 border-[#2D2D2D]/15 text-xs">
          <div className="bg-[#FFFEF2] p-4 rounded-xl border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] space-y-1.5">
            <div className="flex items-center gap-2 font-hand text-xl font-bold text-[#2D2D2D]">
              <span className="w-6 h-6 rounded-full bg-[#00D37F] border border-[#2D2D2D] flex items-center justify-center text-sm">
                1
              </span>
              <span>Extract the ZIP</span>
            </div>
            <p className="text-[#2D2D2D]/80 text-[11px] font-sans leading-relaxed">
              Unpack the downloaded ZIP archive into any local folder on your computer.
            </p>
          </div>

          <div className="bg-[#FFFEF2] p-4 rounded-xl border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] space-y-1.5">
            <div className="flex items-center gap-2 font-hand text-xl font-bold text-[#2D2D2D]">
              <span className="w-6 h-6 rounded-full bg-[#FFD23F] border border-[#2D2D2D] flex items-center justify-center text-sm">
                2
              </span>
              <span>Open chrome://extensions</span>
            </div>
            <p className="text-[#2D2D2D]/80 text-[11px] font-sans leading-relaxed">
              Enable <strong>Developer mode</strong> in Chrome/Brave and click <strong>"Load unpacked"</strong>.
            </p>
          </div>

          <div className="bg-[#FFFEF2] p-4 rounded-xl border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] space-y-1.5">
            <div className="flex items-center gap-2 font-hand text-xl font-bold text-[#2D2D2D]">
              <span className="w-6 h-6 rounded-full bg-[#00D37F] border border-[#2D2D2D] flex items-center justify-center text-sm">
                3
              </span>
              <span>Scrape on Fiverr</span>
            </div>
            <p className="text-[#2D2D2D]/80 text-[11px] font-sans leading-relaxed">
              Navigate to Fiverr, open the extension popup, choose limits &amp; start scraping!
            </p>
          </div>
        </div>
      </div>

      {/* Code Browser */}
      <div className="bg-white border-2 border-[#2D2D2D] rounded-2xl overflow-hidden shadow-[6px_6px_0_#2D2D2D]">
        {/* File Tabs */}
        <div className="bg-[#FFFEF2] border-b-2 border-[#2D2D2D] flex items-center justify-between px-3 overflow-x-auto">
          <div className="flex items-center gap-1.5 py-2">
            {EXTENSION_FILES.map((file) => (
              <button
                key={file.name}
                onClick={() => setSelectedFileName(file.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-code font-bold whitespace-nowrap border-2 border-[#2D2D2D] transition-all cursor-pointer ${
                  selectedFileName === file.name
                    ? 'bg-[#FFD23F] text-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] -translate-y-0.5'
                    : 'bg-white hover:bg-[#FFFEF2] text-[#2D2D2D]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0 py-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FFD23F] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] rounded-lg text-xs font-bold text-[#2D2D2D] transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00D37F] stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Description Header */}
        <div className="px-5 py-2.5 bg-white border-b border-[#2D2D2D]/15 flex items-center justify-between text-xs text-[#2D2D2D]/70 font-code">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#00D37F] shrink-0" />
            <span>{currentFile.description}</span>
          </div>
          <span className="text-[11px] font-bold text-[#2D2D2D]">
            {currentFile.content.split('\n').length} lines
          </span>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-[#FFFEF2] font-code text-xs overflow-x-auto max-h-[600px] leading-relaxed text-[#2D2D2D]">
          <pre>
            <code>{currentFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
