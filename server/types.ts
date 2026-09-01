/**
 * Structured contracts and type definitions for FinIntel Multi-Agent Platform
 * Strict schema validation and direction normalization
 */

export type AgentStatus = 'SUCCESS' | 'DEGRADED' | 'FAILED' | 'NOT_AVAILABLE';
export type DirectionSignal = 'BULLISH' | 'POSITIVE' | 'MILD_POSITIVE' | 'NEUTRAL' | 'MIXED' | 'MILD_NEGATIVE' | 'NEGATIVE' | 'BEARISH' | 'ELEVATED' | 'INSUFFICIENT_DATA';
export type ProviderMode = 'LIVE' | 'CACHED' | 'DEMO' | 'STALE' | 'UNAVAILABLE';
export type RiskLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';
export type ConflictSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface EvidenceRecord {
  id: string;
  document: string;
  ticker: string;
  page?: number;
  section: string;
  text: string;
  relevanceScore: number;
  timestamp: string;
}

export interface Claim {
  claim: string;
  evidence_ids: string[];
  supported: boolean;
  validationNote?: string;
}

export interface Finding {
  claim: string;
  evidence_ids?: string[];
  metric?: string;
  value?: string | number;
}

export interface AgentRisk {
  risk: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  evidence_ids?: string[];
}

export interface BaseAgentResult {
  schema_version: string;
  agent: string;
  status: AgentStatus;
  signal: DirectionSignal;
  direction: number; // Normalized -1.00 to +1.00
  score: number;     // 0.00 to 1.00
  confidence: number;// 0.00 to 1.00
  findings: Finding[];
  risks: AgentRisk[];
  executionTimeMs: number;
  error?: string;
}

export interface TechnicalAgentResult extends BaseAgentResult {
  agent: 'technical';
  metrics: {
    currentPrice: number;
    change24h: number;
    sma20: number;
    sma50: number;
    ema14: number;
    rsi14: number;
    momentumPercent: number;
    volume24h: number;
    volumeAvg30d: number;
    volumeRatio: number;
    priceVs52wHigh: number;
    trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
  };
}

export interface FundamentalAgentResult extends BaseAgentResult {
  agent: 'fundamental';
  evidence: EvidenceRecord[];
  claims: Claim[];
  metrics: {
    peRatio: number;
    industryPe: number;
    revenueGrowthYoy: number;
    operatingMargin: number;
    netMargin: number;
    debtToEquity: number;
    freeCashFlowCr: number;
    roe: number;
  };
}

export interface SentimentAgentResult extends BaseAgentResult {
  agent: 'sentiment';
  positiveDevelopments: string[];
  negativeDevelopments: string[];
  uncertainties: string[];
  newsCount: number;
  sentimentRatio: number;
}

export interface RiskAgentResult extends BaseAgentResult {
  agent: 'risk';
  risk_level: RiskLevel;
  metrics: {
    annualizedVolatility30d: number;
    volatilityChangeYoy: number;
    maxDrawdown90d: number;
    beta: number;
    liquidityScore: number;
    var95Daily: number;
  };
}

export interface SectorPeerAgentResult extends BaseAgentResult {
  agent: 'sector_peer';
  sectorName: string;
  sectorMomentumPercent: number;
  relativePerformanceVsSector: number;
  relativePerformanceVsNifty50: number;
  peerComparisons: {
    ticker: string;
    name: string;
    peRatio: number;
    ytdReturnPercent: number;
    momentumScore: number;
  }[];
}

export interface AgentResultsBundle {
  technical: TechnicalAgentResult;
  fundamental: FundamentalAgentResult;
  sentiment: SentimentAgentResult;
  risk: RiskAgentResult;
  sector_peer: SectorPeerAgentResult;
}

export interface ConsensusResult {
  weightedDirection: number; // -1.00 to +1.00
  consensusPercentage: number; // 0 to 100%
  consensusSignal: DirectionSignal;
  agreementScore: number; // 0.00 to 1.00
  successfulAgents: string[];
  degradedAgents: string[];
  failedAgents: string[];
  totalOperational: number;
}

export interface ConflictItem {
  agentsInvolved: string[];
  severity: ConflictSeverity;
  description: string;
  confidencePenalty: number;
}

export interface AgentDebate {
  topic: string;
  agent1: string;
  agent1Argument: string;
  agent2: string;
  agent2Argument: string;
  resolutionSynthesis: string;
}

export interface ConflictResult {
  hasConflicts: boolean;
  conflicts: ConflictItem[];
  debates?: AgentDebate[];
  totalPenalty: number;
  summary: string;
}

export interface ConfidenceBreakdown {
  meanAgentConfidence: number;
  agreementFactor: number;
  dataCoverageFactor: number;
  evidenceCoverageFactor: number;
  freshnessFactor: number;
  conflictPenalty: number;
  finalConfidence: number; // 0.00 to 1.00
  formulaDescription: string;
}

