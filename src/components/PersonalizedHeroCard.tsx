import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  Check, 
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Percent
} from 'lucide-react';
import { PersonalizedResult, UserProfile } from '../types';

interface PersonalizedHeroCardProps {
  personalized: PersonalizedResult;
  user: UserProfile | null;
  ticker: string;
}

export const PersonalizedHeroCard: React.FC<PersonalizedHeroCardProps> = ({
  personalized,
  user,
  ticker
}) => {
  const [showAdjustments, setShowAdjustments] = useState(false);

  const getSuitabilityColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono';
      case 'MODERATE':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 font-mono';
      case 'CAUTION':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono';
      case 'UNSUITABLE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-mono';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700 font-mono';
    }
  };

  const delta = personalized.suitabilityScore - personalized.objectiveScore;

  return (
    <div id="personalized_suitability_hero_card" className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0D1321] p-5 shadow-xs relative overflow-hidden">
      
      <div>
        {/* Header with User Context Tag */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Personalized Suitability</h2>
              <p className="text-[10px] text-slate-500">Tailored for {user?.name || 'Investor'}</p>
            </div>
          </div>

          <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-300">
            Profile-Specific
          </span>
        </div>

        {/* Hero Score & Delta Display */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Suitability Rating</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getSuitabilityColor(personalized.suitabilityLevel)}`}>
                {personalized.suitabilityLevel}
              </span>
              <span className="text-xs font-mono font-semibold">
                {delta < 0 ? (
                  <span className="text-rose-400 flex items-center gap-0.5">
                    <TrendingDown className="h-3.5 w-3.5" />
                    {delta}% vs Market
                  </span>
                ) : delta > 0 ? (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +{delta}% vs Market
                  </span>
                ) : (
                  <span className="text-slate-400">Aligned with Market</span>
                )}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Suitability Score</div>
            <div className="flex items-baseline justify-end gap-1 mt-0.5">
              <span className="text-3xl font-black font-mono tracking-tight text-white">{personalized.suitabilityScore}</span>
              <span className="text-xs font-mono text-slate-500">/ 100</span>
            </div>
          </div>
        </div>

        {/* User Allocation Guardrails Banner */}
        <div className="rounded-lg bg-[#161F32] p-3 mb-4 border border-slate-800 grid grid-cols-3 gap-2 text-[11px] font-mono">
          <div>
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Risk Tolerance</span>
            <span className="font-bold text-slate-200">{user?.riskTolerance}</span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Sector Limit</span>
            <span className="font-bold text-slate-200">{user?.preferredSectorLimitPercent}%</span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Horizon</span>
            <span className="font-bold text-slate-200">{user?.investmentHorizon}</span>
          </div>
        </div>

        {/* "Why This Matters to You" List */}
        <div className="space-y-2 mb-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-emerald-400" />
            <span>Why This Matters To You</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {personalized.whyThisMattersToYou.slice(0, 4).map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="h-1 w-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Personalized Risk Alerts */}
        {personalized.personalizedRisks.length > 0 && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 mb-3">
            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              <span>Personalized Allocation Risk</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {personalized.personalizedRisks[0]}
            </p>
          </div>
        )}

        {/* Collapsible Factor Adjustments Table */}
        <div className="border-t border-slate-800 pt-2">
          <button
            id="toggle_adjustments_btn"
            onClick={() => setShowAdjustments(!showAdjustments)}
            className="flex w-full items-center justify-between py-1 text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            <span>Personalization Adjustment Breakdown ({personalized.adjustments.length} Factors)</span>
            {showAdjustments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showAdjustments && (
            <div className="mt-2 space-y-1.5 rounded-lg bg-[#161F32] p-2.5 text-xs border border-slate-800">
              <div className="flex justify-between font-bold text-slate-400 pb-1 border-b border-slate-800 text-[10px] uppercase font-mono">
                <span>Adjustment Factor</span>
                <span>Impact</span>
              </div>
              {personalized.adjustments.map((adj, i) => (
                <div key={i} className="flex items-start justify-between gap-2 py-0.5">
                  <div className="flex-1">
                    <span className="font-semibold text-slate-200 block text-[11px]">{adj.factor}</span>
                    <span className="text-[10px] text-slate-400 leading-tight block">{adj.description}</span>
                  </div>
                  <span className={`font-mono font-bold shrink-0 text-[11px] ${
                    adj.impact > 0 ? 'text-emerald-400' : adj.impact < 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {adj.impact > 0 ? `+${Math.round(adj.impact * 100)}%` : `${Math.round(adj.impact * 100)}%`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500 leading-normal font-mono">
        <span className="font-bold text-slate-400">GUARDRAIL:</span> Evaluates existing sector weightings and risk limits without modifying objective market intelligence.
      </div>

    </div>
  );
};
