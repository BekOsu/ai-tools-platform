// Frontend AI Client for calling our API endpoints
export class AIClient {
  private baseURL = '/api/ai';

  // OpenAI Methods
  async generateText(prompt: string, options?: {
    model?: 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4-turbo';
    maxTokens?: number;
    temperature?: number;
    userId?: string;
  }) {
    return this.callAPI('openai', 'generateText', {
      prompt,
      ...options
    });
  }

  async generateImage(prompt: string, options?: {
    size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
    userId?: string;
  }) {
    return this.callAPI('openai', 'generateImage', {
      prompt,
      ...options
    });
  }

  async generateCode(prompt: string, language: string = 'javascript', userId?: string) {
    return this.callAPI('openai', 'generateCode', {
      prompt,
      language,
      userId
    });
  }

  async summarizeText(text: string, maxLength: number = 100, userId?: string) {
    return this.callAPI('openai', 'summarizeText', {
      text,
      maxLength,
      userId
    });
  }

  async analyzeSentiment(text: string, userId?: string) {
    return this.callAPI('openai', 'analyzeSentiment', {
      text,
      userId
    });
  }

  // Claude Methods
  async generateTextClaude(prompt: string, options?: {
    model?: 'claude-3-5-sonnet-20241022' | 'claude-3-haiku-20240307' | 'claude-3-opus-20240229';
    maxTokens?: number;
    temperature?: number;
    userId?: string;
  }) {
    return this.callAPI('claude', 'generateText', {
      prompt,
      ...options
    });
  }

  async analyzeText(text: string, analysisType: 'sentiment' | 'entities' | 'keywords' | 'summary', userId?: string) {
    return this.callAPI('claude', 'analyzeText', {
      text,
      analysisType,
      userId
    });
  }

  async reviewCode(code: string, language: string, userId?: string) {
    return this.callAPI('claude', 'reviewCode', {
      code,
      language,
      userId
    });
  }

  async analyzeDocument(document: string, analysisType: 'structure' | 'content' | 'compliance', userId?: string) {
    return this.callAPI('claude', 'analyzeDocument', {
      document,
      analysisType,
      userId
    });
  }

  async generateCreativeContent(
    type: 'story' | 'article' | 'marketing' | 'email',
    topic: string,
    tone: 'professional' | 'casual' | 'creative' | 'technical',
    length: 'short' | 'medium' | 'long',
    userId?: string
  ) {
    return this.callAPI('claude', 'generateCreativeContent', {
      type,
      topic,
      tone,
      length,
      userId
    });
  }

  // DeepSeek Methods
  async generateCodeDeepSeek(prompt: string, options?: {
    model?: 'deepseek-coder' | 'deepseek-chat';
    maxTokens?: number;
    temperature?: number;
    userId?: string;
  }) {
    return this.callAPI('deepseek', 'generateCode', {
      prompt,
      ...options
    });
  }

  async analyzeCodeDeepSeek(
    code: string, 
    language: string, 
    analysisType: 'bugs' | 'performance' | 'security' | 'refactor',
    userId?: string
  ) {
    return this.callAPI('deepseek', 'analyzeCode', {
      code,
      language,
      analysisType,
      userId
    });
  }

  async completeCode(partialCode: string, language: string, context?: string, userId?: string) {
    return this.callAPI('deepseek', 'completeCode', {
      partialCode,
      language,
      context,
      userId
    });
  }

  async generateDocumentation(
    code: string, 
    language: string, 
    docType: 'api' | 'readme' | 'comments' | 'tutorial',
    userId?: string
  ) {
    return this.callAPI('deepseek', 'generateDocumentation', {
      code,
      language,
      docType,
      userId
    });
  }

  // System Methods
  async getStatus() {
    try {
      const response = await fetch(`${this.baseURL}/status`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get status'
      };
    }
  }

  // Private helper method
  private async callAPI(provider: string, action: string, params: any) {
    try {
      const response = await fetch(`${this.baseURL}/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...params
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `API request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const aiClient = new AIClient();