export interface ObjectiveMarketView {
  signal: DirectionSignal;
  score: number;      // 0 to 100%
  confidence: number; // 0 to 100%
  consensusPercentage: number;
  summary: string;
  topReasons: string[];
  identifiedRisks: string[];
  dataFreshness: {
    marketDataTimestamp: string;
    filingQuarter: string;
    newsTimestamp: string;
    freshnessScore: number;
    isStale: boolean;
    providerMode: ProviderMode;
  };
}

export interface PersonalizationAdjustment {
  factor: string;
  impact: number; // e.g. -0.10, +0.03
  description: string;
}

export interface PersonalizedResult {
  suitabilityScore: number; // 0 to 100%
  suitabilityLevel: 'HIGH' | 'MODERATE' | 'CAUTION' | 'UNSUITABLE';
  objectiveScore: number;   // 0 to 100% (Identical across users)
  adjustments: PersonalizationAdjustment[];
  whyThisMattersToYou: string[];
  personalizedRisks: string[];
}

export interface PortfolioHolding {
  id: string;
  userId: string;
  ticker: string;
  companyName: string;
  sector: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  allocationPercentage: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  investmentHorizon: 'Short term' | 'Medium term' | 'Long term';
  preferredSectorLimitPercent: number;
  maxSingleStockLimitPercent: number;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  monthlyInvestmentBudget: number;
}

export interface PortfolioHealthScore {
  overallScore: number; // 0 to 100
  grade: 'Excellent' | 'Good' | 'Fair' | 'Vulnerable';
  components: {
    diversification: number; // 0 to 100
    sectorBalance: number;   // 0 to 100
    positionBalance: number; // 0 to 100
    riskAlignment: number;   // 0 to 100
  };
  totalPortfolioValue: number;
  sectorConcentration: { [sector: string]: number };
  largestHoldingPercent: number;
  largestHoldingTicker: string;
  recommendations: string[];
}

export interface WhatIfRequest {
  userId: string;
  ticker: string;
  hypotheticalInvestmentAmount: number;
}

export interface WhatIfResult {
  ticker: string;
  companyName: string;
  sector: string;
  investmentAmount: number;
  currentPortfolioValue: number;
  projectedPortfolioValue: number;
  currentTickerExposurePercent: number;
  projectedTickerExposurePercent: number;
  currentSectorExposurePercent: number;
  projectedSectorExposurePercent: number;
  preferredSectorLimitPercent: number;
  currentSuitabilityScore: number;
  projectedSuitabilityScore: number;
  currentPortfolioHealth: number;
  projectedPortfolioHealth: number;
  warnings: string[];
  recommendation: string;
}

export interface HistoricalComparison {
  hasPrevious: boolean;
  previousSessionId?: string;
  previousTimestamp?: string;
  changes: {
    technicalSignal: { from: string; to: string; changed: boolean };
    riskLevel: { from: string; to: string; changed: boolean };
    consensus: { from: number; to: number; delta: number };
    objectiveScore: { from: number; to: number; delta: number };
    suitabilityScore: { from: number; to: number; delta: number };
    confidence: { from: number; to: number; delta: number };
  };
  summary: string;
}

export interface AnalysisRequest {
  ticker: string;
  userId?: string;
  simulatedMode?: ProviderMode;
  investmentAmount?: number;
}

export interface AnalysisResponse {
  sessionId: string;
  ticker: string;
  companyName: string;
  sector: string;
  timestamp: string;
  userId: string;
  providerMode: ProviderMode;
  objective: ObjectiveMarketView;
  personalized: PersonalizedResult;
  agents: AgentResultsBundle;
  consensus: ConsensusResult;
  conflicts: ConflictResult;
  confidenceBreakdown: ConfidenceBreakdown;
  evidenceCoverage: {
    supportedClaimsCount: number;
    totalEvidenceClaimsCount: number;
    coveragePercentage: number;
  };
  allEvidence: EvidenceRecord[];
  whatChanged?: HistoricalComparison;
  executionMetrics: {
    totalDurationMs: number;
    agentDurationsMs: { [agent: string]: number };
    isConcurrent: boolean;
    concurrencySpeedup: number;
  };
}

export interface WatchlistItem {
  id: string;
  userId: string;
  ticker: string;
  companyName: string;
  sector: string;
  currentPrice: number;
  change24h: number;
  lastSignal?: DirectionSignal;
  lastScore?: number;
  addedAt: string;
}

export interface DataProviderStatus {
  marketProvider: ProviderMode;
  ragStatus: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  llmProvider: 'REAL_GEMINI' | 'DETERMINISTIC_FALLBACK';
  cacheHit: boolean;
  lastSyncTime: string;
  activeCompanies: string[];
}
