// DeepSeek API Integration
import { apiKeyManager, UsageTracker } from '../api-keys';

export interface DeepSeekRequest {
  prompt: string;
  model?: 'deepseek-coder' | 'deepseek-chat';
  maxTokens?: number;
  temperature?: number;
  userId?: string;
}

export interface DeepSeekResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    tokens: number;
    cost: number;
  };
}

export class DeepSeekService {
  private apiKey: string;
  private baseURL = 'https://api.deepseek.com/v1';

  constructor() {
    this.apiKey = apiKeyManager.getKey('deepseek');
  }

  // Code Generation (specialized for DeepSeek)
  async generateCode(request: DeepSeekRequest): Promise<DeepSeekResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model || 'deepseek-coder',
          messages: [
            {
              role: 'user',
              content: request.prompt
            }
          ],
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature || 0.3,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error?.message || 'DeepSeek API request failed'
        };
      }

      const data = await response.json();
      const tokens = data.usage?.total_tokens || 0;
      const cost = this.calculateCost(request.model || 'deepseek-coder', tokens);

      // Log usage for billing
      if (request.userId) {
        UsageTracker.logUsage({
          provider: 'deepseek',
          model: request.model || 'deepseek-coder',
          tokens,
          cost,
          timestamp: new Date(),
          userId: request.userId
        });
      }

      return {
        success: true,
        data: {
          text: data.choices[0]?.message?.content || '',
          model: data.model,
          finishReason: data.choices[0]?.finish_reason
        },
        usage: { tokens, cost }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Advanced Code Analysis
  async analyzeCode(code: string, language: string, analysisType: 'bugs' | 'performance' | 'security' | 'refactor', userId?: string): Promise<DeepSeekResponse> {
    let prompt: string;

    switch (analysisType) {
      case 'bugs':
        prompt = `Please analyze the following ${language} code for potential bugs and issues:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. List of potential bugs with line numbers
2. Severity rating (high/medium/low)
3. Suggested fixes for each issue
4. Overall code quality assessment`;
        break;

      case 'performance':
        prompt = `Analyze the following ${language} code for performance optimization opportunities:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Performance bottlenecks identified
2. Time/space complexity analysis
3. Optimization recommendations
4. Alternative algorithms or approaches`;
        break;

      case 'security':
        prompt = `Review the following ${language} code for security vulnerabilities:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Security vulnerabilities found
2. Risk assessment for each issue
3. Remediation steps
4. Best practices recommendations`;
        break;

      case 'refactor':
        prompt = `Suggest refactoring improvements for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Code structure improvements
2. Design pattern suggestions
3. Readability enhancements
4. Maintainability improvements
5. Refactored code examples`;
        break;

      default:
        prompt = `Analyze the following ${language} code: ${code}`;
    }

    return this.generateCode({
      prompt,
      model: 'deepseek-coder',
      maxTokens: 2000,
      temperature: 0.2,
      userId
    });
  }

  // Code Completion and Suggestions
  async completeCode(
    partialCode: string, 
    language: string, 
    context?: string, 
    userId?: string
  ): Promise<DeepSeekResponse> {
    const prompt = `Complete the following ${language} code:

${context ? `Context: ${context}\n\n` : ''}

\`\`\`${language}
${partialCode}
\`\`\`

Please provide the completed code with explanations for the additions.`;

    return this.generateCode({
      prompt,
      model: 'deepseek-coder',
      maxTokens: 1500,
      temperature: 0.4,
      userId
    });
  }

  // Documentation Generation
  async generateDocumentation(
    code: string, 
    language: string, 
    docType: 'api' | 'readme' | 'comments' | 'tutorial', 
    userId?: string
  ): Promise<DeepSeekResponse> {
    let prompt: string;

    switch (docType) {
      case 'api':
        prompt = `Generate comprehensive API documentation for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Include:
1. Function/method descriptions
2. Parameters and return types
3. Usage examples
4. Error handling
5. API endpoints (if applicable)`;
        break;

      case 'readme':
        prompt = `Generate a README.md file for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Include:
1. Project description
2. Installation instructions
3. Usage examples
4. Configuration options
5. Contributing guidelines`;
        break;

      case 'comments':
        prompt = `Add comprehensive inline comments to the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide the same code with detailed comments explaining:
1. What each function/method does
2. Complex logic explanations
3. Parameter descriptions
4. Return value explanations`;
        break;

      case 'tutorial':
        prompt = `Create a step-by-step tutorial explaining the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Include:
1. Overview of what the code does
2. Step-by-step breakdown
3. Key concepts explained
4. Practical examples
5. Common use cases`;
        break;

      default:
        prompt = `Document the following ${language} code: ${code}`;
    }

    return this.generateCode({
      prompt,
      model: 'deepseek-coder',
      maxTokens: 2500,
      temperature: 0.3,
      userId
    });
  }

  // Cost calculation (DeepSeek pricing - estimated)
  private calculateCost(model: string, tokens: number): number {
    const pricing = {
      'deepseek-coder': { input: 0.0014, output: 0.0028 }, // per 1K tokens (estimated)
      'deepseek-chat': { input: 0.0014, output: 0.0028 }
    };

    const modelPricing = pricing[model as keyof typeof pricing] || pricing['deepseek-coder'];
    // Simplified: assume 50% input, 50% output tokens
    const inputTokens = tokens * 0.5;
    const outputTokens = tokens * 0.5;
    
    return (inputTokens * modelPricing.input + outputTokens * modelPricing.output) / 1000;
  }
}

export const deepseekService = new DeepSeekService();