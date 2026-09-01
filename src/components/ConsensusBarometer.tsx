import React, { useState } from 'react';
import { 
  Scale, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  Cpu, 
  Calculator, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { ConsensusResult, ConflictResult, ConfidenceBreakdown, AgentResultsBundle } from '../types';

interface ConsensusBarometerProps {
  consensus: ConsensusResult;
  conflicts: ConflictResult;
  confidence: ConfidenceBreakdown;
  agents: AgentResultsBundle;
}

export const ConsensusBarometer: React.FC<ConsensusBarometerProps> = ({
  consensus,
  conflicts,
  confidence,
  agents
}) => {
  const [showConfidenceMath, setShowConfidenceMath] = useState(false);

  const agentCards = [
    { key: 'technical', label: 'Technical Agent', res: agents.technical },
    { key: 'fundamental', label: 'Fundamental (RAG)', res: agents.fundamental },
    { key: 'sentiment', label: 'Sentiment Agent', res: agents.sentiment },
    { key: 'risk', label: 'Risk & Volatility', res: agents.risk },
    { key: 'sector_peer', label: 'Sector & Peer', res: agents.sector_peer }
  ];

  const getDirectionPill = (dir: number) => {
    if (dir >= 0.5) return { text: 'Bullish (+0.75)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono' };
    if (dir > 0) return { text: 'Positive (+0.40)', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30 font-mono' };
    if (dir === 0) return { text: 'Neutral (0.00)', color: 'bg-slate-800 text-slate-300 border-slate-700 font-mono' };
    if (dir > -0.5) return { text: 'Caution (-0.25)', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono' };
    return { text: 'Bearish (-0.75)', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-mono' };
  };

  return (
    <div id="consensus_barometer_section" className="rounded-xl border border-slate-800 bg-[#0D1321] p-5 shadow-xs">
      
      {/* Section Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Scale className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Multi-Agent Consensus & Conflict Barometer</h3>
            <p className="text-[10px] text-slate-500">Autonomous parallel synthesis across 5 specialized perspectives</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" />
            <span>{consensus.totalOperational}/5 AGENTS ACTIVE</span>
          </span>

          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-300 border border-slate-700">
            Consensus: <strong className="text-white">{consensus.consensusPercentage}%</strong>
          </span>
        </div>
      </div>

      {/* 5-Agent Direction Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-4">
        {agentCards.map(({ key, label, res }) => {
          const pill = getDirectionPill(res.direction);
          return (
            <div 
              key={key} 
              className="rounded-lg border border-slate-800 bg-[#161F32] p-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300">{label}</span>
                  <span className="font-mono text-indigo-300">{Math.round(res.confidence * 100)}%</span>
                </div>
                <div className="text-xs font-mono font-bold text-white mb-2 truncate">
                  Score: {Math.round(res.score * 100)}%
                </div>
              </div>

              <div className={`text-[10px] font-bold text-center py-1 px-1 rounded border ${pill.color}`}>
                {pill.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Conflict Detection Notice */}
      {conflicts.hasConflicts ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 mb-3">
          <div className="flex items-start gap-2.5">
            <div className="rounded bg-amber-500/20 p-1 text-amber-400 mt-0.5">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-300">Cross-Perspective Disagreement Detected</h4>
                <span className="text-[10px] font-mono font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  -{Math.round(conflicts.totalPenalty * 100)}% Penalty
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {conflicts.summary}
              </p>
            </div>
          </div>
          
          {/* Agent Debate Room */}
          {conflicts.debates && conflicts.debates.length > 0 && (
            <div className="mt-4 border-t border-amber-500/10 pt-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Interactive Agent Debate Room</h5>
              </div>
              <div className="space-y-3">
                {conflicts.debates.map((debate, i) => (
                  <div key={i} className="rounded border border-slate-700/50 bg-[#0B0F1A] p-3 shadow-inner">
                    <p className="text-[10px] font-mono text-slate-500 mb-2 border-b border-slate-800 pb-1">Topic: {debate.topic}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div className="rounded bg-indigo-500/5 p-2 border border-indigo-500/10">
                        <span className="text-[9px] font-bold uppercase text-indigo-400 mb-1 block">Agent: {debate.agent1}</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed italic">&quot;{debate.agent1Argument}&quot;</p>
                      </div>
                      <div className="rounded bg-rose-500/5 p-2 border border-rose-500/10">
                        <span className="text-[9px] font-bold uppercase text-rose-400 mb-1 block">Agent: {debate.agent2}</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed italic">&quot;{debate.agent2Argument}&quot;</p>
                      </div>
                    </div>
                    <div className="rounded bg-slate-800/50 p-2 border border-slate-700/50">
                      <span className="text-[9px] font-bold uppercase text-emerald-400 mb-1 block">Resolution Synthesis</span>
                      <p className="text-xs text-slate-200">{debate.resolutionSynthesis}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-800 bg-[#161F32] p-2.5 mb-3 text-xs text-slate-300 flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>High cross-agent alignment: No severe directional signal conflicts detected.</span>
        </div>
      )}

      {/* Confidence Decomposition Formula Section */}
      <div className="rounded-lg border border-slate-800 bg-[#161F32]/60 p-3">
        <button
          id="toggle_confidence_math_btn"
          onClick={() => setShowConfidenceMath(!showConfidenceMath)}
          className="flex w-full items-center justify-between text-xs font-semibold text-slate-300 hover:text-white"
        >
          <div className="flex items-center gap-2">
            <Calculator className="h-3.5 w-3.5 text-indigo-400" />
            <span>Mathematical Confidence Formula Breakdown ({Math.round(confidence.finalConfidence * 100)}% Overall Confidence)</span>
          </div>
          {showConfidenceMath ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showConfidenceMath && (
          <div className="mt-3 space-y-2.5 pt-3 border-t border-slate-800 text-xs">
            <div className="rounded bg-[#0B0F1A] p-2 text-emerald-400 font-mono text-[11px] border border-slate-800 overflow-x-auto">
              {confidence.formulaDescription}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
              <div className="rounded bg-[#0B0F1A] p-2 border border-slate-800">
                <span className="text-slate-500 block uppercase">Agent Mean</span>
                <span className="font-bold text-slate-200">{Math.round(confidence.meanAgentConfidence * 100)}% (×0.35)</span>
              </div>
              <div className="rounded bg-[#0B0F1A] p-2 border border-slate-800">
                <span className="text-slate-500 block uppercase">Agreement</span>
                <span className="font-bold text-slate-200">{Math.round(confidence.agreementFactor * 100)}% (×0.20)</span>
              </div>
              <div className="rounded bg-[#0B0F1A] p-2 border border-slate-800">
                <span className="text-slate-500 block uppercase">Data Coverage</span>
                <span className="font-bold text-slate-200">{Math.round(confidence.dataCoverageFactor * 100)}% (×0.20)</span>
              </div>
              <div className="rounded bg-[#0B0F1A] p-2 border border-slate-800">
                <span className="text-slate-500 block uppercase">Evidence Citations</span>
                <span className="font-bold text-slate-200">{Math.round(confidence.evidenceCoverageFactor * 100)}% (×0.15)</span>
              </div>
              <div className="rounded bg-[#0B0F1A] p-2 border border-slate-800">
                <span className="text-slate-500 block uppercase">Freshness</span>
                <span className="font-bold text-slate-200">{Math.round(confidence.freshnessFactor * 100)}% (×0.10)</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
