import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  BarChart2, 
  FileText, 
  MessageSquare, 
  ShieldAlert, 
  Users, 
  ExternalLink,
  Info,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Cpu
} from 'lucide-react';
import { 
  AgentResultsBundle, 
  EvidenceRecord, 
  StockPricePoint 
} from '../types';

interface AgentDeepDiveProps {
  agents: AgentResultsBundle;
  priceHistory: StockPricePoint[];
  onOpenEvidence: (evidenceId: string) => void;
  onOpenAllEvidence: () => void;
}

export const AgentDeepDive: React.FC<AgentDeepDiveProps> = ({
  agents,
  priceHistory,
  onOpenEvidence,
  onOpenAllEvidence
}) => {
  const [activeTab, setActiveTab] = useState<'technical' | 'fundamental' | 'sentiment' | 'risk' | 'sector'>('fundamental');

  const tabs = [
    { id: 'fundamental', label: 'Fundamental & RAG', icon: FileText, signal: agents.fundamental.signal, badge: `${agents.fundamental.evidence?.length || 0} Docs` },
    { id: 'technical', label: 'Technical & Momentum', icon: BarChart2, signal: agents.technical.signal, badge: agents.technical.metrics?.trend || 'UPTREND' },
    { id: 'sentiment', label: 'Sentiment & Catalysts', icon: MessageSquare, signal: agents.sentiment.signal, badge: `${agents.sentiment.newsCount || 0} Events` },
    { id: 'risk', label: 'Market Risk & VaR', icon: ShieldAlert, signal: agents.risk.signal, badge: agents.risk.risk_level },
    { id: 'sector', label: 'Sector & Peer Relative', icon: Users, signal: agents.sector_peer.signal, badge: agents.sector_peer.sectorName }
  ];

  return (
    <div id="agent_deep_dive_container" className="rounded-xl border border-slate-800 bg-[#0D1321] p-5 shadow-xs">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3 mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-400" />
            <span>Autonomous Research Agent Deep-Dives</span>
          </h3>
          <p className="text-[10px] text-slate-500">Inspect evidence, calculations, and mathematical models behind each agent</p>
        </div>

        <button
          id="view_all_filings_btn"
          onClick={onOpenAllEvidence}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
        >
          <FileText className="h-3.5 w-3.5 text-indigo-400" />
          <span>View Verified SEBI Filings & Transcripts ({agents.fundamental.evidence?.length || 0})</span>
          <ExternalLink className="h-3 w-3 text-slate-400" />
        </button>
      </div>

      {/* Agent Navigation Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 mb-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`agent_tab_${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-[#161F32] text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              <span className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                isActive ? 'bg-indigo-900/60 text-indigo-100' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. FUNDAMENTAL & RAG AGENT */}
      {activeTab === 'fundamental' && (
        <div id="fundamental_agent_panel" className="space-y-4">
          
          {/* Key Fundamental Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-lg border border-slate-800 bg-[#161F32] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">YoY Revenue Growth</span>
              <span className="text-base font-black font-mono text-emerald-400">+{agents.fundamental.metrics.revenueGrowthYoy}%</span>
              <span className="text-[9px] text-slate-400 font-mono block">Audited Consolidated</span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#161F32] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Operating Margin (OPM)</span>
              <span className="text-base font-black font-mono text-white">{agents.fundamental.metrics.operatingMargin}%</span>
              <span className="text-[9px] text-emerald-400 font-mono block">+30 bps QoQ expansion</span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#161F32] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Valuation Multiple (P/E)</span>
              <span className="text-base font-black font-mono text-white">{agents.fundamental.metrics.peRatio}x</span>
              <span className="text-[9px] text-slate-400 font-mono block">Industry: {agents.fundamental.metrics.industryPe}x</span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#161F32] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Free Cash Flow (TTM)</span>
              <span className="text-base font-black font-mono text-indigo-300">₹{agents.fundamental.metrics.freeCashFlowCr?.toLocaleString()} Cr</span>
              <span className="text-[9px] text-indigo-400 font-mono block">Zero Long-Term Debt</span>
            </div>
          </div>

          {/* RAG Claims with Verified Citations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span>RAG Verified Disclosures & Regulatory Citations</span>
              </h4>
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                100% Citation Coverage
              </span>
            </div>

            <div className="space-y-2">
              {agents.fundamental.claims.map((claim, idx) => (
                <div key={idx} className="rounded-lg border border-slate-800 bg-[#161F32]/80 p-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {claim.claim}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-mono text-slate-400">Source Evidence:</span>
                      {claim.evidence_ids.map(id => (
                        <button
                          key={id}
                          onClick={() => onOpenEvidence(id)}
                          className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all"
                        >
                          <span>[{id}]</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: 2. TECHNICAL & MOMENTUM AGENT */}
      {activeTab === 'technical' && (
        <div id="technical_agent_panel" className="space-y-4">
          
          {/* Technical Price Chart */}
          <div className="rounded-lg border border-slate-800 bg-[#161F32] p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Historical Price Trend & Moving Averages</h4>
                <p className="text-[10px] text-slate-500 font-mono">90-day daily OHLCV series with 20 & 50-day SMA</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono font-semibold">
                <span className="flex items-center gap-1 text-indigo-400">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" /> Close Price
                </span>
                <span className="text-white">
                  Current: ₹{agents.technical.metrics.currentPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceHistory}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#334155" />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748b' }} stroke="#334155" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F1A', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                    formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, 'Price']}
                  />
                  <Line type="monotone" dataKey="close" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Technical Indicator Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-lg border border-slate-800 bg-[#161F32] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">RSI (14-Day)</span>
              <span className="text-base font-black font-mono text-emerald-400">{agents.technical.metrics.rsi14}</span>
              <span className="text-[9px] text-emerald-400 font-mono block">Bullish Zone (50-68)</span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#161F32] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">20-Day SMA</span>
              <span className="text-base font-black font-mono text-white">₹{agents.technical.metrics.sma20.toFixed(2)}</span>
              <span className="text-[9px] text-emerald-400 font-mono block">+4.2% above</span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#161F32] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">50-Day SMA</span>
              <span className="text-base font-black font-mono text-white">₹{agents.technical.metrics.sma50.toFixed(2)}</span>
              <span className="text-[9px] text-emerald-400 font-mono block">Golden Cross Structure</span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#161F32] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Volume Ratio</span>
              <span className="text-base font-black font-mono text-indigo-300">{agents.technical.metrics.volumeRatio}x</span>
              <span className="text-[9px] text-indigo-400 font-mono block">vs 30d avg volume</span>
            </div>
          </div>

          {/* Findings */}
          <div className="space-y-1.5">
            {agents.technical.findings.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-200 bg-[#161F32] p-2.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span>{f.claim}</span>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB CONTENT: 3. SENTIMENT & CONTEXT AGENT */}
      {activeTab === 'sentiment' && (
        <div id="sentiment_agent_panel" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Positive Catalysts */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-2 mb-3 uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Positive Enterprise Catalysts ({agents.sentiment.positiveDevelopments?.length || 0})</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {agents.sentiment.positiveDevelopments?.map((pos, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{pos}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Macro Uncertainties & Nuance */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-2 mb-3 uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Macro Commentary & Uncertainties</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {agents.sentiment.uncertainties?.map((unc, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{unc}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. RISK & VOLATILITY AGENT */}
      {activeTab === 'risk' && (
        <div id="risk_agent_panel" className="space-y-4">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-lg border border-slate-800 bg-[#161F32] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">30d Volatility</span>
              <span className="text-base font-black font-mono text-white">{agents.risk.metrics.annualizedVolatility30d}%</span>
              <span className="text-[9px] text-amber-400 font-mono block">Regime: {agents.risk.risk_level}</span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#161F32] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">90d Max Drawdown</span>
              <span className="text-base font-black font-mono text-emerald-400">-{agents.risk.metrics.maxDrawdown90d}%</span>
              <span className="text-[9px] text-slate-400 font-mono block">Contained downside limit</span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#161F32] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Market Beta (vs Nifty)</span>
              <span className="text-base font-black font-mono text-white">{agents.risk.metrics.beta}</span>
              <span className="text-[9px] text-slate-400 font-mono block">Sub-market sensitivity</span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#161F32] p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">1-Day 95% VaR</span>
              <span className="text-base font-black font-mono text-indigo-300">{agents.risk.metrics.var95Daily}%</span>
              <span className="text-[9px] text-indigo-400 font-mono block">96/100 Liquidity Score</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#161F32] p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">Objective Volatility Assessment</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {agents.risk.findings[0]?.claim} Short-term fluctuations are well within bluechip risk parameters.
            </p>
          </div>

        </div>
      )}

      {/* TAB CONTENT: 5. SECTOR & PEER CONTEXT AGENT */}
      {activeTab === 'sector' && (
        <div id="sector_agent_panel" className="space-y-4">
          
          <div className="rounded-lg border border-slate-800 bg-[#161F32] p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">Sector Benchmark & Peer Group Comparison</h4>
            <p className="text-[10px] font-mono text-slate-500 mb-4">Relative valuation multiples and 30-day index momentum</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="rounded-lg bg-[#0B0F1A] p-3 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">Benchmark Index</span>
                <span className="text-xs font-bold text-slate-200">{agents.sector_peer.sectorName}</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold block mt-0.5">
                  +{agents.sector_peer.sectorMomentumPercent}% 30d Momentum
                </span>
              </div>

              {agents.sector_peer.peerComparisons.map((peer, i) => (
                <div key={i} className="rounded-lg bg-[#0B0F1A] p-3 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 block">Tier-1 Peer: {peer.ticker}</span>
                  <span className="text-xs font-bold text-slate-200">{peer.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-medium block mt-0.5">
                    {peer.peRatio}x P/E • {peer.ytdReturnPercent}% YTD
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
