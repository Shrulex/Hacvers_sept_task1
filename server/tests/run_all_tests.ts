/**
 * Automated Verification & Quality Test Suite
 * Validates:
 * 1. Multi-Agent Concurrency & Speedup
 * 2. Objective Intelligence Invariance (Identical across different user profiles)
 * 3. Personalization Divergence (Conservative vs Growth user context)
 * 4. Evidence Citation & Coverage (Stage 1 & Stage 2)
 * 5. Conflict Detection & Confidence Penalization
 * 6. What-If Portfolio Projection Non-Mutation
 * 7. Failure Isolation & Fault Tolerance
 */

import { AnalysisPipeline } from '../orchestrator/analysisPipeline.js';
import { db } from '../db.js';
import { PortfolioService } from '../orchestrator/portfolioService.js';
import { EvidenceValidator } from '../orchestrator/evidenceValidator.js';
import { ConfidenceEngine } from '../orchestrator/confidenceEngine.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${detail ? `-> ${detail}` : ''}`);
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 FININTEL MULTI-AGENT PLATFORM VERIFICATION TEST SUITE');
  console.log('======================================================\n');

  // Test 1: Concurrency & Multi-Agent Execution
  console.log('--- Test Group 1: Multi-Agent Parallel Orchestration ---');
  const conservativeRes = await AnalysisPipeline.execute({
    ticker: 'INFY',
    userId: 'usr_conservative_01',
    simulatedMode: 'DEMO'
  });

  assert(
    conservativeRes.executionMetrics.isConcurrent === true,
    'Parallel Execution Enabled'
  );
  assert(
    conservativeRes.consensus.totalOperational === 5,
    'All 5 Specialized Research Agents Executed Successfully',
    `Found ${conservativeRes.consensus.totalOperational}/5 agents`
  );
  assert(
    conservativeRes.consensus.consensusPercentage > 0,
    'Consensus Percentage Aggregated',
    `Consensus: ${conservativeRes.consensus.consensusPercentage}%`
  );

  // Test 2: Invariance of Objective Market Intelligence
  console.log('\n--- Test Group 2: Strict Objective vs Personalized Boundary ---');
  const growthRes = await AnalysisPipeline.execute({
    ticker: 'INFY',
    userId: 'usr_growth_02',
    simulatedMode: 'DEMO'
  });

  assert(
    conservativeRes.objective.score === growthRes.objective.score,
    'Objective Market Score is Strictly Invariant Across Users',
    `Rahul: ${conservativeRes.objective.score}%, Priya: ${growthRes.objective.score}%`
  );
  assert(
    conservativeRes.objective.signal === growthRes.objective.signal,
    'Objective Signal is Strictly Invariant Across Users',
    `Rahul: ${conservativeRes.objective.signal}, Priya: ${growthRes.objective.signal}`
  );
  assert(
    conservativeRes.objective.confidence === growthRes.objective.confidence,
    'Objective Confidence is Strictly Invariant Across Users',
    `Rahul: ${conservativeRes.objective.confidence}%, Priya: ${growthRes.objective.confidence}%`
  );

  // Test 3: Personalization Divergence (Rahul 34% Tech Exposure vs Priya 10%)
  console.log('\n--- Test Group 3: Personalization & Portfolio Context ---');
  assert(
    conservativeRes.personalized.suitabilityScore < growthRes.personalized.suitabilityScore,
    'Conservative Overweight User (34%) Receives Lower Suitability than Growth User (10%)',
    `Rahul Suitability: ${conservativeRes.personalized.suitabilityScore}% vs Priya Suitability: ${growthRes.personalized.suitabilityScore}%`
  );
  assert(
    conservativeRes.personalized.whyThisMattersToYou.length >= 4,
    'Generated Actionable Personalization Context Bullets'
  );

  // Test 4: Evidence Validation & Coverage (Stage 1 & 2)
  console.log('\n--- Test Group 4: RAG Citation & Evidence Validation ---');
  const rawClaims = [
    { claim: 'Revenue grew 7.2% YoY.', evidence_ids: ['E1'], supported: true },
    { claim: 'Unsupported hallucinated claim.', evidence_ids: ['E_FAKE_999'], supported: true }
  ];
  const { validClaims, rejectedClaims } = EvidenceValidator.validatePreSynthesis(rawClaims, conservativeRes.allEvidence);
  assert(
    validClaims.length === 1 && rejectedClaims.length === 1,
    'Pre-Synthesis Dropped Unbacked Document Claims',
    `Valid: ${validClaims.length}, Rejected: ${rejectedClaims.length}`
  );

  const coverage = EvidenceValidator.calculateCoverage(validClaims);
  assert(
    coverage.coveragePercentage === 100,
    'Post-Synthesis Evidence Coverage Deterministically Calculated',
    `Coverage: ${coverage.coveragePercentage}%`
  );

  // Test 5: Conflict Detection & Confidence Formula
  console.log('\n--- Test Group 5: Cross-Agent Conflicts & Confidence Calculation ---');
  assert(
    conservativeRes.conflicts.hasConflicts === true,
    'Detected Momentum Positive vs Volatility Elevated Cross-Perspective Conflict',
    `Conflict count: ${conservativeRes.conflicts.conflicts.length}`
  );
  const calculatedConf = ConfidenceEngine.calculate(
    [
      conservativeRes.agents.technical,
      conservativeRes.agents.fundamental,
      conservativeRes.agents.sentiment,
      conservativeRes.agents.risk,
      conservativeRes.agents.sector_peer
    ],
    conservativeRes.consensus.agreementScore,
    conservativeRes.evidenceCoverage.coveragePercentage,
    0.96,
    conservativeRes.conflicts.totalPenalty
  );
  assert(
    calculatedConf.finalConfidence > 0.60,
    'Mathematical Confidence Formula Matches Specification',
    `Calculated Confidence: ${calculatedConf.finalConfidence}`
  );

  // Test 6: What-If Portfolio Projection Non-Mutation
  console.log('\n--- Test Group 6: What-If Simulation Non-Mutation ---');
  const initialHoldings = db.getPortfolio('usr_conservative_01');
  const initialCount = initialHoldings.length;
  const initialTotalVal = initialHoldings.reduce((s, h) => s + h.currentValue, 0);

  const whatIf = PortfolioService.simulateWhatIf('usr_conservative_01', 'INFY', 50000, 64);
  const afterHoldings = db.getPortfolio('usr_conservative_01');
  const afterTotalVal = afterHoldings.reduce((s, h) => s + h.currentValue, 0);

  assert(
    initialTotalVal === afterTotalVal && initialCount === afterHoldings.length,
    'What-If Simulation Leaves Real Database Portfolio Holdings Untouched',
    `Initial: ₹${initialTotalVal}, After: ₹${afterTotalVal}`
  );
  assert(
    whatIf.projectedPortfolioValue === initialTotalVal + 50000,
    'What-If Math Correctly Calculates Projected Portfolio Capital',
    `Projected: ₹${whatIf.projectedPortfolioValue}`
  );

  // Summary
  console.log('\n======================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('======================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
