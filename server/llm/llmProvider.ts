/**
 * LLM Provider Abstraction:
 * RealLLMProvider (Google GenAI SDK) vs MockLLMProvider (Deterministic Local Formatter)
 * Automated tests run with MockLLMProvider so they never depend on network or external API availability.
 */

import { GoogleGenAI } from '@google/genai';

export interface ILLMProvider {
  refineExplanation(params: {
    ticker: string;
    companyName: string;
    objectiveSignal: string;
    objectiveScore: number;
    suitabilityScore: number;
    whyThisMatters: string[];
    risks: string[];
  }): Promise<{ summary: string; bullets: string[] }>;
}

export class RealLLMProvider implements ILLMProvider {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }

  public async refineExplanation(params: {
    ticker: string;
    companyName: string;
    objectiveSignal: string;
    objectiveScore: number;
    suitabilityScore: number;
    whyThisMatters: string[];
    risks: string[];
  }): Promise<{ summary: string; bullets: string[] }> {
    if (!this.ai || !process.env.GEMINI_API_KEY) {
      // Graceful fallback to deterministic
      return new MockLLMProvider().refineExplanation(params);
    }

    try {
      const prompt = `You are a financial intelligence assistant.
Given the following deterministic analysis for ${params.companyName} (${params.ticker}):
- Objective Market View: ${params.objectiveSignal} (Score: ${params.objectiveScore}%)
- Personalized Investor Suitability: ${params.suitabilityScore}%
- Deterministic Context Factors:
${params.whyThisMatters.map(w => `* ${w}`).join('\n')}
- Identified Risks:
${params.risks.map(r => `* ${r}`).join('\n')}

Instructions:
1. Polish the wording of the reasons into crisp, professional, transparent financial advisory bullets.
2. DO NOT change or invent any numbers, percentages, or claims.
3. Return a JSON object with:
   "summary": a 2-sentence executive summary
   "bullets": an array of 4-5 concise bullet points.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.summary && Array.isArray(parsed.bullets)) {
          return {
            summary: parsed.summary,
            bullets: parsed.bullets
          };
        }
      }
      return new MockLLMProvider().refineExplanation(params);
    } catch {
      // Failure isolation: graceful fallback
      return new MockLLMProvider().refineExplanation(params);
    }
  }
}

export class MockLLMProvider implements ILLMProvider {
  public async refineExplanation(params: {
    ticker: string;
    companyName: string;
    objectiveSignal: string;
    objectiveScore: number;
    suitabilityScore: number;
    whyThisMatters: string[];
    risks: string[];
  }): Promise<{ summary: string; bullets: string[] }> {
    const summary = `${params.companyName} demonstrates a ${params.objectiveSignal.toLowerCase()} objective market posture (${params.objectiveScore}%), resulting in a ${params.suitabilityScore}% personalized suitability rating given your current portfolio allocation and risk profile.`;
    return {
      summary,
      bullets: params.whyThisMatters
    };
  }
}

// Default instance
export const llmProvider: ILLMProvider = process.env.GEMINI_API_KEY ? new RealLLMProvider() : new MockLLMProvider();
