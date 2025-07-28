// Secure API Key Management System
interface APIKeyConfig {
  openai: string;
  anthropic: string;
  deepseek: string;
}

export class APIKeyManager {
  private static instance: APIKeyManager;
  private keys: APIKeyConfig;

  private constructor() {
    this.keys = {
      openai: process.env.OPENAI_API_KEY || '',
      anthropic: process.env.ANTHROPIC_API_KEY || '',
      deepseek: process.env.DEEPSEEK_API_KEY || ''
    };
  }

  public static getInstance(): APIKeyManager {
    if (!APIKeyManager.instance) {
      APIKeyManager.instance = new APIKeyManager();
    }
    return APIKeyManager.instance;
  }

  public getKey(provider: keyof APIKeyConfig): string {
    const key = this.keys[provider];
    if (!key) {
      throw new Error(`API key for ${provider} not configured`);
    }
    return key;
  }

  public validateKey(provider: keyof APIKeyConfig): boolean {
    const key = this.keys[provider];
    if (!key) return false;
    
    // Basic validation patterns
    switch (provider) {
      case 'openai':
        return key.startsWith('sk-proj-') || key.startsWith('sk-');
      case 'anthropic':
        return key.startsWith('sk-ant-api');
      case 'deepseek':
        return key.length >= 32;
      default:
        return false;
    }
  }

  public getAllValidProviders(): string[] {
    return Object.keys(this.keys).filter(provider => 
      this.validateKey(provider as keyof APIKeyConfig)
    );
  }

  public getProviderStatus(): Record<string, boolean> {
    return {
      openai: this.validateKey('openai'),
      anthropic: this.validateKey('anthropic'),
      deepseek: this.validateKey('deepseek')
    };
  }
}

// Usage tracking for billing
export interface APIUsage {
  provider: string;
  model: string;
  tokens: number;
  cost: number;
  timestamp: Date;
  userId?: string;
}

export class UsageTracker {
  private static usageLog: APIUsage[] = [];

  public static logUsage(usage: APIUsage): void {
    this.usageLog.push(usage);
    
    // In production, this would save to database
    console.log(`API Usage: ${usage.provider} - ${usage.tokens} tokens - $${usage.cost.toFixed(4)}`);
  }

  public static getUserUsage(userId: string, days: number = 30): APIUsage[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.usageLog.filter(usage => 
      usage.userId === userId && usage.timestamp >= cutoffDate
    );
  }

  public static getTotalCost(userId: string, days: number = 30): number {
    const usage = this.getUserUsage(userId, days);
    return usage.reduce((total, record) => total + record.cost, 0);
  }

  public static getProviderUsage(provider: string, days: number = 30): APIUsage[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.usageLog.filter(usage => 
      usage.provider === provider && usage.timestamp >= cutoffDate
    );
  }
}

export const apiKeyManager = APIKeyManager.getInstance();