/**
 * Evidence Validation Engine (Stage 1 and Stage 2).
 * Verifies document citations, drops unverified claims, and calculates deterministic evidence coverage.
 */

import { Claim, EvidenceRecord } from '../types.js';
import { db } from '../db.js';

export class EvidenceValidator {
  /**
   * Stage 1: Pre-Synthesis Evidence Validation.
   * Validates that all evidence_ids exist in the registered vector store / database.
   */
  public static validatePreSynthesis(claims: Claim[], evidenceList: EvidenceRecord[]): {
    validClaims: Claim[];
    rejectedClaims: Claim[];
  } {
    const validClaims: Claim[] = [];
    const rejectedClaims: Claim[] = [];
    const evidenceIds = new Set(evidenceList.map(e => e.id));

    for (const claim of claims) {
      if (!claim.evidence_ids || claim.evidence_ids.length === 0) {
        // Document claim without citations is rejected
        rejectedClaims.push({ ...claim, supported: false, validationNote: 'Missing evidence ID citation.' });
        continue;
      }

      const allExist = claim.evidence_ids.every(id => evidenceIds.has(id) || db.getEvidence(id) !== undefined);
      if (allExist) {
        validClaims.push({ ...claim, supported: true });
      } else {
        rejectedClaims.push({
          ...claim,
          supported: false,
          validationNote: 'Referenced evidence ID not found in indexed disclosures.'
        });
      }
    }

    return { validClaims, rejectedClaims };
  }

  /**
   * Stage 2: Post-Synthesis Evidence Coverage Calculation.
   */
  public static calculateCoverage(claims: Claim[]): {
    supportedClaimsCount: number;
    totalEvidenceClaimsCount: number;
    coveragePercentage: number;
  } {
    if (claims.length === 0) {
      return {
        supportedClaimsCount: 0,
        totalEvidenceClaimsCount: 0,
        coveragePercentage: 100
      };
    }

    const supported = claims.filter(c => c.supported).length;
    const total = claims.length;
    const percentage = Math.round((supported / total) * 1000) / 10;

    return {
      supportedClaimsCount: supported,
      totalEvidenceClaimsCount: total,
      coveragePercentage: percentage
    };
  }
}
