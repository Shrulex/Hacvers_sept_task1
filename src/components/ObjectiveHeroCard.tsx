import React from 'react';
import { 
  Globe2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Info, 
  HelpCircle,
  TrendingUp,
  Percent,
  Layers
} from 'lucide-react';
import { ObjectiveMarketView } from '../types';

interface ObjectiveHeroCardProps {
  objective: ObjectiveMarketView;
  companyName: string;
  ticker: string;
  onOpenConfidenceModal?: () => void;
}

export const ObjectiveHeroCard: React.FC<ObjectiveHeroCardProps> = ({
  objective,
  companyName,
  ticker,
  onOpenConfidenceModal
}) => {
  const getSignalBadgeColor = (signal: string) => {
    switch (signal) {
      case 'BULLISH':
      case 'POSITIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono';
      case 'MILD_POSITIVE':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30 font-mono';
      case 'NEUTRAL':
      case 'MIXED':
        return 'bg-slate-800 text-slate-300 border-slate-700 font-mono';
      case 'MILD_NEGATIVE':
      case 'NEGATIVE':
      case 'BEARISH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-mono';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700 font-mono';
    }
  };

  return (
    <div id="objective_market_hero_card" className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0D1321] p-5 shadow-xs relative overflow-hidden">
      
      <div>
        {/* Header with Strict Separation Tag */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Globe2 className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Objective Market Intelligence</h2>
              <p className="text-[10px] text-slate-500">Independent Multi-Agent Consensus</p>
            </div>
          </div>

          <span className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-300">
            Profile-Independent
          </span>
        </div>

        {/* Hero Score & Signal Display */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Objective Signal</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getSignalBadgeColor(objective.signal)}`}>
                {objective.signal}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Consensus: <span className="font-bold text-emerald-400">{objective.consensusPercentage}%</span>
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Score</div>
            <div className="flex items-baseline justify-end gap-1 mt-0.5">
              <span className="text-3xl font-black font-mono tracking-tight text-emerald-400">{objective.score}</span>
              <span className="text-xs font-mono text-slate-500">/ 100</span>
            </div>
          </div>
        </div>

        {/* Confidence & Freshness Bar */}
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#161F32] p-3 mb-4 border border-slate-800">
          <div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Research Confidence</span>
              <HelpCircle className="h-3 w-3 text-slate-500 cursor-help" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 flex-1 rounded-full bg-slate-900 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${objective.confidence}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-white">{objective.confidence}%</span>
            </div>
          </div>

          <div className="border-l border-slate-800 pl-3">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <Clock className="h-3 w-3 text-slate-500" />
              <span>Data Freshness</span>
            </div>
            <div className="text-xs font-mono font-semibold text-slate-200 mt-1 truncate">
              {objective.dataFreshness.filingQuarter} • {objective.dataFreshness.providerMode}
            </div>
          </div>
        </div>

        {/* Top Market Drivers */}
        <div className="space-y-2 mb-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Key Objective Findings</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {objective.topReasons.slice(0, 3).map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="h-1 w-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Identified Objective Market Risks */}
        {objective.identifiedRisks.length > 0 && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 mb-2">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              <span>Objective Market Risks</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {objective.identifiedRisks[0]}
            </p>
          </div>
        )}
      </div>

      {/* Strict Invariant Disclaimer Footer */}
      <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500 leading-normal font-mono">
        <span className="font-bold text-slate-400">INVARIANT:</span> Profile-independent consensus score remains strictly identical across all investor accounts.
      </div>

    </div>
  );
};
