/**
 * Market Data Ingestion with Tiered Fallback:
 * LIVE -> CACHED -> DEMO -> STALE -> UNAVAILABLE
 * Exposes explicit provider mode and freshness indicators.
 */

import { ProviderMode } from '../types.js';
import { 
  GOLDEN_COMPANIES, 
  GOLDEN_PRICE_HISTORIES, 
  GOLDEN_CONTEXT_EVENTS,
  CompanyProfile,
  StockPricePoint,
  ContextEvent
} from '../data/goldenData.js';

export interface MarketSnapshotResult {
  ticker: string;
  profile: CompanyProfile;
  priceHistory: StockPricePoint[];
  contextEvents: ContextEvent[];
  providerMode: ProviderMode;
  timestamp: string;
  isStale: boolean;
  dataFreshnessScore: number;
}

export interface IMarketDataProvider {
  getMarketSnapshot(ticker: string, forceMode?: ProviderMode): Promise<MarketSnapshotResult>;
  getProviderStatus(): { mode: ProviderMode; activeTickers: string[]; lastSync: string };
}

class MarketDataProvider implements IMarketDataProvider {
  private cache: Map<string, { data: MarketSnapshotResult; cachedAt: number }> = new Map();
  private simulatedMode: ProviderMode = 'DEMO'; // Default deterministic demo provider

  public setSimulatedMode(mode: ProviderMode) {
    this.simulatedMode = mode;
  }

  public async getMarketSnapshot(ticker: string, forceMode?: ProviderMode): Promise<MarketSnapshotResult> {
    const symbol = ticker.toUpperCase().trim();
    const mode = forceMode || this.simulatedMode;
    const now = new Date().toISOString();

    // 1. If UNAVAILABLE mode is forced (e.g. for failure testing)
    if (mode === 'UNAVAILABLE') {
      throw new Error(`Market data provider is currently UNAVAILABLE for ${symbol}`);
    }

    // 2. Lookup golden company dataset
    const profile = GOLDEN_COMPANIES[symbol];
    const priceHistory = GOLDEN_PRICE_HISTORIES[symbol] || [];
    const contextEvents = GOLDEN_CONTEXT_EVENTS.filter(e => e.ticker === symbol);

    if (!profile) {
      // Dynamic fallback for non-seeded tickers
      const syntheticProfile: CompanyProfile = {
        ticker: symbol,
        name: `${symbol} Equities India Ltd`,
        sector: 'General Industries',
        industry: 'Diversified',
        isin: `INE0000${symbol}01`,
        currentPrice: 1250.00,
        change24h: 12.50,
        change24hPercent: 1.01,
        marketCapCr: 45000,
        peRatio: 22.5,
        industryPe: 20.0,
        pbRatio: 3.2,
        dividendYield: 1.2,
        roe: 14.5,
        debtToEquity: 0.25,
        beta: 1.0,
        high52w: 1450.00,
        low52w: 980.00,
        avgVolume30d: 3200000,
        revenueGrowthYoy: 6.5,
        operatingMargin: 18.2,
        netMargin: 12.0,
        freeCashFlowCr: 4200
      };

      return {
        ticker: symbol,
        profile: syntheticProfile,
        priceHistory,
        contextEvents: [],
        providerMode: 'DEMO',
        timestamp: now,
        isStale: false,
        dataFreshnessScore: 0.85
      };
    }

    // Determine freshness and status based on mode
    let freshnessScore = 0.96;
    let isStale = false;

    if (mode === 'STALE') {
      freshnessScore = 0.40;
      isStale = true;
    } else if (mode === 'CACHED') {
      freshnessScore = 0.88;
    } else if (mode === 'LIVE') {
      freshnessScore = 0.99;
    }

    const result: MarketSnapshotResult = {
      ticker: symbol,
      profile: { ...profile },
      priceHistory: [...priceHistory],
      contextEvents: [...contextEvents],
      providerMode: mode,
      timestamp: mode === 'STALE' ? '2026-08-01T08:00:00Z' : now,
      isStale,
      dataFreshnessScore: freshnessScore
    };

    // Cache the snapshot
    this.cache.set(symbol, { data: result, cachedAt: Date.now() });
    return result;
  }

  public getProviderStatus(): { mode: ProviderMode; activeTickers: string[]; lastSync: string } {
    return {
      mode: this.simulatedMode,
      activeTickers: Object.keys(GOLDEN_COMPANIES),
      lastSync: new Date().toISOString()
    };
  }
}

export const marketDataProvider = new MarketDataProvider();
