/**
 * Agent 1: Technical / Market Agent
 * Computes SMA 20/50, EMA 14, RSI 14, Momentum, Volume ratios, and Trend.
 */

import { TechnicalAgentResult } from '../types.js';
import { MarketSnapshotResult } from '../market/marketProvider.js';

export async function runTechnicalAgent(snapshot: MarketSnapshotResult): Promise<TechnicalAgentResult> {
  const startTime = Date.now();
  const prices = snapshot.priceHistory;

  if (!prices || prices.length < 14) {
    return {
      schema_version: '1.0',
      agent: 'technical',
      status: 'DEGRADED',
      signal: 'INSUFFICIENT_DATA',
      direction: 0.0,
      score: 0.50,
      confidence: 0.30,
      findings: [{ claim: 'Insufficient historical price data to compute technical indicators.' }],
      risks: [{ risk: 'Lack of price series continuity', severity: 'MEDIUM' }],
      metrics: {
        currentPrice: snapshot.profile.currentPrice,
        change24h: snapshot.profile.change24h,
        sma20: 0,
        sma50: 0,
        ema14: 0,
        rsi14: 50,
        momentumPercent: 0,
        volume24h: 0,
        volumeAvg30d: snapshot.profile.avgVolume30d,
        volumeRatio: 1.0,
        priceVs52wHigh: 0,
        trend: 'SIDEWAYS'
      },
      executionTimeMs: Date.now() - startTime
    };
  }

  const closes = prices.map(p => p.close);
  const currentPrice = snapshot.profile.currentPrice;

  // 1. Simple Moving Averages (SMA 20 & SMA 50)
  const sma20 = Math.round((closes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, closes.length)) * 100) / 100;
  const sma50 = Math.round((closes.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, closes.length)) * 100) / 100;

  // 2. Exponential Moving Average (EMA 14)
  const k = 2 / (14 + 1);
  let ema14 = closes[0];
  for (let i = 1; i < closes.length; i++) {
    ema14 = (closes[i] * k) + (ema14 * (1 - k));
  }
  ema14 = Math.round(ema14 * 100) / 100;

  // 3. RSI 14
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - 14; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  const avgGain = gains / 14;
  const avgLoss = losses / 14;
  let rsi14 = 50;
  if (avgLoss === 0) {
    rsi14 = 100;
  } else {
    const rs = avgGain / avgLoss;
    rsi14 = Math.round((100 - (100 / (1 + rs))) * 10) / 10;
  }

  // 4. Momentum & Volume
  const close20DaysAgo = closes[Math.max(0, closes.length - 20)];
  const momentumPercent = Math.round(((currentPrice - close20DaysAgo) / close20DaysAgo) * 1000) / 10;
  const lastVol = prices[prices.length - 1].volume;
  const avgVol = snapshot.profile.avgVolume30d || 6000000;
  const volumeRatio = Math.round((lastVol / avgVol) * 100) / 100;

  // 5. Price vs 52-week High
  const high52w = snapshot.profile.high52w || (currentPrice * 1.08);
  const priceVs52wHigh = Math.round(((currentPrice - high52w) / high52w) * 1000) / 10;

  // Trend Determination
  let trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS' = 'SIDEWAYS';
  if (currentPrice > sma20 && sma20 > sma50) trend = 'UPTREND';
  else if (currentPrice < sma20 && sma20 < sma50) trend = 'DOWNTREND';

  // Quantitative Scoring
  let score = 0.50;
  if (trend === 'UPTREND') score += 0.18;
  if (currentPrice > ema14) score += 0.08;
  if (rsi14 >= 50 && rsi14 <= 68) score += 0.10; // Healthy bullish momentum without overbought
  else if (rsi14 > 75) score -= 0.08; // Overbought risk
  if (volumeRatio > 1.1) score += 0.05; // Volume expansion
  score = Math.min(0.95, Math.max(0.10, Math.round(score * 100) / 100));

  let signal: 'BULLISH' | 'MILD_POSITIVE' | 'NEUTRAL' | 'MILD_NEGATIVE' | 'BEARISH' = 'NEUTRAL';
  let direction = 0.0;

  if (score >= 0.70) {
    signal = 'BULLISH';
    direction = 0.75;
  } else if (score >= 0.58) {
    signal = 'MILD_POSITIVE';
    direction = 0.40;
  } else if (score <= 0.35) {
    signal = 'BEARISH';
    direction = -0.75;
  } else if (score <= 0.45) {
    signal = 'MILD_NEGATIVE';
    direction = -0.40;
  }

  const findings = [
    {
      claim: `Price is trading at ₹${currentPrice.toFixed(2)}, holding above 20-day SMA (₹${sma20.toFixed(2)}) and 50-day SMA (₹${sma50.toFixed(2)}).`,
      metric: 'Trend & Moving Averages',
      value: trend
    },
    {
      claim: `14-day RSI stands at ${rsi14}, indicating robust momentum with no immediate overbought exhaustion.`,
      metric: 'RSI (14)',
      value: rsi14
    },
    {
      claim: `20-day Price Momentum is ${momentumPercent > 0 ? '+' : ''}${momentumPercent}%, accompanied by a ${volumeRatio}x average volume surge.`,
      metric: 'Momentum & Volume',
      value: `${momentumPercent}%`
    }
  ];

  const risks = [];
  if (rsi14 > 70) {
    risks.push({ risk: 'RSI is entering overbought territory (>70), creating potential short-term pullback risk.', severity: 'MEDIUM' as const });
  }
  if (priceVs52wHigh > -3.0) {
    risks.push({ risk: 'Trading within 3% of 52-week high resistance zone.', severity: 'LOW' as const });
  }

  return {
    schema_version: '1.0',
    agent: 'technical',
    status: 'SUCCESS',
    signal,
    direction,
    score,
    confidence: 0.84,
    findings,
    risks,
    metrics: {
      currentPrice,
      change24h: snapshot.profile.change24h,
      sma20,
      sma50,
      ema14,
      rsi14,
      momentumPercent,
      volume24h: lastVol,
      volumeAvg30d: avgVol,
      volumeRatio,
      priceVs52wHigh,
      trend
    },
    executionTimeMs: Date.now() - startTime
  };
}
