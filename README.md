# FinIntel Multi-Agent Platform

FinIntel is an advanced, multi-agent financial intelligence platform designed to evaluate market assets through the lens of multiple specialized AI agents. 

Rather than relying on a single large language model to analyze a stock, FinIntel orchestrates a committee of five distinct, specialized agents (Technical, Fundamental, Sentiment, Risk, and Sector/Peer). These agents operate in parallel, processing factual market data and verified financial documents to form an **Objective Market Score**. The platform then routes this universal score through a strict **Personalization Engine**, which adjusts the final **Suitability Score** based on a user's unique risk tolerance, sector constraints, and existing portfolio holdings.

The system features robust safeguards against AI hallucination, utilizing a local RAG (Retrieval-Augmented Generation) evidence validator to ensure fundamental claims are strictly backed by source filings, alongside a deterministic conflict engine to mathematically penalize the system's confidence when agents disagree.

## Key Features

- **Multi-Agent Orchestration:** Five distinct AI agents evaluate the same asset from independent analytical perspectives.
- **RAG Evidence Validation:** Pre-synthesis filtering drops any fundamental claims that cannot be traced back to verified document sources.
- **Strict Personalization Boundary:** Market intelligence (Objective) is calculated completely independently from user constraints (Personalized).
- **Diagnostics & Audit Studio:** A dedicated environment to artificially degrade data freshness (Live -> Cached -> Stale -> Unavailable) and trace exact execution times, conflict penalties, and confidence math.
- **What-If Simulations:** Project theoretical capital requirements and portfolio distributions without mutating actual database states.

## Architecture

This is a full-stack TypeScript application built with:
- **Frontend:** React, Tailwind CSS, Lucide Icons, and Vite.
- **Backend:** Express.js with a structured ES module architecture.
- **Persistence:** Local SQLite database (`better-sqlite3`) utilizing a unified interface for JSON serialization.
- **AI Integration:** Google Gemini API integration for synthesizing raw agent outputs into readable financial context.

## Running the Application

### Prerequisites
- Node.js (v18 or higher recommended)
- `npm` package manager

### Environment Setup

1. The platform requires a valid Gemini API key for its natural language synthesis layers.
2. In the root directory, copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Open the `.env` file and add your API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Installation

Install the required dependencies:
```bash
npm install
```

### Development Server

Start the integrated full-stack development server. This boots both the Express backend (handling API routes on port 3000) and the Vite frontend middleware.

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Building for Production

To compile the application into a self-contained, production-ready build:

```bash
npm run build
```
This command compiles the React frontend into static assets in the `/dist` directory and bundles the Express server using `esbuild`.

To start the compiled production server:
```bash
npm run start
```

### Running the Verification Test Suite

The platform includes a strict test suite that validates the multi-agent orchestration, personalization boundaries, mathematical confidence formulas, and RAG evidence logic.

To run the verification tests:
```bash
npm run test
```
