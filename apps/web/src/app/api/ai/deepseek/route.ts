import { NextRequest, NextResponse } from 'next/server';
import { deepseekService } from '@/lib/integrations/deepseek';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    // Validate required fields
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    // Route to appropriate DeepSeek service method
    let result;
    switch (action) {
      case 'generateCode':
        result = await deepseekService.generateCode(params);
        break;
      case 'analyzeCode':
        result = await deepseekService.analyzeCode(
          params.code,
          params.language,
          params.analysisType,
          params.userId
        );
        break;
      case 'completeCode':
        result = await deepseekService.completeCode(
          params.partialCode,
          params.language,
          params.context,
          params.userId
        );
        break;
      case 'generateDocumentation':
        result = await deepseekService.generateDocumentation(
          params.code,
          params.language,
          params.docType,
          params.userId
        );
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'DeepSeek API endpoint is running',
    timestamp: new Date().toISOString()
  });
}