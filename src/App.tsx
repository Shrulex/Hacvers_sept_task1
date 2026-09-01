import React, { useState, useEffect } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  ObjectiveHeroCard 
} from './components/ObjectiveHeroCard';
import { 
  PersonalizedHeroCard 
} from './components/PersonalizedHeroCard';
import { 
  ConsensusBarometer 
} from './components/ConsensusBarometer';
import { 
  AgentDeepDive 
} from './components/AgentDeepDive';
import { 
  EvidenceModal 
} from './components/EvidenceModal';
import { 
  HistoricalDiffModal 
} from './components/HistoricalDiffModal';
import { 
  PortfolioView 
} from './components/PortfolioView';
import { 
  WatchlistView 
} from './components/WatchlistView';
import { 
  DiagnosticsView 
} from './components/DiagnosticsView';
import { 
  HistoryView 
} from './components/HistoryView';
import { 
  ProfileView 
} from './components/ProfileView';
import { 
  AnalysisResponse, 
  UserProfile, 
  PortfolioHolding, 
  PortfolioHealthScore, 
  WatchlistItem, 
  ProviderMode, 
  HistoricalComparison,
  StockPricePoint
} from './types';
import { 
  History, 
  FileText, 
  Activity, 
  Sparkles, 
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analysis' | 'portfolio' | 'watchlist' | 'history' | 'profile' | 'diagnostics'>('analysis');
  const [selectedTicker, setSelectedTicker] = useState('INFY');
  
  // Data state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [priceHistory, setPriceHistory] = useState<StockPricePoint[]>([]);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [health, setHealth] = useState<PortfolioHealthScore | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [providerMode, setProviderMode] = useState<ProviderMode>('DEMO');
  
  // Modals state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [isHistoricalDiffOpen, setIsHistoricalDiffOpen] = useState(false);
  const [historicalDiff, setHistoricalDiff] = useState<HistoricalComparison | null>(null);

  // 1. Initial Load: Fetch Users & Seed State
  useEffect(() => {
    async function init() {
      try {
        const userRes = await fetch('/api/users');
        if (userRes.ok) {
          const uData = await userRes.json();
          setUsers(uData.users);
          if (uData.users.length > 0) {
            const initialUser = uData.users[0]; // Rahul Sharma (Conservative)
            setCurrentUser(initialUser);
            loadUserData(initialUser.id);
            triggerAnalysis('INFY', initialUser.id, providerMode);
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();
  }, []);

  // 2. Load User Portfolio and Watchlist
  const loadUserData = async (userId: string) => {
    try {
      const [portRes, watchRes] = await Promise.all([
        fetch(`/api/portfolio?userId=${userId}`),
        fetch(`/api/watchlist?userId=${userId}`)
      ]);
      if (portRes.ok) {
        const portData = await portRes.json();
        setHoldings(portData.holdings);
        setHealth(portData.health);
      }
      if (watchRes.ok) {
        const watchData = await watchRes.json();
        setWatchlist(watchData.watchlist);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // 3. User Switcher Handler
  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    loadUserData(user.id);
    if (selectedTicker) {
      triggerAnalysis(selectedTicker, user.id, providerMode);
    }
  };

  // 4. Analysis Trigger
  const triggerAnalysis = async (ticker: string, userId?: string, mode?: ProviderMode) => {
    const targetUser = userId || currentUser?.id || 'usr_conservative_01';
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          userId: targetUser,
          simulatedMode: mode || providerMode
        })
      });

      if (res.ok) {
        const data: AnalysisResponse = await res.json();
        setAnalysisData(data);
        
        // Fetch historical diff vs baseline
        const diffRes = await fetch(`/api/comparison?userId=${targetUser}&ticker=${ticker}&sessionId=${data.sessionId}`);
        if (diffRes.ok) {
          const diffData = await diffRes.json();
          setHistoricalDiff(diffData);
        }

        // Generate synthetic price points for chart if available
        if (data.agents.technical.metrics) {
          const basePrice = data.agents.technical.metrics.currentPrice;
          const points: StockPricePoint[] = [];
          for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const noise = Math.sin(i * 0.4) * (basePrice * 0.015);
            const trend = (30 - i) * (basePrice * 0.001);
            points.push({
              date: d.toISOString().split('T')[0],
              open: basePrice - noise,
              high: basePrice + Math.abs(noise) * 1.5,
              low: basePrice - Math.abs(noise) * 1.5,
              close: Math.round((basePrice - noise + trend) * 100) / 100,
              volume: 6000000
            });
          }
          setPriceHistory(points);
        }
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 5. Watchlist Handlers
  const handleAddToWatchlist = async (ticker: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, ticker })
      });
      if (res.ok) {
        loadUserData(currentUser.id);
      }
    } catch (err) {
      console.error('Add watchlist error:', err);
    }
  };

  const handleRemoveFromWatchlist = async (ticker: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, ticker })
      });
      if (res.ok) {
        loadUserData(currentUser.id);
      }
    } catch (err) {
      console.error('Remove watchlist error:', err);
    }
  };

  // 6. Provider Mode Handler
  const handleSetProviderMode = async (mode: ProviderMode) => {
    setProviderMode(mode);
    try {
      await fetch('/api/market/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      if (selectedTicker && currentUser) {
        triggerAnalysis(selectedTicker, currentUser.id, mode);
      }
    } catch (err) {
      console.error('Mode error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-200 font-sans antialiased flex flex-col">
      
      {/* Top Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedTicker={selectedTicker}
        onSelectTicker={(t) => {
          setSelectedTicker(t);
          triggerAnalysis(t);
        }}
        users={users}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        providerMode={providerMode}
        onSetProviderMode={handleSetProviderMode}
        isAnalyzing={isAnalyzing}
        onTriggerAnalysis={() => triggerAnalysis(selectedTicker)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
        
        {/* TAB 1: MARKET & AGENT ANALYSIS VIEW */}
        {activeTab === 'analysis' && analysisData && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Ticker Header & Sub-Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-[#0D1321] p-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-base shadow-xs">
                  {analysisData.ticker.slice(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold tracking-tight text-white">{analysisData.companyName}</h1>
                    <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-xs font-mono font-bold text-slate-300">
                      {analysisData.ticker}
                    </span>
                    <span className="text-xs font-medium text-slate-400">• Sector: {analysisData.sector}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                    <span>Current Price: <strong className="text-white font-mono">₹{analysisData.agents.technical.metrics.currentPrice.toFixed(2)}</strong></span>
                    <span className="text-emerald-400 font-bold">+₹{analysisData.agents.technical.metrics.change24h.toFixed(2)} (+1.30%)</span>
                    <span className="text-slate-500">• Telemetry: {new Date(analysisData.timestamp).toLocaleTimeString()} UTC</span>
                  </div>
                </div>
              </div>

              {/* Action Bar (What Changed? + SEBI Citations) */}
              <div className="flex items-center gap-2">
                <button
                  id="open_what_changed_btn"
                  onClick={() => setIsHistoricalDiffOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all shadow-xs"
                >
                  <History className="h-3.5 w-3.5" />
                  <span>What Changed? (vs Baseline)</span>
                </button>

                <button
                  id="open_evidence_drawer_btn"
                  onClick={() => {
                    setSelectedEvidenceId(null);
                    setIsEvidenceModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-xs"
                >
                  <FileText className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Verified Citations ({analysisData.evidenceCoverage.supportedClaimsCount})</span>
                </button>
              </div>
            </div>

            {/* DUAL HERO CARDS (STRICT SEPARATION: OBJECTIVE VS PERSONALIZED) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Card A: Objective Market Intelligence */}
              <ObjectiveHeroCard
                objective={analysisData.objective}
                companyName={analysisData.companyName}
                ticker={analysisData.ticker}
              />

              {/* Card B: Personalized Investor Suitability */}
              <PersonalizedHeroCard
                personalized={analysisData.personalized}
                user={currentUser}
                ticker={analysisData.ticker}
              />

            </div>

            {/* CROSS-AGENT CONSENSUS & CONFLICT BAROMETER */}
            <ConsensusBarometer
              consensus={analysisData.consensus}
              conflicts={analysisData.conflicts}
              confidence={analysisData.confidenceBreakdown}
              agents={analysisData.agents}
            />

            {/* 5 AUTONOMOUS RESEARCH AGENTS DEEP-DIVE */}
            <AgentDeepDive
              agents={analysisData.agents}
              priceHistory={priceHistory}
              onOpenEvidence={(evId) => {
                setSelectedEvidenceId(evId);
                setIsEvidenceModalOpen(true);
              }}
              onOpenAllEvidence={() => {
                setSelectedEvidenceId(null);
                setIsEvidenceModalOpen(true);
              }}
            />

          </div>
        )}

        {/* TAB 2: PORTFOLIO & WHAT-IF SIMULATOR */}
        {activeTab === 'portfolio' && (
          <PortfolioView
            holdings={holdings}
            user={currentUser}
            health={health}
            onAnalyzeTicker={(t) => {
              setSelectedTicker(t);
              setActiveTab('analysis');
              triggerAnalysis(t);
            }}
          />
        )}

        {/* TAB 3: WATCHLIST VIEW */}
        {activeTab === 'watchlist' && (
          <WatchlistView
            watchlist={watchlist}
            onAnalyzeTicker={(t) => {
              setSelectedTicker(t);
              setActiveTab('analysis');
              triggerAnalysis(t);
            }}
            onAddTicker={handleAddToWatchlist}
            onRemoveTicker={handleRemoveFromWatchlist}
          />
        )}

        {/* TAB 4: RESEARCH HISTORY */}
        {activeTab === 'history' && currentUser && (
          <HistoryView userId={currentUser.id} />
        )}

        {/* TAB 5: INVESTOR PROFILE */}
        {activeTab === 'profile' && currentUser && (
          <ProfileView userId={currentUser.id} />
        )}

        {/* TAB 6: DIAGNOSTICS & AUDIT STUDIO */}
        {activeTab === 'diagnostics' && (
          <DiagnosticsView
            providerMode={providerMode}
            onSetProviderMode={handleSetProviderMode}
          />
        )}

      </main>

      {/* MODAL: Verified SEBI Filing & Transcript Evidence Drawer */}
      <EvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        evidenceList={analysisData?.allEvidence || []}
        selectedEvidenceId={selectedEvidenceId}
      />

      {/* MODAL: What Changed? Historical Delta Comparison */}
      <HistoricalDiffModal
        isOpen={isHistoricalDiffOpen}
        onClose={() => setIsHistoricalDiffOpen(false)}
        comparison={historicalDiff}
        ticker={selectedTicker}
      />

      {/* Global Footer with High-Density Telemetry */}
      <footer className="h-10 border-t border-slate-800 bg-[#0B0F1A] px-6 flex items-center justify-between text-[10px] font-mono text-slate-500 mt-auto">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">AGENT_ORCHESTRATOR:</span>
            <span className="text-emerald-400 font-bold">ACTIVE (5 CONCURRENT)</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-indigo-400">
            <span>TECH (318ms)</span>
            <span>•</span>
            <span>FUND (412ms)</span>
            <span>•</span>
            <span>SENT (198ms)</span>
            <span>•</span>
            <span>RISK (254ms)</span>
            <span>•</span>
            <span>SECTOR (280ms)</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">DOCS: FY2026_Q1 SEBI LODR</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">INVARIANTS: ENFORCED</span>
        </div>
      </footer>

    </div>
  );
}
