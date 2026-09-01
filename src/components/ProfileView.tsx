import React, { useState, useEffect } from 'react';
import { User, Shield, Briefcase, Activity, AlertCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  riskTolerance: string;
  investmentHorizon: string;
  preferredSectorLimitPercent: number;
  maxSingleStockLimitPercent: number;
  experienceLevel: string;
  monthlyInvestmentBudget: number;
}

interface ProfileViewProps {
  userId: string;
}

export function ProfileView({ userId }: ProfileViewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        const found = data.users?.find((u: UserProfile) => u.id === userId) || data.find((u: UserProfile) => u.id === userId);
        if (found) setProfile(found);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [userId]);

  if (loading || !profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500 mx-auto mb-4"></div>
          <p className="text-xs font-mono text-slate-400">Loading investor profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1321] p-6 shadow-xs flex items-center gap-5">
        <img 
          src={profile.avatar} 
          alt={profile.name}
          className="h-20 w-20 rounded-full border-2 border-indigo-500/50 object-cover"
        />
        <div>
          <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 text-[10px] font-mono font-bold text-indigo-400">
              {profile.riskTolerance} Risk
            </span>
            <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400">
              {profile.experienceLevel} Investor
            </span>
          </div>
        </div>
      </div>

      {/* Constraints Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Risk Tolerance */}
        <div className="rounded-lg border border-slate-800 bg-[#161F32] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-rose-400" />
            <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase">Risk Posture</h3>
          </div>
          <p className="text-lg font-bold text-white">{profile.riskTolerance}</p>
          <p className="text-[10px] text-slate-500 mt-1">Dictates overall suitability caps</p>
        </div>

        {/* Investment Horizon */}
        <div className="rounded-lg border border-slate-800 bg-[#161F32] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase">Time Horizon</h3>
          </div>
          <p className="text-lg font-bold text-white">{profile.investmentHorizon}</p>
          <p className="text-[10px] text-slate-500 mt-1">Impacts volatility tolerance</p>
        </div>

        {/* Sector Limit */}
        <div className="rounded-lg border border-slate-800 bg-[#161F32] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4 text-indigo-400" />
            <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase">Sector Cap</h3>
          </div>
          <p className="text-lg font-mono font-bold text-white">{profile.preferredSectorLimitPercent}%</p>
          <p className="text-[10px] text-slate-500 mt-1">Maximum allowed per sector</p>
        </div>

        {/* Stock Limit */}
        <div className="rounded-lg border border-slate-800 bg-[#161F32] p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase">Single Asset Cap</h3>
          </div>
          <p className="text-lg font-mono font-bold text-white">{profile.maxSingleStockLimitPercent}%</p>
          <p className="text-[10px] text-slate-500 mt-1">Maximum position concentration</p>
        </div>

      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0D1321] p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">System Note</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          The Personalization Engine dynamically adjusts Objective Market Intelligence based on these rigid constraints. 
          When an agent recommends an asset that violates the sector cap ({profile.preferredSectorLimitPercent}%) or clashes 
          with the configured risk posture ({profile.riskTolerance}), the Personalized Suitability score is strictly penalized.
        </p>
      </div>
    </div>
  );
}
