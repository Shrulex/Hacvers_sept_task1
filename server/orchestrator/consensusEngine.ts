/**
 * Consensus Engine:
 * Direction normalization and confidence-weighted aggregation:
 * Weighted Direction = Σ(direction * confidence) / Σ(confidence)
 */

import { BaseAgentResult, ConsensusResult, DirectionSignal } from '../types.js';

export class ConsensusEngine {
  public static calculate(agents: BaseAgentResult[]): ConsensusResult {
    const operational = agents.filter(a => a.status === 'SUCCESS' || a.status === 'DEGRADED');
    const successfulAgents = agents.filter(a => a.status === 'SUCCESS').map(a => a.agent);
    const degradedAgents = agents.filter(a => a.status === 'DEGRADED').map(a => a.agent);
    const failedAgents = agents.filter(a => a.status === 'FAILED' || a.status === 'NOT_AVAILABLE').map(a => a.agent);

    if (operational.length === 0) {
      return {
        weightedDirection: 0.0,
        consensusPercentage: 50,
        consensusSignal: 'INSUFFICIENT_DATA',
        agreementScore: 0.0,
        successfulAgents: [],
        degradedAgents: [],
        failedAgents,
        totalOperational: 0
      };
    }

    let weightedSum = 0;
    let totalWeight = 0;

    for (const a of operational) {
      const conf = Math.max(0.1, a.confidence);
      weightedSum += a.direction * conf;
      totalWeight += conf;
    }

    const weightedDirection = totalWeight > 0 ? weightedSum / totalWeight : 0;
    // Map weightedDirection (-1.00 to +1.00) to Consensus percentage (0 to 100%)
    // -1.0 -> 0%, 0.0 -> 50%, +1.0 -> 100%
    const rawConsensusPercent = ((weightedDirection + 1) / 2) * 100;
    const consensusPercentage = Math.round(rawConsensusPercent);

    // Calculate Agreement Score (1.0 - standard deviation of normalized directions)
    const directions = operational.map(a => a.direction);
    const meanDir = directions.reduce((a, b) => a + b, 0) / directions.length;
    const variance = directions.reduce((sum, d) => sum + Math.pow(d - meanDir, 2), 0) / directions.length;
    const stdDev = Math.sqrt(variance);
    const agreementScore = Math.max(0.1, Math.min(1.0, Math.round((1.0 - (stdDev / 1.4)) * 100) / 100));

    // Map to discrete consensus signal
    let consensusSignal: DirectionSignal = 'NEUTRAL';
    if (weightedDirection >= 0.50) consensusSignal = 'BULLISH';
    else if (weightedDirection >= 0.20) consensusSignal = 'POSITIVE';
    else if (weightedDirection <= -0.50) consensusSignal = 'BEARISH';
    else if (weightedDirection <= -0.20) consensusSignal = 'NEGATIVE';

    return {
      weightedDirection: Math.round(weightedDirection * 100) / 100,
      consensusPercentage,
      consensusSignal,
      agreementScore,
      successfulAgents,
      degradedAgents,
      failedAgents,
      totalOperational: operational.length
    };
  }
}
