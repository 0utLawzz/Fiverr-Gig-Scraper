import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  UploadCloud, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Server
} from 'lucide-react';
import { FiverrGig } from '../types/scraper';
import { 
  getStoredSupabaseConfig, 
  saveStoredSupabaseConfig, 
  testSupabaseConnection, 
  syncGigsToSupabase, 
  SUPABASE_SQL_SCHEMA,
  SupabaseConfig 
} from '../utils/supabaseClient';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  gigs: FiverrGig[];
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  gigs,
}) => {
  const [config, setConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; count: number; error?: string } | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [activeTab, setActiveTab] = useState<'sync' | 'schema' | 'vercel'>('sync');

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredSupabaseConfig());
      setTestResult(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    saveStoredSupabaseConfig(config);
  };

  const handleTestConnection = async () => {
    handleSaveConfig();
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(config.url, config.anonKey, config.tableName);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection test failed.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncToSupabase = async () => {
    handleSaveConfig();
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncGigsToSupabase(gigs, config);
      setSyncResult(res);
    } catch (err: any) {
      setSyncResult({ success: false, count: 0, error: err.message || 'Sync failed.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#2D2D2D]/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-3 border-[#2D2D2D] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[12px_12px_0_#2D2D2D] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FFFEF2] border-b-2 border-[#2D2D2D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D37F] border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] flex items-center justify-center">
              <Database className="w-5 h-5 text-[#2D2D2D]" />
            </div>
            <div>
              <h3 className="font-hand text-2xl font-bold text-[#2D2D2D] flex items-center gap-2">
                <span>Supabase Sync</span>
                <span className="font-code text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#FFD23F] border border-[#2D2D2D]">
                  POSTGRES READY
                </span>
              </h3>
              <p className="label-mono text-[10px] text-[#2D2D2D]/70">
                Sync scraped records directly to your cloud database
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

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-[#2D2D2D] bg-[#FFFEF2] px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-2.5 px-3 font-code text-xs font-bold transition-all border-b-3 ${
              activeTab === 'sync'
                ? 'border-[#2D2D2D] text-[#2D2D2D] -mb-[2px]'
                : 'border-transparent text-[#2D2D2D]/60 hover:text-[#2D2D2D]'
            }`}
          >
            Sync ({gigs.length} Gigs)
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 px-3 font-code text-xs font-bold transition-all border-b-3 ${
              activeTab === 'schema'
                ? 'border-[#2D2D2D] text-[#2D2D2D] -mb-[2px]'
                : 'border-transparent text-[#2D2D2D]/60 hover:text-[#2D2D2D]'
            }`}
          >
            SQL Schema
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`pb-2.5 px-3 font-code text-xs font-bold transition-all border-b-3 ${
              activeTab === 'vercel'
                ? 'border-[#2D2D2D] text-[#2D2D2D] -mb-[2px]'
                : 'border-transparent text-[#2D2D2D]/60 hover:text-[#2D2D2D]'
            }`}
          >
            Vercel Config
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="space-y-3 bg-[#FFFEF2] p-4 rounded-xl border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D]">
                <div>
                  <label className="label-mono block text-[#2D2D2D] mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={config.url}
                    onChange={(e) => setConfig({ ...config, url: e.target.value })}
                    placeholder="https://xyzprojectid.supabase.co"
                    className="w-full px-3 py-2 bg-white border-2 border-[#2D2D2D] rounded-lg text-xs font-bold text-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] outline-none"
                  />
                </div>

                <div>
                  <label className="label-mono block text-[#2D2D2D] mb-1">
                    Supabase Anon Key (Public Key)
                  </label>
                  <input
                    type="password"
                    value={config.anonKey}
                    onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 bg-white border-2 border-[#2D2D2D] rounded-lg text-xs font-bold text-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] outline-none"
                  />
                </div>

                <div>
                  <label className="label-mono block text-[#2D2D2D] mb-1">
                    Target Table Name
                  </label>
                  <input
                    type="text"
                    value={config.tableName}
                    onChange={(e) => setConfig({ ...config, tableName: e.target.value })}
                    placeholder="fiverr_gigs"
                    className="w-full px-3 py-2 bg-white border-2 border-[#2D2D2D] rounded-lg text-xs font-bold text-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting || !config.url || !config.anonKey}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FFFEF2] text-[#2D2D2D] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] rounded-lg font-bold text-xs transition-colors"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Server className="w-3.5 h-3.5 text-[#00D37F]" />
                    )}
                    <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-code text-xs text-[#2D2D2D] hover:underline ml-auto"
                  >
                    <span>Supabase Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Alerts */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] flex items-start gap-2.5 ${
                    testResult.success ? 'bg-[#00D37F]/20 text-[#2D2D2D]' : 'bg-[#FF6B6B]/20 text-[#2D2D2D]'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00D37F] shrink-0 mt-0.5 stroke-[3]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#FF6B6B] shrink-0 mt-0.5 stroke-[3]" />
                  )}
                  <p className="font-code text-xs leading-relaxed">{testResult.message}</p>
                </div>
              )}

              {syncResult && (
                <div
                  className={`p-3 rounded-xl border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] flex items-start gap-2.5 ${
                    syncResult.success ? 'bg-[#00D37F]/20 text-[#2D2D2D]' : 'bg-[#FF6B6B]/20 text-[#2D2D2D]'
                  }`}
                >
                  <p className="font-code text-xs leading-relaxed">
                    {syncResult.success
                      ? `🎉 Successfully synced ${syncResult.count} gigs into Supabase table '${config.tableName}'!`
                      : `Sync error: ${syncResult.error}`}
                  </p>
                </div>
              )}

              <button
                onClick={handleSyncToSupabase}
                disabled={isSyncing || gigs.length === 0 || !config.url || !config.anonKey}
                className="w-full py-3 bg-[#00D37F] hover:bg-[#00ba70] disabled:opacity-40 disabled:pointer-events-none text-[#2D2D2D] font-extrabold uppercase font-sans text-xs tracking-wider border-2 border-[#2D2D2D] shadow-[4px_4px_0_#2D2D2D] active:translate-x-0.5 active:translate-y-0.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Syncing Gigs to Supabase...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Push {gigs.length} Gigs to Supabase Table</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-code text-xs font-bold text-[#2D2D2D]">
                  Run this SQL in your Supabase project's SQL Editor:
                </p>
                <button
                  onClick={handleCopySchema}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#FFD23F] text-[#2D2D2D] border-2 border-[#2D2D2D] shadow-[2px_2px_0_#2D2D2D] rounded-lg font-code text-xs font-bold"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5 text-[#00D37F]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>

              <div className="p-3 bg-[#FFFEF2] font-code text-xs rounded-xl border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] max-h-72 overflow-y-auto text-[#2D2D2D] leading-relaxed">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-[#FFD23F] p-4 rounded-xl border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] space-y-1">
                <h4 className="font-hand text-2xl font-bold text-[#2D2D2D]">1-Click Vercel Deployment</h4>
                <p className="font-sans text-xs text-[#2D2D2D] leading-relaxed">
                  Repository includes configured <code className="bg-white px-1 py-0.5 rounded border border-[#2D2D2D] font-code">vercel.json</code>. Just connect your GitHub repo to Vercel and it deploys automatically!
                </p>
              </div>

              <div className="bg-[#FFFEF2] p-4 rounded-xl border-2 border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] space-y-2">
                <span className="label-mono block text-[#2D2D2D]">Environment Variables:</span>
                <div className="font-code text-xs bg-white p-3 rounded-lg border border-[#2D2D2D] space-y-1 text-[#2D2D2D]">
                  <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                  <div>VITE_SUPABASE_ANON_KEY=your-anon-key-here</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
