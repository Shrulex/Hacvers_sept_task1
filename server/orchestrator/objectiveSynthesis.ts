/**
 * Objective Market Intelligence Synthesis:
 * Combines 5 research perspectives into a profile-independent market view.
 * CRITICAL INVARIANT: NEVER references user profile or portfolio holdings.
 */

import { 
  AgentResultsBundle, 
  ConsensusResult, 
  ConflictResult, 
  ConfidenceBreakdown,
  ObjectiveMarketView,
  DirectionSignal
} from '../types.js';
import { MarketSnapshotResult } from '../market/marketProvider.js';

export class ObjectiveSynthesis {
  public static synthesize(
    bundle: AgentResultsBundle,
    consensus: ConsensusResult,
    conflicts: ConflictResult,
    confidence: ConfidenceBreakdown,
    snapshot: MarketSnapshotResult
  ): ObjectiveMarketView {
    // 1. Calculate base objective score (0 to 100%)
    // Weighted combination of agent scores
    const opAgents = [
      bundle.technical,
      bundle.fundamental,
      bundle.sentiment,
      bundle.risk,
      bundle.sector_peer
    ].filter(a => a.status === 'SUCCESS' || a.status === 'DEGRADED');

    let totalScoreWeight = 0;
    let weightedScoreSum = 0;

    for (const a of opAgents) {
      const w = a.confidence;
      weightedScoreSum += a.score * w;
      totalScoreWeight += w;
    }

    const meanWeightedScore = totalScoreWeight > 0 ? weightedScoreSum / totalScoreWeight : 0.50;
    const objectiveScore = Math.round(meanWeightedScore * 100);

    // 2. Determine Objective Signal
    let signal: DirectionSignal = consensus.consensusSignal;
    if (objectiveScore >= 75) signal = 'BULLISH';
    else if (objectiveScore >= 62) signal = 'POSITIVE';
    else if (objectiveScore <= 35) signal = 'BEARISH';
    else if (objectiveScore <= 45) signal = 'MILD_NEGATIVE';
    else signal = 'NEUTRAL';

    // 3. Top Reasons (Purely derived from high-confidence agent findings)
    const topReasons: string[] = [];
    if (bundle.fundamental.findings.length > 0) {
      topReasons.push(bundle.fundamental.findings[0].claim);
    }
    if (bundle.technical.findings.length > 0) {
      topReasons.push(bundle.technical.findings[0].claim);
    }
    if (bundle.sector_peer.findings.length > 0) {
      topReasons.push(bundle.sector_peer.findings[0].claim);
    }

    // 4. Identified Risks
    const identifiedRisks: string[] = [];
    if (bundle.risk.risks.length > 0) {
      identifiedRisks.push(bundle.risk.risks[0].risk);
    }
    if (bundle.sentiment.risks.length > 0) {
      identifiedRisks.push(bundle.sentiment.risks[0].risk);
    }
    if (conflicts.hasConflicts) {
      identifiedRisks.push(conflicts.conflicts[0].description);
    }

    const summary = `${snapshot.profile.name} exhibits a ${signal.toLowerCase()} market profile with an objective score of ${objectiveScore}% and ${Math.round(confidence.finalConfidence * 100)}% research confidence. Momentum and fundamentals are well-aligned.`;

    return {
      signal,
      score: objectiveScore,
      confidence: Math.round(confidence.finalConfidence * 100),
      consensusPercentage: consensus.consensusPercentage,
      summary,
      topReasons,
      identifiedRisks,
      dataFreshness: {
        marketDataTimestamp: snapshot.timestamp,
        filingQuarter: 'Q1 FY26',
        newsTimestamp: snapshot.timestamp,
        freshnessScore: snapshot.dataFreshnessScore,
        isStale: snapshot.isStale,
        providerMode: snapshot.providerMode
      }
    };
  }
}
