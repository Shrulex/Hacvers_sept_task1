/**
 * Conflict Engine:
 * Detects real divergence across research perspectives.
 * E.g. Technical Positive vs Risk Elevated, Fundamental Positive vs Sentiment Mixed/Negative.
 * Quantifies severity and assigns an objective confidence penalty.
 */

import { BaseAgentResult, ConflictResult, ConflictItem } from '../types.js';

export class ConflictEngine {
  public static evaluate(agents: BaseAgentResult[]): ConflictResult {
    const conflicts: ConflictItem[] = [];
    const agentMap = new Map<string, BaseAgentResult>();
    agents.forEach(a => agentMap.set(a.agent, a));

    const technical = agentMap.get('technical');
    const fundamental = agentMap.get('fundamental');
    const sentiment = agentMap.get('sentiment');
    const risk = agentMap.get('risk');
    const sector = agentMap.get('sector_peer');

    // 1. Technical (Bullish/Positive) vs Risk (Elevated/High)
    if (technical && risk) {
      const riskLevel = (risk as any).risk_level;
      if (technical.direction >= 0.35 && (risk.direction < 0.0 || riskLevel === 'ELEVATED' || riskLevel === 'HIGH')) {
        conflicts.push({
          agentsInvolved: ['technical', 'risk'],
          severity: 'MEDIUM',
          description: 'Technical momentum is positive, but short-term market volatility has expanded to elevated levels.',
          confidencePenalty: 0.03
        });
      }
    }

    // 2. Fundamental (Positive) vs Sentiment (Negative / Mixed)
    if (fundamental && sentiment) {
      if (fundamental.direction >= 0.35 && (sentiment.direction <= 0.20 || sentiment.signal === 'MIXED')) {
        conflicts.push({
          agentsInvolved: ['fundamental', 'sentiment'],
          severity: 'LOW',
          description: 'Core earnings and margins are robust, while broader macroeconomic commentary reflects client budget caution.',
          confidencePenalty: 0.02
        });
      }
    }

    // 3. Technical (Positive) vs Sector/Peer (Negative)
    if (technical && sector) {
      if (technical.direction > 0.4 && sector.direction < -0.3) {
        conflicts.push({
          agentsInvolved: ['technical', 'sector_peer'],
          severity: 'HIGH',
          description: 'Individual stock shows strong breakout momentum despite broader sector headwind.',
          confidencePenalty: 0.05
        });
      }
    }

    const totalPenalty = Math.round(conflicts.reduce((sum, c) => sum + c.confidencePenalty, 0) * 100) / 100;
    const hasConflicts = conflicts.length > 0;
    const summary = hasConflicts
      ? conflicts.map(c => c.description).join(' ')
      : 'No significant cross-agent signal conflicts detected.';

    return {
      hasConflicts,
      conflicts,
      totalPenalty,
      summary
    };
  }
}
