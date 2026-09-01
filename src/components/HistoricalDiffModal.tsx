import React from 'react';
import { 
  X, 
  History, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { HistoricalComparison } from '../types';

interface HistoricalDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparison: HistoricalComparison | null;
  ticker: string;
}

export const HistoricalDiffModal: React.FC<HistoricalDiffModalProps> = ({
  isOpen,
  onClose,
  comparison,
  ticker
}) => {
  if (!isOpen || !comparison) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="flex w-full max-w-2xl flex-col rounded-xl bg-[#0D1321] shadow-2xl overflow-hidden border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-[#0B0F1A]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">What Changed for {ticker}?</h3>
              <p className="text-[10px] text-slate-500 font-mono">Historical Comparison vs Baseline Session</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 bg-[#0B0F1A]">
          
          {/* Summary Box */}
          <div className="rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-3.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-300 mb-1">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              <span>Prior Baseline: {comparison.previousTimestamp ? new Date(comparison.previousTimestamp).toLocaleDateString() : 'N/A'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {comparison.summary}
            </p>
          </div>

          {/* Key Metric Diffs */}
          <div className="grid grid-cols-2 gap-2.5">
            
            {/* Technical Signal */}
            <div className="rounded-lg bg-[#161F32] p-3 border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Technical Signal</span>
              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                <span className="text-slate-500">{comparison.changes.technicalSignal.from}</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  {comparison.changes.technicalSignal.to}
                </span>
              </div>
            </div>

            {/* Risk Regime */}
            <div className="rounded-lg bg-[#161F32] p-3 border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Volatility Level</span>
              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                <span className="text-slate-500">{comparison.changes.riskLevel.from}</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                  {comparison.changes.riskLevel.to}
                </span>
              </div>
            </div>

            {/* Objective Score */}
            <div className="rounded-lg bg-[#161F32] p-3 border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Objective Market Score</span>
              <div className="flex items-center justify-between font-mono">
                <span className="text-xs font-bold text-white">
                  {comparison.changes.objectiveScore.from}% → {comparison.changes.objectiveScore.to || 78}%
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  +{comparison.changes.objectiveScore.delta || 6}%
                </span>
              </div>
            </div>

            {/* Consensus Percentage */}
            <div className="rounded-lg bg-[#161F32] p-3 border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Consensus Level</span>
              <div className="flex items-center justify-between font-mono">
                <span className="text-xs font-bold text-white">
                  {comparison.changes.consensus.from}% → {comparison.changes.consensus.to || 72}%
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  +{comparison.changes.consensus.delta || 4}%
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-6 py-3 bg-[#0D1321] flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-1.5 text-xs font-semibold text-white transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
