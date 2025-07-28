// OpenAI API Integration
import { apiKeyManager, UsageTracker } from '../api-keys';

export interface OpenAITextRequest {
  prompt: string;
  model?: 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4-turbo';
  maxTokens?: number;
  temperature?: number;
  userId?: string;
}

export interface OpenAIImageRequest {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  userId?: string;
}

export interface OpenAIResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    tokens: number;
    cost: number;
  };
}

export class OpenAIService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = apiKeyManager.getKey('openai');
  }

  // Text Generation (Chat Completion)
  async generateText(request: OpenAITextRequest): Promise<OpenAIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: request.prompt
            }
          ],
          max_tokens: request.maxTokens || 1000,
          temperature: request.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error?.message || 'OpenAI API request failed'
        };
      }

      const data = await response.json();
      const tokens = data.usage?.total_tokens || 0;
      const cost = this.calculateCost(request.model || 'gpt-3.5-turbo', tokens);

      // Log usage for billing
      if (request.userId) {
        UsageTracker.logUsage({
          provider: 'openai',
          model: request.model || 'gpt-3.5-turbo',
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

  // Image Generation (DALL-E)
  async generateImage(request: OpenAIImageRequest): Promise<OpenAIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: request.prompt,
          size: request.size || '1024x1024',
          quality: request.quality || 'standard',
          style: request.style || 'vivid',
          n: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error?.message || 'OpenAI Image API request failed'
        };
      }

      const data = await response.json();
      const cost = this.calculateImageCost(request.size || '1024x1024', request.quality || 'standard');

      // Log usage for billing
      if (request.userId) {
        UsageTracker.logUsage({
          provider: 'openai',
          model: 'dall-e-3',
          tokens: 1, // Images are counted as 1 unit
          cost,
          timestamp: new Date(),
          userId: request.userId
        });
      }

      return {
        success: true,
        data: {
          imageUrl: data.data[0]?.url || '',
          revisedPrompt: data.data[0]?.revised_prompt || request.prompt
        },
        usage: { tokens: 1, cost }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Code Generation
  async generateCode(prompt: string, language: string = 'javascript', userId?: string): Promise<OpenAIResponse> {
    const codePrompt = `Generate ${language} code for the following request. Provide clean, well-commented, production-ready code:

${prompt}

Please provide only the code with brief comments explaining key parts.`;

    return this.generateText({
      prompt: codePrompt,
      model: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.3,
      userId
    });
  }

  // Text Summarization
  async summarizeText(text: string, maxLength: number = 100, userId?: string): Promise<OpenAIResponse> {
    const prompt = `Please summarize the following text in approximately ${maxLength} words:

${text}`;

    return this.generateText({
      prompt,
      model: 'gpt-3.5-turbo',
      maxTokens: Math.ceil(maxLength * 1.5),
      temperature: 0.3,
      userId
    });
  }

  // Sentiment Analysis
  async analyzeSentiment(text: string, userId?: string): Promise<OpenAIResponse> {
    const prompt = `Analyze the sentiment of the following text and provide a JSON response with sentiment (positive/negative/neutral), confidence score (0-1), and a brief explanation:

${text}

Response format: {"sentiment": "positive/negative/neutral", "confidence": 0.85, "explanation": "brief explanation"}`;

    return this.generateText({
      prompt,
      model: 'gpt-3.5-turbo',
      maxTokens: 200,
      temperature: 0.1,
      userId
    });
  }

  // Cost calculation (approximate OpenAI pricing)
  private calculateCost(model: string, tokens: number): number {
    const pricing = {
      'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 }
    };

    const modelPricing = pricing[model as keyof typeof pricing] || pricing['gpt-3.5-turbo'];
    // Simplified: assume 50% input, 50% output tokens
    const inputTokens = tokens * 0.5;
    const outputTokens = tokens * 0.5;
    
    return (inputTokens * modelPricing.input + outputTokens * modelPricing.output) / 1000;
  }

  private calculateImageCost(size: string, quality: string): number {
    const pricing = {
      '1024x1024': { standard: 0.040, hd: 0.080 },
      '1792x1024': { standard: 0.080, hd: 0.160 },
      '1024x1792': { standard: 0.080, hd: 0.160 }
    };

    const sizePricing = pricing[size as keyof typeof pricing] || pricing['1024x1024'];
    return sizePricing[quality as keyof typeof sizePricing] || sizePricing.standard;
  }
}

export const openaiService = new OpenAIService();