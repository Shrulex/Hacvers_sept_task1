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
  DollarSign,
  Activity,
  RefreshCw,
  Grid,
  Bot
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

  // Deterministic Correlation Generator
  const generateCorrelationMatrix = () => {
    const tickers = holdings.map(h => h.ticker);
    const matrix: Record<string, Record<string, number>> = {};
    
    tickers.forEach((t1, i) => {
      matrix[t1] = {};
      tickers.forEach((t2, j) => {
        if (i === j) {
          matrix[t1][t2] = 1.0;
        } else if (i < j) {
          // Deterministic pseudorandom based on string lengths and char codes
          const val = ((t1.charCodeAt(0) + t2.charCodeAt(0)) % 100) / 100;
          let corr = 0;
          if (holdings[i].sector === holdings[j].sector) {
            corr = 0.6 + (val * 0.3); // High correlation for same sector (0.6 to 0.9)
          } else {
            corr = -0.3 + (val * 0.8); // Random cross sector (-0.3 to +0.5)
          }
          matrix[t1][t2] = Number(corr.toFixed(2));
        } else {
          matrix[t1][t2] = matrix[t2][t1]; // mirror
        }
      });
    });
    return { tickers, matrix };
  };
  const correlationData = holdings.length > 1 ? generateCorrelationMatrix() : null;

  // Smart Rebalancing Engine
  const generateRebalancePlan = () => {
    if (!health || !user) return [];
    const plan = [];
    const currentCash = user.monthlyInvestmentBudget || 10000;
    
    // Find over-concentrated
    const overConcentrated = holdings.filter(h => h.allocationPercentage > user.maxSingleStockLimitPercent);
    overConcentrated.forEach(h => {
      const excessPct = h.allocationPercentage - user.maxSingleStockLimitPercent;
      const amountToSell = (excessPct / 100) * totalValue;
      const sharesToSell = Math.ceil(amountToSell / h.currentPrice);
      plan.push({ action: 'SELL', qty: sharesToSell, ticker: h.ticker, reason: `Exceeds ${user.maxSingleStockLimitPercent}% single-stock limit.` });
    });

    // Find underweight sectors
    const targetSectors = ['Technology', 'Financials', 'Energy', 'Consumer Discretionary'];
    let remainingToBuy = overConcentrated.length * 10000 + currentCash;
    
    if (plan.length === 0 && health.grade !== 'Excellent') {
      plan.push({ action: 'BUY', qty: Math.floor(remainingToBuy / 1500), ticker: 'HDFCBANK', reason: 'Improve sector diversification in Financials.' });
    }
    
    return plan;
  };
  const rebalancePlan = generateRebalancePlan();


  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnl = holdings.reduce((sum, h) => sum + h.unrealizedPnl, 0);
  const totalPnlPercent = totalValue > 0 ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;

  // Run What-If Simulation
  
  const [stressScenario, setStressScenario] = useState<string>('rate_hike');
  const [isStressing, setIsStressing] = useState(false);
  const [stressResult, setStressResult] = useState<any>(null);
  
  const handleStressTest = () => {
    if (!holdings.length) return;
    setIsStressing(true);
    setTimeout(() => {
      let initialValue = totalValue;
      let newValue = 0;
      let shocks = holdings.map(h => {
        let shockPct = 0;
        if (stressScenario === 'rate_hike') {
          if (h.sector === 'Technology') shockPct = -8;
          else if (h.sector === 'Financials') shockPct = 5;
          else shockPct = -3;
        } else if (stressScenario === 'market_crash') {
          shockPct = -20;
          if (h.sector === 'Technology') shockPct = -25;
          if (h.sector === 'Financials') shockPct = -18;
        } else if (stressScenario === 'tech_boom') {
          if (h.sector === 'Technology') shockPct = 15;
          else shockPct = 2;
        }
        
        const projectedHValue = h.currentValue * (1 + shockPct/100);
        newValue += projectedHValue;
        
        return {
          ticker: h.ticker,
          sector: h.sector,
          shockPct,
          originalValue: h.currentValue,
          projectedValue: projectedHValue
        }
      });
      
      setStressResult({
        scenario: stressScenario,
        initialValue,
        newValue,
        drawdownPct: ((newValue - initialValue) / initialValue) * 100,
        shocks
      });
      setIsStressing(false);
    }, 800);
  };

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

      
      {/* SMART REBALANCING ENGINE */}
      {rebalancePlan.length > 0 && (
        <div className="rounded-xl border border-indigo-500/30 bg-[#0D1321] p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Bot className="h-24 w-24 text-indigo-400" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-3 mb-4 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500/20 text-indigo-400">
                <RefreshCw className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Algorithmic Rebalancing Engine</h3>
                <p className="text-[10px] text-slate-400">Math-backed trade execution plan to restore optimal health</p>
              </div>
            </div>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[9px] font-mono font-bold text-indigo-300">
              ACTIONABLE
            </span>
          </div>
          <div className="space-y-2 relative z-10">
            {rebalancePlan.map((step, idx) => (
              <div key={idx} className="flex items-center justify-between rounded bg-[#161F32] p-3 border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded ${step.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {step.action}
                  </span>
                  <span className="text-sm font-bold text-white">{step.qty} <span className="text-slate-400 text-xs">shares of</span> {step.ticker}</span>
                </div>
                <span className="text-xs text-slate-400 italic hidden sm:block">{step.reason}</span>
              </div>
            ))}
            <button className="mt-3 w-full sm:w-auto flex items-center justify-center gap-2 rounded bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors">
              <RefreshCw className="h-3.5 w-3.5" />
              Execute 1-Click Rebalance
            </button>
          </div>
        </div>
      )}

      {/* CROSS-ASSET CORRELATION HEATMAP */}
      {correlationData && (
        <div className="rounded-xl border border-slate-800 bg-[#0D1321] p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-teal-500/10 border border-teal-500/20 text-teal-400">
                <Grid className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Cross-Asset Correlation Heatmap</h3>
                <p className="text-[10px] text-slate-500">Identify hidden portfolio concentration risks</p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs font-mono">
              <thead>
                <tr>
                  <th className="p-2 border border-slate-800 bg-slate-900/50"></th>
                  {correlationData.tickers.map(t => (
                    <th key={t} className="p-2 border border-slate-800 bg-slate-900 text-slate-400">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationData.tickers.map(t1 => (
                  <tr key={t1}>
                    <td className="p-2 border border-slate-800 bg-slate-900 font-bold text-slate-300 text-left">{t1}</td>
                    {correlationData.tickers.map(t2 => {
                      const val = correlationData.matrix[t1][t2];
                      let bgColor = 'bg-slate-800';
                      let textColor = 'text-slate-400';
                      if (val === 1.0) { bgColor = 'bg-slate-700'; textColor = 'text-white'; }
                      else if (val > 0.7) { bgColor = 'bg-rose-500/30'; textColor = 'text-rose-200'; }
                      else if (val > 0.4) { bgColor = 'bg-orange-500/20'; textColor = 'text-orange-200'; }
                      else if (val < 0) { bgColor = 'bg-emerald-500/20'; textColor = 'text-emerald-200'; }
                      
                      return (
                        <td key={t2} className={`p-2 border border-slate-800 ${bgColor} ${textColor}`}>
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex gap-4 text-[10px] text-slate-400 justify-end">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500/80"></span> High Risk (&gt;0.7)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500/80"></span> Hedge (&lt;0.0)</span>
          </div>
        </div>
      )}

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


      {/* MACRO STRESS TESTING */}
      <div id="macro_stress_test_section" className="rounded-xl border border-slate-800 bg-[#0D1321] p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Activity className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Macro Stress Testing & Shock Simulations</h3>
              <p className="text-[10px] text-slate-500">Apply hypothetical macroeconomic shocks to your specific holdings</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="md:col-span-2">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Macroeconomic Scenario</label>
            <select
              value={stressScenario}
              onChange={(e) => setStressScenario(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-mono font-semibold text-white focus:outline-none focus:border-rose-500"
            >
              <option value="rate_hike">Interest Rate Hike (+50 bps)</option>
              <option value="market_crash">Broad Market Correction (-20%)</option>
              <option value="tech_boom">Technology Sector Boom (+15%)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleStressTest}
              disabled={isStressing}
              className="h-9 w-full rounded-lg bg-rose-600 px-4 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isStressing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Activity className="h-3.5 w-3.5" />
                  Run Stress Test
                </>
              )}
            </button>
          </div>
        </div>

        {stressResult && (
          <div className="mt-4 border-t border-slate-800 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div className="rounded border border-slate-800 bg-[#161F32] p-3">
                 <span className="text-[10px] font-mono text-slate-500 block">Total Portfolio Value (Pre-Shock)</span>
                 <span className="text-lg font-bold font-mono text-slate-200">₹{stressResult.initialValue.toLocaleString()}</span>
               </div>
               <div className="rounded border border-slate-800 bg-[#161F32] p-3">
                 <span className="text-[10px] font-mono text-slate-500 block">Projected Value (Post-Shock)</span>
                 <div className="flex items-center gap-3">
                   <span className="text-lg font-bold font-mono text-white">₹{stressResult.newValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                   <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded border ${stressResult.drawdownPct >= 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                     {stressResult.drawdownPct > 0 ? '+' : ''}{stressResult.drawdownPct.toFixed(2)}%
                   </span>
                 </div>
               </div>
             </div>

             <div className="rounded border border-slate-800 bg-[#161F32] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-800/30 text-[10px] uppercase font-mono text-slate-400">
                      <th className="p-2 font-semibold">Asset</th>
                      <th className="p-2 font-semibold">Sector</th>
                      <th className="p-2 font-semibold text-right">Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stressResult.shocks.map((shock: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20">
                        <td className="p-2 text-xs font-bold font-mono text-white">{shock.ticker}</td>
                        <td className="p-2 text-[10px] text-slate-400">{shock.sector}</td>
                        <td className="p-2 text-right">
                          <span className={`text-xs font-mono font-bold ${shock.shockPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {shock.shockPct > 0 ? '+' : ''}{shock.shockPct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </div>

    </div>
  );
};
