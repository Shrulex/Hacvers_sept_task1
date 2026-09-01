import React, { useState } from 'react';
import { 
  ShieldCheck, 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  Calculator, 
  Sliders, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';
import { 
  PortfolioHolding, 
  UserProfile, 
  PortfolioHealthScore, 
  WhatIfResult 
} from '../types';

interface PortfolioViewProps {
  holdings: PortfolioHolding[];
  user: UserProfile | null;
  health: PortfolioHealthScore | null;
  onAnalyzeTicker: (ticker: string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  holdings,
  user,
  health,
  onAnalyzeTicker
}) => {
  const [whatIfTicker, setWhatIfTicker] = useState('INFY');
  const [whatIfAmount, setWhatIfAmount] = useState(50000);
  const [whatIfResult, setWhatIfResult] = useState<WhatIfResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnl = holdings.reduce((sum, h) => sum + h.unrealizedPnl, 0);
  const totalPnlPercent = totalValue > 0 ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;

  // Run What-If Simulation
  const handleRunSimulation = async () => {
    if (!user) return;
    setIsSimulating(true);
    try {
      const res = await fetch('/api/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ticker: whatIfTicker,
          amount: whatIfAmount,
          currentSuitability: 64
        })
      });
      if (res.ok) {
        const data = await res.json();
        setWhatIfResult(data);
      }
    } catch (err) {
      console.error('What-if error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div id="portfolio_view_container" className="space-y-4">
      
      {/* Portfolio Overview & Health Score Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Total Capital Card */}
        <div className="rounded-xl border border-slate-800 bg-[#0D1321] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Portfolio Value</span>
            <div className="text-2xl font-black font-mono tracking-tight text-white mt-1">
              ₹{totalValue.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-bold ${
                totalPnl >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                <TrendingUp className="h-3 w-3" />
                {totalPnl >= 0 ? '+' : ''}₹{Math.round(totalPnl).toLocaleString()} ({totalPnlPercent.toFixed(2)}%)
              </span>
              <span className="text-[10px] font-mono text-slate-500">Unrealized P&L</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Investor: <strong className="text-white">{user?.name}</strong></span>
            <span className="rounded bg-slate-800 px-2 py-0.5 font-semibold text-slate-300 border border-slate-700">{user?.riskTolerance}</span>
          </div>
        </div>

        {/* Portfolio Health Score (4 Pillars) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0D1321] p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Portfolio Health Score</h3>
                <p className="text-[10px] text-slate-500">4-Pillar Diversification, Sector & Risk Equilibrium Model</p>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">{health?.overallScore || 74}</span>
              <span className="text-xs font-mono text-slate-500">/ 100</span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                {health?.grade || 'Good'}
              </span>
            </div>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
            <div className="rounded-lg bg-[#161F32] p-2.5 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Diversification</span>
              <span className="text-base font-black font-mono text-white">{health?.components.diversification}%</span>
              <span className="text-[9px] text-slate-400 font-mono block">Weight: 30%</span>
            </div>
            <div className="rounded-lg bg-[#161F32] p-2.5 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sector Balance</span>
              <span className="text-base font-black font-mono text-white">{health?.components.sectorBalance}%</span>
              <span className="text-[9px] text-slate-400 font-mono block">Weight: 30%</span>
            </div>
            <div className="rounded-lg bg-[#161F32] p-2.5 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Position Balance</span>
              <span className="text-base font-black font-mono text-white">{health?.components.positionBalance}%</span>
              <span className="text-[9px] text-slate-400 font-mono block">Weight: 20%</span>
            </div>
            <div className="rounded-lg bg-[#161F32] p-2.5 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Risk Alignment</span>
              <span className="text-base font-black font-mono text-white">{health?.components.riskAlignment}%</span>
              <span className="text-[9px] text-slate-400 font-mono block">Weight: 20%</span>
            </div>
          </div>

          {/* Recommendation */}
          <p className="text-xs text-slate-300 bg-[#161F32] p-2.5 rounded-lg border border-slate-800">
            <strong className="text-indigo-400">Actionable Insight:</strong> {health?.recommendations[0]}
          </p>
        </div>

      </div>

      {/* Sector Concentration Overview */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1321] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Sector Allocation vs Declared Preferred Max Limit</h3>
            <p className="text-[10px] text-slate-500 font-mono">Preferred maximum sector concentration ceiling: {user?.preferredSectorLimitPercent}%</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {health?.sectorConcentration && Object.entries(health.sectorConcentration).map(([sec, pctVal]) => {
            const pct = Number(pctVal);
            const isOverweight = pct > (user?.preferredSectorLimitPercent || 30);
            return (
              <div key={sec} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">{sec}</span>
                  <span className={isOverweight ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                    {pct.toFixed(1)}% {isOverweight && `(Exceeds ${user?.preferredSectorLimitPercent}% limit)`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-900 overflow-hidden relative border border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      isOverweight ? 'bg-rose-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                  {/* Preferred Limit Marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                    style={{ left: `${user?.preferredSectorLimitPercent || 30}%` }}
                    title={`Preferred Max: ${user?.preferredSectorLimitPercent}%`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Holdings Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1321] p-5 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Active Portfolio Holdings ({holdings.length})</h3>
          <span className="text-[10px] font-mono text-slate-500">Click any holding to run multi-agent analysis</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-[#161F32] text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Avg Buy Price</th>
                <th className="py-2.5 px-3 text-right">Current Price</th>
                <th className="py-2.5 px-3 text-right">Current Value</th>
                <th className="py-2.5 px-3 text-right">Weight</th>
                <th className="py-2.5 px-3 text-right">P&L</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {holdings.map((h) => (
                <tr key={h.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-white block">{h.ticker}</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">{h.companyName}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{h.sector}</td>
                  <td className="py-2.5 px-3 text-right text-slate-200">{h.quantity}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">₹{h.avgBuyPrice.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-white">₹{h.currentPrice.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-white">₹{Math.round(h.currentValue).toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{h.allocationPercentage.toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`font-bold ${h.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {h.unrealizedPnl >= 0 ? '+' : ''}{h.unrealizedPnlPercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onAnalyzeTicker(h.ticker)}
                      className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2 py-1 text-[10px] font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all"
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INTERACTIVE WHAT-IF PORTFOLIO SIMULATOR */}
      <div id="what_if_simulator_section" className="rounded-xl border border-slate-800 bg-[#0D1321] p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Calculator className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Interactive What-If Portfolio Projection Simulator</h3>
              <p className="text-[10px] text-slate-500">Model hypothetical capital allocations without mutating actual holdings</p>
            </div>
          </div>

          <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[9px] font-mono font-bold text-indigo-300 border border-indigo-500/30">
            Pure Projection Sandbox
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Target Asset</label>
            <select
              id="whatif_ticker_select"
              value={whatIfTicker}
              onChange={(e) => setWhatIfTicker(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-mono font-semibold text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="INFY">INFY (Infosys Ltd - Technology)</option>
              <option value="TCS">TCS (Tata Consultancy Services - Technology)</option>
              <option value="HDFCBANK">HDFCBANK (HDFC Bank - Financials)</option>
              <option value="RELIANCE">RELIANCE (Reliance Ind - Energy)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Hypothetical Investment (₹)</label>
            <input
              id="whatif_amount_input"
              type="number"
              step="10000"
              value={whatIfAmount}
              onChange={(e) => setWhatIfAmount(Number(e.target.value))}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-mono font-semibold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              id="run_whatif_btn"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isSimulating ? 'Simulating...' : 'Simulate Portfolio Impact'}</span>
            </button>
          </div>
        </div>

        {/* Projection Results */}
        {whatIfResult && (
          <div className="rounded-lg border border-slate-800 bg-[#161F32] p-4 space-y-3 animate-in fade-in duration-200">
            <h4 className="text-xs font-bold text-white font-mono">
              Projected Outcomes for Hypothetical ₹{whatIfAmount.toLocaleString()} in {whatIfTicker}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded bg-[#0B0F1A] p-2.5 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Projected Portfolio</span>
                <span className="text-sm font-bold font-mono text-white">₹{whatIfResult.projectedPortfolioValue.toLocaleString()}</span>
                <span className="text-[9px] text-emerald-400 font-mono block">+₹{whatIfAmount.toLocaleString()} capital</span>
              </div>

              <div className="rounded bg-[#0B0F1A] p-2.5 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Projected {whatIfResult.sector}</span>
                <span className={`text-sm font-bold font-mono ${
                  whatIfResult.projectedSectorExposurePercent > whatIfResult.preferredSectorLimitPercent ? 'text-rose-400' : 'text-white'
                }`}>
                  {whatIfResult.currentSectorExposurePercent}% → {whatIfResult.projectedSectorExposurePercent}%
                </span>
                <span className="text-[9px] text-slate-400 font-mono block">Limit: {whatIfResult.preferredSectorLimitPercent}%</span>
              </div>

              <div className="rounded bg-[#0B0F1A] p-2.5 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Projected Health</span>
                <span className="text-sm font-bold font-mono text-white">
                  {whatIfResult.currentPortfolioHealth} → {whatIfResult.projectedPortfolioHealth}
                </span>
                <span className="text-[9px] text-slate-400 font-mono block">Health score delta</span>
              </div>

              <div className="rounded bg-[#0B0F1A] p-2.5 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Projected Suitability</span>
                <span className="text-sm font-bold font-mono text-white">
                  {whatIfResult.currentSuitabilityScore}% → {whatIfResult.projectedSuitabilityScore}%
                </span>
                <span className="text-[9px] text-slate-400 font-mono block">Personalized rating</span>
              </div>
            </div>

            {/* Warnings or Safe Advice */}
            {whatIfResult.warnings.length > 0 ? (
              <div className="rounded bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-200">Concentration Guardrail Triggered:</strong> {whatIfResult.warnings[0]}
                </div>
              </div>
            ) : (
              <div className="rounded bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{whatIfResult.recommendation}</span>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
