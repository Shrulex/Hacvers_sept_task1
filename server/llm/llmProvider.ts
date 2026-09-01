/**
 * LLM Provider Abstraction:
 * RealLLMProvider (Google GenAI SDK) vs MockLLMProvider (Deterministic Local Formatter)
 * Automated tests run with MockLLMProvider so they never depend on network or external API availability.
 */

import { GoogleGenAI } from '@google/genai';
import { AgentDebate, ConflictResult, AgentResultsBundle } from '../types.js';

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
  generateDebate(params: {
    ticker: string;
    companyName: string;
    conflicts: ConflictResult;
    agents: AgentResultsBundle;
  }): Promise<AgentDebate[]>;

}

export class RealLLMProvider implements ILLMProvider {

  public async generateDebate(params: {
    ticker: string;
    companyName: string;
    conflicts: ConflictResult;
    agents: AgentResultsBundle;
  }): Promise<AgentDebate[]> {
    if (!this.ai || !process.env.GEMINI_API_KEY || params.conflicts.conflicts.length === 0) {
      return new MockLLMProvider().generateDebate(params);
    }
    try {
      const conflictStrs = params.conflicts.conflicts.map(c => `- ${c.description} (Involving: ${c.agentsInvolved.join(', ')})`).join('\n');
      const prompt = `You are an advanced financial multi-agent moderator. 
We have detected logical conflicts between our specialized AI agents analyzing ${params.companyName} (${params.ticker}).
Conflicts detected:
${conflictStrs}

For each conflict, construct a rigorous "Debate" where the two involved agents cross-examine each other's data, followed by a resolution synthesis.
Return a JSON array of objects with the following schema for each conflict:
[
  {
    "topic": "Brief description of the conflict",
    "agent1": "Name of first agent (e.g., technical, fundamental, sentiment, risk)",
    "agent1Argument": "A robust 2-3 sentence argument from the perspective of agent1 based on their likely findings",
    "agent2": "Name of second agent",
    "agent2Argument": "A robust 2-3 sentence counter-argument from agent2",
    "resolutionSynthesis": "A 2-sentence synthesis of how a portfolio manager should weigh this specific contradiction"
  }
]
Do not return any other text outside the JSON array.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed)) {
          return parsed as AgentDebate[];
        }
      }
      return new MockLLMProvider().generateDebate(params);
    } catch {
      return new MockLLMProvider().generateDebate(params);
    }
  }
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

  public async generateDebate(params: {
    ticker: string;
    companyName: string;
    conflicts: ConflictResult;
    agents: AgentResultsBundle;
  }): Promise<AgentDebate[]> {
    if (params.conflicts.conflicts.length === 0) return [];
    
    return params.conflicts.conflicts.map(c => {
      const agent1 = c.agentsInvolved[0] || 'Unknown';
      const agent2 = c.agentsInvolved[1] || 'Unknown';
      return {
        topic: c.description,
        agent1,
        agent1Argument: `${agent1} indicators strongly suggest a distinct trajectory based on local data.`,
        agent2,
        agent2Argument: `${agent2} models point to severe counter-risks that invalidate the primary trend.`,
        resolutionSynthesis: `In the absence of a live LLM, this deterministic debate highlights the structural contradiction between ${agent1} and ${agent2}.`
      };
    });
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
    const summary = `${params.companyName} demonstrates a ${params.objectiveSignal.toLowerCase()} objective market posture (${params.objectiveScore}%), resulting in a ${params.suitabilityScore}% personalized suitability rating given your current portfolio allocation and risk profile.`;
    return {
      summary,
      bullets: params.whyThisMatters
    };
  }
}

// Default instance
export const llmProvider: ILLMProvider = process.env.GEMINI_API_KEY ? new RealLLMProvider() : new MockLLMProvider();
