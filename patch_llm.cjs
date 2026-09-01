const fs = require('fs');
let code = fs.readFileSync('server/llm/llmProvider.ts', 'utf8');

code = code.replace(
  "import { GoogleGenAI } from '@google/genai';",
  "import { GoogleGenAI } from '@google/genai';\nimport { AgentDebate, ConflictResult, AgentResultsBundle } from '../types.js';"
);

code = code.replace(
  "}): Promise<{ summary: string; bullets: string[] }>;",
  "}): Promise<{ summary: string; bullets: string[] }>;\n  generateDebate(params: {\n    ticker: string;\n    companyName: string;\n    conflicts: ConflictResult;\n    agents: AgentResultsBundle;\n  }): Promise<AgentDebate[]>;\n"
);

const realLLMMethod = `
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
      const conflictStrs = params.conflicts.conflicts.map(c => \`- \${c.description} (Involving: \${c.agentsInvolved.join(', ')})\`).join('\\n');
      const prompt = \`You are an advanced financial multi-agent moderator. 
We have detected logical conflicts between our specialized AI agents analyzing \${params.companyName} (\${params.ticker}).
Conflicts detected:
\${conflictStrs}

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
Do not return any other text outside the JSON array.\`;

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
`;

code = code.replace(
  "export class RealLLMProvider implements ILLMProvider {\n",
  "export class RealLLMProvider implements ILLMProvider {\n" + realLLMMethod
);

const mockLLMMethod = `
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
        agent1Argument: \`\${agent1} indicators strongly suggest a distinct trajectory based on local data.\`,
        agent2,
        agent2Argument: \`\${agent2} models point to severe counter-risks that invalidate the primary trend.\`,
        resolutionSynthesis: \`In the absence of a live LLM, this deterministic debate highlights the structural contradiction between \${agent1} and \${agent2}.\`
      };
    });
  }
`;

code = code.replace(
  "export class MockLLMProvider implements ILLMProvider {\n",
  "export class MockLLMProvider implements ILLMProvider {\n" + mockLLMMethod
);

fs.writeFileSync('server/llm/llmProvider.ts', code);
