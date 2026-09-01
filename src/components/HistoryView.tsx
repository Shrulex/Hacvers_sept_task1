import React, { useState, useEffect } from 'react';
import { History, TrendingUp, AlertTriangle, ShieldCheck, Target, ArrowRight } from 'lucide-react';

interface HistoryRecord {
  id: string;
  userId: string;
  ticker: string;
  companyName: string;
  timestamp: string;
  objectiveScore: number;
  suitabilityScore: number;
  confidence: number;
  consensusPercentage: number;
}

interface HistoryViewProps {
  userId: string;
}

export function HistoryView({ userId }: HistoryViewProps) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      try {
        const res = await fetch(`/api/history?userId=${userId}`);
        const data = await res.json();
        setHistory(data.history || []);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500 mx-auto mb-4"></div>
          <p className="text-xs font-mono text-slate-400">Loading research history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-800 bg-[#0D1321] p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <History className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Research History</h3>
              <p className="text-[10px] text-slate-500">Persisted objective intelligence and personalized suitability sessions</p>
            </div>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            No past research sessions found for this profile.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((session) => (
              <div key={session.id} className="rounded-lg border border-slate-800 bg-[#161F32] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all">
                
                {/* Left: Ticker & Time */}
                <div className="flex flex-col gap-1 w-48">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black font-mono text-white">{session.ticker}</span>
                    <span className="text-[10px] text-slate-400 font-medium truncate">{session.companyName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(session.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap items-center gap-6 flex-1 justify-center md:justify-start">
                  
                  {/* Objective Score */}
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase">
                      <Target className="h-3 w-3" />
                      <span>Objective</span>
                    </div>
                    <span className="text-lg font-bold font-mono text-white">{session.objectiveScore}%</span>
                  </div>

                  {/* Consensus */}
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase">
                      <TrendingUp className="h-3 w-3" />
                      <span>Consensus</span>
                    </div>
                    <span className="text-lg font-bold font-mono text-white">{session.consensusPercentage}%</span>
                  </div>
                  
                  {/* Confidence */}
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Confidence</span>
                    </div>
                    <span className="text-lg font-bold font-mono text-emerald-400">{Math.round(session.confidence * 100)}%</span>
                  </div>

                </div>

                {/* Right: Suitability */}
                <div className="flex flex-col items-end gap-1 w-40">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Personal Suitability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-mono text-indigo-400">{session.suitabilityScore}%</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
