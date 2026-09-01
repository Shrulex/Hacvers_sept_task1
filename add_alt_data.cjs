const fs = require('fs');
let code = fs.readFileSync('src/components/AgentDeepDive.tsx', 'utf8');

if (!code.includes('Alt Data')) {
  // Add Eye icon for Alt data
  code = code.replace("Users,", "Users,\n  Eye,");

  // Add the tab
  code = code.replace(
    "{ id: 'sector', icon: Users, label: 'Sector & Peer' }",
    "{ id: 'sector', icon: Users, label: 'Sector & Peer' },\n    { id: 'altdata', icon: Eye, label: 'Alt Data (Flow)' }"
  );

  const altDataContent = `
        {activeTab === 'altdata' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400">
                <Eye className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Alternative Data & Insider Flow</h3>
                <p className="text-xs text-slate-400">Institutional accumulation and C-Suite trading behavior</p>
              </div>
              <span className="ml-auto rounded bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-fuchsia-300 border border-fuchsia-500/30">
                PILOT MODE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-700/50 bg-[#161F32]/50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-700/50 pb-2">Insider Buying (90 Days)</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono text-slate-300">CEO Open Market Buys</span>
                  <span className="text-xs font-bold text-emerald-400">₹4.2 Cr</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono text-slate-300">CFO Open Market Sales</span>
                  <span className="text-xs font-bold text-rose-400">₹0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-300">Net Insider Sentiment</span>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Bullish</span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-700/50 bg-[#161F32]/50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-700/50 pb-2">Hedge Fund Flow</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono text-slate-300">13F Institutional Additions</span>
                  <span className="text-xs font-bold text-emerald-400">+12 Funds</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono text-slate-300">13F Institutional Exits</span>
                  <span className="text-xs font-bold text-rose-400">-3 Funds</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-300">Net Capital Flow (MoM)</span>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">+18.5%</span>
                </div>
              </div>
            </div>

            <div className="rounded border border-fuchsia-500/20 bg-fuchsia-500/5 p-3">
              <p className="text-[11px] text-fuchsia-300/80 leading-relaxed font-mono">
                &gt; ALT_DATA_SIGNAL: POSITIVE. High conviction indicated by simultaneous C-suite accumulation and positive net institutional inflows over the trailing quarter.
              </p>
            </div>
          </div>
        )}
`;

  code = code.replace(
    "{/* Tab Content */}",
    "{/* Tab Content */}\n" + altDataContent
  );

  fs.writeFileSync('src/components/AgentDeepDive.tsx', code);
}
