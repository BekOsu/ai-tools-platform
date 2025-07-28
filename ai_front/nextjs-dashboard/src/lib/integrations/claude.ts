// Claude (Anthropic) API Integration
import { apiKeyManager, UsageTracker } from '../api-keys';

export interface ClaudeRequest {
  prompt: string;
  model?: 'claude-3-5-sonnet-20241022' | 'claude-3-haiku-20240307' | 'claude-3-opus-20240229';
  maxTokens?: number;
  temperature?: number;
  userId?: string;
}

export interface ClaudeResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    tokens: number;
    cost: number;
  };
}

export class ClaudeService {
  private apiKey: string;
  private baseURL = 'https://api.anthropic.com/v1';

  constructor() {
    this.apiKey = apiKeyManager.getKey('anthropic');
  }

  // Text Generation
  async generateText(request: ClaudeRequest): Promise<ClaudeResponse> {
    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: request.model || 'claude-3-5-sonnet-20241022',
          max_tokens: request.maxTokens || 1000,
          temperature: request.temperature || 0.7,
          messages: [
            {
              role: 'user',
              content: request.prompt
            }
          ]
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error?.message || 'Claude API request failed'
        };
      }

      const data = await response.json();
      const inputTokens = data.usage?.input_tokens || 0;
      const outputTokens = data.usage?.output_tokens || 0;
      const totalTokens = inputTokens + outputTokens;
      const cost = this.calculateCost(request.model || 'claude-3-5-sonnet-20241022', inputTokens, outputTokens);

      // Log usage for billing
      if (request.userId) {
        UsageTracker.logUsage({
          provider: 'anthropic',
          model: request.model || 'claude-3-5-sonnet-20241022',
          tokens: totalTokens,
          cost,
          timestamp: new Date(),
          userId: request.userId
        });
      }

      return {
        success: true,
        data: {
          text: data.content[0]?.text || '',
          model: data.model,
          stopReason: data.stop_reason
        },
        usage: { tokens: totalTokens, cost }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Advanced Text Analysis
  async analyzeText(text: string, analysisType: 'sentiment' | 'entities' | 'keywords' | 'summary', userId?: string): Promise<ClaudeResponse> {
    let prompt: string;

    switch (analysisType) {
      case 'sentiment':
        prompt = `Analyze the sentiment of the following text. Provide a detailed analysis including:
1. Overall sentiment (positive, negative, neutral)
2. Confidence score (0-1)
3. Key emotional indicators
4. Tone and mood
5. Context considerations

Text: ${text}

Please provide your analysis in a structured JSON format.`;
        break;

      case 'entities':
        prompt = `Extract and identify named entities from the following text. Categorize them as:
- PERSON (people's names)
- ORGANIZATION (companies, institutions)
- LOCATION (places, countries, cities)
- DATE (dates, times)
- MONEY (monetary values)
- MISCELLANEOUS (other important entities)

Text: ${text}

Return the results in JSON format with categories and confidence scores.`;
        break;

      case 'keywords':
        prompt = `Extract the most important keywords and phrases from the following text. Provide:
1. Top 10 keywords ranked by importance
2. Key phrases (2-4 words)
3. Topic classification
4. Relevance scores for each keyword

Text: ${text}

Return in structured JSON format.`;
        break;

      case 'summary':
        prompt = `Provide a comprehensive summary of the following text:
1. Main points (bullet format)
2. Key takeaways
3. Essential information
4. Brief overview (2-3 sentences)

Text: ${text}`;
        break;

      default:
        prompt = `Analyze the following text: ${text}`;
    }

    return this.generateText({
      prompt,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 1500,
      temperature: 0.3,
      userId
    });
  }

  // Code Analysis and Review
  async reviewCode(code: string, language: string, userId?: string): Promise<ClaudeResponse> {
    const prompt = `Please review the following ${language} code and provide:

1. **Code Quality Assessment** (1-10 scale)
2. **Security Issues** (if any)
3. **Performance Optimizations**
4. **Best Practices** violations
5. **Suggestions for Improvement**
6. **Potential Bugs** or issues
7. **Readability Score** (1-10)

\`\`\`${language}
${code}
\`\`\`

Please structure your response clearly with sections for each category.`;

    return this.generateText({
      prompt,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 2000,
      temperature: 0.2,
      userId
    });
  }

  // Document Analysis
  async analyzeDocument(document: string, analysisType: 'structure' | 'content' | 'compliance', userId?: string): Promise<ClaudeResponse> {
    let prompt: string;

    switch (analysisType) {
      case 'structure':
        prompt = `Analyze the structure and organization of this document:
1. Document type identification
2. Section breakdown
3. Information hierarchy
4. Format assessment
5. Completeness evaluation

Document: ${document}`;
        break;

      case 'content':
        prompt = `Provide a comprehensive content analysis:
1. Main topics and themes
2. Key information extracted
3. Data points and facts
4. Conclusions and recommendations
5. Content quality assessment

Document: ${document}`;
        break;

      case 'compliance':
        prompt = `Review this document for compliance and quality:
1. Language clarity and professionalism
2. Completeness of information
3. Consistency checks
4. Potential compliance issues
5. Recommendations for improvement

Document: ${document}`;
        break;

      default:
        prompt = `Analyze this document: ${document}`;
    }

    return this.generateText({
      prompt,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 2000,
      temperature: 0.3,
      userId
    });
  }

  // Creative Writing Assistant
  async generateCreativeContent(
    type: 'story' | 'article' | 'marketing' | 'email',
    topic: string,
    tone: 'professional' | 'casual' | 'creative' | 'technical',
    length: 'short' | 'medium' | 'long',
    userId?: string
  ): Promise<ClaudeResponse> {
    const lengthGuide = {
      short: '200-300 words',
      medium: '500-800 words',
      long: '1000-1500 words'
    };

    const prompt = `Create ${type === 'story' ? 'a compelling story' : 
                           type === 'article' ? 'an informative article' :
                           type === 'marketing' ? 'marketing content' :
                           'a professional email'} about "${topic}".

Requirements:
- Tone: ${tone}
- Length: ${lengthGuide[length]}
- Engaging and well-structured
- Appropriate for the specified type and tone

${type === 'marketing' ? 'Include a clear call-to-action.' : ''}
${type === 'email' ? 'Include subject line and proper email formatting.' : ''}`;

    return this.generateText({
      prompt,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: length === 'long' ? 2000 : length === 'medium' ? 1200 : 800,
      temperature: 0.7,
      userId
    });
  }

  // Cost calculation (Anthropic pricing)
  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing = {
      'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 }, // per 1M tokens
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
      'claude-3-opus-20240229': { input: 15.00, output: 75.00 }
    };

    const modelPricing = pricing[model as keyof typeof pricing] || pricing['claude-3-5-sonnet-20241022'];
    
    return (inputTokens * modelPricing.input + outputTokens * modelPricing.output) / 1000000;
  }
}

export const claudeService = new ClaudeService();