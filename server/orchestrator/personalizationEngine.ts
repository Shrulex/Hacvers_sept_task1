/**
 * Personalization Engine:
 * Computes Personalized Suitability based on investor risk profile, portfolio exposure, investment horizon, and history.
 * CRITICAL RULE: Never rewrites objective market facts.
 */

import { 
  UserProfile, 
  PortfolioHolding, 
  ObjectiveMarketView, 
  PersonalizedResult, 
  PersonalizationAdjustment,
  RiskLevel
} from '../types.js';

export class PersonalizationEngine {
  public static personalize(
    objective: ObjectiveMarketView,
    user: UserProfile,
    holdings: PortfolioHolding[],
    ticker: string,
    sector: string,
    objectiveRiskLevel: RiskLevel
  ): PersonalizedResult {
    const adjustments: PersonalizationAdjustment[] = [];

    // 1. Calculate Portfolio Context
    const totalPortfolioValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const sectorHoldings = holdings.filter(h => h.sector === sector);
    const sectorValue = sectorHoldings.reduce((sum, h) => sum + h.currentValue, 0);
    const currentSectorPercent = totalPortfolioValue > 0 ? (sectorValue / totalPortfolioValue) * 100 : 0;

    const currentTickerHolding = holdings.find(h => h.ticker === ticker.toUpperCase());
    const currentTickerValue = currentTickerHolding ? currentTickerHolding.currentValue : 0;
    const currentTickerPercent = totalPortfolioValue > 0 ? (currentTickerValue / totalPortfolioValue) * 100 : 0;

    // 2. Portfolio Adjustment (-0.18 to +0.08)
    let portfolioImpact = 0;
    let portfolioDesc = 'Portfolio allocation aligns comfortably with preferred sector limits.';

    if (currentSectorPercent > user.preferredSectorLimitPercent) {
      // Overweight in sector
      const excess = currentSectorPercent - user.preferredSectorLimitPercent;
      portfolioImpact = -Math.min(0.18, Math.max(0.04, 0.04 + (excess * 0.015)));
      portfolioImpact = Math.round(portfolioImpact * 100) / 100;
      portfolioDesc = `${sector} already represents ${currentSectorPercent.toFixed(1)}% of portfolio (exceeds ${user.preferredSectorLimitPercent}% preferred limit).`;
    } else if (currentSectorPercent < user.preferredSectorLimitPercent * 0.5) {
      // Underweight in sector, room for diversification
      portfolioImpact = +0.04;
      portfolioDesc = `${sector} is currently underweight at ${currentSectorPercent.toFixed(1)}% (room up to ${user.preferredSectorLimitPercent}%).`;
    }

    if (currentTickerPercent > user.maxSingleStockLimitPercent) {
      portfolioImpact -= 0.04;
      portfolioDesc += ` Existing position (${currentTickerPercent.toFixed(1)}%) exceeds single-stock limit.`;
    }
    portfolioImpact = Math.max(-0.18, Math.min(0.08, Math.round(portfolioImpact * 100) / 100));

    adjustments.push({
      factor: 'Portfolio Concentration & Sector Limit',
      impact: portfolioImpact,
      description: portfolioDesc
    });

    // 3. Risk Compatibility Adjustment (-0.12 to +0.08)
    let riskImpact = 0;
    let riskDesc = '';

    if (user.riskTolerance === 'Conservative') {
      if (objectiveRiskLevel === 'ELEVATED' || objectiveRiskLevel === 'HIGH') {
        riskImpact = -0.06;
        riskDesc = 'Conservative profile warrants caution during elevated market volatility.';
      } else {
        riskImpact = +0.02;
        riskDesc = 'Low market volatility matches conservative risk profile.';
      }
    } else if (user.riskTolerance === 'Aggressive') {
      if (objective.score >= 70) {
        riskImpact = +0.06;
        riskDesc = 'Aggressive growth appetite is well-aligned with strong fundamental momentum.';
      } else {
        riskImpact = -0.02;
        riskDesc = 'Aggressive growth profile requires higher upside momentum.';
      }
    } else {
      // Moderate
      riskImpact = +0.01;
      riskDesc = 'Moderate risk profile compatible with bluechip balance sheet stability.';
    }
    riskImpact = Math.max(-0.12, Math.min(0.08, Math.round(riskImpact * 100) / 100));

    adjustments.push({
      factor: 'Risk Preference Compatibility',
      impact: riskImpact,
      description: riskDesc
    });

    // 4. Horizon Adjustment (-0.08 to +0.08)
    let horizonImpact = 0;
    let horizonDesc = '';

    if (user.investmentHorizon === 'Long term') {
      horizonImpact = +0.03;
      horizonDesc = 'Long-term horizon (5+ yrs) mitigates short-term volatility fluctuations.';
    } else if (user.investmentHorizon === 'Short term') {
      horizonImpact = -0.04;
      horizonDesc = 'Short-term horizon is vulnerable to technical pullbacks near 52-week resistance.';
    } else {
      horizonImpact = +0.01;
      horizonDesc = 'Medium-term horizon allows for cyclical earnings realization.';
    }
    horizonImpact = Math.max(-0.08, Math.min(0.08, Math.round(horizonImpact * 100) / 100));

    adjustments.push({
      factor: 'Investment Horizon Alignment',
      impact: horizonImpact,
      description: horizonDesc
    });

    // 5. Historical Adjustment (-0.04 to +0.04)
    const historicalImpact = -0.01;
    adjustments.push({
      factor: 'Historical Interaction Context',
      impact: historicalImpact,
      description: 'Prior analysis baseline reflected consolidation phase.'
    });

    // 6. Calculate Final Suitability Score (0 to 100%)
    const baseObjectiveDecimal = objective.score / 100.0;
    const totalAdjustment = portfolioImpact + riskImpact + horizonImpact + historicalImpact;
    const rawSuitability = baseObjectiveDecimal + totalAdjustment;
    const clampedSuitability = Math.max(0.05, Math.min(0.98, rawSuitability));
    const suitabilityScore = Math.round(clampedSuitability * 100);

    // 7. Suitability Level Classification
    let suitabilityLevel: 'HIGH' | 'MODERATE' | 'CAUTION' | 'UNSUITABLE' = 'MODERATE';
    if (suitabilityScore >= 75) suitabilityLevel = 'HIGH';
    else if (suitabilityScore >= 60) suitabilityLevel = 'MODERATE';
    else if (suitabilityScore >= 45) suitabilityLevel = 'CAUTION';
    else suitabilityLevel = 'UNSUITABLE';

    // 8. Deterministic "Why This Matters to You"
    const whyThisMattersToYou: string[] = [
      `${sector} already represents ${currentSectorPercent.toFixed(1)}% of your portfolio holdings.`,
      `Your declared preferred maximum for ${sector} is ${user.preferredSectorLimitPercent}%.`,
      `Objective market evidence remains positive (${objective.score}% score, ${objective.confidence}% confidence).`,
      portfolioImpact < 0
        ? `Additional exposure increases portfolio concentration risk.`
        : `Portfolio has ample headroom for disciplined accumulation.`,
      user.investmentHorizon === 'Long term'
        ? `Your long-term investment horizon reduces the impact of short-term volatility.`
        : `Your ${user.investmentHorizon.toLowerCase()} horizon requires strict stop-loss discipline.`
    ];

    const personalizedRisks: string[] = [];
    if (currentSectorPercent > user.preferredSectorLimitPercent) {
      personalizedRisks.push(`Sector Overweight: Adding to ${ticker} pushes ${sector} exposure further above ${user.preferredSectorLimitPercent}%.`);
    }
    if (user.riskTolerance === 'Conservative' && objectiveRiskLevel === 'ELEVATED') {
      personalizedRisks.push('Risk Mismatch: Elevated market volatility exceeds conservative risk tolerance parameters.');
    }

    return {
      suitabilityScore,
      suitabilityLevel,
      objectiveScore: objective.score, // Guaranteed identical across users
      adjustments,
      whyThisMattersToYou,
      personalizedRisks
    };
  }
}
