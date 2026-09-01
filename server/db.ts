/**
 * Persistence layer: User profiles, portfolios, watchlists, analysis sessions, agent runs, and historical records.
 * Supports in-memory SQLite-compatible relational store with JSON serialization.
 */

import { 
  UserProfile, 
  PortfolioHolding, 
  WatchlistItem, 
  AnalysisResponse,
  EvidenceRecord
} from './types.js';
import { GOLDEN_COMPANIES } from './data/goldenData.js';

export interface StoredSessionRecord {
  id: string;
  userId: string;
  ticker: string;
  companyName: string;
  timestamp: string;
  objectiveScore: number;
  suitabilityScore: number;
  confidence: number;
  consensusPercentage: number;
  responseJson: string; // Full AnalysisResponse
}

class FinIntelDatabase {
  private users: Map<string, UserProfile> = new Map();
  private portfolios: Map<string, PortfolioHolding[]> = new Map();
  private watchlists: Map<string, WatchlistItem[]> = new Map();
  private analysisSessions: StoredSessionRecord[] = [];
  private evidenceRecords: Map<string, EvidenceRecord> = new Map();

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    // 1. Seed User Profiles
    const conservativeUser: UserProfile = {
      id: 'usr_conservative_01',
      name: 'Rahul Sharma (Conservative)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      riskTolerance: 'Conservative',
      investmentHorizon: 'Long term',
      preferredSectorLimitPercent: 30.0,
      maxSingleStockLimitPercent: 20.0,
      experienceLevel: 'Intermediate',
      monthlyInvestmentBudget: 50000
    };

    const growthUser: UserProfile = {
      id: 'usr_growth_02',
      name: 'Priya Patel (Growth)',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      riskTolerance: 'Aggressive',
      investmentHorizon: 'Long term',
      preferredSectorLimitPercent: 40.0,
      maxSingleStockLimitPercent: 30.0,
      experienceLevel: 'Advanced',
      monthlyInvestmentBudget: 150000
    };

    this.users.set(conservativeUser.id, conservativeUser);
    this.users.set(growthUser.id, growthUser);

    // 2. Seed Portfolios
    // Total Portfolio for Rahul Sharma = ₹10,00,000.
    // Technology: INFY (₹2,20,000) + TCS (₹1,20,000) = ₹3,40,000 (34.0% - EXCEEDS 30% PREFERRED LIMIT)
    // Financials: HDFCBANK (₹3,00,000 = 30%)
    // Energy: RELIANCE (₹2,60,000 = 26%)
    // Cash / Liquid: (₹1,00,000 = 10%)
    const conservativeHoldings: PortfolioHolding[] = [
      {
        id: 'hld_c_01',
        userId: conservativeUser.id,
        ticker: 'INFY',
        companyName: 'Infosys Limited',
        sector: 'Information Technology',
        quantity: 120,
        avgBuyPrice: 1650.00,
        currentPrice: 1824.50,
        currentValue: 218940,
        allocationPercentage: 21.89,
        unrealizedPnl: 20940,
        unrealizedPnlPercent: 10.58
      },
      {
        id: 'hld_c_02',
        userId: conservativeUser.id,
        ticker: 'TCS',
        companyName: 'Tata Consultancy Services',
        sector: 'Information Technology',
        quantity: 29,
        avgBuyPrice: 3950.00,
        currentPrice: 4210.00,
        currentValue: 122090,
        allocationPercentage: 12.21,
        unrealizedPnl: 7540,
        unrealizedPnlPercent: 6.58
      },
      {
        id: 'hld_c_03',
        userId: conservativeUser.id,
        ticker: 'HDFCBANK',
        companyName: 'HDFC Bank Limited',
        sector: 'Financial Services',
        quantity: 185,
        avgBuyPrice: 1520.00,
        currentPrice: 1642.00,
        currentValue: 303770,
        allocationPercentage: 30.38,
        unrealizedPnl: 22570,
        unrealizedPnlPercent: 8.03
      },
      {
        id: 'hld_c_04',
        userId: conservativeUser.id,
        ticker: 'RELIANCE',
        companyName: 'Reliance Industries Limited',
        sector: 'Energy & Conglomerate',
        quantity: 88,
        avgBuyPrice: 2850.00,
        currentPrice: 2985.00,
        currentValue: 262680,
        allocationPercentage: 26.27,
        unrealizedPnl: 11880,
        unrealizedPnlPercent: 4.74
      },
      {
        id: 'hld_c_05',
        userId: conservativeUser.id,
        ticker: 'LIQUIDBEES',
        companyName: 'Nippon Liquid ETF',
        sector: 'Cash & Equivalents',
        quantity: 92,
        avgBuyPrice: 1000.00,
        currentPrice: 1005.50,
        currentValue: 92520,
        allocationPercentage: 9.25,
        unrealizedPnl: 506,
        unrealizedPnlPercent: 0.55
      }
    ];

