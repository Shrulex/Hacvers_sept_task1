const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioView.tsx', 'utf8');

// 1. Add icons: RefreshCw (rebalance), Grid (heatmap)
if (!code.includes('RefreshCw')) {
  code = code.replace("Activity\n}", "Activity,\n  RefreshCw,\n  Grid,\n  Bot\n}");
}

// 2. Generate Deterministic Correlation Matrix
const correlationInsert = `
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
      plan.push({ action: 'SELL', qty: sharesToSell, ticker: h.ticker, reason: \`Exceeds \${user.maxSingleStockLimitPercent}% single-stock limit.\` });
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
`;

code = code.replace(
  "const [isSimulating, setIsSimulating] = useState(false);",
  "const [isSimulating, setIsSimulating] = useState(false);\n" + correlationInsert
);

// 3. Add UI Sections before What-If simulator
const uiInsert = `
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
                  <span className={\`text-[10px] font-bold font-mono px-2 py-1 rounded \${step.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}\`}>
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
                        <td key={t2} className={\`p-2 border border-slate-800 \${bgColor} \${textColor}\`}>
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
`;

code = code.replace(
  "{/* INTERACTIVE WHAT-IF PORTFOLIO SIMULATOR */}",
  uiInsert + "\n      {/* INTERACTIVE WHAT-IF PORTFOLIO SIMULATOR */}"
);

fs.writeFileSync('src/components/PortfolioView.tsx', code);
