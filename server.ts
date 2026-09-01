/**
 * FinIntel Multi-Agent Autonomous Financial Intelligence Platform
 * Backend Express Server with Vite Middleware
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { marketDataProvider } from './server/market/marketProvider.js';
import { AnalysisPipeline } from './server/orchestrator/analysisPipeline.js';
import { PortfolioService } from './server/orchestrator/portfolioService.js';
import { ProviderMode } from './server/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ----------------------------------------------------
  // API ROUTES
  // ----------------------------------------------------

  // 1. Health & Status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'FinIntel Multi-Agent Financial Intelligence Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'connected',
      activeUsers: db.getAllUsers().length,
      marketProvider: marketDataProvider.getProviderStatus()
    });
  });

  // 2. User Profiles
  app.get('/api/users', (req, res) => {
    res.json({ users: db.getAllUsers() });
  });

  // 3. User Portfolio & Health Score
  app.get('/api/portfolio', (req, res) => {
    const userId = (req.query.userId as string) || 'usr_conservative_01';
    const user = db.getUserById(userId) || db.getAllUsers()[0];
    const holdings = db.getPortfolio(user.id);
    const health = PortfolioService.calculateHealth(holdings, user);

    res.json({
      userId: user.id,
      user,
      holdings,
      health
    });
  });

  // 4. Watchlist Management
  app.get('/api/watchlist', (req, res) => {
    const userId = (req.query.userId as string) || 'usr_conservative_01';
    res.json({ watchlist: db.getWatchlist(userId) });
  });

  app.post('/api/watchlist', (req, res) => {
    const { userId, ticker } = req.body;
    if (!ticker) return res.status(400).json({ error: 'Ticker is required' });
    const item = db.addToWatchlist(userId || 'usr_conservative_01', ticker);
    res.json({ success: true, item });
  });

  app.delete('/api/watchlist', (req, res) => {
    const { userId, ticker } = req.body;
    if (!ticker) return res.status(400).json({ error: 'Ticker is required' });
    const removed = db.removeFromWatchlist(userId || 'usr_conservative_01', ticker);
    res.json({ success: removed });
  });

  // 5. Core Multi-Agent Analysis Pipeline
  app.post('/api/analyze', async (req, res) => {
    try {
      const { ticker, userId, simulatedMode, investmentAmount } = req.body;
      if (!ticker) {
        return res.status(400).json({ error: 'Ticker symbol is required' });
      }

      const result = await AnalysisPipeline.execute({
        ticker,
        userId: userId || 'usr_conservative_01',
        simulatedMode,
        investmentAmount
      });

      res.json(result);
    } catch (err: any) {
      console.error('Analysis pipeline error:', err);
      res.status(500).json({
        error: err.message || 'Internal analysis orchestration error'
      });
    }
  });

  // 6. What-If Portfolio Projection
  app.post('/api/what-if', (req, res) => {
    try {
      const { userId, ticker, amount, currentSuitability } = req.body;
      if (!ticker || !amount) {
        return res.status(400).json({ error: 'Ticker and investment amount are required' });
      }

      const projection = PortfolioService.simulateWhatIf(
        userId || 'usr_conservative_01',
        ticker,
        Number(amount),
        Number(currentSuitability || 64)
      );

      res.json(projection);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 7. Historical Analysis Sessions & "What Changed?" Diff
  app.get('/api/history', (req, res) => {
    const userId = (req.query.userId as string) || 'usr_conservative_01';
    res.json({ history: db.getHistory(userId) });
  });

  app.get('/api/comparison', (req, res) => {
    const userId = (req.query.userId as string) || 'usr_conservative_01';
    const ticker = (req.query.ticker as string) || 'INFY';
    const currentSessionId = req.query.sessionId as string;

    const previousSession = db.getPreviousSession(userId, ticker, currentSessionId);
    const currentSession = currentSessionId ? db.getSessionById(currentSessionId) : undefined;
    const currentData = currentSession ? JSON.parse(currentSession.responseJson) : {};

    const diff = PortfolioService.compareWithPrevious(currentData, previousSession);
    res.json(diff);
  });

  // 8. Evidence Retrieval
  app.get('/api/evidence/:id', (req, res) => {
    const evidence = db.getEvidence(req.params.id);
    if (!evidence) {
      return res.status(404).json({ error: 'Evidence record not found' });
    }
    res.json(evidence);
  });

  // 9. Provider Mode & Diagnostics (For live testing and failure injection)
  app.get('/api/market/status', (req, res) => {
    res.json(marketDataProvider.getProviderStatus());
  });

  app.post('/api/market/mode', (req, res) => {
    const { mode } = req.body;
    if (!['LIVE', 'CACHED', 'DEMO', 'STALE', 'UNAVAILABLE'].includes(mode)) {
      return res.status(400).json({ error: 'Invalid provider mode' });
    }
    marketDataProvider.setSimulatedMode(mode as ProviderMode);
    res.json({ success: true, mode });
  });

  // ----------------------------------------------------
  // VITE MIDDLEWARE / STATIC ASSETS
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FinIntel Multi-Agent Platform server running on http://localhost:${PORT}`);
  });
}

startServer();
