import React, { useState } from 'react';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  ExternalLink,
  Search,
  CheckCircle2
} from 'lucide-react';
import { WatchlistItem } from '../types';

interface WatchlistViewProps {
  watchlist: WatchlistItem[];
  onAnalyzeTicker: (ticker: string) => void;
  onAddTicker: (ticker: string) => void;
  onRemoveTicker: (ticker: string) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlist,
  onAnalyzeTicker,
  onAddTicker,
  onRemoveTicker
}) => {
  const [newTicker, setNewTicker] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTicker.trim()) {
      onAddTicker(newTicker.trim().toUpperCase());
      setNewTicker('');
    }
  };

  return (
    <div id="watchlist_view_container" className="space-y-4">
      
      {/* Header & Add Form */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-[#0D1321] p-5 shadow-xs">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-indigo-400" />
            <span>Target Watchlist & Monitored Equities</span>
          </h3>
          <p className="text-[10px] text-slate-500">Autonomous signal monitoring across your saved equity universe</p>
        </div>

        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            id="add_watchlist_input"
            type="text"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            placeholder="Add Ticker (e.g. INFY, TCS)"
            className="h-8 w-44 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-mono font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            id="add_watchlist_submit_btn"
            className="flex h-8 items-center gap-1 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Watchlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {watchlist.map((item) => (
          <div
            key={item.id}
            id={`watchlist_card_${item.ticker}`}
            className="rounded-xl border border-slate-800 bg-[#0D1321] p-4 shadow-xs flex flex-col justify-between hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-sm font-black font-mono text-white block">{item.ticker}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{item.companyName}</span>
                </div>
                <button
                  onClick={() => onRemoveTicker(item.ticker)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  title="Remove from watchlist"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-baseline justify-between border-b border-slate-800/80 pb-2.5 mb-2.5">
                <div>
                  <span className="text-base font-bold font-mono text-white">₹{item.currentPrice.toFixed(2)}</span>
                  <span className={`text-xs font-mono font-semibold ml-2 ${
                    item.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {item.change24h >= 0 ? '+' : ''}₹{item.change24h.toFixed(2)}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{item.sector}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono mb-3">
                <span className="text-[10px] text-slate-400 uppercase">Agent Signal:</span>
                <span className="font-bold text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {item.lastSignal || 'BULLISH'} ({item.lastScore || 78}%)
                </span>
              </div>
            </div>

            <button
              onClick={() => onAnalyzeTicker(item.ticker)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-xs"
            >
              <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Launch Multi-Agent Synthesis</span>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
