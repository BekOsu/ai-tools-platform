import { NextResponse } from 'next/server';
import { apiKeyManager } from '@/lib/api-keys';

export async function GET() {
  try {
    const providerStatus = apiKeyManager.getProviderStatus();
    const validProviders = apiKeyManager.getAllValidProviders();

    return NextResponse.json({
      success: true,
      status: 'AI Integration Status',
      providers: {
        openai: {
          configured: providerStatus.openai,
          endpoint: '/api/ai/openai',
          capabilities: ['text-generation', 'image-generation', 'code-generation', 'summarization', 'sentiment-analysis']
        },
        anthropic: {
          configured: providerStatus.anthropic,
          endpoint: '/api/ai/claude',
          capabilities: ['text-generation', 'text-analysis', 'code-review', 'document-analysis', 'creative-content']
        },
        deepseek: {
          configured: providerStatus.deepseek,
          endpoint: '/api/ai/deepseek',
          capabilities: ['code-generation', 'code-analysis', 'code-completion', 'documentation-generation']
        }
      },
      totalConfigured: validProviders.length,
      validProviders,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Status Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}