    // Total Portfolio for Priya Patel = ₹10,00,000.
    // Technology: INFY (₹1,00,000 = 10.0% - WELL BELOW 40% PREFERRED LIMIT)
    // Energy: RELIANCE (₹4,20,000 = 42%)
    // Financials: HDFCBANK (₹3,80,000 = 38%)
    // Cash: ₹1,00,000 (10%)
    const growthHoldings: PortfolioHolding[] = [
      {
        id: 'hld_g_01',
        userId: growthUser.id,
        ticker: 'INFY',
        companyName: 'Infosys Limited',
        sector: 'Information Technology',
        quantity: 55,
        avgBuyPrice: 1580.00,
        currentPrice: 1824.50,
        currentValue: 100347,
        allocationPercentage: 10.03,
        unrealizedPnl: 13447,
        unrealizedPnlPercent: 15.47
      },
      {
        id: 'hld_g_02',
        userId: growthUser.id,
        ticker: 'RELIANCE',
        companyName: 'Reliance Industries Limited',
        sector: 'Energy & Conglomerate',
        quantity: 140,
        avgBuyPrice: 2750.00,
        currentPrice: 2985.00,
        currentValue: 417900,
        allocationPercentage: 41.79,
        unrealizedPnl: 32900,
        unrealizedPnlPercent: 8.55
      },
      {
        id: 'hld_g_03',
        userId: growthUser.id,
        ticker: 'HDFCBANK',
        companyName: 'HDFC Bank Limited',
        sector: 'Financial Services',
        quantity: 232,
        avgBuyPrice: 1490.00,
        currentPrice: 1642.00,
        currentValue: 380944,
        allocationPercentage: 38.09,
        unrealizedPnl: 35264,
        unrealizedPnlPercent: 10.20
      },
      {
        id: 'hld_g_04',
        userId: growthUser.id,
        ticker: 'LIQUIDBEES',
        companyName: 'Nippon Liquid ETF',
        sector: 'Cash & Equivalents',
        quantity: 100,
        avgBuyPrice: 1000.00,
        currentPrice: 1008.00,
        currentValue: 100800,
        allocationPercentage: 10.08,
        unrealizedPnl: 800,
        unrealizedPnlPercent: 0.80
      }
    ];

    this.portfolios.set(conservativeUser.id, conservativeHoldings);
    this.portfolios.set(growthUser.id, growthHoldings);

    // 3. Seed Watchlists
    this.watchlists.set(conservativeUser.id, [
      {
        id: 'w_c_01',
        userId: conservativeUser.id,
        ticker: 'INFY',
        companyName: 'Infosys Limited',
        sector: 'Information Technology',
        currentPrice: 1824.50,
        change24h: 23.40,
        lastSignal: 'BULLISH',
        lastScore: 78,
        addedAt: '2026-08-15T10:00:00Z'
      },
      {
        id: 'w_c_02',
        userId: conservativeUser.id,
        ticker: 'TCS',
        companyName: 'Tata Consultancy Services',
        sector: 'Information Technology',
        currentPrice: 4210.00,
        change24h: 31.50,
        lastSignal: 'POSITIVE',
        lastScore: 75,
        addedAt: '2026-08-10T11:30:00Z'
      }
    ]);

