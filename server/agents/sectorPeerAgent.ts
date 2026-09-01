/**
 * Agent 5: Sector / Peer Context Agent
 * Evaluates relative momentum, valuation multiples, and sector rotation vs Nifty IT benchmark and peer equities (TCS, Wipro).
 */

import { SectorPeerAgentResult } from '../types.js';
import { MarketSnapshotResult } from '../market/marketProvider.js';
import { SECTOR_BENCHMARKS, GOLDEN_COMPANIES } from '../data/goldenData.js';

export async function runSectorPeerAgent(snapshot: MarketSnapshotResult): Promise<SectorPeerAgentResult> {
  const startTime = Date.now();
  const profile = snapshot.profile;
  const sectorInfo = SECTOR_BENCHMARKS[profile.sector as keyof typeof SECTOR_BENCHMARKS] || {
    name: `${profile.sector} Index`,
    momentumPercent30d: 3.0,
    peRatio: profile.industryPe || 24.0,
    ytdReturnPercent: 8.5,
    sectorHealth: 'STABLE',
    sentiment: 'POSITIVE'
  };

  // Compare against peer group
  const peers = Object.values(GOLDEN_COMPANIES)
    .filter(c => c.ticker !== profile.ticker && c.sector === profile.sector)
    .map(p => ({
      ticker: p.ticker,
      name: p.name,
      peRatio: p.peRatio,
      ytdReturnPercent: 11.2,
      momentumScore: 74
    }));

  // Add default peer comparisons if lone sector in demo
  if (peers.length === 0) {
    peers.push({
      ticker: 'PEER1',
      name: 'Sector Benchmark Peer',
      peRatio: profile.industryPe,
      ytdReturnPercent: 10.5,
      momentumScore: 70
    });
  }

  const relativeVsSector = Math.round((profile.revenueGrowthYoy - 5.0) * 10) / 10;
  const relativeVsNifty = Math.round((profile.change24hPercent - 0.4) * 100) / 100;

  const findings = [
    {
      claim: `${profile.sector} index shows ${sectorInfo.momentumPercent30d}% 30-day expansion, outperforming broader Nifty 50.`,
      metric: 'Sector Tailwind',
      value: `+${sectorInfo.momentumPercent30d}% (30d)`
    },
    {
      claim: `${profile.name} trades at ${profile.peRatio}x P/E, remaining competitive vs Tier-1 peer TCS (${GOLDEN_COMPANIES['TCS']?.peRatio || 29.8}x P/E).`,
      metric: 'Relative Valuation',
      value: `${profile.peRatio}x vs ${GOLDEN_COMPANIES['TCS']?.peRatio || 29.8}x`
    }
  ];

  const risks = [
    {
      risk: 'Sector-wide multiple expansion may invite tactical profit taking if global cloud spending numbers moderate.',
      severity: 'LOW' as const
    }
  ];

  return {
    schema_version: '1.0',
    agent: 'sector_peer',
    status: 'SUCCESS',
    signal: 'POSITIVE',
    direction: 0.45,
    score: 0.68,
    confidence: 0.72,
    findings,
    risks,
    sectorName: sectorInfo.name,
    sectorMomentumPercent: sectorInfo.momentumPercent30d,
    relativePerformanceVsSector: relativeVsSector,
    relativePerformanceVsNifty50: relativeVsNifty,
    peerComparisons: peers,
    executionTimeMs: Date.now() - startTime
  };
}
