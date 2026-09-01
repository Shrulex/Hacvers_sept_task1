const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioView.tsx', 'utf8');

// 1. Add Icons
code = code.replace(
    "DollarSign",
    "DollarSign,\n  Activity"
);

// 2. Add State
const stateInsert = `
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
`;
code = code.replace(
    "const handleRunSimulation = async () => {",
    stateInsert + "\n  const handleRunSimulation = async () => {"
);

// 3. Add UI Section
const uiInsert = `
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
                   <span className={\`text-[11px] font-bold font-mono px-2 py-0.5 rounded border \${stressResult.drawdownPct >= 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}\`}>
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
                          <span className={\`text-xs font-mono font-bold \${shock.shockPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}\`}>
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
`;
code = code.replace(
    "    </div>\n  );\n};",
    uiInsert + "\n    </div>\n  );\n};"
);

fs.writeFileSync('src/components/PortfolioView.tsx', code);
