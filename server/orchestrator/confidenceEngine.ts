/**
 * Confidence Engine:
 * Mathematical, deterministic calculation of overall confidence:
 * Final Confidence = 0.35 * Mean Agent Confidence
 *                  + 0.20 * Agreement Factor
 *                  + 0.20 * Data Coverage Factor
 *                  + 0.15 * Evidence Coverage Factor
 *                  + 0.10 * Data Freshness Factor
 *                  - Conflict Penalty
 */

import { BaseAgentResult, ConfidenceBreakdown } from '../types.js';

export class ConfidenceEngine {
  public static calculate(
    agents: BaseAgentResult[],
    agreementScore: number,
    evidenceCoveragePercent: number,
    dataFreshnessScore: number,
    conflictPenalty: number = 0
  ): ConfidenceBreakdown {
    const operational = agents.filter(a => a.status === 'SUCCESS' || a.status === 'DEGRADED');

    // 1. Mean Agent Confidence
    const totalConf = operational.reduce((sum, a) => sum + a.confidence, 0);
    const meanAgentConfidence = operational.length > 0 ? totalConf / operational.length : 0.40;

    // 2. Data Coverage Factor (Ratio of operational agents to standard 5 agents)
    const dataCoverageFactor = Math.min(1.0, operational.length / 5.0);

    // 3. Evidence Coverage Factor (Normalized 0.0 to 1.0)
    const evidenceCoverageFactor = Math.max(0.0, Math.min(1.0, evidenceCoveragePercent / 100.0));

    // 4. Freshness Factor (0.0 to 1.0)
    const freshnessFactor = Math.max(0.0, Math.min(1.0, dataFreshnessScore));

    // 5. Formula calculation
    const rawConfidence =
      (0.35 * meanAgentConfidence) +
      (0.20 * agreementScore) +
      (0.20 * dataCoverageFactor) +
      (0.15 * evidenceCoverageFactor) +
      (0.10 * freshnessFactor) -
      conflictPenalty;

    const finalConfidence = Math.max(0.10, Math.min(0.99, Math.round(rawConfidence * 100) / 100));

    return {
      meanAgentConfidence: Math.round(meanAgentConfidence * 100) / 100,
      agreementFactor: Math.round(agreementScore * 100) / 100,
      dataCoverageFactor: Math.round(dataCoverageFactor * 100) / 100,
      evidenceCoverageFactor: Math.round(evidenceCoverageFactor * 100) / 100,
      freshnessFactor: Math.round(freshnessFactor * 100) / 100,
      conflictPenalty: Math.round(conflictPenalty * 100) / 100,
      finalConfidence,
      formulaDescription: '0.35×AgentConf + 0.20×Agreement + 0.20×DataCoverage + 0.15×EvidenceCoverage + 0.10×Freshness - ConflictPenalty'
    };
  }
}
