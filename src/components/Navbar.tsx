import React from 'react';
import { 
  TrendingUp, 
  User, 
  ShieldCheck, 
  BarChart3, 
  Layers, 
  History, 
  Bookmark, 
  Activity,
  Search,
  CheckCircle2,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { UserProfile, ProviderMode } from '../types';

interface NavbarProps {
  activeTab: 'analysis' | 'portfolio' | 'watchlist' | 'history' | 'profile' | 'diagnostics';
  setActiveTab: (tab: 'analysis' | 'portfolio' | 'watchlist' | 'history' | 'profile' | 'diagnostics') => void;
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
  users: UserProfile[];
  currentUser: UserProfile | null;
  onSelectUser: (user: UserProfile) => void;
  providerMode: ProviderMode;
  onSetProviderMode: (mode: ProviderMode) => void;
  isAnalyzing: boolean;
  onTriggerAnalysis: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedTicker,
  onSelectTicker,
  users,
  currentUser,
  onSelectUser,
  providerMode,
  onSetProviderMode,
  isAnalyzing,
  onTriggerAnalysis
}) => {
  const quickTickers = ['INFY', 'TCS', 'RELIANCE', 'HDFCBANK'];

  return (
    <header id="main_navbar" className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0B0F1A]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand & Platform Identity */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 px-2.5 py-1 rounded text-xs font-bold tracking-tighter text-white">
            A.F.I.P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-white">
                Multi-Agent Intelligence <span className="text-slate-500 font-normal text-xs">v2.4</span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE TELEMETRY
              </span>
            </div>
          </div>
        </div>

        {/* Global Ticker Search & Presets */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              id="ticker_search_input"
              type="text"
              value={selectedTicker}
              onChange={(e) => onSelectTicker(e.target.value.toUpperCase())}
              placeholder="Ticker (INFY)..."
              className="h-8 w-32 rounded border border-slate-800 bg-[#161F32] pl-8 pr-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#161F32] p-0.5 rounded border border-slate-800">
            {quickTickers.map(t => (
              <button
                key={t}
                id={`ticker_btn_${t}`}
                onClick={() => {
                  onSelectTicker(t);
                  if (activeTab !== 'analysis') setActiveTab('analysis');
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-all ${
                  selectedTicker === t
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            id="run_analysis_btn"
            onClick={onTriggerAnalysis}
            disabled={isAnalyzing}
            className="flex h-8 items-center gap-1.5 rounded bg-indigo-600 px-3 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-xs"
          >
            {isAnalyzing ? (
              <>
                <Activity className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                <span className="font-mono text-[11px]">Synthesizing...</span>
              </>
            ) : (
              <>
                <Layers className="h-3.5 w-3.5 text-indigo-200" />
                <span className="font-mono text-[11px]">Run Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* User Switcher & Provider Indicator */}
        <div className="flex items-center gap-3">
          
          {/* Provider Mode Status Chip */}
          <div className="relative group">
            <button
              id="provider_mode_toggle_btn"
              className={`flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-mono font-medium border ${
                providerMode === 'LIVE'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : providerMode === 'DEMO'
                  ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
                  : providerMode === 'CACHED'
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                  : providerMode === 'STALE'
                  ? 'border-orange-500/30 bg-orange-500/10 text-orange-300'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
              }`}
            >
              <Radio className="h-3 w-3 animate-pulse" />
              <span className="font-bold">{providerMode}</span>
            </button>
          </div>

          {/* User Profile Selector (Rahul vs Priya) */}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] text-slate-500 leading-none uppercase tracking-widest font-bold">Active Profile</p>
                <div className="flex items-center justify-end">
                  <select
                    id="user_profile_select"
                    value={currentUser?.id || ''}
                    onChange={(e) => {
                      const found = users.find(u => u.id === e.target.value);
                      if (found) onSelectUser(found);
                    }}
                    className="bg-transparent text-xs font-semibold text-indigo-400 focus:outline-none cursor-pointer"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="bg-[#0D1321] text-slate-200">
                        {u.name} ({u.riskTolerance})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-200">
                {currentUser?.name.split(' ').map(n => n[0]).join('') || 'CI'}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-slate-800 bg-[#0D1321] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto py-1.5 text-xs font-medium">
          <button
            id="nav_tab_analysis"
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded transition-all ${
              activeTab === 'analysis'
                ? 'bg-indigo-600 font-semibold text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161F32]'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Market & Agent Analysis</span>
          </button>

          <button
            id="nav_tab_portfolio"
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded transition-all ${
              activeTab === 'portfolio'
                ? 'bg-indigo-600 font-semibold text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161F32]'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Portfolio & Simulator</span>
          </button>

          <button
            id="nav_tab_watchlist"
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded transition-all ${
              activeTab === 'watchlist'
                ? 'bg-indigo-600 font-semibold text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161F32]'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Watchlist & Quotes</span>
          </button>

          <button
            id="nav_tab_history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-600 font-semibold text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161F32]'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Research History</span>
          </button>

          <button
            id="nav_tab_profile"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-600 font-semibold text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161F32]'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile settings</span>
          </button>

          <button
            id="nav_tab_diagnostics"
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-indigo-600 font-semibold text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161F32]'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Testing & Audit Studio</span>
          </button>
        </div>
      </div>
    </header>
  );
};
