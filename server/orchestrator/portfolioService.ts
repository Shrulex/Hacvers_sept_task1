/**
 * Portfolio Context Service:
 * 1. Portfolio Health Score calculation (Diversification, Sector Balance, Position Balance, Risk Alignment).
 * 2. What-If Simulator (Hypothetical buy projection without mutating actual holdings).
 * 3. What Changed? diff engine between current and historic sessions.
 */

import { 
  PortfolioHolding, 
  UserProfile, 
  PortfolioHealthScore, 
  WhatIfResult,
  HistoricalComparison,
  AnalysisResponse
} from '../types.js';
import { db, StoredSessionRecord } from '../db.js';
import { GOLDEN_COMPANIES } from '../data/goldenData.js';

export class PortfolioService {
  /**
   * Calculate interpretable Portfolio Health Score (0 to 100)
   */
  public static calculateHealth(holdings: PortfolioHolding[], user: UserProfile): PortfolioHealthScore {
    if (!holdings || holdings.length === 0) {
      return {
        overallScore: 50,
        grade: 'Fair',
        components: {
          diversification: 40,
          sectorBalance: 50,
          positionBalance: 50,
          riskAlignment: 60
        },
        totalPortfolioValue: 0,
        sectorConcentration: {},
        largestHoldingPercent: 0,
        largestHoldingTicker: 'NONE',
        recommendations: ['Add diversified core holdings across major sectors.']
      };
    }

    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);

    // 1. Diversification Score (Based on number of distinct holdings & sectors)
    const numHoldings = holdings.length;
    const sectors = new Set(holdings.map(h => h.sector));
    let diversification = Math.min(100, (numHoldings * 12) + (sectors.size * 10));
    diversification = Math.max(30, Math.min(95, diversification));

    // 2. Sector Balance Score (Penalize any sector exceeding user preferred limit)
    const sectorConcentration: { [sector: string]: number } = {};
    for (const h of holdings) {
      sectorConcentration[h.sector] = (sectorConcentration[h.sector] || 0) + (h.currentValue / totalValue) * 100;
    }

    let sectorOverweightPenalty = 0;
    for (const [sec, pct] of Object.entries(sectorConcentration)) {
      if (pct > user.preferredSectorLimitPercent) {
        sectorOverweightPenalty += (pct - user.preferredSectorLimitPercent) * 2.0;
      }
    }
    const sectorBalance = Math.max(30, Math.min(95, Math.round(90 - sectorOverweightPenalty)));

    // 3. Position Balance Score (Penalize individual stock concentration)
    let largestHoldingPercent = 0;
    let largestHoldingTicker = '';
    for (const h of holdings) {
      const pct = (h.currentValue / totalValue) * 100;
      if (pct > largestHoldingPercent) {
        largestHoldingPercent = pct;
        largestHoldingTicker = h.ticker;
      }
    }
    const positionPenalty = Math.max(0, (largestHoldingPercent - user.maxSingleStockLimitPercent) * 2.5);
    const positionBalance = Math.max(35, Math.min(95, Math.round(92 - positionPenalty)));

    // 4. Risk Alignment Score
    let riskAlignment = 80;
    if (user.riskTolerance === 'Conservative' && sectorBalance < 70) {
      riskAlignment -= 15;
    } else if (user.riskTolerance === 'Aggressive' && diversification > 85) {
      riskAlignment -= 5; // Too diluted for aggressive growth
    }

    // Weighted Overall Portfolio Health Score:
    // 30% Diversification + 30% Sector Balance + 20% Position Balance + 20% Risk Alignment
    const overallScore = Math.round(
      (0.30 * diversification) +
      (0.30 * sectorBalance) +
      (0.20 * positionBalance) +
      (0.20 * riskAlignment)
    );

    let grade: 'Excellent' | 'Good' | 'Fair' | 'Vulnerable' = 'Good';
    if (overallScore >= 80) grade = 'Excellent';
    else if (overallScore >= 68) grade = 'Good';
    else if (overallScore >= 50) grade = 'Fair';
    else grade = 'Vulnerable';

    const recommendations: string[] = [];
    if (sectorBalance < 70) {
      recommendations.push(`Reduce overweight sector exposure to stay within ${user.preferredSectorLimitPercent}% preferred threshold.`);
    }
    if (positionBalance < 75) {
      recommendations.push(`Trim ${largestHoldingTicker} position to remain below ${user.maxSingleStockLimitPercent}% single-stock limit.`);
    }
    if (diversification < 60) {
      recommendations.push('Add non-correlated assets (e.g. FMCG, Pharma, Liquid ETFs) to enhance portfolio resilience.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Portfolio demonstrates strong sector equilibrium and disciplined risk distribution.');
    }