    this.watchlists.set(growthUser.id, [
      {
        id: 'w_g_01',
        userId: growthUser.id,
        ticker: 'INFY',
        companyName: 'Infosys Limited',
        sector: 'Information Technology',
        currentPrice: 1824.50,
        change24h: 23.40,
        lastSignal: 'BULLISH',
        lastScore: 78,
        addedAt: '2026-08-18T09:00:00Z'
      },
      {
        id: 'w_g_02',
        userId: growthUser.id,
        ticker: 'RELIANCE',
        companyName: 'Reliance Industries Limited',
        sector: 'Energy & Conglomerate',
        currentPrice: 2985.00,
        change24h: -14.20,
        lastSignal: 'NEUTRAL',
        lastScore: 58,
        addedAt: '2026-08-12T14:00:00Z'
      }
    ]);

    // 4. Seed a Previous Historical Analysis Session for INFY (e.g. 14 days ago) to support "What Changed?"
    this.seedHistoricalSession(conservativeUser.id, 'INFY');
    this.seedHistoricalSession(growthUser.id, 'INFY');
  }

  private seedHistoricalSession(userId: string, ticker: string) {
    const prevTimestamp = '2026-08-15T09:45:00Z';
    const isConservative = userId.includes('conservative');
    const sessionId = `sess_prev_${userId}_${ticker}`;

    const prevAnalysis = {
      sessionId,
      ticker,
      companyName: 'Infosys Limited',
      sector: 'Information Technology',
      timestamp: prevTimestamp,
      userId,
      providerMode: 'DEMO',
      objective: {
        signal: 'NEUTRAL',
        score: 72,
        confidence: 76,
        consensusPercentage: 68,
        summary: 'Earlier analysis reflected consolidation around 200 SMA and moderate deal conversion.',
        topReasons: ['Trading near 50-day EMA support', 'Q4 margin softness offset by large deal pipeline'],
        identifiedRisks: ['Moderate macroeconomic deceleration in US BFS clients'],
        dataFreshness: {
          marketDataTimestamp: prevTimestamp,
          filingQuarter: 'Q4 FY25',
          newsTimestamp: prevTimestamp,
          freshnessScore: 0.90,
          isStale: false,
          providerMode: 'DEMO'
        }
      },
      personalized: {
        suitabilityScore: isConservative ? 58 : 74,
        suitabilityLevel: isConservative ? 'CAUTION' : 'HIGH',
        objectiveScore: 72,
        adjustments: [],
        whyThisMattersToYou: ['Previous baseline showed neutral momentum.'],
        personalizedRisks: []
      },
      consensus: {
        weightedDirection: 0.28,
        consensusPercentage: 68,
        consensusSignal: 'NEUTRAL',
        agreementScore: 0.68,
        successfulAgents: ['technical', 'fundamental', 'sentiment', 'risk', 'sector_peer'],
        degradedAgents: [],
        failedAgents: [],
        totalOperational: 5
      },
      conflicts: {
        hasConflicts: false,
        conflicts: [],
        totalPenalty: 0,
        summary: 'No significant conflicts in baseline session.'
      },
      confidenceBreakdown: {
        meanAgentConfidence: 0.78,
        agreementFactor: 0.68,
        dataCoverageFactor: 1.0,
        evidenceCoverageFactor: 0.88,
        freshnessFactor: 0.90,
        conflictPenalty: 0.0,
        finalConfidence: 0.76,
        formulaDescription: 'Weighted linear combination of agent confidences and coverage'
      },
      evidenceCoverage: {
        supportedClaimsCount: 7,
        totalEvidenceClaimsCount: 8,
        coveragePercentage: 87.5
      },
      allEvidence: [],
      executionMetrics: {
        totalDurationMs: 412,
        agentDurationsMs: { technical: 82, fundamental: 120, sentiment: 75, risk: 65, sector_peer: 70 },
        isConcurrent: true,
        concurrencySpeedup: 3.4
      }
    };

    this.analysisSessions.push({
      id: sessionId,
      userId,
      ticker,
      companyName: 'Infosys Limited',
      timestamp: prevTimestamp,
      objectiveScore: 72,
      suitabilityScore: isConservative ? 58 : 74,
      confidence: 76,
      consensusPercentage: 68,
      responseJson: JSON.stringify(prevAnalysis)
    });
  }

  // --- CRUD API Methods ---

  public getAllUsers(): UserProfile[] {
    return Array.from(this.users.values());
  }

  public getUserById(id: string): UserProfile | undefined {
    return this.users.get(id);
  }

  public getPortfolio(userId: string): PortfolioHolding[] {
    return this.portfolios.get(userId) || [];
  }

  public getWatchlist(userId: string): WatchlistItem[] {
    return this.watchlists.get(userId) || [];
  }

  public addToWatchlist(userId: string, ticker: string): WatchlistItem {
    const list = this.getWatchlist(userId);
    const existing = list.find(item => item.ticker === ticker.toUpperCase());
    if (existing) return existing;

    const company = GOLDEN_COMPANIES[ticker.toUpperCase()] || {
      ticker: ticker.toUpperCase(),
      name: ticker.toUpperCase(),
      sector: 'General Equity',
      currentPrice: 1000,
      change24h: 0
    };

    const newItem: WatchlistItem = {
      id: `w_${userId}_${Date.now()}`,
      userId,
      ticker: company.ticker,
      companyName: company.name,
      sector: company.sector,
      currentPrice: company.currentPrice,
      change24h: company.change24h,
      addedAt: new Date().toISOString()
    };

    list.push(newItem);
    this.watchlists.set(userId, list);
    return newItem;
  }

  public removeFromWatchlist(userId: string, ticker: string): boolean {
    const list = this.getWatchlist(userId);
    const filtered = list.filter(item => item.ticker !== ticker.toUpperCase());
    if (filtered.length !== list.length) {
      this.watchlists.set(userId, filtered);
      return true;
    }
    return false;
  }

  public saveAnalysisSession(response: AnalysisResponse): StoredSessionRecord {
    const record: StoredSessionRecord = {
      id: response.sessionId,
      userId: response.userId,
      ticker: response.ticker,
      companyName: response.companyName,
      timestamp: response.timestamp,
      objectiveScore: response.objective.score,
      suitabilityScore: response.personalized.suitabilityScore,
      confidence: response.objective.confidence,
      consensusPercentage: response.consensus.consensusPercentage,
      responseJson: JSON.stringify(response)
    };

    // Store in memory (latest first)
    this.analysisSessions.unshift(record);

    // Update watchlist item with latest signal if it exists
    const watchlist = this.getWatchlist(response.userId);
    const watchItem = watchlist.find(w => w.ticker === response.ticker);
    if (watchItem) {
      watchItem.lastSignal = response.objective.signal;
      watchItem.lastScore = response.objective.score;
    }

    return record;
  }

  public getHistory(userId: string): StoredSessionRecord[] {
    return this.analysisSessions.filter(s => s.userId === userId);
  }

  public getSessionById(sessionId: string): StoredSessionRecord | undefined {
    return this.analysisSessions.find(s => s.id === sessionId);
  }

  public getPreviousSession(userId: string, ticker: string, currentSessionId?: string): StoredSessionRecord | undefined {
    return this.analysisSessions.find(
      s => s.userId === userId && s.ticker === ticker && s.id !== currentSessionId
    );
  }

  public addEvidence(evidence: EvidenceRecord) {
    this.evidenceRecords.set(evidence.id, evidence);
  }

  public getEvidence(id: string): EvidenceRecord | undefined {
    return this.evidenceRecords.get(id);
  }
}

export const db = new FinIntelDatabase();