    return {
      overallScore,
      grade,
      components: {
        diversification,
        sectorBalance,
        positionBalance,
        riskAlignment
      },
      totalPortfolioValue: totalValue,
      sectorConcentration,
      largestHoldingPercent: Math.round(largestHoldingPercent * 10) / 10,
      largestHoldingTicker,
      recommendations
    };
  }

  /**
   * What-If Simulator:
   * Pure projection - DOES NOT MUTATE ACTUAL PORTFOLIO.
   */
  public static simulateWhatIf(
    userId: string,
    ticker: string,
    amount: number,
    currentSuitability: number
  ): WhatIfResult {
    const user = db.getUserById(userId);
    if (!user) throw new Error('User not found');

    const holdings = db.getPortfolio(userId);
    const company = GOLDEN_COMPANIES[ticker.toUpperCase()] || {
      ticker: ticker.toUpperCase(),
      name: ticker.toUpperCase(),
      sector: 'Information Technology'
    };

    const currentTotal = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const projectedTotal = currentTotal + amount;

    // Current ticker and sector values
    const currentTickerHolding = holdings.find(h => h.ticker === ticker.toUpperCase());
    const currentTickerVal = currentTickerHolding ? currentTickerHolding.currentValue : 0;
    const currentTickerExposurePercent = currentTotal > 0 ? (currentTickerVal / currentTotal) * 100 : 0;

    const currentSectorHoldings = holdings.filter(h => h.sector === company.sector);
    const currentSectorVal = currentSectorHoldings.reduce((sum, h) => sum + h.currentValue, 0);
    const currentSectorExposurePercent = currentTotal > 0 ? (currentSectorVal / currentTotal) * 100 : 0;

    // Projected values
    const projectedTickerVal = currentTickerVal + amount;
    const projectedTickerExposurePercent = (projectedTickerVal / projectedTotal) * 100;

    const projectedSectorVal = currentSectorVal + amount;
    const projectedSectorExposurePercent = (projectedSectorVal / projectedTotal) * 100;

    // Simulated new holdings list for health calculation
    const simulatedHoldings: PortfolioHolding[] = holdings.map(h => {
      if (h.ticker === ticker.toUpperCase()) {
        return {
          ...h,
          currentValue: h.currentValue + amount,
          allocationPercentage: ((h.currentValue + amount) / projectedTotal) * 100
        };
      }
      return {
        ...h,
        allocationPercentage: (h.currentValue / projectedTotal) * 100
      };
    });

    if (!currentTickerHolding) {
      simulatedHoldings.push({
        id: 'sim_hld',
        userId,
        ticker: company.ticker,
        companyName: company.name,
        sector: company.sector,
        quantity: 10,
        avgBuyPrice: 1000,
        currentPrice: 1000,
        currentValue: amount,
        allocationPercentage: (amount / projectedTotal) * 100,
        unrealizedPnl: 0,
        unrealizedPnlPercent: 0
      });
    }

    const currentHealth = this.calculateHealth(holdings, user);
    const projectedHealth = this.calculateHealth(simulatedHoldings, user);

    // Calculate projected suitability adjustment
    let projectedSuitabilityScore = currentSuitability;
    if (projectedSectorExposurePercent > user.preferredSectorLimitPercent) {
      const excess = projectedSectorExposurePercent - user.preferredSectorLimitPercent;
      const penalty = Math.min(20, Math.round(excess * 1.5));
      projectedSuitabilityScore = Math.max(30, currentSuitability - penalty);
    } else {
      projectedSuitabilityScore = Math.min(95, currentSuitability + 3);
    }

    const warnings: string[] = [];
    if (projectedSectorExposurePercent > user.preferredSectorLimitPercent) {
      warnings.push(`Projected ${company.sector} exposure (${projectedSectorExposurePercent.toFixed(1)}%) will exceed your ${user.preferredSectorLimitPercent}% preferred ceiling.`);
    }
    if (projectedTickerExposurePercent > user.maxSingleStockLimitPercent) {
      warnings.push(`Projected ${ticker} position (${projectedTickerExposurePercent.toFixed(1)}%) will exceed your ${user.maxSingleStockLimitPercent}% single-stock limit.`);
    }

    const recommendation = warnings.length > 0
      ? `Allocate hypothetical capital into underweight non-tech sectors to preserve a high portfolio health score.`
      : `Hypothetical buy keeps sector allocation within optimal risk parameters.`;

    return {
      ticker: company.ticker,
      companyName: company.name,
      sector: company.sector,
      investmentAmount: amount,
      currentPortfolioValue: Math.round(currentTotal),
      projectedPortfolioValue: Math.round(projectedTotal),
      currentTickerExposurePercent: Math.round(currentTickerExposurePercent * 10) / 10,
      projectedTickerExposurePercent: Math.round(projectedTickerExposurePercent * 10) / 10,
      currentSectorExposurePercent: Math.round(currentSectorExposurePercent * 10) / 10,
      projectedSectorExposurePercent: Math.round(projectedSectorExposurePercent * 10) / 10,
      preferredSectorLimitPercent: user.preferredSectorLimitPercent,
      currentSuitabilityScore: currentSuitability,
      projectedSuitabilityScore,
      currentPortfolioHealth: currentHealth.overallScore,
      projectedPortfolioHealth: projectedHealth.overallScore,
      warnings,
      recommendation
    };
  }

  /**
   * What Changed? - Compare current analysis with previous session
   */
  public static compareWithPrevious(
    currentResponse: Partial<AnalysisResponse>,
    previousSession?: StoredSessionRecord
  ): HistoricalComparison {
    if (!previousSession) {
      return {
        hasPrevious: false,
        changes: {
          technicalSignal: { from: 'None', to: currentResponse.objective?.signal || 'NEUTRAL', changed: false },
          riskLevel: { from: 'None', to: currentResponse.agents?.risk?.risk_level || 'LOW', changed: false },
          consensus: { from: 0, to: currentResponse.consensus?.consensusPercentage || 0, delta: 0 },
          objectiveScore: { from: 0, to: currentResponse.objective?.score || 0, delta: 0 },
          suitabilityScore: { from: 0, to: currentResponse.personalized?.suitabilityScore || 0, delta: 0 },
          confidence: { from: 0, to: currentResponse.objective?.confidence || 0, delta: 0 }
        },
        summary: 'No previous analysis available for historical comparison.'
      };
    }

    try {
      const prevData: AnalysisResponse = JSON.parse(previousSession.responseJson);
      const prevTechSig = prevData.agents?.technical?.signal || 'NEUTRAL';
      const currTechSig = currentResponse.agents?.technical?.signal || 'NEUTRAL';

      const prevRisk = prevData.agents?.risk?.risk_level || 'MODERATE';
      const currRisk = currentResponse.agents?.risk?.risk_level || 'MODERATE';

      const prevConsensus = prevData.consensus?.consensusPercentage || 68;
      const currConsensus = currentResponse.consensus?.consensusPercentage || 72;

      const prevObj = prevData.objective?.score || 72;
      const currObj = currentResponse.objective?.score || 78;

      const prevSuit = prevData.personalized?.suitabilityScore || 58;
      const currSuit = currentResponse.personalized?.suitabilityScore || 64;

      const prevConf = prevData.objective?.confidence || 76;
      const currConf = currentResponse.objective?.confidence || 82;

      const summary = `Compared to baseline (${new Date(previousSession.timestamp).toLocaleDateString()}): Technical shifted from ${prevTechSig} to ${currTechSig}, Objective Score gained +${currObj - prevObj} points, and Consensus moved from ${prevConsensus}% to ${currConsensus}%.`;

      return {
        hasPrevious: true,
        previousSessionId: previousSession.id,
        previousTimestamp: previousSession.timestamp,
        changes: {
          technicalSignal: {
            from: prevTechSig,
            to: currTechSig,
            changed: prevTechSig !== currTechSig
          },
          riskLevel: {
            from: prevRisk,
            to: currRisk,
            changed: prevRisk !== currRisk
          },
          consensus: {
            from: prevConsensus,
            to: currConsensus,
            delta: currConsensus - prevConsensus
          },
          objectiveScore: {
            from: prevObj,
            to: currObj,
            delta: currObj - prevObj
          },
          suitabilityScore: {
            from: prevSuit,
            to: currSuit,
            delta: currSuit - prevSuit
          },
          confidence: {
            from: prevConf,
            to: currConf,
            delta: currConf - prevConf
          }
        },
        summary
      };
    } catch {
      return {
        hasPrevious: false,
        changes: {
          technicalSignal: { from: 'Error', to: 'Current', changed: false },
          riskLevel: { from: 'Error', to: 'Current', changed: false },
          consensus: { from: 0, to: 0, delta: 0 },
          objectiveScore: { from: 0, to: 0, delta: 0 },
          suitabilityScore: { from: 0, to: 0, delta: 0 },
          confidence: { from: 0, to: 0, delta: 0 }
        },
        summary: 'Historical session data was unreadable.'
      };
    }
  }
}
